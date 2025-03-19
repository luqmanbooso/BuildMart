const express = require('express');
const router = express.Router();
const OngoingWork = require('../models/Ongoingworkmodel');
const Job = require('../models/Job');


// Get all ongoing works (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    // Check if user is admin (You'll need to add admin validation)
    const ongoingWorks = await OngoingWork.find().populate('jobId');
    res.status(200).json(ongoingWorks);
  } catch (error) {
    console.error('Error fetching ongoing works:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get ongoing works for a specific client
router.get('/client/:clientId', async (req, res) => {
  try {
    const ongoingWorks = await OngoingWork.find({ clientId: req.params.clientId }).populate('jobId');
    res.status(200).json(ongoingWorks);
  } catch (error) {
    console.error('Error fetching client ongoing works:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get ongoing works for a specific contractor
router.get('/contractor/:contractorId', async (req, res) => {
  try {
    const ongoingWorks = await OngoingWork.find({ contractorId: req.params.contractorId }).populate('jobId');
    res.status(200).json(ongoingWorks);
  } catch (error) {
    console.error('Error fetching contractor ongoing works:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific ongoing work by ID
router.get('/:id', async (req, res) => {
  try {
    const ongoingWork = await OngoingWork.findById(req.params.id).populate('jobId');
    if (!ongoingWork) {
      return res.status(404).json({ message: 'Ongoing work not found' });
    }
    res.status(200).json(ongoingWork);
  } catch (error) {
    console.error('Error fetching ongoing work details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new ongoing work
router.post('/', async (req, res) => {
  try {
    const { jobId, clientId, contractorId, milestones, totalPrice } = req.body;
    
    // Validate required fields
    if (!jobId || !clientId || !contractorId) {
      return res.status(400).json({ message: 'jobId, clientId, and contractorId are required fields' });
    }
    
    // Validate totalPrice (required field)
    if (totalPrice === undefined || totalPrice === null) {
      return res.status(400).json({ message: 'totalPrice is a required field' });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Calculate initial totalAmountPending
    let totalAmountPending = 0;
    if (milestones && milestones.length > 0) {
      totalAmountPending = milestones.reduce((sum, milestone) => {
        return sum + (parseInt(milestone.amount) || 0);
      }, 0);
    }
    
    const newOngoingWork = new OngoingWork({
      jobId,
      clientId,
      contractorId,
      milestones: milestones || [],
      totalAmountPending,
      totalPrice: Number(totalPrice),
      workProgress: 0,
      jobStatus: 'In Progress'
    });
    
    const savedWork = await newOngoingWork.save();
    
    // Update job status to indicate it's now in progress
    await Job.findByIdAndUpdate(jobId, { status: 'Active' });
    
    res.status(201).json(savedWork);
  } catch (error) {
    console.error('Error creating ongoing work:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ongoing work details
router.put('/:id', async (req, res) => {
  try {
    const { workProgress, jobStatus, milestones, totalPrice } = req.body;
    const ongoingWorkId = req.params.id;
    
    // Find the ongoing work
    const ongoingWork = await OngoingWork.findById(ongoingWorkId);
    if (!ongoingWork) {
      return res.status(404).json({ message: 'Ongoing work not found' });
    }
    
    // Update fields
    if (workProgress !== undefined) ongoingWork.workProgress = workProgress;
    if (jobStatus) ongoingWork.jobStatus = jobStatus;
    if (milestones) ongoingWork.milestones = milestones;
    if (totalPrice !== undefined) ongoingWork.totalPrice = Number(totalPrice);
    
    // Recalculate amounts if milestones were updated
    if (milestones) {
      let totalAmountPending = 0;
      let totalAmountPaid = 0;
      
      milestones.forEach(milestone => {
        const amount = parseInt(milestone.amount) || 0;
        if (milestone.status === 'Completed' && milestone.actualAmountPaid) {
          totalAmountPaid += milestone.actualAmountPaid;
        } else {
          totalAmountPending += amount;
        }
      });
      
      ongoingWork.totalAmountPaid = totalAmountPaid;
      ongoingWork.totalAmountPending = totalAmountPending;
    }
    
    // Mark job as completed if work is completed
    if (jobStatus === 'Completed') {
      await Job.findByIdAndUpdate(ongoingWork.jobId, { status: 'Closed' });
    }
    
    await ongoingWork.save();
    res.status(200).json(ongoingWork);
  } catch (error) {
    console.error('Error updating ongoing work:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update milestone status
router.patch('/:id/milestone/:milestoneIndex', async (req, res) => {
  try {
    const { status, actualAmountPaid, completedAt } = req.body;
    const { id, milestoneIndex } = req.params;
    
    const ongoingWork = await OngoingWork.findById(id);
    if (!ongoingWork) {
      return res.status(404).json({ message: 'Ongoing work not found' });
    }
    
    const milestoneIdx = parseInt(milestoneIndex);
    if (milestoneIdx < 0 || milestoneIdx >= ongoingWork.milestones.length) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }
    
    // Update milestone
    if (status) ongoingWork.milestones[milestoneIdx].status = status;
    if (actualAmountPaid) ongoingWork.milestones[milestoneIdx].actualAmountPaid = actualAmountPaid;
    
    // Set completion date if milestone is marked as completed
    if (status === 'Completed') {
      ongoingWork.milestones[milestoneIdx].completedAt = completedAt || new Date();
    }
    
    // Recalculate amounts
    let totalAmountPaid = 0;
    let totalAmountPending = 0;
    
    ongoingWork.milestones.forEach(milestone => {
      const amount = parseInt(milestone.amount) || 0;
      if (milestone.status === 'Completed' && milestone.actualAmountPaid) {
        totalAmountPaid += milestone.actualAmountPaid;
      } else {
        totalAmountPending += amount;
      }
    });
    
    ongoingWork.totalAmountPaid = totalAmountPaid;
    ongoingWork.totalAmountPending = totalAmountPending;
    
    // Update last payment date if payment was made
    if (actualAmountPaid && status === 'Completed') {
      ongoingWork.lastPaymentDate = new Date();
    }
    
    // Check if all milestones are completed
    const allCompleted = ongoingWork.milestones.every(m => m.status === 'Completed');
    if (allCompleted) {
      ongoingWork.jobStatus = 'Completed';
      ongoingWork.workProgress = 100;
      await Job.findByIdAndUpdate(ongoingWork.jobId, { status: 'Closed' });
    }
    
    await ongoingWork.save();
    res.status(200).json(ongoingWork);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
