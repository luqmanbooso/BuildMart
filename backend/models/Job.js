const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: String,
  amount: String,
  description: String,
});

const jobSchema = new mongoose.Schema({
  userid: String,
  username: String,
  title: String,  
  category: String,
  area: String,
  description: String,
  minBudget: String, // Changed from budget
  maxBudget: String, // Added maxBudget
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now },
  biddingStartTime: { type: Date, required: true },
  biddingEndTime: { type: Date, required: true },
  bids: { type: Number, default: 0 },
  acceptedBid: { type: String, default: null }, // Add this to store accepted bid ID
  milestones: { type: [milestoneSchema], default: [] }, // Make milestones optional
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
