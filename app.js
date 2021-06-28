const express = require("express");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const app = express();

const db = new JsonDB(new Config("MyDB", true, false, "/"));
app.use(express.json());

app.post("/api/register", (req, res) => {
  const { token, userID } = req.body;
  console.log({ token, userID });
  const id = uuid.v4();
  try {
    const path = `/user/{id}`;
    const user = db.getData(path);
    const { base32: secret } = user.temp_secret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: token,
    });
    if (verified) {
      db.push(path, {
        id: userID,
        secret: user.temp_secret,
      });
      res.json({
        verified: true,
      });
    } else {
      res.json({
        verified: false,
      });
    }
  } catch (err) {
    res.status(500).json({ status: 500, message: err });
  }
});

app.get("/api", (req, res) => {
  res.json({ MLH: "SIMP" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVER STARTED IN ${PORT}`);
});
