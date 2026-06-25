const mongoose = require("mongoose");
const { Fund } = require("../model/FundsModel");
const { Holding } = require("../model/HoldingsModel");
const { Position } = require("../model/PositionsModel");

async function updateFundsOnOrderAction(
  userId,
  order,
  actionType,
  options = {}
) {
  const session = options.session || null;
  const qty = options.newQty ?? order.qty;
  const price = options.newPrice ?? order.price;
  const total = qty * price;

  async function computeAvgBuyValue() {
    if (order.avg) return order.avg * qty;
    const collection = order.type === "Delivery" ? Holding : Position;
    const asset = await collection
      .findOne({ userId, name: order.name })
      .session(session || undefined);
    if (asset) return asset.avg * qty;
    return total;
  }

  if (session) {
    let fund = await Fund.findOne({ userId }).session(session);
    if (!fund) throw new Error("Fund record not found");

    if (actionType === "place") {
      if (order.mode === "BUY") {
        await Fund.updateOne(
          { userId },
          {
            $inc: { availableCash: -total, usedMargin: total, exposure: total },
          }
        ).session(session);
      }
    } else if (actionType === "cancel") {
      if (order.mode === "BUY") {
        await Fund.updateOne(
          { userId },
          {
            $inc: {
              availableCash: total,
              usedMargin: -total,
              exposure: -total,
            },
          }
        ).session(session);
      }
    } else if (actionType === "edit-revert") {
      if (order.mode === "BUY") {
        const revertTotal = order.qty * order.price;
        await Fund.updateOne(
          { userId },
          {
            $inc: {
              availableCash: revertTotal,
              usedMargin: -revertTotal,
              exposure: -revertTotal,
            },
          }
        ).session(session);
      }
    } else if (actionType === "edit-apply") {
      if (order.mode === "BUY") {
        await Fund.updateOne(
          { userId },
          {
            $inc: { availableCash: -total, usedMargin: total, exposure: total },
          }
        ).session(session);
      }
    } else if (actionType === "execute") {
      if (order.mode === "BUY") {
        await Fund.updateOne(
          { userId },
          { $inc: { usedMargin: -total, exposure: -total } }
        ).session(session);
      } else if (order.mode === "SELL") {
        const avgBuyValue = await computeAvgBuyValue();
        const realisedPL = total - avgBuyValue;
        await Fund.updateOne(
          { userId },
          {
            $inc: {
              availableCash: total,
              usedMargin: -avgBuyValue,
              exposure: -avgBuyValue,
              realisedPnL: realisedPL,
            },
          }
        ).session(session);
      }
    }

    const updatedFund = await Fund.findOne({ userId }).session(session);
    const newAvailableMargin =
      (updatedFund.availableCash || 0) +
      (updatedFund.collateralLiquid || 0) +
      (updatedFund.collateralEquity || 0);
    await Fund.updateOne(
      { userId },
      { $set: { availableMargin: newAvailableMargin } }
    ).session(session);

    return;
  }

  if (actionType === "place") {
    if (order.mode === "BUY") {
      await Fund.updateOne(
        { userId },
        { $inc: { availableCash: -total, usedMargin: total, exposure: total } }
      );
    }
  } else if (actionType === "cancel") {
    if (order.mode === "BUY") {
      await Fund.updateOne(
        { userId },
        { $inc: { availableCash: total, usedMargin: -total, exposure: -total } }
      );
    }
  } else if (actionType === "edit-revert") {
    if (order.mode === "BUY") {
      const revertTotal = order.qty * order.price;
      await Fund.updateOne(
        { userId },
        {
          $inc: {
            availableCash: revertTotal,
            usedMargin: -revertTotal,
            exposure: -revertTotal,
          },
        }
      );
    }
  } else if (actionType === "edit-apply") {
    if (order.mode === "BUY") {
      await Fund.updateOne(
        { userId },
        { $inc: { availableCash: -total, usedMargin: total, exposure: total } }
      );
    }
  } else if (actionType === "execute") {
    if (order.mode === "BUY") {
      await Fund.updateOne(
        { userId },
        { $inc: { usedMargin: -total, exposure: -total } }
      );
    } else if (order.mode === "SELL") {
      const avgBuyValue = await computeAvgBuyValue();
      const realisedPL = total - avgBuyValue;
      await Fund.updateOne(
        { userId },
        {
          $inc: {
            availableCash: total,
            usedMargin: -avgBuyValue,
            exposure: -avgBuyValue,
            realisedPnL: realisedPL,
          },
        }
      );
    }
  }

  const fundDoc = await Fund.findOne({ userId });
  const newAvailableMargin =
    (fundDoc.availableCash || 0) +
    (fundDoc.collateralLiquid || 0) +
    (fundDoc.collateralEquity || 0);
  fundDoc.availableMargin = newAvailableMargin;
  await fundDoc.save();
}

module.exports = { updateFundsOnOrderAction };
