const router = require("express-promise-router")();
const accountController = require("../controllers/account_payable.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.post("/account_payable", accountController.create);

module.exports = router;
