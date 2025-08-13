const { Fund } = require("../model/FundsModel");
const { Holding } = require("../model/HoldingsModel");
const { Position } = require("../model/PositionsModel");

async function updateFundsOnOrderAction(
  userId,
  order,
  actionType,
  newQty = null,
  newPrice = null
) {
  const fund = await Fund.findOne({ userId });
  if (!fund) throw new Error("Fund record not found");

  const qty = newQty ?? order.qty;
  const price = newPrice ?? order.price;
  const total = qty * price;

  if (actionType === "place") {
    if (order.mode === "BUY") {
      fund.availableCash -= total;
      fund.usedMargin += total;
      fund.exposure += total;
    }
  }

  else if (actionType === "cancel") {
    if (order.mode === "BUY") {
      fund.availableCash += total;
      fund.usedMargin -= total;
      fund.exposure -= total;
    }
  }

  else if (actionType === "edit-revert") {
    if (order.mode === "BUY") {
      fund.availableCash += order.qty * order.price;
      fund.usedMargin -= order.qty * order.price;
      fund.exposure -= order.qty * order.price;
    }
  }

  else if (actionType === "edit-apply") {
    if (order.mode === "BUY") {
      fund.availableCash -= total;
      fund.usedMargin += total;
      fund.exposure += total;
    }
  }

  else if (actionType === "execute") {
    if (order.mode === "BUY") {
      // Release the locked margin
      fund.usedMargin -= total;
      fund.exposure -= total;
    } 
    else if (order.mode === "SELL") {
      // Credit proceeds from sale
      fund.availableCash += total;

      // Get avg buy price from DB if not provided
      let avgBuyValue;
      if (order.avg) {
        avgBuyValue = order.avg * qty;
      } else {
        const collection = order.type === "Delivery" ? Holding : Position;
        const asset = await collection.findOne({ userId, name: order.name });
        if (asset) {
          avgBuyValue = asset.avg * qty;
        } else {
          avgBuyValue = total; // fallback
        }
      }

      // Release margin based on buy cost
      fund.usedMargin -= avgBuyValue;
      fund.exposure -= avgBuyValue;

      // Update realised P&L
      const realisedPL = total - avgBuyValue;
      fund.realisedPnL = (fund.realisedPnL || 0) + realisedPL;
    }
  }

  // Recalculate availableMargin
  fund.availableMargin =
    fund.availableCash + fund.collateralLiquid + fund.collateralEquity;

  await fund.save();
}

module.exports = { updateFundsOnOrderAction };
