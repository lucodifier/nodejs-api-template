const router = require("express-promise-router")();
const authController = require("../controllers/auth.controller");

router.post("/auth/authenticate", authController.authenticate);

module.exports = router;
