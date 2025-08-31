const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const MongoStore = require("connect-mongo");

dotenv.config();

const app = express();

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: { secure: false } // render ฟรีใช้ http, ถ้า https ใส่ true
}));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));
// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// หน้าแรก
app.get("/", (req, res) => {
  res.render("index", { title: "หน้าแรก" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
