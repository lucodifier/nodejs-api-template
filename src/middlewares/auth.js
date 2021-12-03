const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JSONSECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).send({ error: "No token provided." });

  const parts = authHeader.split(" ");

  if (!parts.length === 2)
    return res.status(401).send({ error: "Token invalid." });

  const [scheme, token] = parts;

  if (!/^Bearer/i.test(scheme))
    return res.status(401).send({ error: "Token invalid. Send Bearer." });

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).send({ error: "Token invalid." });

    req.id_identity = decoded.id;

    return next();
  });
};
