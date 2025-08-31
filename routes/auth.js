const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", userSchema);

// GET login
router.get("/login", (req, res) => {
  res.render("login");
});

// POST login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    res.redirect("/home");
  } else {
    res.send("Invalid credentials");
  }
});

// GET register
router.get("/register", (req, res) => {
  res.render("register");
});

// POST register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.redirect("/login");
});

// GET home
router.get("/home", (req, res) => {
  res.render("home");
});

module.exports = router;
