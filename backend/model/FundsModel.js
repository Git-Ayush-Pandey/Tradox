const { Schema, model } = require("mongoose");

const FundsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  availableMargin: Number,
  usedMargin: Number,
  availableCash: Number,
  openingBalance: Number,
  payin: Number,
  span: Number,
  deliveryMargin: Number,
  exposure: Number,
  optionsPremium: Number,
  collateralLiquid: Number,
  collateralEquity: Number,
});

const Fund = model("Fund", FundsSchema);
module.exports = { Fund };
