const { Schema, model } = require("mongoose");

const FundsSchema = new Schema({
  realisedPnL: { type: Number, default: 0 },
  unrealisedPnL: { type: Number, default: 0 },
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

  commodityAvailableMargin: Number,
  commodityUsedMargin: Number,
  commodityAvailableCash: Number,
  commodityOpeningBalance: Number,
  commodityPayin: Number,
  commoditySpan: Number,
  commodityDeliveryMargin: Number,
  commodityExposure: Number,
  commodityOptionsPremium: Number,
});

const Fund = model("Fund", FundsSchema);
module.exports = { Fund };
