const { Position } = require("../model/PositionsModel");

module.exports.getPositions = async (req, res) => {
  let allPositions = await Position.find({});
  res.json(allPositions);
};
