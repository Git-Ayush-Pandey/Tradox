const router = require("express").Router();
const { Fund } = require("../model/FundsModel");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  const fund = await Fund.findOne({ userId: req.user._id });
  if (!fund) return res.status(404).json({ message: "Fund data not found" });
  res.json(fund);
});

router.post("/add", isLoggedIn, async (req, res) => {
  const amount = parseFloat(req.body.amount);
  if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  const fund = await Fund.findOne({ userId: req.user._id });
  if (!fund) return res.status(404).json({ message: "Fund not found" });

  fund.availableMargin += amount;
  fund.availableCash += amount;
  fund.payin += amount;
  await fund.save();

  res.json({ success: true, message: "Funds added", fund });
});

router.post("/withdraw", isLoggedIn, async (req, res) => {
  const amount = parseFloat(req.body.amount);
  if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  const fund = await Fund.findOne({ userId: req.user._id });
  if (!fund) return res.status(404).json({ message: "Fund not found" });

  if (fund.availableCash < amount) {
    return res.status(400).json({ message: "Insufficient funds" });
  }
  fund.availableMargin -= amount;
  fund.availableCash -= amount;
  fund.payin -= amount;
  await fund.save();

  res.json({ success: true, message: "Funds withdrawn", fund });
});

module.exports = router;
