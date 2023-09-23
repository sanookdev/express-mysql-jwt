module.exports = function (conPool, app) {
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
};
