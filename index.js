const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// ตั้งค่า title default
app.use((req, res, next) => {
  res.locals.title = "My App";
  next();
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
    );
  })
  .catch((err) => console.log(err));
