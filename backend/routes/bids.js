const express = require('express');
const Bid = require('../models/bidModel');

const router = express.Router();

// 1. Submit a new bid
// Update the bid submission route

router.post('/submit', async (req, res) => {
  try {
    const { projectId, contractorId, contractorname, price, timeline, qualifications, rating, completedProjects } = req.body;

    // Enhanced debugging
    console.log('Bid submission with values:', {
      projectId,
      projectIdType: typeof projectId,
      contractorId,
      contractorIdType: typeof contractorId
    });

    // Basic validation
    if (!projectId || !contractorId || !contractorname || !price || !timeline || !qualifications) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Project ID, Contractor ID, Contractor Name, Price, Timeline, and Qualifications are required'
      });
    }

    // Manual check for existing bid - more reliable than relying on MongoDB's unique index
    const existingBid = await Bid.findOne({ 
      projectId: projectId.toString(), 
      contractorId: contractorId.toString()
    });
    
    if (existingBid) {
      // Update existing bid
      existingBid.contractorname = contractorname;
      existingBid.price = price;
      existingBid.timeline = timeline;
      existingBid.qualifications = qualifications;
      existingBid.rating = rating || existingBid.rating;
      existingBid.completedProjects = completedProjects || existingBid.completedProjects;
      
      await existingBid.save();
      return res.status(200).json({
        message: 'Your bid has been updated successfully',
        bid: existingBid
      });
    } else {
      // Create new bid
      const newBid = new Bid({
        projectId: projectId.toString(), // Ensure string type
        contractorId: contractorId.toString(), // Ensure string type
        contractorname,
        price,
        timeline,
        qualifications,
        rating: rating || 0,
        completedProjects: completedProjects || 0
      });
      
      await newBid.save();
      return res.status(201).json({
        message: 'Bid submitted successfully',
        bid: newBid
      });
    }
  } catch (error) {
    console.error('Bid submission error:', error);
    
    // Handle duplicate key errors explicitly
    if (error.code === 11000) {
      // Log the exact key pattern causing the issue
      console.error('Duplicate key error details:', {
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      });
      
      return res.status(400).json({ 
        error: 'Duplicate bid error',
        message: 'You have already submitted a bid for this project'
      });
    }
    
    // Generic error handler
    res.status(500).json({ 
      error: 'Error processing bid', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// 2. Get all bids
router.get('/', async (req, res) => {
  try {
    const bids = await Bid.find();
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bids' });
  }
});

// 3. Get bids for a specific project
router.get('/project/:projectId', async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.projectId });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project bids' });
  }
});

// 4. Accept or reject a bid
router.put('/:bidId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const bid = await Bid.findByIdAndUpdate(req.params.bidId, { status }, { new: true });
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    if (status === 'accepted') {
      await Bid.updateMany(
        { 
          projectId: bid.projectId, 
          _id: { $ne: bid._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    res.json({ message: `Bid ${status} successfully`, bid });
  } catch (error) {
    res.status(500).json({ error: 'Error updating bid status' });
  }
});

module.exports = router;
