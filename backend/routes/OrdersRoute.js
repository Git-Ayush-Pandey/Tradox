const { getOrders } = require("../controller/OrdersController");
const router = require("express").Router();

router.get("/", getOrders);

module.exports = router;
