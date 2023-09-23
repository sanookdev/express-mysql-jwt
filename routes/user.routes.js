module.exports = function (conPool, app) {
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
};
