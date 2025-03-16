const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// POST: Create a new job
router.post('/', async (req, res) => {
  const { userid, title, category, area, budget, biddingStartTime, milestones } = req.body;

  const newJob = new Job({
    userid,
    title,
    category,
    area,
    budget,
    biddingStartTime,
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

// GET: Fetch a specific job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching job details' });
  }
});

module.exports = router;
