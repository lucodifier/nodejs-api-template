const db = require("../configs/_database");

exports.active_list = async (id_identity) => {
  return await db.query(
    `SELECT 
      a.id, 
      a.ticket,
      a.description, 
      a.id_investment_category, 
      a.created_at, 
      a.updated_at, 
      a.deleted_at, 
      a.id_identity, 
      ic.description as category
    FROM invest.actives a
    inner join invest.investment_categories ic on ic.id = a.id_investment_category 
    where a.id_identity = $1 and a.deleted_at is null order by 2 asc`,
    [id_identity]
  );
};

exports.active_list_by_category = async (id_identity, id_category) => {
  return await db.query(
    `SELECT 
      a.id, 
      a.ticket,
      a.description, 
      concat(a.ticket, ' - ', a.description) as active, 
      a.id_investment_category, 
      a.created_at, 
      a.updated_at, 
      a.deleted_at, 
      a.id_identity, 
      ic.description as category
    FROM invest.actives a
    inner join invest.investment_categories ic on ic.id = a.id_investment_category 
    where a.id_identity = $1 
    and  a.id_investment_category = $2
    and a.deleted_at is null 
    order by 2 asc`,
    [id_identity, id_category]
  );
};

exports.active_find = async (id_identity, ticket) => {
  return await db.query(
    `SELECT id, description, id_investment_category, created_at, updated_at, deleted_at, id_identity, ticket
      FROM invest.actives a
       where a.id_identity = $1 
      and a.deleted_at is null 
      and ticket = $2`,
    [id_identity, ticket]
  );
};

exports.active_create = async (id_identity, body) => {
  const { categoryId, ticket, description } = body;

  console.log(body);

  return await db.query(
    `INSERT INTO invest.actives
    (ticket, description, id_investment_category, created_at, updated_at, deleted_at, id_identity)
    VALUES($1,$2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $4)`,
    [ticket, description, categoryId, id_identity]
  );
};

exports.active_update = async (body) => {
  const { id, ticket, description, categoryId } = body;

  return await db.query(
    `UPDATE invest.actives
    SET ticket=$1, description=$2, id_investment_category=$3 
    WHERE id=$4;`,
    [ticket, description, categoryId, id]
  );
};

exports.active_delete = async (id) => {
  return await db.query(
    `UPDATE invest.actives
      SET deleted_at=CURRENT_TIMESTAMP
      WHERE id=$1`,
    [id]
  );
};
