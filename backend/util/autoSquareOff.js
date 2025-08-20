const { Position } = require("../model/PositionsModel");
const { Order } = require("../model/OrdersModel");
const { updateFundsOnOrderAction } = require("./updateFunds");
const { Fund } = require("../model/FundsModel");
const axios = require("axios");

async function fetchQuote(symbol) {
  const res = await axios.get(`http://localhost:4000/price?symbol=${symbol}`);
  return res.data;
}
async function autoSquareOffIntraday() {
  const positions = await Position.find({ type: "Intraday" });

  for (const pos of positions) {
    const userId = pos.userId;
    const qty = pos.qty;
    const avgPrice = pos.avg;

    let ltp;
    try {
      const quote = await fetchQuote(pos.name);
      ltp = quote?.data?.c || avgPrice;
    } catch (e) {
      ltp = avgPrice;
    }

    const order = new Order({
      userId,
      name: pos.name,
      qty,
      price: ltp,
      avg: avgPrice,
      mode: "SELL",
      type: "Intraday",
      executed: true,
      executedAt: new Date(),
    });

    await order.save();

    await updateFundsOnOrderAction(userId, order, "execute");

    await Position.deleteOne({ _id: pos._id });

    console.log(
      `🔄 Auto-sold ${qty} of ${pos.name} at ${ltp} for user ${userId}`
    );
  }
}

module.exports = { autoSquareOffIntraday };
