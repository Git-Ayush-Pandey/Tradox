const router = require("express").Router();
const { Holding } = require("../model/HoldingsModel");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const allHoldings = await Holding.find({ userId });
    res.json(allHoldings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// WARNING: /add and /sell routes below bypass the Orders flow and do NOT
// perform fund accounting. They are NOT called by any dashboard component.
// They are intentionally disabled (403) to prevent data inconsistencies.
// The correct path is POST /orders/new + POST /orders/execute/:id.

router.post("/add", isLoggedIn, (_req, res) => {
  res.status(403).json({
    success: false,
    message: "Direct holding manipulation is disabled. Use the Orders flow.",
  });
});

router.put("/sell/:name", isLoggedIn, (_req, res) => {
  res.status(403).json({
    success: false,
    message: "Direct holding sell is disabled. Use the Orders flow.",
  });
});

module.exports = router;
