const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');

// Get all contractors
router.get('/', async (req, res) => {
  try {
    const contractors = await Contractor.find();
    console.log("Fetched contractors:", contractors);
    res.status(200).json(contractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Failed to fetch contractors' });
  }
});

// Get contractor by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Looking for contractor with userId:", userId);
    
    const contractor = await Contractor.findOne({ userId });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    console.log("Found contractor:", contractor);
    res.status(200).json(contractor);
  } catch (error) {
    console.error('Error fetching contractor by userId:', error);
    res.status(500).json({ error: 'Failed to fetch contractor' });
  }
});

// Toggle contractor verification status
router.put('/verify/:contractorId', async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.contractorId);
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Toggle verification status
    contractor.verified = !contractor.verified;
    await contractor.save();
    
    res.status(200).json({ 
      message: `Contractor ${contractor.verified ? 'verified' : 'unverified'} successfully`,
      contractor
    });
  } catch (error) {
    console.error('Error updating contractor verification:', error);
    res.status(500).json({ error: 'Failed to update contractor verification status' });
  }
});

module.exports = router;
