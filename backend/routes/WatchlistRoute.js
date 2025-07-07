const { getWatchlist } = require("../controller/WatchListController");
const router = require("express").Router();

router.get("/", getWatchlist);

module.exports = router;
