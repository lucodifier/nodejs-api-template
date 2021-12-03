const db = require("../configs/_database");

exports.list = async (id_identity, accounts, categories, month, year) => {
  var andClause = "";
  if (accounts != "") andClause += ` and t.id_account in (${accounts})`;
  if (categories != "") andClause += ` and t.id_category in (${categories})`;

  if (month != "")
    andClause += `and EXTRACT(MONTH  FROM t.occurrence) = ${month}`;
  if (year != "") andClause += `and EXTRACT(YEAR  FROM t.occurrence) = ${year}`;

  console.log(andClause);

  return await db.query(
    `SELECT 
        t.id, 
        t.id_account, 
        a.description as account,
        t.id_category, 
        ac.description as category,
        t.description, 
        t.occurrence, 
        t.transaction_type, 
        t.value, 
        t.created_at,
        t.id_identity
      FROM invest.accounts_transactions t
      inner join invest.accounts a on a.id = t.id_account 
      inner join invest.accounts_categories ac on ac.id = t.id_category
      where t.deleted_at  is null
      and t.id_identity = $1
      ${andClause}    
      order by 1 asc 
  `,
    [id_identity]
  );
};

exports.create = async (id_identity, body) => {
  const {
    id_account,
    id_category,
    description,
    occurrence,
    transaction_type,
    value,
  } = body;

  return await db.query(
    `INSERT INTO invest.accounts_transactions
      (id_account, id_category, description, occurrence, transaction_type, value, created_at, updated_at, deleted_at, id_identity)
      VALUES($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $7);
      `,
    [
      id_account,
      id_category,
      description,
      occurrence,
      transaction_type,
      value,
      id_identity,
    ]
  );
};

exports.update = async (id_identity, body) => {
  const {
    id,
    id_account,
    id_category,
    description,
    occurrence,
    transaction_type,
    value,
  } = body;

  return await db.query(
    `UPDATE invest.accounts_transactions
    SET 
    id_account=$1, 
    id_category=$2, 
    description=$3, 
    occurrence=$4, 
    transaction_type=$5, 
    value=$6, 
    updated_at=CURRENT_TIMESTAMP 
    WHERE id=$7 and id_identity=$8 `,
    [
      id_account,
      id_category,
      description,
      occurrence,
      transaction_type,
      value,
      id,
      id_identity,
    ]
  );
};

exports.remove = async (id_identity, id) => {
  return await db.query(
    `UPDATE invest.accounts_transactions
    SET 
    deleted_at=CURRENT_TIMESTAMP 
    WHERE id=$1 and id_identity=$2 `,
    [id, id_identity]
  );
};
