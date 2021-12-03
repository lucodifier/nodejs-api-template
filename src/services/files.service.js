const fs = require("fs");

exports.readFileData = async () => {
  try {
    const data = fs.readFileSync("C:/temp/employees.csv", "utf8");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
};
