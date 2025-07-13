const router = require("express").Router();
const mongoose = require("mongoose");
const { Order } = require("../model/OrdersModel");
const { isLoggedIn } = require("../middleware");

// GET orders belonging to logged-in user
router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allOrders = await Order.find({ userId });
  res.json(allOrders);
});

// POST new order for logged-in user
router.post("/new", isLoggedIn, async (req, res) => {
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
    const result = await Order.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).send("Order not found or unauthorized");
    }
    res.status(200).send("Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
