const db = require("../configs/_database");
var pg = require("pg");

// ==> Método responsável por criar um novo
exports.create = async (req, res) => {
  const id_identity = req.id_identity;
  const { description, note, value, day, month, year, recurrence, date } =
    req.body;
  const response = await db.query(
    `INSERT INTO invest.accounts_payable
   (description, note, value, payable_day, payable_month, payable_year, recurrence, payable_date, created_at, updated_at, deleted_at, id_identity)
   VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $9);`,
    [description, note, value, day, month, year, recurrence, date, id_identity]
  );

  res.status(201).send({
    message: "Added successfully!",
    body: {
      account: { description },
    },
  });
};

// ==> Método responsável por listar todos os 'Products':
exports.list = async (req, res) => {
  const response = await db.query(
    "select * from invest.accounts order by 2 asc"
  );

  console.log("List executed!");

  res.status(200).send(response.rows);
};
/*
// ==> Método responsável por selecionar 'Product' pelo 'Id':
exports.findProductById = async (req, res) => {
  const productId = parseInt(req.params.id);
  const response = await db.query(
    "SELECT * FROM products WHERE productid = $1",
    [productId]
  );
  res.status(200).send(response.rows);
};

// ==> Método responsável por atualizar um 'Product' pelo 'Id':
exports.updateProductById = async (req, res) => {
  const productId = parseInt(req.params.id);
  const { product_name, quantity, price } = req.body;

  const response = await db.query(
    "UPDATE products SET product_name = $1, quantity = $2, price = $3 WHERE productId = $4",
    [product_name, quantity, price, productId]
  );

  res.status(200).send({ message: "Product Updated Successfully!" });
};

// ==> Método responsável por excluir um 'Product' pelo 'Id':
exports.deleteProductById = async (req, res) => {
  const productId = parseInt(req.params.id);
  await db.query("DELETE FROM products WHERE productId = $1", [productId]);

  res.status(200).send({ message: "Product deleted successfully!", productId });
};*/
