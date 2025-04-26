const express = require('express');
const router = express.Router();
const SupplierPayment = require('../models/SupplierPayment');
const RestockRequest = require('../models/RestockRequest');

console.log('Initializing supplier payment routes');

// Create a new supplier payment
router.post('/', async (req, res) => {
  console.log('POST /api/supplier-payments/ hit');
  try {
    console.log('Creating supplier payment:', req.body);

    // Create payment record
    const payment = new SupplierPayment(req.body);
    const savedPayment = await payment.save();
    console.log('Payment saved:', savedPayment);

    // Update restock request payment status and details
    if (req.body.requestId) {
      const updatedRequest = await RestockRequest.findByIdAndUpdate(
        req.body.requestId,
        {
          paymentStatus: 'paid',
          paymentDetails: {
            method: 'Direct Payment',
            amount: req.body.amount,
            transactionId: savedPayment._id,
            paidDate: new Date()
          }
        },
        { new: true }
      );
      console.log('Updated restock request:', updatedRequest);
    }

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating supplier payment:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors || {},
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all supplier payments
router.get('/', async (req, res) => {
  console.log('GET /api/supplier-payments/ hit');
  try {
    console.log('Fetching all supplier payments');
    const payments = await SupplierPayment.find()
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get supplier payment by ID
router.get('/:id', async (req, res) => {
  console.log('GET /api/supplier-payments/:id hit');
  try {
    console.log('Fetching supplier payment by ID:', req.params.id);
    const payment = await SupplierPayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Error fetching supplier payment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Supplier payment routes are working' });
});

console.log('Supplier payment routes initialized');

module.exports = router; 