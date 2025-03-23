const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  cardholderName: {
    type: String,
    required: true
  },
  cardType: {
    type: String,
    required: true
  },
  lastFourDigits: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    min: 0
  },
  commissionAmount: {
    type: Number,
    min: 0
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 1 // As a decimal (0.10 = 10%)
  },
  status: {
    type: String,
    default: 'completed',
    enum: ['pending', 'completed', 'failed']
  },
  paymentType: {
    type: String,
    enum: ['other', 'milestone', 'inventory', 'agreement_fee'],
    default: 'other'
  },
  // User information
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    name: String,
    role: String,
    userType: String
  },
  // Work/milestone info
  workId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OngoingWork'
  },
  milestoneId: mongoose.Schema.Types.ObjectId,
  // Order information
  order: {
    orderId: String,
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      quantity: Number,
      price: Number
    }],
    shippingDetails: {
      address: String,
      city: String,
      postalCode: String,
      phone: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
