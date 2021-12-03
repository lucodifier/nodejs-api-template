const db = require("../configs/_database");

exports.list = async (id_identity) => {
  return await db.query(
    `SELECT 
        id, 
        description, 
        created_at, 
        id_identity
      FROM invest.accounts_categories ac
      where ac.deleted_at  is null
      and ac.id_identity = $1
      order by 2  
  `,
    [id_identity]
  );
};

exports.create = async (id_identity, body) => {
  const { description } = body;

  return await db.query(
    `INSERT INTO invest.accounts_categories
    (description, created_at, updated_at, deleted_at, id_identity)
    VALUES($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, $2)`,
    [description, id_identity]
  );
};
