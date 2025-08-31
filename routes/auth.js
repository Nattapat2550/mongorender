const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// GET Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "สมัครสมาชิก" });
});

// POST Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // เช็คว่ามี user ซ้ำหรือยัง
    let user = await User.findOne({ username });
    if (user) {
      return res.send("⚠️ มีผู้ใช้นี้แล้ว กรุณาเลือกชื่อใหม่");
    }

    // เข้ารหัส password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง user ใหม่
    user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.send("✅ สมัครสมาชิกสำเร็จ! <a href='/auth/login'>เข้าสู่ระบบ</a>");
  } catch (err) {
    console.error(err);
    res.send("❌ เกิดข้อผิดพลาด");
  }
});

module.exports = router;
