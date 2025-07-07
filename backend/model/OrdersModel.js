const { model } = require("mongoose");
const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: String,
});

const Order = model("Order", OrdersSchema);

module.exports = { Order };
