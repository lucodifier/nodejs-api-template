const router = require("express-promise-router")();
const controller = require("../controllers/broker.controller");

router.get("/brokers", controller.list);

module.exports = router;
