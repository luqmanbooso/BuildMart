const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: String,
  amount: String,
  description: String,
});

const jobSchema = new mongoose.Schema({
userid: String,
  title: String,  
  category: String,
  area: String,
  budget: String,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now },
  biddingStartTime: { type: Date, required: true },
  bids: { type: Number, default: 0 },
  milestones: [milestoneSchema],
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
