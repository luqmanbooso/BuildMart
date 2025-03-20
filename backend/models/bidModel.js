const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bidSchema = new mongoose.Schema({
  // Reference to project
  projectId: { 
    type: String, 
    required: true 
  },
  // Basic contractor info
  contractorId: {
    type: String, 
    required: true,
  },
  contractorname: {
    type: String,
    required: true
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
  // NEW FIELDS for bid updates
  updateCount: {
    type: Number,
    default: 0 // Start with 0 updates
  },
  previousPrices: [{
    price: Number,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Adds updatedAt field automatically
});

// Add this index right before creating the model
bidSchema.index({ projectId: 1, price: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;