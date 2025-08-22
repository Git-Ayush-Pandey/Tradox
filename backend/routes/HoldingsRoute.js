const router = require("express").Router();
const { Holding } = require("../model/HoldingsModel");
const { isLoggedIn } = require("../middleware");
const { User } = require("../model/UserModel");

router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allHoldings = await Holding.find({ userId });
  res.json(allHoldings);
});

router.post("/add", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { name, qty, avg, price, net, day } = req.body;

  if (!name || qty == null || avg == null) {
    return res.status(400).json({ error: "Required fields missing" });
  }
  try {
    const existing = await Holding.findOne({ name, userId });
    if (existing) {
      const totalQty = existing.qty + qty;
      const totalCost = existing.avg * existing.qty + avg * qty;
      existing.qty = totalQty;
      existing.avg = totalCost / totalQty;
      existing.price = price;
      existing.net = net;
      existing.day = day;

      await existing.save();
      return res
        .status(200)
        .json({ message: "Holding updated", holding: existing });
    }
    const newHolding = new Holding({
      name,
      qty,
      avg,
      price,
      net,
      day,
      userId,
    });
    await newHolding.save();
    res.status(201).json({ message: "Holding added", holding: newHolding });
  } catch (err) {
    console.error("Add/Update holding error:", err);
    res.status(500).send("Server error");
  }
});

router.put("/sell/:name", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { name } = req.params;
  const { qtySold, sellPrice } = req.body;

  try {
    const holding = await Holding.findOne({ name, userId });
    if (!holding) return res.status(404).send("Holding not found");

    const user = await User.findById(userId);

    const pl = (sellPrice - holding.avg) * qtySold;

    if (qtySold >= holding.qty) {
      await Holding.deleteOne({ _id: holding._id });
    } else {
      holding.qty -= qtySold;
      await holding.save();
    }

    user.realizedPL = (user.realizedPL || 0) + pl;
    await user.save();

    res
      .status(200)
      .json({ message: "Holding sold", realizedPL: user.realizedPL });
  } catch (err) {
    console.error("Sell holding error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
