const cron = require("node-cron");
const Order = require("../model/OrdersModel");

cron.schedule("30 11 * * *", async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1); // 1 day ago

    const result = await Order.deleteMany({
      executed: true,
      placedAt: { $lt: cutoff },
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} executed orders older than 1 day`);
  } catch (err) {
    console.error("❌ Failed to clean old executed orders:", err);
  }
});