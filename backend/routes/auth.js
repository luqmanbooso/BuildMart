const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const router = express.Router();
// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });
const User = require('../models/User');

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
        { 
          userId: newUser._id, 
          username: newUser.username, 
          email: newUser.email,
          role: newUser.role
        },
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

// Add this new route to get all admin users
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'Admin' });
    res.json(admins.map(admin => ({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      salary: admin.salary,
      profilePic: admin.profilePic
    })));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Error fetching admin users' });
  }
});

// Add this route to update admin salary
router.patch('/admins/:id/salary', async (req, res) => {
  try {
    const { id } = req.params;
    const { salary } = req.body;
    
    if (!salary || typeof salary !== 'number' || salary <= 0) {
      return res.status(400).json({ message: 'Invalid salary amount' });
    }
    
    const admin = await User.findById(id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (admin.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }
    
    // Initialize the salary object if it doesn't exist
    if (!admin.salary) {
      admin.salary = {
        amount: 0,
        epf: {
          employee: 0,
          employer: 0
        },
        etf: 0,
        paymentStatus: 'Pending'
      };
    }
    
    // Update salary amount
    admin.salary.amount = salary;
    
    // Update EPF and ETF calculations
    admin.salary.epf.employee = salary * 0.08;
    admin.salary.epf.employer = salary * 0.12;
    admin.salary.etf = salary * 0.03;
    
    // Reset payment status when salary changes
    admin.salary.paymentStatus = 'Pending';
    
    await admin.save();
    
    res.json({
      message: 'Salary updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        salary: admin.salary.amount,
        status: admin.salary.paymentStatus,
        lastPaid: admin.salary.lastPaid
      }
    });
  } catch (error) {
    console.error('Error updating admin salary:', error);
    res.status(500).json({ message: 'Error updating salary', error: error.message });
  }
});

// POST request to login a user
router.post('/login', async (req, res) => {
  const { emailUsername, password } = req.body;
  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailUsername }, { username: emailUsername }],
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    // Generate JWT token with userId and username (matching signup route)
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Send response with token and user data (excluding password)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET request to fetch user data by userId
router.get('/user/:userId', async (req, res) => {
  try {
    // Find the user by the userId passed in the URL parameter
    const user = await User.findById(req.params.userId);

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user data (excluding password for security)
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});



module.exports = router;