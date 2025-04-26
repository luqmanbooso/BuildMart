const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');
const OngoingWork = require('../models/Ongoingworkmodel');
const mongoose = require('mongoose');

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
    
    // Special case handler for 'profile'
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
    
    // Store the original manually entered count
    const manualCount = contractor.manualCompletedProjects || contractor.completedProjects || 0;
    
    // Get system count from OngoingWork
    try {
      const completedWorks = await OngoingWork.countDocuments({
        contractorId: req.params.userId,
        jobStatus: 'Completed'
      });
      
      // Add additional fields to response
      contractor._doc.systemCompletedProjects = completedWorks;
      contractor._doc.manualCompletedProjects = manualCount;
      contractor._doc.totalCompletedProjects = manualCount + completedWorks;
      
      // The completedProjects field will be the total
      if (contractor.completedProjects !== manualCount + completedWorks) {
        contractor.completedProjects = manualCount + completedWorks;
        
        // Also store the manual count separately for future reference
        contractor.manualCompletedProjects = manualCount;
        
        await contractor.save();
      }
      
    } catch (syncError) {
      console.error('Error syncing completed projects count:', syncError);
      // Continue execution even if sync fails
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

// Update the endpoint to handle completed projects correctly
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Special case handler for 'profile'
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
    
    // Store the original manually entered count
    const manualCount = contractor.manualCompletedProjects || contractor.completedProjects || 0;
    
    // Get system count from OngoingWork
    try {
      const completedWorks = await OngoingWork.countDocuments({
        contractorId: userId,
        jobStatus: 'Completed'
      });
      
      // Add additional fields to response
      contractor._doc.systemCompletedProjects = completedWorks;
      contractor._doc.manualCompletedProjects = manualCount;
      contractor._doc.totalCompletedProjects = manualCount + completedWorks;
      
      // The completedProjects field will be the total
      if (contractor.completedProjects !== manualCount + completedWorks) {
        contractor.completedProjects = manualCount + completedWorks;
        
        // Also store the manual count separately for future reference
        contractor.manualCompletedProjects = manualCount;
        
        await contractor.save();
      }
    } catch (syncError) {
      console.error('Error syncing completed projects count:', syncError);
      // Continue execution even if sync fails
    }
    
    res.json(contractor);
  } catch (error) {
    console.error('Error fetching contractor:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update the refresh endpoint to handle manual counts properly
router.get('/refresh-completed-projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Refreshing completed projects for contractor with userId: ${userId}`);
    
    // Find the contractor
    let contractor = await Contractor.findOne({ userId });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Get the manual count from the query parameter or the stored value
    const manualCount = parseInt(req.query.manualCount) || 
                        contractor.manualCompletedProjects || 
                        contractor.completedProjects || 
                        0;
    
    // Count completed works for this contractor
    const completedWorks = await OngoingWork.countDocuments({ 
      contractorId: userId, 
      jobStatus: 'Completed' 
    });
    
    console.log(`Found ${completedWorks} completed works for contractor ${userId}`);
    console.log(`Manual count: ${manualCount}`);
    
    // Store both values separately and calculate the total
    contractor.manualCompletedProjects = manualCount;
    contractor.completedProjects = manualCount + completedWorks;
    
    await contractor.save();
    
    console.log(`Updated completed projects to ${contractor.completedProjects} (${manualCount} manual + ${completedWorks} system)`);
    
    res.status(200).json({
      message: 'Completed projects count refreshed successfully',
      manualCount,
      systemCount: completedWorks,
      totalCount: contractor.completedProjects,
      contractor: {
        ...contractor._doc,
        manualCompletedProjects: manualCount,
        systemCompletedProjects: completedWorks,
        totalCompletedProjects: contractor.completedProjects
      }
    });
  } catch (error) {
    console.error('Error refreshing completed projects:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Add a clear endpoint to allow admin to reset counts for debugging
router.post('/admin/reset-completion-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { manualCount = 0, resetSystem = false } = req.body;
    
    // Find the contractor
    let contractor = await Contractor.findOne({ userId });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Store the original manually entered count
    contractor.manualCompletedProjects = manualCount;
    
    // If requested to reset the system count as well
    if (resetSystem) {
      contractor.completedProjects = manualCount;
    } else {
      // Otherwise get the system count and add it to manual count
      const completedWorks = await OngoingWork.countDocuments({
        contractorId: userId,
        jobStatus: 'Completed'
      });
      contractor.completedProjects = manualCount + completedWorks;
    }
    
    await contractor.save();
    
    res.json({
      message: 'Contractor completion count reset successfully',
      manualCompletedProjects: contractor.manualCompletedProjects,
      totalCompletedProjects: contractor.completedProjects
    });
  } catch (error) {
    console.error('Error resetting completion count:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// New endpoint to refresh contractor's completed projects count
router.get('/refresh-completed-projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Refreshing completed projects for contractor with userId: ${userId}`);
    
    // Find the contractor
    let contractor = await Contractor.findOne({ userId });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Count completed works for this contractor
    const completedWorks = await OngoingWork.countDocuments({ 
      contractorId: userId, 
      jobStatus: 'Completed' 
    });
    
    console.log(`Found ${completedWorks} completed works for contractor ${userId}`);
    
    // Get the original count for logging
    const originalCount = contractor.completedProjects || 0;
    const manuallyEnteredCount = parseInt(req.query.manualCount) || originalCount;
    
    // Update the contractor's completedProjects field - ADD the count instead of replacing
    // If manualCount query parameter is provided, use that as the base
    contractor.completedProjects = manuallyEnteredCount + completedWorks;
    
    await contractor.save();
    
    console.log(`Updated completed projects from ${originalCount} to ${contractor.completedProjects} for contractor ${userId}`);
    console.log(`(${manuallyEnteredCount} manually entered + ${completedWorks} from system)`);
    
    res.status(200).json({
      message: 'Completed projects count refreshed successfully',
      originalCount,
      systemCompletedWorks: completedWorks,
      manuallyEnteredCount,
      newTotalCount: contractor.completedProjects,
      contractor
    });
  } catch (error) {
    console.error('Error refreshing completed projects:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update the PUT endpoint to handle manualCompletedProjects field
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
    
    // Handle completedProjects as manualCompletedProjects
    if (req.body.completedProjects !== undefined) {
      updateData.manualCompletedProjects = req.body.completedProjects;
      
      // Recalculate total completedProjects
      const completedWorks = await OngoingWork.countDocuments({
        contractorId: contractor.userId,
        jobStatus: 'Completed'
      });
      
      updateData.completedProjects = req.body.completedProjects + completedWorks;
    }
    
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

// Search and filter contractors
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