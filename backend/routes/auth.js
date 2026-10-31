const express = require('express');
const router = express.Router();

const {
    register,
    login,
    adminLogin,
    getProfile,
    updateProfile
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

// Customer authentication
router.post('/register', register);
router.post('/login', login);

// Admin authentication
router.post('/admin-login', adminLogin);

// Customer profile
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;