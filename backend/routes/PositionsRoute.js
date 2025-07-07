const { getPositions } = require("../controller/PositionController");
const router = require("express").Router();

router.get("/", getPositions);

module.exports = router;
