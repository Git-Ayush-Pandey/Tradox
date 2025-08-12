const { model, Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  boughtday: {
  type: Date,
  default: Date.now
},
  day: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Holding = new model("Holding", HoldingsSchema);
module.exports = { Holding };
