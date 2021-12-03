const router = require("express-promise-router")();
const accountController = require("../controllers/account.controller");

router.get("/accounts", accountController.list);
router.post("/accounts", accountController.create);
router.put("/accounts", accountController.update);
router.delete("/accounts/:id", accountController.remove);

// ==> Rota responsável por listar todos : (GET): localhost:3000/api/accounts
/*
// ==> Rota responsável por selecionar 'Product' pelo 'Id': (GET): localhost:3000/api/products/:id
router.get("/products/:id", productController.findProductById);

// ==> Rota responsável por atualizar 'Product' pelo 'Id': (PUT): localhost: 3000/api/products/:id
router.put("/products/:id", productController.updateProductById);

// ==> Rota responsável por excluir 'Product' pelo 'Id': (DELETE): localhost:3000/api/products/:id
router.delete("/products/:id", productController.deleteProductById);*/

module.exports = router;
