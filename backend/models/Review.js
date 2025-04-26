const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OngoingWork',
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    type: String // URL to uploaded images
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  // Track if the contractor has responded to this review
  contractorResponse: {
    comment: String,
    respondedAt: Date
  }
}, { timestamps: true });

// Pre-save hook to ensure rating is within range
reviewSchema.pre('save', function(next) {
  if (this.rating < 1) this.rating = 1;
  if (this.rating > 5) this.rating = 5;
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
