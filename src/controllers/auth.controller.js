const identiyService = require("../services/identity.service");
const bcrypt = require("bcryptjs");

exports.authenticate = async (req, res) => {
  try {
    var { email, pass } = req.body;

    const user = await identiyService.find(email);

    if (!user || user.rows.length == 0)
      return res.status(400).send({ error: "User not found" });

    const identity = user.rows[0];

    if (!(await bcrypt.compare(pass, identity.pass)))
      return res.status(400).send({ error: "Invalid credencials!" });

    const token = identiyService.generateToken({
      id: identity.id,
      name: identity.description,
    });

    delete identity.pass;

    console.log("Authenticated executed!");

    res.status(201).send({ identity, "x-access-token": token });
  } catch (error) {
    return res
      .status(400)
      .send({ error: "Authenticated failed" + " Error: " + error });
  }
};

exports.register = async (req, res) => {
  const { nome, email, pass } = req.body;

  try {
    if ((await (await identiyService.find(email)).rows.count) > 0)
      return res.send(400).send({ error: "User already exist" });

    await identiyService.create(email, pass, nome);

    console.log("Identity created!");

    return res.status(201).send({ message: "User created!" });
  } catch (error) {
    return res.status(400).send({ error: "Registration failed" });
  }
};
