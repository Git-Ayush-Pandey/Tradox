const router = require("express").Router();
const mongoose = require("mongoose");
const { Order } = require("../model/OrdersModel");
const { Fund } = require("../model/FundsModel");
const { isLoggedIn } = require("../middleware");
const User = require("../model/UserModel");
const { Holding } = require("../model/HoldingsModel");
const { Position } = require("../model/PositionsModel");

router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allOrders = await Order.find({ userId });
  res.json(allOrders);
});

router.post("/new", isLoggedIn, async (req, res) => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const isWeekend = day === 0 || day === 6;
  const isBefore7PM = hour < 19;
  const isAfter130AM = hour > 1 || (hour === 1 && minute > 30);
  const isMarketClosed = isBefore7PM && hour !== 0 || isAfter130AM;

  if (isWeekend || isMarketClosed) {
    return res.status(403).json({
      success: false,
      message: "Orders can only be placed between 7:00 PM and 1:30 AM IST on weekdays.",
    });
  }
  const { name, qty, price, mode, type } = req.body;
  const userId = req.user._id;
  if (!name || !qty || !price || !mode || !type) {
    return res
      .status(400)
      .json({ success: false, message: "Missing fields in order" });
  }

  const totalCost = qty * price;

  try {
    const fund = await Fund.findOne({ userId });
    if (!fund) {
      return res
        .status(404)
        .json({ success: false, message: "Fund record not found" });
    }

    if (mode === "BUY") {
      if (fund.availableCash < totalCost) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient available cash" });
      }

      fund.availableCash -= totalCost;
      fund.usedMargin += totalCost;
      fund.exposure += totalCost;
      fund.availableMargin =
        fund.availableCash + fund.collateralLiquid + fund.collateralEquity;
    } else if (mode === "SELL") {
      fund.availableCash += totalCost;
      fund.availableMargin += totalCost;
    }
    await fund.save();
    const newOrder = new Order({
      userId,
      name,
      qty,
      price,
      mode,
      type,
    });

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
    const order = await Order.findOneAndDelete({ _id: id, userId });
    if (!order) {
      return res.status(404).send("Order not found or unauthorized");
    }
    if (!order.executed) {
      const fund = await Fund.findOne({ userId });
      if (!fund) return res.status(404).send("Fund data not found");
      const total = order.qty * order.price;

      if (order.mode === "BUY") {
        fund.availableCash += total;
        fund.usedMargin -= total;
        fund.exposure -= total;
      } else if (order.mode === "SELL") {
        fund.availableCash -= total;
        fund.availableMargin -= total;
      }
      fund.availableMargin =
        fund.availableCash + fund.collateralLiquid + fund.collateralEquity;
      await fund.save();
    }

    res.status(200).send("Order cancelled and funds updated");
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
      return res.status(400).json({ error: "Already executed" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ error: "User not found" });

    const totalCost = order.price * order.qty;

    if (order.mode === "BUY" && user.funds < totalCost) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    if (order.mode === "BUY") {
      user.funds -= totalCost;
      await user.save();
    }
    console.log(order.type);
    if (order.mode === "BUY") {
      if (order.type === "Delivery") {
        await Holding.updateOne(
          { userId: req.user._id, name: order.name },
          { $inc: { qty: order.qty }, $setOnInsert: { price: order.price } },
          { upsert: true }
        );
      } else if (order.type === "Intraday") {
        await Position.updateOne(
          { userId: req.user._id, name: order.name },
          { $inc: { qty: order.qty }, $setOnInsert: { price: order.price } },
          { upsert: true }
        );
      }
    }

    order.executed = true;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Order execution failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
