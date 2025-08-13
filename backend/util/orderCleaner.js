// util/orderCronJobs.js
const cron = require("node-cron");
const { Order } = require("../model/OrdersModel");
const { updateFundsOnOrderAction } = require("../util/updateFunds");

// ✅ Delete executed orders older than 1 day — 6:00 PM IST
cron.schedule("30 12 * * *", async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1); // older than 1 day

    const result = await Order.deleteMany({
      executed: true,
      placedAt: { $lt: cutoff },
    });

    console.log(`🧹 Deleted ${result.deletedCount} executed orders older than 1 day`);
  } catch (err) {
    console.error("❌ Failed to delete executed orders:", err);
  }
});

// ✅ Cancel all non-executed orders — 1:30 AM IST
cron.schedule("30 20 * * *", async () => {
  try {
    const pendingOrders = await Order.find({
      executed: false,
      cancelled: { $ne: true }
    });

    for (const order of pendingOrders) {
      await updateFundsOnOrderAction(order.userId, order, "cancel");
      order.cancelled = true;
      await order.save();
    }

    console.log(`🚫 Cancelled ${pendingOrders.length} pending orders and updated funds`);
  } catch (err) {
    console.error("❌ Failed to cancel orders:", err);
  }
});
