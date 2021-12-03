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
// const connectionString = process.env.CONNECTION_DATABASE;

// const pool = new Pool({
//   connectionString,
// });

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

pool.on("connect", () => {
  console.log("DataBase is connected");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

// // async/await - check out a client
// (async () => {
//   console.log("vai conectar");
//   const client = await pool.connect();
// })().catch((err) => console.log(err.stack));
