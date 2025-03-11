const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  contractorName: { type: String, required: true },
  price: { type: Number, required: true },
  timeline: { type: String, required: true },
  qualifications: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
