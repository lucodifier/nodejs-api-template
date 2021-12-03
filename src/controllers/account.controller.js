const db = require("../configs/_database");
var pg = require("pg");

exports.create = async (req, res) => {
  const id_identity = req.id_identity;
  console.log(id_identity);
  const { description } = req.body;
  const response = await db.query(
    "INSERT INTO invest.accounts (description, created_at, updated_at, deleted_at, id_identity)" +
      "VALUES($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $2)",
    [description, id_identity]
  );

  res.status(201).send({
    message: "Account added successfully!",
    body: {
      account: { description },
    },
  });
};

exports.update = async (req, res) => {
  const id_identity = req.id_identity;
  const { id, description } = req.body;
  const response = await db.query(
    `UPDATE invest.accounts
    SET description=$2, updated_at=CURRENT_TIMESTAMP 
    WHERE id=$1 and id_identity=$3`,
    [id, description, id_identity]
  );

  res.status(201).send({
    message: "Account updated successfully!",
    body: {
      account: { description },
    },
  });
};

exports.list = async (req, res) => {
  const id_identity = req.id_identity;
  const response = await db.query(
    `SELECT 
    a.id, 
    a.description, 
    a.created_at, 
    id_identity, 
    ( select sum(Cast(value as int4)) FROM invest.accounts_transactions tr where tr.id_account = a.id ) as total
  FROM invest.accounts a
  where a.id_identity  = $1
  and a.deleted_at is null`,
    [id_identity]
  );
  console.log("List executed!");

  res.status(200).send(response.rows);
};

exports.remove = async (req, res) => {
  const id_identity = req.id_identity;
  const id = parseInt(req.params.id);
  const response = await db.query(
    `UPDATE invest.accounts
    SET deleted_at=CURRENT_TIMESTAMP
    WHERE id=$1 and id_identity=$2`,
    [id, id_identity]
  );

  res.status(201).send({
    message: "Account deleted successfully!",
    id,
  });
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
