const express = require('express');
const Bid = require('../models/bidModel');
const Job = require('../models/Job');

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    const { 
      projectId, 
      contractorId, 
      contractorname, 
      price, 
      timeline, 
      qualifications, 
      rating, 
      completedProjects,
      costBreakdown,
      timelineBreakdown,
      specialRequests
    } = req.body;

    // Input validation
    if (!projectId || !contractorId || !price || !timeline) {
      return res.status(400).json({ 
        error: 'Missing required fields'
      });
    }

    // Check if contractor already bid
    const existingBid = await Bid.findOne({ 
      projectId: projectId,
      contractorId: contractorId
    });
    
    if (existingBid) {
      return res.status(400).json({ 
        error: 'Duplicate bid',
        message: 'You have already submitted a bid for this project'
      });
    }

    // Find the current lowest bid for this project
    const lowestBid = await Bid.findOne({ projectId: projectId })
      .sort({ price: 1 })
      .limit(1);
      
    if (lowestBid) {
      let minDecrement;
      const currentMinPrice = lowestBid.price;
      
      // Determine minimum decrement based on price range
      if (currentMinPrice <= 15000) {
        minDecrement = 200;
      } else if (currentMinPrice <= 100000) {
        minDecrement = 1000;
      } else {
        minDecrement = 2000;
      }
      
      const requiredPrice = currentMinPrice - minDecrement;
      
      // Check if new bid meets minimum decrement requirement
      if (price > requiredPrice) {
        return res.status(400).json({
          error: 'insufficient_decrement',
          message: `Your bid must be at least LKR ${minDecrement.toLocaleString()} less than the current lowest bid`,
          currentLowestBid: currentMinPrice,
          requiredBid: requiredPrice,
          minDecrement: minDecrement
        });
      }
    }

    // Check if bid is below project minimum budget
    const job = await Job.findOne({ _id: projectId });
      
    if (job && job.minBudget && price < job.minBudget) {
      return res.status(400).json({
        error: 'below Min Budget',
        message: `Your bid cannot be lower than the project minimum budget of LKR ${job.minBudget.toLocaleString()}`,
        minBudget: job.minBudget
      });
    }

    // Check for duplicate price 
    const duplicatePriceBid = await Bid.findOne({
      projectId: projectId,
      price: price
    });

    if (duplicatePriceBid) {
      return res.status(400).json({
        error: 'Duplicate price',
        message: 'Another bid with this exact price already exists. Please adjust your price.'
      });
    }

    // Create new bid with enhanced proposal data
    const newBid = new Bid({
      projectId,
      contractorId,
      contractorname,
      price,
      timeline,
      qualifications,
      rating: rating || 0,
      completedProjects: completedProjects || 0,
      ...(costBreakdown && { costBreakdown }),
      ...(timelineBreakdown && { timelineBreakdown }),
      ...(specialRequests && { specialRequests })
    });
    
    await newBid.save();
    
    res.status(201).json({
      message: 'Bid submitted successfully',
      bid: newBid
    });

  } catch (error) {
    console.error('Bid submission error:', error);
    res.status(500).json({ error: 'Error submitting bid', message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const bids = await Bid.find();
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bids' });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.projectId });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project bids' });
  }
});

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

router.put('/update/:bidId', async (req, res) => {
  try {
    const { bidId } = req.params;
    const { price, timeline, qualifications, contractorId, costBreakdown, timelineBreakdown } = req.body;
    
    // Find the bid
    const bid = await Bid.findById(bidId);
    
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    // Check if this contractor owns this bid
    if (bid.contractorId !== contractorId) {
      return res.status(403).json({ error: 'You can only update your own bids' });
    }
    
    if (bid.status !== 'pending') {
      return res.status(400).json({ 
        error: 'This bid can no longer be updated as it has been ' + bid.status 
      });
    }
    
    if (bid.updateCount >= 3) {
      return res.status(400).json({ 
        error: 'You have reached the maximum number of updates (3) for this bid' 
      });
    }
    
    if (price && price !== bid.price) {
      const lowestBid = await Bid.findOne({ 
        projectId: bid.projectId,
        _id: { $ne: bidId } 
      }).sort({ price: 1 }).limit(1);
      
      if (lowestBid) {
        let minDecrement;
        const currentMinPrice = lowestBid.price;
        
        if (currentMinPrice <= 15000) {
          minDecrement = 200;
        } else if (currentMinPrice <= 100000) {
          minDecrement = 1000;
        } else {
          minDecrement = 2000;
        }
        
        const requiredPrice = currentMinPrice - minDecrement;
        
        if (price > requiredPrice) {
          return res.status(400).json({
            error: 'insufficient_decrement',
            message: `Your updated bid must be at least LKR ${minDecrement.toLocaleString()} less than the current lowest bid`,
            currentLowestBid: currentMinPrice,
            requiredBid: requiredPrice,
            minDecrement: minDecrement
          });
        }
      }
      
      const job = await Job.findOne({ _id: bid.projectId });
      
      if (job && job.minBudget && price < job.minBudget) {
        return res.status(400).json({
          error: 'below_min_budget',
          message: `Your bid cannot be lower than the project minimum budget of LKR ${job.minBudget.toLocaleString()}`,
          minBudget: job.minBudget
        });
      }
      
      const duplicatePriceBid = await Bid.findOne({
        projectId: bid.projectId,
        price: price,
        _id: { $ne: bidId } // Exclude current bid
      });
      
      if (duplicatePriceBid) {
        return res.status(400).json({
          error: 'Duplicate price',
          message: 'Another bid with this exact price already exists. Please adjust your price slightly.',
          suggestedPrice: price + 1 
        });
      }
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
    if (costBreakdown) bid.costBreakdown = costBreakdown;
    if (timelineBreakdown) bid.timelineBreakdown = timelineBreakdown;
    
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

// Get bids by contractor ID
router.get('/contractor/:contractorId', async (req, res) => {
  try {
    const { contractorId } = req.params;
    
    if (!contractorId) {
      return res.status(400).json({ error: 'Contractor ID is required' });
    }
    
    const bids = await Bid.find({ contractorId });
    
    res.json(bids);
    
  } catch (error) {
    console.error('Error fetching contractor bids:', error);
    res.status(500).json({ error: 'Error fetching contractor bids' });
  }
});

// get the lowest bid
router.get('/project/:projectId/lowest', async (req, res) => {
  try {
    const lowestBid = await Bid.findOne({ projectId: req.params.projectId })
      .sort({ price: 1 })
      .limit(1);
    
    if (!lowestBid) {
      return res.json({ exists: false });
    }
    
    res.json({ 
      exists: true,
      price: lowestBid.price,
      minDecrement: lowestBid.price <= 15000 ? 200 : 
                   lowestBid.price <= 100000 ? 1000 : 2000
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lowest bid' });
  }
});

router.get('/auction/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const bids = await Bid.find({ projectId });
    res.json(bids);
  } catch (error) {
    console.error('Error fetching project bids:', error);
    res.status(500).json({ message: 'Error fetching project bids' });
  }
});

module.exports = router;
