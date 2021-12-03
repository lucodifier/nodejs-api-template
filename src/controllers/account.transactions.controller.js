const accountTransactionService = require("../services/account.transactions.service");

exports.list = async (req, res) => {
  const id_identity = req.id_identity;
  var accounts = req.params.accounts;
  var categories = req.params.categories;
  var month = req.params.month;
  var year = req.params.year;

  if (!accounts) accounts = "";
  if (!categories) categories = "";
  if (!month) month = "";
  if (!year) year = "";

  const response = await accountTransactionService.list(
    id_identity,
    accounts,
    categories,
    month,
    year
  );

  console.log("List transactions executed!");

  res.status(200).send(response.rows);
};

exports.create = async (req, res) => {
  const id_identity = req.id_identity;

  const response = await accountTransactionService.create(
    id_identity,
    req.body
  );

  console.log("Create transaction executed!");

  res.status(201).send({
    message: "Transaction create executed!",
    body: req.body,
  });
};

exports.update = async (req, res) => {
  const id_identity = req.id_identity;

  const response = await accountTransactionService.update(
    id_identity,
    req.body
  );

  console.log("Update transaction executed!");

  res.status(201).send({
    message: "Transaction update executed!",
    body: req.body,
  });
};

exports.remove = async (req, res) => {
  const id_identity = req.id_identity;
  const { id } = req.body;

  const response = await accountTransactionService.remove(id_identity, id);

  console.log("Remove transaction executed!");

  res.status(201).send({
    message: "Transaction removed executed!",
    body: req.body,
  });
};

// Ler key csvfile from post form-data
exports.upload = async (req, res) => {
  const id_identity = req.id_identity;
  var form = new formidable.IncomingForm();

  var itens = [];

  console.log("Upload started!");

  form.parse(req, function (err, fields, files) {
    try {
      var csvData = fs.readFileSync(files.csvfile.path, "utf8");

      return csvtojson({
        delimiter: ";",
        trim: true,
        quote: "off",
      })
        .fromString(csvData)
        .then((json) => {
          if (json) {
            itens = json;
          }
        });
    } catch (error) {
      console.log("Erro no upload do csv");
      console.error(error);
      return res.status(404);
    }
  });

  // Aguardar leitura do arquivo
  setTimeout(async () => {
    try {
      await investmentTransaction.investments_uploads(id_identity, itens);
      res.status(201).send({ message: "Upload Finished" });
      console.log("Upload finished!");
    } catch (err) {
      console.log("Error");
      console.log(err);
      res.status(404).send({ message: err });
    }
  }, 3000);
};
