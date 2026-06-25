const router = require("express").Router();
const { Fund } = require("../model/FundsModel");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const fund = await Fund.findOne({ userId: req.user._id });
    if (!fund) return res.status(404).json({ message: "Fund data not found" });
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  // FIX: isNaN guard on parseFloat
  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0)
    return res.status(400).json({ message: "Invalid amount" });

  try {
    const fund = await Fund.findOne({ userId: req.user._id });
    if (!fund) return res.status(404).json({ message: "Fund not found" });

    fund.availableMargin += amount;
    fund.availableCash += amount;
    fund.payin += amount;
    await fund.save();

    res.json({ success: true, message: "Funds added", fund });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/withdraw", isLoggedIn, async (req, res) => {
  // FIX: isNaN guard on parseFloat
  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0)
    return res.status(400).json({ message: "Invalid amount" });

  try {
    const fund = await Fund.findOne({ userId: req.user._id });
    if (!fund) return res.status(404).json({ message: "Fund not found" });

    if (fund.availableCash < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    // FIX: payin tracks total deposits and should NOT be decremented on withdrawal
    // Only availableMargin and availableCash are reduced
    fund.availableMargin -= amount;
    fund.availableCash -= amount;
    await fund.save();

    res.json({ success: true, message: "Funds withdrawn", fund });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
