const db = require("../configs/_database");
const axios = require("axios");

exports.list = async (id_identity) => {
  return db.query(
    `
  SELECT id, description, logo_url, created_at, updated_at, deleted_at, id_identity
    FROM invest.brokers
    where id_identity  = $1
  `,
    [id_identity]
  );
};

exports.create = async () => {
  return db.query(``);
};

exports.update = async () => {
  return db.query(``);
};

exports.delete = async () => {
  return db.query(``);
};

// Retorna preço de um ativo de api externa
exports.actual_price = async (active, type) => {
  var url = "";

  if (type.toLowerCase() == "bdrs" || type.toLowerCase() == "brr") {
    try {
      url = process.env.API_TICKET_STATUS_BDR + active;
      const response = await axios.get(url);
      if (response) {
        return response.data[0].afterMarket;
      }
    } catch (error) {
      console.log("Erro ao buscar preço do BDR " + active);
      console.error(error);
    }
  } else {
    url = process.env.API_TICKET_STATUS_ACTIONS;
    var payload = `ticker=${active}&type=0&currences%5B%5D=1`;

    try {
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      const response = await axios.post(url, payload);

      if (response) {
        return response.data[0].prices[response.data[0].prices.length - 1]
          .price;
      }
    } catch (error) {
      console.log("Erro ao buscar preço da ação " + active);
      console.error(error);
    }
  }
};

exports.find = async (id_identity, broker) => {
  return db.query(
    `
  SELECT id, description, logo_url, created_at, updated_at, deleted_at, id_identity
    FROM invest.brokers
    where id_identity  = $1
    and description = $2
  `,
    [id_identity, broker]
  );
};
