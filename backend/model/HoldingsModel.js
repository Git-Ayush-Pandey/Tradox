const { model, Schema } = require("mongoose");

const HoldingsSchema = new Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    avg: { type: Number, required: true },
    price: Number,
    // FIX: net is now explicitly in schema (was being stored but not defined)
    net: String,
    day: String,
    boughtday: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// FIX: Index for userId-filtered queries
HoldingsSchema.index({ userId: 1 });
HoldingsSchema.index({ userId: 1, name: 1 });

const Holding = new model("Holding", HoldingsSchema);
module.exports = { Holding };
