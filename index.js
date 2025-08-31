import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ตั้งค่า __dirname สำหรับ ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", authRoutes);

// MongoDB URI จาก Environment Variables
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ ERROR: MONGO_URI is not defined. Please set it in Render Environment Variables.");
  process.exit(1);
}

// MongoDB Connect
mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
