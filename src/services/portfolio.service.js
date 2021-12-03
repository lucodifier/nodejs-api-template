const db = require("../configs/_database");

exports.exists = async (id_identity, id_active, id_broker) => {
  return await db.query(
    `SELECT id, id_active, id_broker, amount, actual_price, profits, created_at, updated_at, deleted_at, id_identity
  FROM invest.portfolio p
  where p.id_active = $1 
  and p.id_broker = $2 
  and p.id_identity = $3`,
    [id_active, id_broker, id_identity]
  );
};

exports.create = async (
  id_identity,
  id_active,
  id_broker,
  amount,
  price,
  tax
) => {
  return await db.query(
    `
  INSERT INTO invest.portfolio
  (id_active, id_broker, amount, actual_price, profits, tax, created_at, updated_at, deleted_at, id_identity)
  VALUES($1, $2, $3, $4, 0, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $6)`,
    [id_active, id_broker, amount, price, tax, id_identity]
  );
};

exports.update = async (amount, price, profits, tax, id) => {
  return await db.query(
    `
    UPDATE invest.portfolio
    SET amount=$1, 
      actual_price=$2, 
      profits=$3, 
      tax=$4, 
      updated_at=CURRENT_TIMESTAMP
    where id = $5`,
    [amount, price, profits, tax, id]
  );
};

exports.list = async (id_identity) => {
  return await db.query(
    `
  SELECT 
    p.id, 
    a.ticket as active,
    a.description as active_decription,    
    ic.description as category,
    p.id_broker, 
    b.description as broker,
    b.logo_url,
    p.amount, 
    p.actual_price,
    case when cast (p.actual_price as int4) > 0 then
      (( cast (p.actual_price as int4) * (p.amount)) - cast (p.tax as int4))
    else 
      (( cast (p.actual_price as int4) * (-p.amount)) + cast (p.tax as int4))
    end as total,
    p.created_at,
    ic.incometype 
  FROM invest.portfolio p
  inner join invest.brokers b on b.id = p.id_broker
  inner join invest.actives a on a.id = p.id_active
  inner join invest.investment_categories ic on ic.id  = a.id_investment_category 
  where p.deleted_at is null
  and p.id_identity = $1
  and p.amount > 0
  and p.deleted_at is null
  `,
    [id_identity]
  );
};

exports.remove = async (id_identity, id_active, id_broker) => {
  const portfolio = await this.exists(id_identity, id_active, id_broker);
  if (portfolio) {
    if (portfolio.rows.length > 0) {
      const id = portfolio.rows[0].id;
      return await db.query(
        `UPDATE invest.portfolio
        SET deleted_at= current_timestamp
        WHERE id=$1`,
        [id]
      );
    }
  }
  return null;
};
