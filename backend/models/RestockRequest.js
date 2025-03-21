const mongoose = require('mongoose');

const restockRequestSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: String,
  currentStock: Number,
  threshold: Number,
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
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  supplierName: String,
  status: {
    type: String,
    enum: ['requested', 'approved', 'ordered', 'shipped', 'delivered', 'cancelled'],
    default: 'requested'
  },
  notes: String,
  orderDate: Date,
  deliveryDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'rejected'],
    default: 'pending'
  },
  paymentDetails: {
    method: String,
    amount: Number,
    transactionId: String,
    paidDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
restockRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RestockRequest', restockRequestSchema);