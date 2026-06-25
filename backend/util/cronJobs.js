const cron = require("node-cron");
const { autoSquareOffIntraday } = require("./autoSquareOff");
const { Order } = require("../model/OrdersModel");
const { updateFundsOnOrderAction } = require("./updateFunds");

// FIX: Changed timezone from America/New_York to Asia/Kolkata (IST) to match
// the INR-denominated, NSE-themed UI. NSE closes at 15:30 IST.
// Auto square-off runs at 15:25 IST, cancel pending at 15:35 IST.
// NOTE: If you intend US market hours, revert timezone to "America/New_York"
// and change times to "2 16 * * 1-5" and "5 16 * * 1-5".
function registerCronJobs() {
  cron.schedule(
    "25 15 * * 1-5",
    async () => {
      console.log("[cron] Trigger: auto-square-off (15:25 IST)");
      try {
        await autoSquareOffIntraday();
        console.log("[cron] Auto square-off completed");
      } catch (err) {
        console.error("[cron] Auto square-off failed:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  cron.schedule(
    "35 15 * * 1-5",
    async () => {
      console.log("[cron] Trigger: cancel pending orders (15:35 IST)");
      try {
        const pendingOrders = await Order.find({
          executed: false,
          cancelled: { $ne: true },
        });

        let cancelledCount = 0;
        for (const order of pendingOrders) {
          try {
            await updateFundsOnOrderAction(order.userId, order, "cancel");
            order.cancelled = true;
            order.cancelledAt = new Date();
            await order.save();
            cancelledCount++;
          } catch (e) {
            console.error(`[cron] Failed cancelling order ${order._id}:`, e);
          }
        }
        console.log(`[cron] Cancelled ${cancelledCount}/${pendingOrders.length} pending orders`);
      } catch (err) {
        console.error("[cron] Cancelling pending orders failed:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  cron.schedule(
    "0 2 * * 1-5",
    async () => {
      console.log("[cron] Trigger: cleanup executed orders older than 1 day (02:00 IST)");
      try {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await Order.deleteMany({
          executed: true,
          executedAt: { $lt: cutoff },
        });
        console.log(`[cron] Deleted ${result.deletedCount} executed orders older than 1 day`);
      } catch (err) {
        console.error("[cron] Deleting executed orders failed:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("[cron] Registered cron jobs (auto-square, cancel, cleanup) — timezone: Asia/Kolkata (IST)");
}

module.exports = registerCronJobs;
