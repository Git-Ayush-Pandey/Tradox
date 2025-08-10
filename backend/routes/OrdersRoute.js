const router = require("express").Router();
const mongoose = require("mongoose");
const { Order } = require("../model/OrdersModel");
const { Fund } = require("../model/FundsModel");
const { isLoggedIn } = require("../middleware");
const { Holding } = require("../model/HoldingsModel");
const { Position } = require("../model/PositionsModel");
const { updateFundsOnOrderAction } = require("../util/updateFunds");

router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allOrders = await Order.find({ userId });
  res.json(allOrders);
});

router.post("/new", isLoggedIn, async (req, res) => {
  const now = new Date();
  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const day = istNow.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const hour = istNow.getHours();
  const minute = istNow.getMinutes();

  const isWeekend = day === 0 || day === 6;
  const timeInMinutes = hour * 60 + minute;

  // 7:00 PM = 1140 minutes, 1:30 AM = 90 minutes
  const isMarketOpen =
    (timeInMinutes >= 1140 && timeInMinutes <= 1439) || // 7:00 PM to 11:59 PM
    (timeInMinutes >= 0 && timeInMinutes <= 90); // 12:00 AM to 1:30 AM

  // if (isWeekend || !isMarketOpen) {
  //   return res.status(403).json({
  //     success: false,
  //     message:
  //       "Orders can only be placed between 7:00 PM and 1:30 AM IST on weekdays.",
  //   });
  // }

  const { name, qty, price, mode, type } = req.body;
  const userId = req.user._id;

  try {
    const fund = await Fund.findOne({ userId });
    if (!fund) {
      return res
        .status(404)
        .json({ success: false, message: "Fund record not found" });
    }
    await updateFundsOnOrderAction(userId, { qty, price, mode }, "place");
    const newOrder = new Order({
      userId,
      name,
      qty,
      price,
      mode,
      type,
    });

    await newOrder.save();
    console.log(newOrder);
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

    // If not executed, reverse funds
    if (!order.executed && !order.cancelled) {
      await updateFundsOnOrderAction(userId, order, "cancel");
    }

    // Permanently delete the order
    await order.deleteOne();

    res.status(200).send("Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/execute/:id", isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.executed)
      return res.status(400).json({ error: "Order already executed" });

    const userId = req.user._id;
    const totalCost = order.price * order.qty;

    const fund = await Fund.findOne({ userId });
    if (!fund) return res.status(404).json({ error: "Fund record not found" });

    // BUY execution
    if (order.mode === "BUY") {
      // Cash was already deducted during order placement

      if (order.type === "Delivery") {
        const existing = await Holding.findOne({ userId, name: order.name });

        if (!existing) {
          // Create new holding
          await Holding.create({
            name: order.name,
            qty: order.qty,
            avg: order.price,
            price: order.price,
            userId,
          });
        } else {
          // Update existing holding
          const totalQty = existing.qty + order.qty;
          const totalCost =
            existing.avg * existing.qty + order.price * order.qty;
          const newAvg = totalCost / totalQty;

          existing.qty = totalQty;
          existing.avg = newAvg;
          existing.price = order.price;

          await existing.save();
        }
      } else if (order.type === "Intraday") {
        const existing = await Position.findOne({ userId, name: order.name });

        if (!existing) {
          // Create new position
          await Position.create({
            name: order.name,
            qty: order.qty,
            avg: order.price,
            price: order.price,
            userId,
          });
        } else {
          // Update existing position
          const totalQty = existing.qty + order.qty;
          const totalCost =
            existing.avg * existing.qty + order.price * order.qty;
          const newAvg = totalCost / totalQty;

          existing.qty = totalQty;
          existing.avg = newAvg;
          existing.price = order.price;

          await existing.save();
        }
      }
    }

    // SELL execution
    else if (order.mode === "SELL") {
      const collection = order.type === "Delivery" ? Holding : Position;
      const asset = await collection.findOne({ userId, name: order.name });

      if (!asset || asset.qty < order.qty) {
        return res.status(400).json({ error: "Not enough quantity to sell" });
      }

      // Reduce quantity or remove asset
      asset.qty -= order.qty;
      if (asset.qty === 0) {
        await collection.deleteOne({ _id: asset._id });
      } else {
        await asset.save();
      }

      // Credit the user's fund account
      fund.availableCash += totalCost;

      // Recompute availableMargin
      fund.availableMargin =
        fund.availableCash + fund.collateralLiquid + fund.collateralEquity;

      await fund.save();
    }

    // Mark the order as executed
    order.executed = true;
    order.executedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order executed", order });
  } catch (err) {
    console.error("❌ Execution error:", err);
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
    await updateFundsOnOrderAction(userId, order, "edit-revert"); // revert old
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
    return res.status(500).json({
      success: false,
      message: "Server error while editing order",
    });
  }
});

router.post("/cancel/:id", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.executed) {
      return res.status(400).json({ error: "Order already executed" });
    }

    if (order.cancelled) {
      return res.status(400).json({ error: "Order already cancelled" });
    }

    order.cancelled = true;
    await order.save();

    // Refund funds if necessary
    await updateFundsOnOrderAction(userId, order, "cancel");

    res.status(200).json({ success: true, message: "Order cancelled" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

module.exports = router;
