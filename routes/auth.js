const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req, res) => res.render('register', { error: null }));
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.render('register', { error: 'กรอกให้ครบ' });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.render('register', { error: 'username ถูกใช้แล้ว' });

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, passwordHash: hash });
    await user.save();

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'เกิดข้อผิดพลาด' });
  }
});

router.get('/login', (req, res) => res.render('login', { error: null }));
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.render('login', { error: 'กรอกให้ครบ' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.render('login', { error: 'ไม่พบผู้ใช้' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.render('login', { error: 'รหัสผ่านไม่ถูกต้อง' });

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'เกิดข้อผิดพลาด' });
  }
});

router.get('/dashboard', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = await User.findById(req.session.userId).lean();
  res.render('dashboard', { user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
