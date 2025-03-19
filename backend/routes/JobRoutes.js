const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User'); // Add this import for User model
const router = express.Router();

// POST: Create a new job
router.post('/', async (req, res) => {
  const { 
    userid, 
    title, 
    category, 
    area,
    description,
    budget, 
    biddingStartTime, 
    biddingEndTime,
    milestones 
  } = req.body;

  try {
    // Fetch the username for the given userid
    const user = await User.findById(userid);
    const username = user ? user.username : 'Unknown User';

    const newJob = new Job({
      userid,
      username, // Store the username with the job
      title,
      category,
      area,
      description,
      budget,
      biddingStartTime,
      biddingEndTime,
      milestones,
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

// Add a new endpoint to update auction status
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
    
    res.status(200).json({ message: 'Auction status updated successfully', job });
  } catch (err) {
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

module.exports = router;
