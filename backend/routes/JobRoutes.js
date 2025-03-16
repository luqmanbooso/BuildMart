const express = require('express');
const Job = require('../models/Job');
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
    biddingEndTime, // Added bidding end time
    milestones 
  } = req.body;

  const newJob = new Job({
    userid,
    title,
    category,
    area,
    description,
    budget,
    biddingStartTime,
    biddingEndTime, // Added bidding end time
    milestones,
  });

  try {
    await newJob.save();
    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (err) {
    res.status(500).json({ error: 'Error creating job' });
  }
});

// Update the GET all jobs route to include user info

// GET: Fetch all jobs with user info
router.get('/', async (req, res) => {
  try {
    const { userid } = req.query;
    
    // If userid is provided, filter jobs by userid
    const query = userid ? { userid } : {};
    
    // Fetch jobs
    const jobs = await Job.find(query);
    
    // For each job, try to fetch the user info
    const jobsWithUserInfo = await Promise.all(jobs.map(async (job) => {
      try {
        // Assuming you have a User model and endpoint
        const user = await User.findOne({ _id: job.userid });
        const jobObj = job.toObject();
        jobObj.userName = user ? user.name : 'Unknown User';
        return jobObj;
      } catch (error) {
        // If user lookup fails, just return the job
        return job;
      }
    }));
    
    res.status(200).json(jobsWithUserInfo);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

// Update the GET specific job route to include user information

// GET: Fetch a specific job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // If there's a userid, try to get the user name
    if (job.userid) {
      try {
        const user = await User.findById(job.userid).select('name');
        if (user) {
          const jobData = job.toObject();
          jobData.userName = user.name;
          return res.status(200).json(jobData);
        }
      } catch (userErr) {
        console.log('Error fetching user data:', userErr);
      }
    }
    
    // Return job without user info if user fetch fails
    res.status(200).json(job);
  } catch (err) {
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

module.exports = router;
