const express = require('express');
const router = express.Router();
const SupplierPayment = require('../models/SupplierPayment');
const RestockRequest = require('../models/RestockRequest');

console.log('Initializing supplier payment routes');

// Get all supplier payments
router.get('/', async (req, res) => {
  try {
    const payments = await SupplierPayment.find();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new supplier payment
router.post('/', async (req, res) => {
  try {
    const payment = new SupplierPayment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating supplier payment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get a specific payment
router.get('/:id', async (req, res) => {
  try {
    const payment = await SupplierPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    console.error('Error fetching supplier payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('Supplier payment routes initialized');

module.exports = router;