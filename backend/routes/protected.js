const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Protected route
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: 'Welcome to the dashboard!',
    user: req.user, // User data from authMiddleware
  });
});

module.exports = router;