const mongoose = require('mongoose');

const RestockRequestSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productSku: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'ordered', 'received', 'declined'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  approvedBy: {
    type: String
  }
});

module.exports = mongoose.model('RestockRequest', RestockRequestSchema);