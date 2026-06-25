const router = require("express").Router();
const mongoose = require("mongoose");
const { Order } = require("../model/OrdersModel");
const { Fund } = require("../model/FundsModel");
const { isLoggedIn } = require("../middleware");
const { Holding } = require("../model/HoldingsModel");
const { Position } = require("../model/PositionsModel");
const { updateFundsOnOrderAction } = require("../util/updateFunds");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const allOrders = await Order.find({ userId }).sort({ placedAt: -1 });
    res.json(allOrders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/new", isLoggedIn, async (req, res) => {
  const { name, qty, price, mode, type } = req.body;
  const userId = req.user._id;

  if (!name || !qty || !price || !mode) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  if (qty <= 0 || price <= 0) {
    return res.status(400).json({ success: false, message: "qty and price must be positive" });
  }

  try {
    const fund = await Fund.findOne({ userId });
    if (!fund) {
      return res
        .status(404)
        .json({ success: false, message: "Fund record not found" });
    }
    await updateFundsOnOrderAction(userId, { qty, price, mode }, "place");
    const newOrder = new Order({ userId, name, qty, price, mode, type });
    await newOrder.save();
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while placing order" });
  }
});

router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid order ID");
  }

  try {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return res.status(404).send("Order not found or unauthorized");
    }

    if (!order.executed && !order.cancelled) {
      await updateFundsOnOrderAction(userId, order, "cancel");
    }

    await order.deleteOne();
    res.status(200).send("Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});

// FIX: Atomic execution — use findOneAndUpdate with { executed: false } filter
// so two concurrent requests cannot both pass the !executed check.
router.post("/execute/:id", isLoggedIn, async (req, res) => {
  try {
    // Atomically mark the order as executed; if it was already executed this returns null
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, executed: false, cancelled: { $ne: true } },
      { $set: { executed: true, executedAt: new Date() } },
      { new: false } // return the original doc (pre-update) so we can read fields
    );

    if (!order) {
      // Either not found, already executed, or already cancelled
      const existing = await Order.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Order not found" });
      if (existing.executed) return res.status(400).json({ error: "Order already executed" });
      if (existing.cancelled) return res.status(400).json({ error: "Order already cancelled" });
      return res.status(400).json({ error: "Cannot execute order" });
    }

    const userId = req.user._id;

    if (order.mode === "BUY") {
      if (order.type === "Delivery") {
        const existing = await Holding.findOne({ userId, name: order.name });
        if (!existing) {
          await Holding.create({
            name: order.name,
            qty: order.qty,
            avg: order.price,
            price: order.price,
            userId,
          });
        } else {
          const totalQty = existing.qty + order.qty;
          const totalCost =
            existing.avg * existing.qty + order.price * order.qty;
          existing.qty = totalQty;
          existing.avg = totalCost / totalQty;
          existing.price = order.price;
          await existing.save();
        }
      } else if (order.type === "Intraday") {
        const existing = await Position.findOne({ userId, name: order.name });
        if (!existing) {
          await Position.create({
            name: order.name,
            qty: order.qty,
            avg: order.price,
            price: order.price,
            userId,
          });
        } else {
          const totalQty = existing.qty + order.qty;
          const totalCost =
            existing.avg * existing.qty + order.price * order.qty;
          existing.qty = totalQty;
          existing.avg = totalCost / totalQty;
          existing.price = order.price;
          await existing.save();
        }
      }

      await updateFundsOnOrderAction(userId, order, "execute");
    } else if (order.mode === "SELL") {
      const collection = order.type === "Delivery" ? Holding : Position;
      const asset = await collection.findOne({ userId, name: order.name });

      if (!asset || asset.qty < order.qty) {
        // Revert the executed flag if sell can't proceed
        await Order.findByIdAndUpdate(order._id, {
          $set: { executed: false, executedAt: null },
        });
        return res.status(400).json({ error: "Not enough quantity to sell" });
      }

      const avgBuyPrice = asset.avg;

      asset.qty -= order.qty;
      if (asset.qty === 0) {
        await collection.deleteOne({ _id: asset._id });
      } else {
        await asset.save();
      }

      await updateFundsOnOrderAction(
        userId,
        { ...order.toObject(), avg: avgBuyPrice },
        "execute"
      );
    }

    const updatedOrder = await Order.findById(order._id);
    res.json({ success: true, message: "Order executed", order: updatedOrder });
  } catch (err) {
    console.error("Execution error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { qty, price, type } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order ID" });
  }
  if (qty <= 0 || price <= 0) {
    return res.status(400).json({ success: false, message: "qty and price must be positive" });
  }

  try {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or unauthorized" });
    }
    if (order.executed) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit an already executed order",
      });
    }

    await updateFundsOnOrderAction(userId, order, "edit-revert");
    await updateFundsOnOrderAction(
      userId,
      { qty, price, mode: order.mode },
      "edit-apply"
    );

    order.qty = qty;
    order.price = price;
    order.type = type;
    await order.save();

    return res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (err) {
    console.error("Edit order error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while editing order" });
  }
});

router.post("/cancel/:id", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.executed)
      return res.status(400).json({ error: "Order already executed" });
    if (order.cancelled)
      return res.status(400).json({ error: "Order already cancelled" });

    order.cancelled = true;
    await order.save();
    await updateFundsOnOrderAction(userId, order, "cancel");

    res.status(200).json({ success: true, message: "Order cancelled" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

module.exports = router;
