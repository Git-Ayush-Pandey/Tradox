const router = require("express").Router();
const { Holding } = require("../model/HoldingsModel");
const { isLoggedIn } = require("../middleware");

// ✅ GET: All holdings of the logged-in user
router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const allHoldings = await Holding.find({ userId });
  res.json(allHoldings);
});

// ✅ POST: Add or update holding on buy
router.post("/add", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { name, qty, avg, price, net, day } = req.body;

  if (!name || qty == null || avg == null) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const existing = await Holding.findOne({ name, userId });

    if (existing) {
      // Update existing holding: weighted average and total qty
      const totalQty = existing.qty + qty;
      const totalCost = existing.avg * existing.qty + avg * qty;
      existing.qty = totalQty;
      existing.avg = totalCost / totalQty;
      existing.price = price;
      existing.net = net;
      existing.day = day;

      await existing.save();
      return res.status(200).json({ message: "Holding updated", holding: existing });
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

// ✅ PUT: Reduce holding or delete on full sell
router.put("/sell/:name", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const { name } = req.params;
  const { qtySold } = req.body;

  try {
    const holding = await Holding.findOne({ name, userId });

    if (!holding) return res.status(404).send("Holding not found");

    if (qtySold >= holding.qty) {
      await Holding.deleteOne({ _id: holding._id });
      return res.status(200).send("Holding fully sold and deleted");
    }

    holding.qty -= qtySold;
    await holding.save();
    res.status(200).json({ message: "Holding partially sold", updated: holding });
  } catch (err) {
    console.error("Sell holding error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
