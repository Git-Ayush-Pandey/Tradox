const router = require("express").Router();
const { Position } = require("../model/PositionsModel");
const { isLoggedIn } = require("../middleware");
const { User } = require("../model/UserModel");

router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allPositions = await Position.find({ userId });
  res.json(allPositions);
});

router.post("/add", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { name, qty, avg, price, net, day, isLoss } = req.body;

  if (!name || qty == null || avg == null) {
    return res.status(400).json({ error: "Required fields missing" });
  }
  try {
    const existing = await Position.findOne({ name, userId });
    if (existing) {
      const totalQty = existing.qty + qty;
      const totalValue = existing.avg * existing.qty + avg * qty;
      existing.qty = totalQty;
      existing.avg = totalValue / totalQty;
      existing.price = price;
      existing.net = net;
      existing.day = day;
      existing.isLoss = isLoss;

      await existing.save();
      return res
        .status(200)
        .json({ message: "Position updated", position: existing });
    }
    const newPosition = new Position({
      name,
      qty,
      avg,
      price,
      net,
      day,
      isLoss,
      userId,
    });
    await newPosition.save();
    res.status(201).json({ message: "Position added", position: newPosition });
  } catch (err) {
    console.error("Add/Update position error:", err);
    res.status(500).send("Server error");
  }
});

router.put("/sell/:name", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { name } = req.params;
  const { qtySold, sellPrice } = req.body;

  try {
    const position = await Position.findOne({ name, userId });
    if (!position) return res.status(404).send("Position not found");

    const pnl = (sellPrice - position.avg) * Math.min(qtySold, position.qty);

    await User.findByIdAndUpdate(userId, { $inc: { realisedPnL: pnl } });

    if (qtySold >= position.qty) {
      await Position.deleteOne({ _id: position._id });
      return res.status(200).send("Position fully sold and deleted");
    }

    position.qty -= qtySold;
    await position.save();

    res.status(200).json({
      message: "Position partially sold",
      realisedPnL: pnl,
      updated: position,
    });
  } catch (err) {
    console.error("Sell error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
