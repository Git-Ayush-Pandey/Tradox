const { getHoldings } = require("../controller/HoldingController");
const router = require("express").Router();

router.get("/", getHoldings);

module.exports = router;
