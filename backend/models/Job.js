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
  description: String,
  budget: String,
  status: { type: String, default: 'Pending' }, // 'Pending', 'Active', 'Closed'
  date: { type: Date, default: Date.now },
  biddingStartTime: { type: Date, required: true },
  biddingEndTime: { type: Date, required: true }, // Added bidding end time field
  bids: { type: Number, default: 0 },
  milestones: [milestoneSchema],
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
