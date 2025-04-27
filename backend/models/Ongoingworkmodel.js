const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const milestoneSchema = new mongoose.Schema({
  name: String,
  amount: String,
  description: String,
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
    default: 30,
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
    default: 0, 
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
    senderId: String, 
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
  timestamps: true
});

const OngoingWork = mongoose.model('OngoingWork', ongoingWorkSchema);

module.exports = OngoingWork;
