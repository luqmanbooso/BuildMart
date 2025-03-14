const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const router = express.Router();
// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });
  
// POST request to register a new user
router.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { username, email, password, role } = req.body;
  const profilePic = req.file ? req.file.buffer.toString('base64') : null;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      profilePic,
    });
    await newUser.save();
    
    // Generate JWT token with error handling
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not defined');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      const token = jwt.sign(
        { userId: newUser._id, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    
     

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { username, email, role, profilePic },
      });
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      // User is created but token generation failed
      res.status(201).json({
        message: 'User created successfully, but session could not be established. Please log in.',
        user: { username, email, role }
      });
    }
  } catch (error) {
    console.error('Error in user creation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;