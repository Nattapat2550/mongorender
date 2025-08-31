const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// GET Register
router.get("/register", (req, res) => {
  res.render("register");
});

// POST Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username });
  if (user) return res.send("❌ User already exists. <a href='/auth/register'>Back</a>");

  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({ username, password: hashedPassword });
  await user.save();

  res.redirect("/auth/login");
});

// GET Login
router.get("/login", (req, res) => {
  res.render("login");
});

// POST Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.send("❌ User not found. <a href='/auth/login'>Back</a>");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("❌ Invalid password. <a href='/auth/login'>Back</a>");

  req.session.user = user;
  res.redirect("/");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
