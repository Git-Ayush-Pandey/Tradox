const { Order } = require("../model/OrdersModel");

module.exports.getOrders = async (req, res) => {
  let allOrders = await Order.find({});
  res.json(allOrders);
};
