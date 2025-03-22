const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User'); // Add this import for User model
const router = express.Router();

// POST: Create a new job
router.post('/', async (req, res) => {
  const { 
    userid, 
    title, 
    categories,  // Changed from category to categories
    area,
    description,
    minBudget,
    maxBudget,
    biddingStartTime, 
    biddingEndTime,
    milestones  // Add this to accept milestones
  } = req.body;

  try {
    // Fetch the username for the given userid
    const user = await User.findById(userid);
    const username = user ? user.username : 'Unknown User';

    const newJob = new Job({
      userid,
      username,
      title,
      categories,  // Changed from category to categories
      area,
      description,
      minBudget,
      maxBudget,
      biddingStartTime,
      biddingEndTime,
      milestones: milestones || []  // Use provided milestones or empty array
    });

    await newJob.save();
    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Error creating job' });
  }
});

// GET: Fetch all jobs with user info
router.get('/', async (req, res) => {
  try {
    const { userid } = req.query;
    
    // If userid is provided, filter jobs by userid
    const query = userid ? { userid } : {};
    
    // Fetch jobs
    const jobs = await Job.find(query);
    
    // For each job, try to fetch the user info if username is not already stored
    const jobsWithUserInfo = await Promise.all(jobs.map(async (job) => {
      const jobObj = job.toObject();
      
      // Only fetch user info if username is not available
      if (!jobObj.username && jobObj.userid) {
        try {
          const user = await User.findById(jobObj.userid);
          jobObj.username = user ? user.username : 'Unknown User';
        } catch (error) {
          console.log('Error fetching user data:', error);
          jobObj.username = 'Unknown User';
        }
      }
      
      return jobObj;
    }));
    
    res.status(200).json(jobsWithUserInfo);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

// GET: Fetch a specific job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const jobData = job.toObject();
    
    // If username is not stored with job, try to fetch it
    if (!jobData.username && jobData.userid) {
      try {
        const user = await User.findById(jobData.userid);
        if (user) {
          jobData.username = user.username;
        }
      } catch (userErr) {
        console.log('Error fetching user data:', userErr);
      }
    }
    
    res.status(200).json(jobData);
  } catch (err) {
    console.error('Error fetching job details:', err);
    res.status(500).json({ error: 'Error fetching job details' });
  }
});

// Modify the auction-status endpoint to ensure consistent response format
router.put('/:id/auction-status', async (req, res) => {
  const { status } = req.body;
  
  if (!['Active', 'Pending', 'Closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // If starting auction now, update bidding start time
    if (status === 'Active' && job.status !== 'Active') {
      job.biddingStartTime = new Date();
    }
    
    // If stopping auction early, update bidding end time to now
    if (status === 'Closed' && job.status === 'Active') {
      job.biddingEndTime = new Date();
    }
    
    job.status = status;
    await job.save();
    
    // FIXED: Return the updated job in a consistent format
    res.status(200).json({ 
      message: 'Auction status updated successfully', 
      job: job.toObject()  // Convert to plain object for consistent formatting
    });
  } catch (err) {
    console.error('Error updating auction status:', err);
    res.status(500).json({ error: 'Error updating auction status' });
  }
});

// Add this route to handle job deletion
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Optional: Add authentication to ensure only the job owner can delete it
    // if (job.userid !== req.user.id) {
    //   return res.status(403).json({ error: 'Not authorized to delete this job' });
    // }
    
    await Job.findByIdAndDelete(req.params.id);
    
    // Optional: Delete related bids or other associated data
    // await Bid.deleteMany({ jobId: req.params.id });
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Error deleting job' });
  }
});

// Add this route to handle bid acceptance with milestones in one operation
router.put('/:id/accept-bid', async (req, res) => {
  try {
    const { bidId, acceptedBidAmount, milestones } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Update job with accepted bid info and milestones
    job.acceptedBid = bidId;
    job.acceptedBidAmount = acceptedBidAmount;
    job.milestones = milestones;
    job.status = 'Closed'; // Close the auction
    
    await job.save();
    
    res.status(200).json({ 
      message: 'Bid accepted and milestones saved successfully',
      job: job
    });
  } catch (err) {
    console.error('Error accepting bid:', err);
    res.status(500).json({ error: 'Error accepting bid' });
  }
});

// Add this route for updating job details
router.put('/:id', async (req, res) => {
  try {
    const { 
      title, 
      categories,
      area,
      description,
      minBudget,
      maxBudget,
      biddingStartTime, 
      biddingEndTime,
      milestones
    } = req.body;

    // Find the job by ID
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Optional: Check if user is authorized to update this job
    // if (job.userid !== req.userId) {
    //   return res.status(403).json({ error: 'Not authorized to update this job' });
    // }
    
    // Update job fields
    job.title = title || job.title;
    job.categories = categories || job.categories;
    job.area = area || job.area;
    job.description = description || job.description;
    job.minBudget = minBudget || job.minBudget;
    job.maxBudget = maxBudget || job.maxBudget;
    job.biddingStartTime = biddingStartTime || job.biddingStartTime;
    job.biddingEndTime = biddingEndTime || job.biddingEndTime;
    
    // Only update milestones if provided
    if (milestones) {
      job.milestones = milestones;
    }
    
    // Save the updated job
    await job.save();
    
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ error: 'Error updating job' });
  }
});

// Add this function before module.exports
// Function to update auction statuses automatically
const updateAuctionStatus = async (jobId) => {
  // Validate job ID before attempting to find it
  if (!jobId || jobId === 'undefined' || jobId === undefined) {
    console.log("Skipping auction status update - invalid job ID");
    return;
  }

  try {
    const job = await Job.findById(jobId);
    
    if (!job) {
      console.log(`Job with ID ${jobId} not found`);
      return;
    }
    
    const now = new Date();
    const endTime = new Date(job.biddingEndTime);
    const startTime = new Date(job.biddingStartTime);
    
    // Update job status based on current time
    if (job.status === 'Pending' && now >= startTime) {
      job.status = 'Active';
      await job.save();
      console.log(`Job ${job._id} activated (auction started)`);
    } else if (job.status === 'Active' && now >= endTime) {
      job.status = 'Closed';
      await job.save();
      console.log(`Job ${job._id} closed (auction ended)`);
    }
  } catch (error) {
    console.error(`Error updating auction status for job ${jobId}:`, error);
  }
};

// Add an endpoint to check and update all auction statuses
router.get('/update-all-auction-statuses', async (req, res) => {
  try {
    // Find all jobs that might need status updates
    const pendingJobs = await Job.find({ status: 'Pending' });
    const activeJobs = await Job.find({ status: 'Active' });
    
    let updatedCount = 0;
    
    // Check all pending jobs for activation
    for (const job of pendingJobs) {
      const now = new Date();
      const startTime = new Date(job.biddingStartTime);
      
      if (now >= startTime) {
        job.status = 'Active';
        await job.save();
        updatedCount++;
      }
    }
    
    // Check all active jobs for completion
    for (const job of activeJobs) {
      const now = new Date();
      const endTime = new Date(job.biddingEndTime);
      
      if (now >= endTime) {
        job.status = 'Closed';
        await job.save();
        updatedCount++;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Updated ${updatedCount} jobs` 
    });
  } catch (error) {
    console.error('Error updating auction statuses:', error);
    res.status(500).json({ error: 'Failed to update auction statuses' });
  }
});

// Add route to restart a closed job
router.put('/:id/restart', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Validate job ID
    if (!jobId) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Only allow restarting closed jobs
    if (job.status !== 'Closed') {
      return res.status(400).json({ error: 'Only closed jobs can be restarted' });
    }
    
    // Set new bidding times (default to 7 days)
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7); // Default 7 day auction
    
    // Update with new values from request or use defaults
    const { biddingEndTime } = req.body;
    
    job.status = 'Active';
    job.biddingStartTime = now;
    job.biddingEndTime = biddingEndTime || endDate;
    job.wasReopened = true; // Flag to indicate this job was reopened
    
    await job.save();
    
    res.status(200).json({ 
      message: 'Job restarted successfully',
      job: job
    });
  } catch (err) {
    console.error('Error restarting job:', err);
    res.status(500).json({ error: 'Error restarting job' });
  }
});

module.exports = router;
