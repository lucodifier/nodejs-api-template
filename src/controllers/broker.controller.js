const db = require("../configs/_database");

const brokerService = require("../services/broker.service");

exports.list = async (req, res) => {
  const id_identity = req.id_identity;

  var response = await brokerService.list(id_identity);

  console.log("Broker list executed!");

  res.status(200).send(response.rows);
};
