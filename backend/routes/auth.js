const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const profileUpload = require('../middleware/profileUpload'); // Import our custom middleware

// Update the signup route
router.post('/signup', profileUpload.single('profilePic'), async (req, res) => {
  const { username, email, password, role } = req.body;
  // Store the file path instead of the base64 data
  const profilePic = req.file ? `/uploads/profiles/${req.file.filename}` : null;
  
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
      profilePic,  // Save the file path, not the base64 string
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

// Add this route to your auth.js file

// Route to process admin salary payment
router.post('/admins/pay-salary', async (req, res) => {
  try {
    const { adminId, paymentDate, salary } = req.body;
    
    if (!adminId || !paymentDate || !salary) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const admin = await User.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (admin.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }
    
    // Update salary payment status
    if (!admin.salary) {
      admin.salary = {
        amount: salary.basicSalary,
        paymentStatus: 'Paid',
        lastPaid: paymentDate
      };
    } else {
      admin.salary.paymentStatus = 'Paid';
      admin.salary.lastPaid = paymentDate;
    }
    
    await admin.save();
    
    res.status(200).json({
      message: 'Salary payment processed successfully',
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
    console.error('Error processing salary payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

// Update login response to include the correct path to profile pic
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
        profilePic: user.profilePic // This will be the file path now
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Also update the user route to return correct profile pic path
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
        profilePic: user.profilePic // This will be the file path now
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    // Format the response to exclude sensitive information like passwords
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      createdAt: user.createdAt
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// PATCH request to update user data
router.patch('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user fields if provided
    if (name) user.username = name;
    if (email) user.email = email;
    
    await user.save();
    
    // Return updated user (excluding password)
    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// PUT request to update user data including password
router.put('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, currentPassword, newPassword, profilePic } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prepare updates object
    const updates = {};
    
    // Include email in updates if provided
    if (email) {
      updates.email = email;
    }
    
    // Include username in updates if provided
    if (name) {
      updates.username = name;
    }
    
    // Include profile pic in updates if provided
    if (profilePic) {
      updates.profilePic = profilePic;
    }
    
    // Handle password update if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updates.password = hashedPassword;
    }
    
    // Only proceed if there are updates
    if (Object.keys(updates).length > 0) {
      try {
        // Attempt to update the user
        const updatedUser = await User.findByIdAndUpdate(
          userId, 
          updates, 
          { new: true, runValidators: true }
        );
        
        // Return updated user (excluding password)
        res.json({
          message: 'User updated successfully',
          user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePic: updatedUser.profilePic || null
          }
        });
      } catch (updateError) {
        // Handle MongoDB duplicate key errors elegantly
        if (updateError.code === 11000) {
          // Extract the duplicate field from the error message
          const field = Object.keys(updateError.keyValue)[0];
          const value = updateError.keyValue[field];
          
          return res.status(409).json({ 
            error: `The ${field} "${value}" is already taken by another user` 
          });
        }
        throw updateError; // Rethrow if it's not a duplicate key error
      }
    } else {
      res.json({
        message: 'No changes made',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic || null
        }
      });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// DELETE request to delete a user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Add these routes after your existing routes

// Import multer and file system utilities if not already at the top
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// Route to handle profile image upload separately
router.post('/upload/profile', profileUpload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No profile image uploaded' });
    }
    
    // Return the path to the uploaded file
    const filePath = `/uploads/profiles/${req.file.filename}`;
    
    res.json({
      message: 'Profile image uploaded successfully',
      filePath: filePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

module.exports = router;