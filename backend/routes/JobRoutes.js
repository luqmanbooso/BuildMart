const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// POST: Create a new job
router.post('/', async (req, res) => {
  const { title, category, area, budget, biddingStartTime, milestones } = req.body;

  const newJob = new Job({
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

// GET: Fetch all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

module.exports = router;
