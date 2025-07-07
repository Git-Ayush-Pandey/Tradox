const { Holding } = require("../model/HoldingsModel");

module.exports.getHoldings = async (req, res) => {
  let allHoldings = await Holding.find({});
  res.json(allHoldings);
};
