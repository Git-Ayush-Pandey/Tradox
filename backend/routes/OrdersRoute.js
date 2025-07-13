const router = require("express").Router();
const mongoose = require("mongoose");
const { Order } = require("../model/OrdersModel");
const { Fund } = require("../model/FundsModel");
const { isLoggedIn } = require("../middleware");

// GET orders belonging to logged-in user
router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allOrders = await Order.find({ userId });
  res.json(allOrders);
});

router.post("/new", isLoggedIn, async (req, res) => {
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday=0, Saturday=6
  const hour = now.getHours();
  const minute = now.getMinutes();
  const isBefore9AM = hour < 9;
  const isAfter330PM = hour > 15 || (hour === 15 && minute > 30);

  if (isWeekend || isBefore9AM || isAfter330PM) {
    return res.status(403).json({
      success: false,
      message: "Orders can only be placed between 9:00 AM and 3:30 PM on weekdays.",
    });
  }
  const newOrder = new Order({
    userId: req.user._id,
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });

  await newOrder.save();
  res.send("Order Saved");
});


// DELETE order only if it belongs to the logged-in user
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

    if (order.mode === "BUY") {
      const fund = await Fund.findOne({ userId });

      if (fund) {
        const refundAmount = order.qty * order.price;
        fund.availableMargin += refundAmount;
        fund.availableCash += refundAmount;
        fund.usedMargin -= refundAmount;
        await fund.save();
      }
    }

    res.status(200).send("Order cancelled and funds refunded");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
