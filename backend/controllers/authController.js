const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'saree_business_secret_key_2024';

// POST /api/auth/register
const register = (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`,
    [name, email, hashedPassword, phone || null],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        return res.status(500).json({ success: false, message: 'Registration failed.' });
      }
      const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ success: true, message: 'Registration successful!', token, user: { id: this.lastID, name, email } });
    }
  );
};

// POST /api/auth/login
const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Login failed.' });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Login successful!', token, user: { id: user.id, name: user.name, email: user.email } });
  });
};

// GET /api/auth/profile
const getProfile = (req, res) => {
  db.get(`SELECT id, name, email, phone, address, city, state, pincode, created_at FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  });
};

// PUT /api/auth/profile
const updateProfile = (req, res) => {
  const { name, phone, address, city, state, pincode } = req.body;
  db.run(
    `UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?`,
    [name, phone, address, city, state, pincode, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to update profile.' });
      res.json({ success: true, message: 'Profile updated successfully.' });
    }
  );
};

// POST /api/auth/admin-login
const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  if ((email === 'admin@vasanthisilks.com' && password === 'Admin@123') ||
      (email === 'vimala@sssai.in' && (password === 'demo1234' || password === 'Admin@123'))) {
    const token = jwt.sign({ id: 0, email, name: 'Vimala (Admin)', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, message: 'Admin login successful!', token, user: { id: 0, name: 'Vimala', email, role: 'admin' } });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Login failed.' });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Admin login successful!', token, user: { id: user.id, name: user.name, email: user.email, role: 'admin' } });
  });
};

module.exports = { register, login, adminLogin, getProfile, updateProfile };
