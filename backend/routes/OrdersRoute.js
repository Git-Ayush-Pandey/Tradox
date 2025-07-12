const router = require("express").Router();
const mongoose = require("mongoose"); 
const { Order } = require("../model/OrdersModel");
const {isLoggedIn} = require("../middleware")

router.get("/", isLoggedIn, async (req, res) => {
  let allOrders = await Order.find({});
  res.json(allOrders);
});

router.post("/new", isLoggedIn, async (req, res) => {
  let newOrder = new Order({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  await newOrder.save();
  res.send("Order Saved");
});

router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid order ID");
  }
  try {
    const result = await Order.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send("Order not found");
    }
    res.status(200).send("Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
