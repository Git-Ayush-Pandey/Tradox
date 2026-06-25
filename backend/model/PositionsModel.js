const { model, Schema } = require("mongoose");

const PositionsSchema = new Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    avg: { type: Number, required: true },
    price: Number,
    net: String,
    day: String,
    isLoss: Boolean,
    // FIX: processing and processingAt are now explicit in schema
    processing: { type: Boolean, default: false },
    processingAt: Date,
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
PositionsSchema.index({ userId: 1 });
PositionsSchema.index({ userId: 1, name: 1 });

const Position = model("Position", PositionsSchema);
module.exports = { Position };
