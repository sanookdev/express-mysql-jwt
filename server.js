const express = require("express");
const conPool = require("./config/db.config");
const app = express();
const cors = require("cors");

require("dotenv").config();

require("./config/db.config");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY;

const PORT = process.env.PORT || 5000;

app.use(express());
app.use(express.json());
app.use(cors({ origin: "localhost:8081" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/role", (req, res) => {
  conPool.query("SELECT * FROM `roles`", function (err, results) {
    if (err) {
      res.json({ message: err });
      return;
    }
    res.send(results);
  });
});

app.get("/users", (req, res) => {
  conPool.execute("SELECT * FROM `users`", function (err, results) {
    if (err) {
      res.json({ message: err });
      return;
    }
    if (!results.length) {
      res.json({ message: "User empty" });
      return;
    }
    res.send(results);
  });
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      res.json({ message: "Error: " + err });
      return;
    }
    conPool.execute(
      "INSERT INTO users(username, email, password) VALUES (?,?,?)",
      [req.body.username, req.body.email, hash],
      (error, results) => {
        if (error) return res.json({ error: error });
        res.json({ message: "User has been Inserted." });
      }
    );
  });
});

app.post("/login", (req, res) => {
  conPool.execute(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [req.body.username, req.body.username],
    (error, users, fields) => {
      if (error) return res.json({ error: error });
      if (!users.length) return res.json({ message: "No user found." });

      // Load hash from your password DB.
      bcrypt.compare(
        req.body.password,
        users[0].password,
        function (err, isLogin) {
          if (!isLogin) {
            res.json({
              status: "false",
              message: "Username or Password is invalid!",
            });
            return;
          }
          var token = jwt.sign(
            {
              email: users[0].email,
            },
            secret,
            { expiresIn: "1h" }
          );
          res.json({ status: "ok", message: "Login Success", token });
        }
      );
    }
  );
});

app.post("/auth", (req, res, next) => {
  try {
    let tokenAuth = req.headers.authorization.split(" ")[1]; // get only token without Bearer " "
    var decoded = jwt.verify(tokenAuth, secret);
    res.json({ status: "varified", decoded });
  } catch (error) {
    res.json({ status: "error", error });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
