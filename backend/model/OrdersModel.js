const { model, Schema } = require("mongoose");

const OrdersSchema = new Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    mode: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    // FIX: Added enum constraint so invalid type values are rejected
    type: {
      type: String,
      enum: ["Delivery", "Intraday"],
    },
    executed: {
      type: Boolean,
      default: false,
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    executedAt: Date,
    cancelledAt: Date,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    note: String,
    auto: Boolean,
  },
  { timestamps: true }
);

// FIX: Index for userId-filtered queries (prevents full collection scan)
OrdersSchema.index({ userId: 1 });
// FIX: Compound index used by cron cancel query
OrdersSchema.index({ userId: 1, executed: 1, cancelled: 1 });

const Order = model("Order", OrdersSchema);
module.exports = { Order };
