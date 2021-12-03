const accountCategoryService = require("../services/account.category.service");

exports.list = async (req, res) => {
  const id_identity = req.id_identity;

  const response = await accountCategoryService.list(id_identity);

  console.log("List categories executed!");

  res.status(200).send(response.rows);
};

exports.create = async (req, res) => {
  const id_identity = req.id_identity;

  const response = await accountCategoryService.create(id_identity, req.body);

  console.log("Create category executed!");

  res.status(201).send({
    message: "Category create executed!",
    body: req.body,
  });
};
