const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "mysecret",
  resave: false,
  saveUninitialized: false
}));

// View Engine
app.set("view engine", "ejs");

// MongoDB Connect
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

// Routes
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.send("❌ Email & Password required");

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ email, password: hashedPassword, role: role || "user" });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("❌ User already exists");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.redirect("/home");
  } else {
    res.send("❌ Invalid credentials");
  }
});

app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("home", { user: req.session.user });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
