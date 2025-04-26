const express = require('express');
const router = express.Router();
const Inquiry = require('../models/inquiryModel');

// Get all inquiries
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ submittedAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Server error while fetching inquiries' });
  }
});

// Get a specific inquiry by ID
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ message: 'Server error while fetching inquiry' });
  }
});

// Create a new inquiry
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      priority, 
      projectId, 
      projectName,
      userId,
      username, // Add username field
      userRole,
      status,
      submittedAt
    } = req.body;
    
    // Log the received data for debugging
    console.log('Received inquiry data:', {
      title, description, category, priority, projectId, projectName, userId, username, userRole, status
    });
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    // Check and normalize user role if needed
    let normalizedUserRole = userRole;
    if (userRole && !['Client', 'Service Provider', 'Guest', 'Admin', 'User'].includes(userRole)) {
      normalizedUserRole = 'User'; // Default to 'User' if invalid role received
    }
    
    const inquiry = new Inquiry({
      title,
      description,
      category: category || 'technical',
      priority: priority || 'medium',
      projectId,
      projectName,
      userId,
      username, // Store username in database
      userRole: normalizedUserRole,
      status: status || 'pending',
      submittedAt: submittedAt || new Date()
    });
    
    const savedInquiry = await inquiry.save();
    res.status(201).json(savedInquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    
    // Improved error handling
    if (error.name === 'ValidationError') {
      // Mongoose validation error - send details to help debug
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    
    res.status(500).json({ message: 'Server error while creating inquiry', error: error.message });
  }
});

// Update inquiry status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'resolved' ? { resolvedAt: new Date() } : {})
      },
      { new: true }
    );
    
    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json(updatedInquiry);
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
});

// Delete an inquiry
router.delete('/:id', async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);
    
    if (!deletedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ message: 'Server error while deleting inquiry' });
  }
});

// Get inquiries by project ID
router.get('/project/:projectId', async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ projectId: req.params.projectId }).sort({ submittedAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching project inquiries:', error);
    res.status(500).json({ message: 'Server error while fetching project inquiries' });
  }
});

module.exports = router;
