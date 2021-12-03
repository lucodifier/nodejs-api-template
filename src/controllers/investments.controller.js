const db = require("../configs/_database");

// Components
const fs = require("fs");
const csvtojson = require("csvtojson");
var formidable = require("formidable");

// Services
const broker = require("../services/broker.service");
const investmentTransaction = require("../services/investment.transactions.service");
const portfolioService = require("../services/portfolio.service");

// Helpers
const calculations = require("../services/currency.service");

exports.create = async (req, res) => {
  const id_identity = req.id_identity;

  const response = await investmentTransaction.investments_transaction_create(
    id_identity,
    req.body
  );

  var { id_active, id_broker, description, amount, price, tax } = req.body;

  await investmentTransaction.update_profits(
    id_identity,
    id_active,
    id_broker,
    amount,
    price,
    tax,
    "buy"
  );

  res.status(201).send({
    message: "Transaction create executed!",
    body: req.body,
  });
};

exports.list = async (req, res) => {
  const id_identity = req.id_identity;
  const response = await investmentTransaction.investments_transaction_list(
    id_identity
  );

  console.log("Active list executed!");

  res.status(200).send(response.rows);
};

// ==> Método responsável por listar
exports.portfolio = async (req, res) => {
  const id_identity = req.id_identity;
  const response = await db.query(
    `SELECT 
    t.id, 
    a.key as active,
    a.description as active_name,        
    i.description as investmentType,
    t.negotiation_date, 
    t.description, 
    b.description  as broker,
    b.logo_url as broker_image, 
    t.amount_buy, 
    t.price_buy, 
    (t.amount_buy * t.price_buy) as total_buy,
    t.amount_sell, 
    t.price_sell, 
    (t.amount_sell * t.price_sell) as total_sell,
    t.status, 
    t.created_at, 
    t.updated_at, 
    t.deleted_at        
  FROM invest.investmentstransactions t
  inner join invest.actives a on a.id = t.id_active 
  inner join invest.typeofinvestments i on i.id = t.id_investment_type 
  inner join invest.brokers  b on b.id = t.id_broker 
  where t.id_identity = $1
  order by 3 asc`,
    [id_identity]
  );

  console.log("portfolio executed!");

  res.status(200).send(response.rows);
};

// ==> Método responsável por listar os ativos e seus preços
exports.follow_up = async (req, res) => {
  const id_identity = req.id_identity;

  const response =
    await investmentTransaction.investments_transaction_follow_up(id_identity);

  var results = await Promise.all(
    response.rows.map(async (row) => {
      // Preço atual do ativo
      var price = await broker.actual_price(row.active, row.category);

      if (price) {
        var actual_price = calculations.decimal_to_int(price);
        row["actual_price"] = actual_price;

        // Preço estimado de venda neste valor
        var estimated_price_sell = actual_price * row.amount;
        row["estimated_price_sell"] =
          calculations.decimal_to_int(estimated_price_sell);

        // Diferença entre o preço comprado e preço atual
        var total = row.price * row.amount;
        row["total"] = total;
        var estimated_price_dif = estimated_price_sell - total;
        row["estimated_price_dif"] =
          calculations.decimal_to_int(estimated_price_dif);
      }

      return row;
    })
  );

  console.log("follow_up executed!");

  res.status(200).send(results);
};

exports.sell = async (req, res) => {
  const id_identity = req.id_identity;
  const { transaction_id, id_active, id_broker, amount, price, tax } = req.body;

  const exists =
    await investmentTransaction.investments_transaction_find_to_sell(
      id_identity,
      id_active,
      id_broker
    );
  console.log("passo 1");

  if (exists.rows.length == 0) {
    return res.status(409).send({
      message: "Do not have this amount of this asset",
      body: req.body,
    });
  } else {
    if (amount > exists.rows[0].amount) {
      return res.status(409).send({
        message: "Do not have this amount of this asset",
        body: req.body,
      });
    }
  }

  // Ajusta valores do body para o banco
  req.body.status = "Venda";
  req.body.price = -price;
  req.body.amount = -amount;

  console.log("passo 2");

  const response = await investmentTransaction.investments_transaction_create(
    id_identity,
    req.body
  );

  var status = "Liquidado"; //amount == exists.rows[0].amount ? "Liquidado" : "Parcial";

  await investmentTransaction.investments_transaction_liquidate(
    transaction_id,
    status
  );

  console.log("passo 3");

  await investmentTransaction.update_profits(
    id_identity,
    id_active,
    id_broker,
    amount,
    price,
    tax,
    "sell"
  );

  res.status(201).send({
    message: "Transaction create executed!",
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

exports.remove = async (req, res) => {
  const id_identity = req.id_identity;
  const { id, id_active, id_broker } = req.body;

  console.log(id, id_active, id_broker);

  await investmentTransaction.investments_delete(id_identity, id);

  await portfolioService.remove(id_identity, id_active, id_broker);

  console.log(`Transaction ${id} removed!`);

  res.status(200).send({
    message: "Transaction removed!",
    body: id,
  });
};
