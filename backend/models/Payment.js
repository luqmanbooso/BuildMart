const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  cardholderName: {
    type: String,
    required: true
  },
  cardType: {
    type: String,
    required: true,
    enum: ['visa', 'mastercard', 'amex', 'discover']
  },
  lastFourDigits: {
    type: String,
    required: true,
    match: /^\d{4}$/ // Ensures only the last 4 digits are stored
  },
  expiryDate: {
    type: String,
    required: true,
    match: /^\d{2}\/\d{2}$/ // Ensures MM/YY format
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01 // Ensures positive amount
  },
  status: {
    type: String,
    default: 'completed',
    enum: ['pending', 'completed', 'failed']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
