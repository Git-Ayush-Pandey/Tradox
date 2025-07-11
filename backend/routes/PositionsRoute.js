const router = require("express").Router();
const { Position } = require("../model/PositionsModel");
const {isLoggedIn} = require("../middleware")

router.get("/", isLoggedIn, async (req, res) => {
  let allPositions = await Position.find({});
  res.json(allPositions);
});

module.exports = router;
