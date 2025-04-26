const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Pending Verification', 'Ready For Payment', 'Completed'],
    default: 'Pending'
  },
  completedAt: {
    type: Date
  },
  actualAmountPaid: {
    type: Number
  }
});

const ongoingWorkSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeline: {
    type: Number, // Number of days
    required: true
  },
  workProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  milestones: [milestoneSchema],
  status: {
    type: String,
    enum: ['Active', 'On Hold', 'Completed', 'Cancelled', 'Disputed'],
    default: 'Active'
  },
  reviewed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Calculate work progress based on completed milestones
ongoingWorkSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(
      m => m.status === 'Completed'
    ).length;
    
    this.workProgress = Math.round((completedMilestones / this.milestones.length) * 100);
    
    // If all milestones are completed, mark the work as completed
    if (this.workProgress === 100 && this.status !== 'Completed') {
      this.status = 'Completed';
    }
  }
  next();
});

const OngoingWork = mongoose.model('OngoingWork', ongoingWorkSchema);

module.exports = OngoingWork;
