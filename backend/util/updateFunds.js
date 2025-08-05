// utils/updateFunds.js
const { Fund } = require("../model/FundsModel");

async function updateFundsOnOrderAction(userId, order, actionType, newQty = null, newPrice = null) {
  const fund = await Fund.findOne({ userId });
  if (!fund) throw new Error("Fund record not found");

  const qty = newQty ?? order.qty;
  const price = newPrice ?? order.price;
  const total = qty * price;

  const multiplier = actionType === "place" ? 1 :
                     actionType === "cancel" ? -1 :
                     actionType === "edit-revert" ? 1 :
                     actionType === "edit-apply" ? -1 : 0;

  if (order.mode === "BUY") {
    fund.availableCash -= multiplier * total;
    fund.usedMargin += multiplier * total;
    fund.exposure += multiplier * total;
  } else if (order.mode === "SELL") {
    fund.availableCash += multiplier * total;
    fund.availableMargin += multiplier * total;
  }

  fund.availableMargin =
    fund.availableCash + fund.collateralLiquid + fund.collateralEquity;

  await fund.save();
}
module.exports = { updateFundsOnOrderAction };
