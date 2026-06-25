const router = require("express").Router();
const { Position } = require("../model/PositionsModel");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const allPositions = await Position.find({ userId });
    res.json(allPositions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// WARNING: /add and /sell routes below bypass the Orders flow and do NOT
// perform fund accounting. They are intentionally disabled (403).
// The correct path is POST /orders/new + POST /orders/execute/:id.

router.post("/add", isLoggedIn, (_req, res) => {
  res.status(403).json({
    success: false,
    message: "Direct position manipulation is disabled. Use the Orders flow.",
  });
});

router.put("/sell/:name", isLoggedIn, (_req, res) => {
  res.status(403).json({
    success: false,
    message: "Direct position sell is disabled. Use the Orders flow.",
  });
});

module.exports = router;
