const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bidSchema = new mongoose.Schema({
  // Reference to project
  projectId: { 
    type: String, 
    required: true 
  },
  // Basic contractor info
  contractorName: { 
    type: String, 
    required: true 
  },
  contractorId: {
    type: String,
    required: false
  },
  // Bid details
  price: { 
    type: Number, 
    required: true 
  },
  timeline: { 
    type: Number, 
    required: true 
  },
  qualifications: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  // Optional contractor profile data
  rating: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Adds updatedAt field automatically
});

// Compound index to ensure one bid per contractor per project
bidSchema.index({ contractorName: 1, projectId: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
// const mongoose = require('mongoose');

// const bidSchema = new mongoose.Schema({
//   contractorName: { type: String, required: true, unique: true },
//   price: { type: Number, required: true },
//   timeline: { type: String, required: true },
//   qualifications: { type: String, required: true },
//   status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
//   createdAt: { type: Date, default: Date.now }
// });

// const Bid = mongoose.model('Bid', bidSchema);
// module.exports = Bid;

// // schema-> data define , schema-> model(table)
