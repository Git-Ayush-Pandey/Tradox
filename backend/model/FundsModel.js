const { Schema, model } = require("mongoose");

const FundsSchema = new Schema(
  {
    // NOTE: realisedPnL/unrealisedPnL kept here for funds context (order execution P&L tracking)
    // UserModel.realizedPL/unrealizedPL is updated separately from the dashboard for display
    realisedPnL: { type: Number, default: 0 },
    unrealisedPnL: { type: Number, default: 0 },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    availableMargin: { type: Number, default: 0 },
    usedMargin: { type: Number, default: 0 },
    availableCash: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    payin: { type: Number, default: 0 },
    span: { type: Number, default: 0 },
    deliveryMargin: { type: Number, default: 0 },
    exposure: { type: Number, default: 0 },
    optionsPremium: { type: Number, default: 0 },
    collateralLiquid: { type: Number, default: 0 },
    collateralEquity: { type: Number, default: 0 },

    commodityAvailableMargin: { type: Number, default: 0 },
    commodityUsedMargin: { type: Number, default: 0 },
    commodityAvailableCash: { type: Number, default: 0 },
    commodityOpeningBalance: { type: Number, default: 0 },
    commodityPayin: { type: Number, default: 0 },
    commoditySpan: { type: Number, default: 0 },
    commodityDeliveryMargin: { type: Number, default: 0 },
    commodityExposure: { type: Number, default: 0 },
    commodityOptionsPremium: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// FIX: Index for userId-filtered queries
FundsSchema.index({ userId: 1 }, { unique: true });

const Fund = model("Fund", FundsSchema);
module.exports = { Fund };
