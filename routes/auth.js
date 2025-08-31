const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", error: null });
});

// Register Handle
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", { title: "Register", error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", { title: "Register", error: "Something went wrong" });
  }
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", error: null });
});

// Login Handle
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { title: "Login", error: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { title: "Login", error: "Invalid username or password" });
    }
    res.render("dashboard", { title: "Dashboard", user });
  } catch (err) {
    console.error(err);
    res.render("login", { title: "Login", error: "Something went wrong" });
  }
});

module.exports = router;
