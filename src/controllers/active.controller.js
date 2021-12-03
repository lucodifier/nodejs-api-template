const db = require("../configs/_database");
const formidable = require("formidable");
const csvtojson = require("csvtojson");
const fs = require("fs");
const format = require("pg-format");

let categories = require("./investment_categories.json");
const activeService = require("../services/active.service");

exports.list = async (req, res) => {
  const id_identity = req.id_identity;

  var response = await activeService.active_list(id_identity);

  console.log("Active list executed!");

  res.status(200).send(response.rows);
};

exports.list_by_category = async (req, res) => {
  const id_identity = req.id_identity;
  const id_category = parseInt(req.params.id);

  var response = await activeService.active_list_by_category(
    id_identity,
    id_category
  );

  console.log("Active list by category executed!");

  res.status(200).send(response.rows);
};

exports.create = async (req, res) => {
  const id_identity = req.id_identity;

  const exists = await activeService.active_find(id_identity, req.body.ticket);

  if (exists.rows.length > 0) {
    return res.status(409).send({
      message: "Active already exists!",
      body: req.body,
    });
  }

  const response = await activeService.active_create(id_identity, req.body);

  res.status(201).send({
    message: "Active create executed!",
    body: req.body,
  });
};

exports.update = async (req, res) => {
  const id_identity = req.id_identity;

  if (req.body.id == 0) {
    return res.status(404).send({
      message: "Id required!",
      body: req.body,
    });
  }

  const exists = await activeService.active_find(id_identity, req.body.ticket);
  if (exists.rows.length > 0) {
    if (exists.rows[0].id != req.body.id) {
      return res.status(409).send({
        message: "Active already exists!",
        body: req.body,
      });
    }
  }

  const response = await activeService.active_update(req.body);

  res.status(201).send({
    message: "Active update executed!",
    body: req.body,
  });
};

exports.delete = async (req, res) => {
  const id = parseInt(req.params.id);

  const response = await activeService.active_delete(id);

  console.log("Active delete executed!");

  res.status(200).send({ message: "Deleted successfully!", id });
};

// Ler key csvfile from post form-data
exports.upload = (req, res) => {
  const id_identity = req.id_identity;
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    try {
      const csvData = fs.readFileSync(files.csvfile.path, "utf8");

      return csvtojson({
        delimiter: ";",
        trim: true,
        quote: "off",
      })
        .fromString(csvData)
        .then((json) => {
          if (json) {
            const itens = json.map((item) => {
              var category = categories.investment_categories.find(
                (c) => c.description == item.Tipo
              );
              var categoryId = 1;
              if (category) categoryId = category.id;
              return [
                item.Ativo,
                item.Descricao,
                null,
                id_identity,
                categoryId,
              ];
            });

            const query = `INSERT INTO invest.actives
            (ticket, description, deleted_at, id_identity, id_investment_category)
            values %L`;
            const insert = format(query, itens);

            const response = db.query(insert).then((response) => {
              console.log("Active import executed!");

              return res
                .status(201)
                .json({ message: "Ativos importados", json: json });
            });
          }
        });
    } catch (error) {
      console.log("Erro no upload do csv");
      console.error(error);
      return res.status(404);
    }
  });
};
