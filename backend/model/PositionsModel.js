const { model, Schema } = require("mongoose");

const PositionsSchema = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  day: String,
  isLoss: Boolean,
  boughtday: {
  type: Date,
  default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Position = new model("Position", PositionsSchema);
module.exports = { Position };
