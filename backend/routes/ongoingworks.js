const express = require('express');
const router = express.Router();
const OngoingWork = require('../models/Ongoingworkmodel');
const Job = require('../models/Job');
const Contractor = require('../models/Contractor'); // Add this import
const mongoose = require('mongoose'); // Import mongoose

// Add the commission constant at the top of the file
const COMMISSION_RATE = 0.10; // 10% commission

// Helper function to increment contractor's completed projects
const incrementCompletedProjects = async (contractorId) => {
  try {
    console.log(`Incrementing completed projects for contractor: ${contractorId}`);
    
    // Find the contractor by userId
    const contractor = await Contractor.findOne({ userId: contractorId });
    
    if (!contractor) {
      console.error(`Contractor not found with userId: ${contractorId}`);
      return false;
    }
    
    // Increment the completedProjects field
    contractor.completedProjects += 1;
    
    // Save the updated contractor document
    await contractor.save();
    
    console.log(`Successfully updated completed projects count to ${contractor.completedProjects} for contractor: ${contractorId}`);
    return true;
  } catch (error) {
    console.error('Error incrementing completed projects:', error);
    return false;
  }
};

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
    const { clientId } = req.params;
    console.log(`[DEBUG] Fetching ongoing works for client: ${clientId}`);
    
    // Check if clientId seems valid
    if (!clientId || clientId === 'undefined' || clientId === 'null') {
      console.error(`[DEBUG] Invalid clientId provided: ${clientId}`);
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Try to find works both with string and ObjectId versions of clientId
    let ongoingWorks;
    try {
      // First try as is (string comparison)
      ongoingWorks = await OngoingWork.find({ clientId }).populate('jobId');
      console.log(`[DEBUG] Found ${ongoingWorks.length} works with string clientId`);
      
      // If no works found and it might be an ObjectId, try with ObjectId
      if (ongoingWorks.length === 0 && clientId.match(/^[0-9a-fA-F]{24}$/)) {
        const objectIdClientId = new mongoose.Types.ObjectId(clientId);
        const objectIdWorks = await OngoingWork.find({ 
          clientId: objectIdClientId 
        }).populate('jobId');
        
        console.log(`[DEBUG] Found ${objectIdWorks.length} works with ObjectId clientId`);
        
        if (objectIdWorks.length > 0) {
          ongoingWorks = objectIdWorks;
        }
      }
    } catch (findError) {
      console.error('[DEBUG] Error during find operation:', findError);
      throw findError; // Re-throw to be caught by the outer try-catch
    }

    // Log the result counts
    console.log(`[DEBUG] Total ongoing works found: ${ongoingWorks.length}`);
    
    // Add work IDs to log for debugging
    if (ongoingWorks.length > 0) {
      console.log('[DEBUG] Work IDs found:', ongoingWorks.map(work => work._id));
    }
    
    res.status(200).json(ongoingWorks);
  } catch (error) {
    console.error('[DEBUG] Error fetching client ongoing works:', error);
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

// Get ongoing work by job ID
router.get('/job/:jobId', async (req, res) => {
  try {
    const ongoingWork = await OngoingWork.findOne({ jobId: req.params.jobId });
    if (!ongoingWork) {
      return res.status(404).json({ message: 'Ongoing work not found for this job' });
    }
    res.status(200).json(ongoingWork);
  } catch (error) {
    console.error('Error fetching ongoing work by job ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new ongoing work - Fix potential issues here
router.post('/', async (req, res) => {
  try {
    const { jobId, clientId, contractorId, milestones, totalPrice, timeline } = req.body;
    
    console.log('[DEBUG] Creating new ongoing work:', {
      jobId, clientId, contractorId, timeline, totalPrice,
      milestonesCount: milestones?.length
    });
    
    // Validate required fields
    if (!jobId || !clientId || !contractorId) {
      console.error('[DEBUG] Missing required field in ongoing work creation');
      return res.status(400).json({ message: 'jobId, clientId, and contractorId are required fields' });
    }
    
    // Validate totalPrice (required field)
    if (totalPrice === undefined || totalPrice === null) {
      console.error('[DEBUG] Missing totalPrice in ongoing work creation');
      return res.status(400).json({ message: 'totalPrice is a required field' });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.error(`[DEBUG] Job not found: ${jobId}`);
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if ongoing work for this job already exists
    const existingWork = await OngoingWork.findOne({ jobId });
    if (existingWork) {
      console.log(`[DEBUG] Ongoing work already exists for job: ${jobId}`);
      return res.status(409).json({ 
        message: 'An ongoing work for this job already exists',
        existingWorkId: existingWork._id
      });
    }
    
    // Parse timeline as number with fallback
    const parsedTimeline = parseInt(timeline) || 30;
    console.log(`[DEBUG] Creating ongoing work with timeline: ${parsedTimeline} days`);
    
    // Calculate initial totalAmountPending with better validation
    let totalAmountPending = 0;
    if (milestones && Array.isArray(milestones) && milestones.length > 0) {
      totalAmountPending = milestones.reduce((sum, milestone) => {
        const amount = parseInt(milestone.amount) || 0;
        return sum + amount;
      }, 0);
    } else {
      console.warn('[DEBUG] No valid milestones provided for ongoing work');
    }
    
    const newOngoingWork = new OngoingWork({
      jobId,
      clientId: clientId.toString(), // Ensure clientId is stored as string for consistency
      contractorId: contractorId.toString(), // Ensure contractorId is stored as string
      milestones: milestones || [],
      totalAmountPending,
      totalPrice: Number(totalPrice),
      workProgress: 0,
      timeline: parsedTimeline,
      jobStatus: 'In Progress'
    });
    
    console.log('[DEBUG] Saving new ongoing work with structure:', {
      jobId: newOngoingWork.jobId,
      clientId: newOngoingWork.clientId,
      contractorId: newOngoingWork.contractorId,
      milestoneCount: newOngoingWork.milestones.length,
      timeline: newOngoingWork.timeline
    });
    
    const savedWork = await newOngoingWork.save();
    
    // Update job status to indicate it's now in progress
    await Job.findByIdAndUpdate(jobId, { status: 'Active' });
    
    console.log(`[DEBUG] Successfully created ongoing work: ${savedWork._id}`);
    res.status(201).json(savedWork);
  } catch (error) {
    console.error('[DEBUG] Error creating ongoing work:', error);
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
    
    // Track if job status changes to completed
    const becomingCompleted = jobStatus === 'Completed' && ongoingWork.jobStatus !== 'Completed';
    
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
    if (becomingCompleted) {
      await Job.findByIdAndUpdate(ongoingWork.jobId, { status: 'Closed' });
      
      // Increment contractor's completed projects count
      await incrementCompletedProjects(ongoingWork.contractorId);
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
    const { status, actualAmountPaid, completedAt, notes } = req.body;
    const { id, milestoneIndex } = req.params;
    
    console.log('Milestone update request:', {
      workId: id,
      milestoneIndex,
      requestBody: req.body,
    });
    
    const ongoingWork = await OngoingWork.findById(id);
    if (!ongoingWork) {
      return res.status(404).json({ message: 'Ongoing work not found' });
    }
    
    const milestoneIdx = parseInt(milestoneIndex);
    if (milestoneIdx < 0 || milestoneIdx >= ongoingWork.milestones.length) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }
    
    // Update milestone status
    if (status) {
      const validStatuses = ['Pending', 'In Progress', 'Pending Verification', 'Ready For Payment', 'Completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      ongoingWork.milestones[milestoneIdx].status = status;
      
      // If status is changing to 'Pending Verification', set completedAt if not already set
      if (status === 'Pending Verification' && !ongoingWork.milestones[milestoneIdx].completedAt) {
        ongoingWork.milestones[milestoneIdx].completedAt = completedAt || new Date();
      }
      
      // Only when client makes payment and status is explicitly 'Completed'
      if (status === 'Completed' && actualAmountPaid) {
        ongoingWork.milestones[milestoneIdx].actualAmountPaid = actualAmountPaid;
        ongoingWork.lastPaymentDate = new Date();
        
        // Calculate commission
        const originalAmount = parseFloat(ongoingWork.milestones[milestoneIdx].amount || 0);
        const commission = originalAmount * COMMISSION_RATE;
        
        // Store commission information
        ongoingWork.milestones[milestoneIdx].commission = commission;
        ongoingWork.milestones[milestoneIdx].originalAmount = originalAmount;
        
        // Update total commission
        ongoingWork.totalCommission = (ongoingWork.totalCommission || 0) + commission;
      }
    }
    
    // Add notes if provided
    if (notes) {
      ongoingWork.milestones[milestoneIdx].notes = notes;
    }
    
    // Recalculate amounts and progress
    let completedCount = 0;
    let totalAmountPaid = 0;
    let totalAmountPending = 0;
    
    ongoingWork.milestones.forEach(milestone => {
      const amount = parseFloat(milestone.amount || 0);
      
      if (milestone.status === 'Completed') {
        totalAmountPaid += milestone.actualAmountPaid || amount;
        completedCount++;
      } else {
        totalAmountPending += amount;
      }
      
      // Count 'Pending Verification' and 'Ready For Payment' as partially complete for progress bar
      if (milestone.status === 'Pending Verification' || milestone.status === 'Ready For Payment') {
        completedCount += 0.5; // Count as half complete for progress bar
      }
    });
    
    // Update financial totals
    ongoingWork.totalAmountPaid = totalAmountPaid;
    ongoingWork.totalAmountPending = totalAmountPending;
    
    // Calculate progress percentage
    ongoingWork.workProgress = Math.round((completedCount / ongoingWork.milestones.length) * 100);
    
    // Check if all milestones are completed for job status update
    const allCompleted = ongoingWork.milestones.every(m => m.status === 'Completed');
    if (allCompleted) {
      const wasAlreadyCompleted = ongoingWork.jobStatus === 'Completed';
      ongoingWork.jobStatus = 'Completed';
      ongoingWork.workProgress = 100;
      await Job.findByIdAndUpdate(ongoingWork.jobId, { status: 'Closed' });
      
      // Only increment completed projects if the job wasn't already completed
      if (!wasAlreadyCompleted) {
        await incrementCompletedProjects(ongoingWork.contractorId);
      }
    }
    
    await ongoingWork.save();
    res.status(200).json(ongoingWork);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// New endpoint to get completed project counts for a contractor
router.get('/completed-count/:contractorId', async (req, res) => {
  try {
    const { contractorId } = req.params;
    console.log(`Fetching completed projects count for contractor: ${contractorId}`);
    
    // Get count of completed works from OngoingWork collection
    const systemCompletedCount = await OngoingWork.countDocuments({ 
      contractorId: contractorId, 
      jobStatus: 'Completed' 
    });
    
    // Get the contractor record to find manually entered count
    const contractor = await Contractor.findOne({ userId: contractorId });
    
    if (!contractor) {
      return res.status(404).json({ 
        message: 'Contractor not found',
        systemCount: systemCompletedCount,
        manualCount: 0,
        totalCount: systemCompletedCount
      });
    }
    
    // Get the manual count (if available)
    const manualCompletedCount = contractor.manualCompletedProjects || 0;
    
    // Return all counts
    res.status(200).json({
      message: 'Completed projects counts retrieved successfully',
      systemCount: systemCompletedCount,
      manualCount: manualCompletedCount,
      totalCount: systemCompletedCount + manualCompletedCount
    });
    
  } catch (error) {
    console.error('Error fetching completed projects count:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      systemCount: 0,
      manualCount: 0,
      totalCount: 0
    });
  }
});

module.exports = router;
