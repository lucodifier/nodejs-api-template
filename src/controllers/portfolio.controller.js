const db = require("../configs/_database");
const portfolioService = require("../services/portfolio.service");

exports.list = async (req, res) => {
  const id_identity = req.id_identity;

  var response = await portfolioService.list(id_identity);

  console.log("Portfolio list executed!");

  res.status(200).send(response.rows);
};
