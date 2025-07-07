const { model } = require("mongoose");
const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
});

const Position = new model("Position", PositionsSchema);

module.exports = { Position };
