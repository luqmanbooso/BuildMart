const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');

router.post('/', async (req, res) => {
  try {
    // Check if contractor profile already exists for this user
    const existingContractor = await Contractor.findOne({ userId: req.body.userId });
    if (existingContractor) {
      return res.status(400).json({ error: 'Contractor profile already exists for this user' });
    }

    // Create new contractor profile
    const contractorData = {
      userId: req.body.userId, // Get from request body since no auth
      phone: req.body.phone,
      address: req.body.address,
      companyName: req.body.companyName,
      specialization: req.body.specialization,
      experienceYears: req.body.experienceYears,
      completedProjects: req.body.completedProjects,
      bio: req.body.bio
    };

    const contractor = new Contractor(contractorData);
    await contractor.save();

    res.status(201).json(contractor);
  } catch (error) {
    console.error('Error creating contractor profile:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const contractors = await Contractor.find()
      .populate('userId', 'username email profilePic');
    res.json(contractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Add this special case handler
    if (userId === 'profile') {
      // If you need to get the authenticated user's profile
      // Extract the ID from authentication token
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authUserId = decoded.id || decoded.userId;
        
        const contractor = await Contractor.findOne({ userId: authUserId });
        
        if (!contractor) {
          return res.status(404).json({ error: 'Contractor profile not found' });
        }
        
        return res.json(contractor);
      } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
      }
    }
    
    // Regular ObjectId lookup
    const contractor = await Contractor.findOne({ userId });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.json(contractor);
  } catch (error) {
    console.error('Error fetching contractor:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/user/:userId', async (req, res) => {
  try {
    const contractor = await Contractor.findOne({ userId: req.params.userId })
      .populate('userId', 'username email profilePic');
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.json(contractor);
  } catch (error) {
    console.error('Error fetching contractor by user ID:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Invalid user ID format' });
    }
    
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    let contractor = await Contractor.findById(req.params.id);
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Update fields
    const updateData = {};
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.companyName !== undefined) updateData.companyName = req.body.companyName; // Allow null
    if (req.body.specialization) updateData.specialization = req.body.specialization;
    if (req.body.experienceYears) updateData.experienceYears = req.body.experienceYears;
    if (req.body.completedProjects) updateData.completedProjects = req.body.completedProjects;
    if (req.body.bio) updateData.bio = req.body.bio;
    
    // Only update fields that were provided
    const updatedContractor = await Contractor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updatedContractor);
  } catch (error) {
    console.error('Error updating contractor profile:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    await Contractor.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Contractor profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting contractor profile:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/verify/:id', async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Toggle verification status
    contractor.verified = !contractor.verified;
    await contractor.save();
    
    // Populate the user data before sending response
    const populatedContractor = await Contractor.findById(contractor._id)
      .populate('userId', 'username email profilePic');
    
    res.json({ 
      message: `Contractor ${contractor.verified ? 'verified' : 'unverified'} successfully`,
      contractor: populatedContractor
    });
  } catch (error) {
    console.error('Error verifying contractor:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/search/filters', async (req, res) => {
  try {
    const { specialization, location, verified } = req.query;
    
    // Build search query
    const searchQuery = {};
    
    if (specialization) {
      searchQuery['specialization.0'] = { $in: [specialization] };
    }
    
    if (location) {
      searchQuery.address = { $regex: location, $options: 'i' };
    }
    
    if (verified === 'true') {
      searchQuery.verified = true;
    }
    
    const contractors = await Contractor.find(searchQuery)
      .populate('userId', 'username email profilePic');
    
    res.json(contractors);
  } catch (error) {
    console.error('Error searching contractors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;