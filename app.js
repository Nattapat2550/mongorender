const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// MongoDB connect
mongoose
  .connect("mongodb+srv://admin:1234@cluster0.nyv7co6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    req.flash("error_msg", "กรุณากรอกข้อมูลให้ครบ");
    return res.redirect("/register");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    req.flash("error_msg", "อีเมลนี้ถูกใช้แล้ว");
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role: "user" });
  await newUser.save();
  req.flash("success_msg", "สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error_msg", "ไม่พบบัญชีนี้");
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash("error_msg", "รหัสผ่านไม่ถูกต้อง");
    return res.redirect("/login");
  }

  // ส่ง role ไปหน้า home
  res.render("home", { user });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
