const express = require('express');
const router = express.Router();
const SupplierPayment = require('../models/SupplierPayment');
const RestockRequest = require('../models/RestockRequest');


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
    // Update restock request payment status and details
    if (req.body.requestId) {
      const updatedRequest = await RestockRequest.findByIdAndUpdate(
        req.body.requestId,
        {
          paymentStatus: 'pending payment',
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

// Update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const payment = await SupplierPayment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = status;
    
    // If payment is marked as paid, update the payment date
    if (status === 'paid') {
      payment.paymentDate = new Date();
      
      // If there's an associated restock request, update it too
      if (payment.requestId) {
        await RestockRequest.findByIdAndUpdate(
          payment.requestId,
          {
            paymentStatus: 'paid',
            'paymentDetails.paidDate': new Date()
          }
        );
      }
    }
    
    const updatedPayment = await payment.save();
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating supplier payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;