const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Milestone Schema to track phases of the project
const milestoneSchema = new mongoose.Schema({
  name: String,
  amount: String,
  description: String,
  // Update the status enum to include all possible states
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Pending Verification', 'Ready For Payment', 'Completed'],
    default: 'Pending' 
  },
  completedAt: { 
    type: Date 
  },
  actualAmountPaid: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number,
    default: 0
  },
  notes: String
});

// Ongoing Work Schema to track job progress for both client and contractor
const ongoingWorkSchema = new mongoose.Schema({
  jobId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  clientId: { 
    type: String, 
    required: true 
  },
  timeline: {
    type: Number,
    default: 30, // Default to 30 days if not specified
    required: true
  },
  contractorId: { 
    type: String, 
    required: true 
  },
  jobStatus: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'In Progress'
  },
  milestones: [milestoneSchema],
  clientFeedback: { 
    type: String 
  },
  contractorFeedback: { 
    type: String 
  },
  workProgress: {
    type: Number,
    default: 0, // percentage of work completed
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  totalAmountPending: {
    type: Number,
    default: 0
  },
  lastPaymentDate: { 
    type: Date 
  },
  paymentStatus: {
    type: String, 
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  communication: [{
    senderId: String, // Either client or contractor
    message: String,
    sentAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Adds updatedAt field automatically
});

const OngoingWork = mongoose.model('OngoingWork', ongoingWorkSchema);

module.exports = OngoingWork;
