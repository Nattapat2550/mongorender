const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connect
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:1234@cluster0.nyv7co6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware ส่ง user ไปให้ views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// หน้าแรก
app.get("/", (req, res) => {
  res.render("index");
});

// สมัครสมาชิก
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hash });
  res.redirect("/login");
});

// เข้าสู่ระบบ
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send("ไม่พบผู้ใช้");
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.send("รหัสผ่านไม่ถูกต้อง");
  req.session.user = user;
  res.redirect("/");
});

// ออกจากระบบ
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
