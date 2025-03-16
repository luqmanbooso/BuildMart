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

// GET: Fetch all jobs or filter by userid
router.get('/', async (req, res) => {
  try {
    const { userid } = req.query;
    
    // If userid is provided, filter jobs by userid
    const query = userid ? { userid } : {};
    
    const jobs = await Job.find(query);
    res.status(200).json(jobs);
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
