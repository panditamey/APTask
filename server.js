const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })
);

app.use(bodyParser.json());

const SECRET_KEY = "AadiPathak";

// Database setup
let db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run(
    "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
  );
});

// Middleware for checking JWT token
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register User
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) return res.status(500).json({ message: "User creation failed" });
      res.json({ id: this.lastID });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY
    );
    res.json({ token });
  });
});

// Logout (dummy endpoint since we're using JWT)
app.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logged out" });
});

// Get Users List
app.get("/users", authenticateToken, (req, res) => {
  db.all("SELECT id, username FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error retrieving users" });
    res.json(rows);
  });
});

// Delete User
app.delete("/users/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM users WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ message: "Deletion failed" });
    res.json({ message: "User deleted" });
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

module.exports = app; // For testing purposes
