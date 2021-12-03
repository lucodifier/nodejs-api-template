const db = require("../configs/_database");
const calculations = require("./currency.service");
const portfolioService = require("./portfolio.service");

const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();
// ==> Conexão com a Base de Dados:
const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DATABASE,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
});

exports.investments_transaction_create = async (id_identity, body) => {
  const {
    id_active,
    id_broker,
    description,
    amount,
    price,
    tax,
    status,
    buy_or_sell,
  } = body;

  var adjustPrice = calculations.decimal_to_int(price);
  var adjustTax = calculations.decimal_to_int(tax);
  var statusSave = "Compra";
  if (status) statusSave = status;

  return await db.query(
    `INSERT INTO invest.investments_transactions
    (id_active, id_broker, ocurrence, description, amount, price, tax, status, created_at, updated_at, deleted_at, id_identity, buy_or_sell)
    VALUES($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $8, $9)`,
    [
      id_active,
      id_broker,
      description,
      amount,
      adjustPrice,
      adjustTax,
      statusSave,
      id_identity,
      buy_or_sell,
    ]
  );
};

exports.investments_transaction_list = async (id_identity) => {
  return await db.query(
    `SELECT 
        t.id, 
        t.id_active, 
        t.id_broker,
        t.ocurrence,
        t.description,
        (- t.amount) as amount,
        t.tax,
        -  cast (t.price as int4) as price ,        
        - case when cast (t.price as int4) > 0 then
           (( cast (t.price as int4) * (t.amount)) - cast (t.tax as int4))
        else 
          (( cast (t.price as int4) * (-t.amount)) + cast (t.tax as int4))
        end as total,
        t.status,
        t.created_at,
        t.updated_at,
        t.deleted_at,
        t.id_identity,
        b.description as broker,
        b.logo_url,
        a.description as active_decription,
        a.ticket as active,
        ic.description as category
      FROM invest.investments_transactions t
      inner join invest.brokers b on b.id = t.id_broker
      inner join invest.actives a on a.id = t.id_active
      inner join invest.investment_categories ic on ic.id  = a.id_investment_category 
      where t.id_identity = $1
      and t.deleted_at is null 
      order by ocurrence desc`,
    [id_identity]
  );
};

exports.investments_transaction_follow_up = async (id_identity) => {
  return await db.query(
    `
    select 
      t.id, 
        t.id_active, 
        t.id_broker,
        cast (t.price as int4)  as price,
        (select sum(amount) from invest.investments_transactions where id_active = t.id_active and id_broker = t.id_broker) as amount,
        t.status,
        t.created_at,
        t.updated_at,
        t.deleted_at,
        t.id_identity,
        b.description as broker,
        b.logo_url,
        a.description as active_decription,
        a.ticket as active,
        ic.description as category
      FROM invest.investments_transactions t
      inner join invest.brokers b on b.id = t.id_broker
      inner join invest.actives a on a.id = t.id_active
      inner join invest.investment_categories ic on ic.id  = a.id_investment_category 
      where  t.id_identity =$1 and t.deleted_at is null
    and t.status in ('Compra', 'Parcial') -- Somente status de compra com saldo
    and ic.description in ('BDR', 'Ações', 'BDRs', 'Ação') -- somente estes tipos de ativos
    order by t.id desc`,
    [id_identity]
  );
};

exports.investments_transaction_find_to_sell = async (
  id_identity,
  id_active,
  id_broker
) => {
  return await db.query(
    `
        SELECT sum(amount) as amount
        FROM invest.investments_transactions
        where id_identity  = $1
        and id_active = $2
        and id_broker  = $3
        group  by id_active`,
    [id_identity, id_active, id_broker]
  );
};

exports.update_profits = async (
  id_identity,
  id_active,
  id_broker,
  amount,
  price,
  tax,
  transaction
) => {
  const exists = await portfolioService.exists(
    id_identity,
    id_active,
    id_broker
  );

  console.log("passo 4");

  var price = calculations.decimal_to_int(price);
  var tax = calculations.decimal_to_int(tax);

  if (exists.rows.length == 0) {
    await portfolioService.create(
      id_identity,
      id_active,
      id_broker,
      amount,
      price,
      tax
    );
  } else {
    var row = exists.rows[0];
    var balanceAmount = Number(row.amount) - Number(amount);
    if (transaction == "sell") {
      // Profits + (quant. vendida * preço vendido) - (quant. vendida * preço existente) - taxa
      var totalBuy = amount * row.actual_price; // total
      var totalSell = amount * price;
      var profits = row.profits + totalSell - totalBuy - tax;
      await portfolioService.update(balanceAmount, price, profits, tax, row.id);
    } else if (transaction == "buy") {
      await portfolioService.update(
        balanceAmount,
        price,
        row.profits,
        tax,
        row.id
      );
    }
  }
};

exports.investments_transaction_liquidate = async (id, status) => {
  return await db.query(
    `update invest.investments_transactions 
      set status = $1
      where id = $2`,
    [status, id]
  );
};

exports.investments_uploads = async (id_identity, itens) => {
  const client = await pool.connect();
  var error = null;
  try {
    itens.map(async (item) => {
      try {
        const active = await client.query(
          `select id from invest.actives a where a.id_identity = $1 and a.ticket  = $2`,
          [id_identity, item.Ativo]
        );

        const broker = await client.query(
          `select id from invest.brokers b where id_identity  = $1 and description = $2`,
          [id_identity, item.Corretora]
        );

        const id_active = active.rows.length > 0 ? active.rows[0].id : 0;
        const id_broker = broker.rows.length > 0 ? broker.rows[0].id : 0;
        const ocurrence = item.Data;
        const description = item.Descritivo;
        const amount = item.Quantidade;
        const price = calculations.string_to_int(item.Valor);
        const tax = item.Taxa == "" ? 0 : calculations.string_to_int(item.Taxa);
        const status = item.Tipo;
        const buy_or_sell =
          item.Tipo.toLowerCase() == "compra" ? "buy" : "sell";

        if (id_active == 0) {
          console.log("Ativo não encontrado");
          return;
        }

        if (id_broker == 0) {
          console.log("Corretora não encontrada");
          return;
        }

        await client.query(
          `INSERT INTO invest.investments_transactions
              (id_active, id_broker, ocurrence, description, amount, price, tax, status, created_at, updated_at, deleted_at, id_identity, buy_or_sell)
              VALUES($1, $2, TO_DATE($3,'DD/MM/YYYY'), $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $9, $10)`,
          [
            id_active,
            id_broker,
            ocurrence,
            description,
            amount,
            price,
            tax,
            status,
            id_identity,
            buy_or_sell,
          ]
        );

        await client.query(
          `
      INSERT INTO invest.portfolio
            (id_active, id_broker, amount, actual_price, profits, tax, created_at, updated_at, deleted_at, id_identity)
            SELECT it.id_active, it.id_broker, it.amount, it.price, 0, it.tax, current_timestamp,  current_timestamp, null, it.id_identity 
                  FROM  invest.investments_transactions it 
                  where it.id_active not in (select id_active from invest.portfolio  where id_identity = $1) 
                  and id_identity = $1
            `,
          [id_identity]
        );
      } catch (err) {
        throw err;
        error = err;
      }
    });
  } catch (err) {
    error = err;
    throw err;
  } finally {
    client.release();
  }
};

exports.investments_delete = async (id_identity, id) => {
  return await db.query(
    `UPDATE invest.investments_transactions
    SET deleted_at=CURRENT_TIMESTAMP
    WHERE id=$1 and id_identity=$2`,
    [id, id_identity]
  );
};
