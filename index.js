//require("dotenv").config({ path: ".env" });

const app = require("./src/app");
let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
  if (process.env.ENVIRONMENT == "dev")
    console.log(`App init in - http://localhost:${port}/api`);
});
