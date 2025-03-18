const express = require('express');
const Bid = require('../models/bidModel');

const router = express.Router();

// 1. Submit a new bid
// Update the bid submission route

router.post('/submit', async (req, res) => {
  try {
    const { projectId, contractorId, contractorname, price, timeline, qualifications, rating, completedProjects } = req.body;

    // Input validation
    if (!projectId || !contractorId || !price || !timeline) {
      return res.status(400).json({ 
        error: 'Missing required fields'
      });
    }

    // Check if this contractor has already bid on this project
    const existingBid = await Bid.findOne({ 
      projectId: projectId,
      contractorId: contractorId
    });

    if (existingBid) {
      return res.status(400).json({ 
        error: 'You have already submitted a bid for this project'
      });
    }

    // Create new bid - this allows different contractors to bid on the same project
    const newBid = new Bid({
      projectId,
      contractorId,
      contractorname: contractorname || "Anonymous Contractor",
      price,
      timeline,
      qualifications: qualifications || `Experience: ${req.body.experience || 'Not specified'} years`,
      rating: rating || 0,
      completedProjects: completedProjects || 0
    });
    
    await newBid.save();
    
    res.status(201).json({
      message: 'Bid submitted successfully',
      bid: newBid
    });

  } catch (error) {
    console.error('Bid submission error:', error);
    
    // Check if error is a MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Duplicate bid error',
        message: 'You have already submitted a bid for this project'
      });
    }
    
    res.status(500).json({ 
      error: 'Error submitting bid', 
      message: error.message 
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

// Add this new route for updating bids

// Update an existing bid with limits
router.put('/update/:bidId', async (req, res) => {
  try {
    const { bidId } = req.params;
    const { price, timeline, qualifications, contractorId } = req.body;
    
    // Find the bid
    const bid = await Bid.findById(bidId);
    
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    // Check if this contractor owns this bid
    if (bid.contractorId !== contractorId) {
      return res.status(403).json({ error: 'You can only update your own bids' });
    }
    
    // Check if bid is still pending (can't update accepted/rejected bids)
    if (bid.status !== 'pending') {
      return res.status(400).json({ 
        error: 'This bid can no longer be updated as it has been ' + bid.status 
      });
    }
    
    // Check if update limit reached (3 updates max)
    if (bid.updateCount >= 3) {
      return res.status(400).json({ 
        error: 'You have reached the maximum number of updates (3) for this bid' 
      });
    }
    
    // Save the old price to history
    const previousPrice = {
      price: bid.price,
      updatedAt: new Date()
    };
    
    // Update the bid
    bid.previousPrices = bid.previousPrices || [];
    bid.previousPrices.push(previousPrice);
    bid.updateCount += 1;
    bid.price = price || bid.price;
    
    if (timeline) bid.timeline = timeline;
    if (qualifications) bid.qualifications = qualifications;
    
    await bid.save();
    
    res.json({ 
      message: 'Bid updated successfully', 
      bid,
      updatesRemaining: 3 - bid.updateCount
    });
    
  } catch (error) {
    console.error('Error updating bid:', error);
    res.status(500).json({ 
      error: 'Error updating bid', 
      message: error.message 
    });
  }
});


module.exports = router;
