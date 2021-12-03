const express = require("express");
const cors = require("cors");

// ==> Rotas da API:
const index = require("./routes/index");
const authRoutes = require("./routes/auth.routes");
const activesRoutes = require("./routes/active.routes");
const investment_categoryRoute = require("./routes/investment.category.routes");
const accountRoute = require("./routes/accounts.routes");
const investmentsRoute = require("./routes/investments.routes");
const account_payableRoute = require("./routes/account_payable.routes");
const brokerRoute = require("./routes/broker.routes");
const portfolioRoute = require("./routes/portfolio.routes");
const accountTransactionsRoute = require("./routes/account.transactions.routes");
const accountCategoriesRoute = require("./routes/account.category.routes");

const app = express();

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: "application/vnd.api+json" }));
app.use(cors());

app.use(index);
app.use("/api/", authRoutes);
app.use("/api/", activesRoutes);
app.use("/api/", investment_categoryRoute);
app.use("/api/", accountRoute);
app.use("/api/", investmentsRoute);
app.use("/api/", account_payableRoute);
app.use("/api/", brokerRoute);
app.use("/api/", portfolioRoute);
app.use("/api/", accountTransactionsRoute);
app.use("/api/", accountCategoriesRoute);

module.exports = app;
