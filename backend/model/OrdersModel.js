const { model, Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: {
    type: String,
    enum: ["BUY", "SELL"],
  },
  type: String,
  executed: {
    type: Boolean,
    default: false,
  },
  placedAt: {
    type: Date,
    default: Date.now,
  },
  executedAt: Date,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
});

const Order = model("Order", OrdersSchema);
module.exports = { Order };