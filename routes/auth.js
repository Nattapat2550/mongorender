const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// หน้าแรก redirect ไป login
router.get("/", (req, res) => {
  res.redirect("/login");
});

// Login
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("Wrong password");

  res.send(`Welcome, ${username}!`);
});

// Register
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await User.create({ username, password: hashed });
    res.redirect("/login");
  } catch (err) {
    res.send("User already exists");
  }
});

module.exports = router;
