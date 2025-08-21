const axios = require("axios");
const mongoose = require("mongoose");
const { Position } = require("../model/PositionsModel");
const { Order } = require("../model/OrdersModel");
const { updateFundsOnOrderAction } = require("./updateFunds");
const FINNHUB_REST = process.env.SEARCH_API_KEY || null;

async function fetchQuoteSafe(symbol) {
  try {
    const res = await axios.get(`${PRICE_API_BASE}/price`, {
      params: { symbol },
    });
    const data = res.data;
    if (data && (data?.data?.c || data?.c)) {
      return data?.data?.c ?? data?.c;
    }
  } catch (err) {
    console.warn("Local price fetch failed for", symbol, err.message);
  }

  if (FINNHUB_REST) {
    try {
      const res = await axios.get("https://finnhub.io/api/v1/quote", {
        params: { symbol, token: FINNHUB_REST },
      });
      if (res.data && res.data.c !== undefined && res.data.c !== null)
        return res.data.c;
    } catch (err) {
      console.warn("Finnhub REST fetch failed for", symbol, err.message);
    }
  }

  return null;
}

async function autoSquareOffIntraday() {
  console.log("[autoSquareOff] Starting auto-square-off loop");

  while (true) {
    const pos = await Position.findOneAndUpdate(
      { type: "Intraday", processing: { $ne: true } },
      { $set: { processing: true, processingAt: new Date() } },
      { new: true }
    );

    if (!pos) break;

    const session = await mongoose.startSession();
    let usingTx = false;
    try {
      const quotePrice = await fetchQuoteSafe(pos.name);
      const ltp = quotePrice !== null ? quotePrice : pos.avg;
      const userId = pos.userId;
      const qty = pos.qty;
      const avgPrice = pos.avg;

      const orderDoc = {
        userId,
        name: pos.name,
        qty,
        price: ltp,
        avg: avgPrice,
        mode: "SELL",
        type: "Intraday",
        executed: true,
        executedAt: new Date(),
        placedAt: pos.boughtAt || new Date(),
        auto: true,
        note: "auto-square-off-intraday",
      };

      try {
        session.startTransaction();
        usingTx = true;

        const createdOrder = await Order.create([orderDoc], { session });
        await updateFundsOnOrderAction(userId, createdOrder[0], "execute", {
          session,
        });
        await Position.deleteOne({ _id: pos._id }).session(session);

        await session.commitTransaction();
        session.endSession();
        console.log(
          `[autoSquareOff] Order ${createdOrder[0]._id} created & funds updated for user ${userId}`
        );
      } catch (txErr) {
        if (usingTx) {
          await session.abortTransaction();
          session.endSession();
          usingTx = false;
        }
        console.warn(
          "[autoSquareOff] Transaction failed or not available, falling back:",
          txErr.message
        );

        const createdOrder = await Order.create(orderDoc);
        try {
          await updateFundsOnOrderAction(userId, createdOrder, "execute");
        } catch (fundErr) {
          console.error(
            "[autoSquareOff] Funds update failed for order",
            createdOrder._id,
            fundErr
          );
          createdOrder.note =
            (createdOrder.note || "") + " | funds-update-failed";
          await createdOrder.save();
        }
        await Position.deleteOne({ _id: pos._id });
        console.log(
          `[autoSquareOff] Fallback processed order ${createdOrder._id} for user ${userId}`
        );
      }
    } catch (err) {
      console.error("[autoSquareOff] Error processing position", pos._id, err);
      try {
        await Position.updateOne(
          { _id: pos._id },
          { $unset: { processing: "", processingAt: "" } }
        );
      } catch (clearErr) {
        console.error(
          "[autoSquareOff] Failed to clear processing flag:",
          clearErr
        );
      }
    } finally {
      if (session && session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch (_) {}
        session.endSession();
      }
    }
  }

  console.log("[autoSquareOff] Finished auto-square-off loop");
}

module.exports = { autoSquareOffIntraday };
