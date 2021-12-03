const db = require("../configs/_database");

exports.list = async (req, res) => {
  const response = await db.query(
    "SELECT id, description FROM invest.investment_categories order by 2 "
  );

  console.log("Category list executed!");

  res.status(200).send(response.rows);
};
