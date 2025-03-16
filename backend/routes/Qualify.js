const express = require('express');
const router = express.Router();
const Qualification = require('../models/Qualification');

// GET all qualifications for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const qualifications = await Qualification.find({ userId: req.params.userId });
    res.json(qualifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching qualifications' });
  }
});

// GET a specific qualification
router.get('/:id', async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);
    if (!qualification) return res.status(404).json({ error: 'Qualification not found' });
    res.json(qualification);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching qualification' });
  }
});

// POST a new qualification
// POST a new qualification
router.post('/', async (req, res) => {
    try {
      const { userId, type, name, issuer, year, expiry, documentUrls } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const qualification = new Qualification({
        userId,  // Get from request body for now
        type,
        name,
        issuer,
        year,
        expiry,
        documentUrls
      });
      
      const savedQualification = await qualification.save();
      res.status(201).json(savedQualification);
    } catch (error) {
      console.error('Error creating qualification:', error);
      res.status(500).json({ error: 'Error creating qualification', details: error.message });
    }
  });

// PUT (update) a qualification
// PUT (update) a qualification
router.put('/:id', async (req, res) => {
    try {
      console.log('PUT request received for ID:', req.params.id);
      console.log('Request body:', req.body);
      
      // Find the qualification
      const qualification = await Qualification.findById(req.params.id);
      if (!qualification) {
        return res.status(404).json({ error: 'Qualification not found' });
      }
      
      // REMOVE THIS AUTHORIZATION CHECK - it's causing the 500 error
      // since req.user is undefined without auth middleware
      // If you want to keep this check, you need to add auth middleware to the route
      
      // Update the qualification
      const updatedQualification = await Qualification.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      console.log('Successfully updated qualification');
      res.json(updatedQualification);
    } catch (error) {
      console.error('Error updating qualification:', error);
      res.status(500).json({ 
        error: 'Error updating qualification',
        details: error.message 
      });
    }
  });

// DELETE a qualification
router.delete('/:id', async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);
    if (!qualification) return res.status(404).json({ error: 'Qualification not found' });
    
   
    await Qualification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Qualification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting qualification' });
  }
});

module.exports = router;