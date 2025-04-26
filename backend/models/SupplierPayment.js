const mongoose = require('mongoose');

console.log('Defining SupplierPayment Schema');

const supplierPaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  supplier: {
    type: String,
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  product: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestockRequest',
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'paid'
  }
}, {
  timestamps: true,
  collection: 'supplierpayments' // Explicitly set collection name
});

// Add a pre-save hook for logging
supplierPaymentSchema.pre('save', function(next) {
  console.log('Saving supplier payment:', this);
  next();
});

// Create the model
const SupplierPayment = mongoose.model('SupplierPayment', supplierPaymentSchema);

console.log('SupplierPayment model registered');

module.exports = SupplierPayment; 