const router = require("express-promise-router")();
const controller = require("../controllers/investment.category.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.get("/investment_category", controller.list);

module.exports = router;
