const db = require("../configs/_database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.find = async (email) => {
  return await db.query(
    `SELECT 
        id, description, email, pass
      FROM invest.identities
      where email = $1
      and deleted_at is null`,
    [email]
  );
};

exports.create = async (email, pass, nome) => {
  const hash = await bcrypt.hashSync(pass, 10);

  return await db.query(
    `INSERT INTO invest.identities
    (description, email, pass, created_at, updated_at, deleted_at)
    VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null)`,
    [nome, email, hash]
  );
};

exports.generateToken = (params) => {
  return jwt.sign(params, process.env.JSONSECRET, {
    expiresIn: 3600, // 1 hora
  });
};
