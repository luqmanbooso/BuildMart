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
  categories: [String],  
  area: String,
  description: String,
  minBudget: String,
  maxBudget: String,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now },
  biddingStartTime: { type: Date, required: true },
  biddingEndTime: { type: Date, required: true },
  bids: { type: Number, default: 0 },
  acceptedBid: { type: String, default: null },
  milestones: { type: [milestoneSchema], default: [] },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
