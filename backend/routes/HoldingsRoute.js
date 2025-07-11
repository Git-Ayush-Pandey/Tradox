const router = require("express").Router();
const { Holding } = require("../model/HoldingsModel");
const {isLoggedIn} = require("../middleware")

router.get("/", isLoggedIn, async (req, res) => {
  let allHoldings = await Holding.find({});
  res.json(allHoldings);
})

module.exports = router;
