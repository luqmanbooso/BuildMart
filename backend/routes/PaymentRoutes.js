// paymentController.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');  // Import your payment model

// Process Payment Route
router.post('/process-payment', async (req, res) => {
  try {
    const {
      name: cardholderName,
      cardNumber,
      expiry,
      amount,
      activeCard
    } = req.body;

    // Validate required fields
    if (!cardholderName || !cardNumber || !expiry || !amount || !activeCard) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate card number format (12 to 19 digits)
    const cardNumberPattern = /^[0-9]{12,19}$/;
    if (!cardNumberPattern.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number format'
      });
    }

    // Validate expiry date (MM/YY) and check if it's expired
    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYear = 2000 + year; // convert to full year (e.g., 2023 from 23)

    if (!month || !year || month < 1 || month > 12 || expiryYear < currentDate.getFullYear() || (expiryYear === currentDate.getFullYear() && month < currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired card date'
      });
    }

    // Validate amount (Must be positive)
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Validate card type
    const validCardTypes = ['visa', 'mastercard', 'amex', 'discover'];
    if (!validCardTypes.includes(activeCard.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card type'
      });
    }

    // Extract last 4 digits
    const lastFourDigits = cardNumber.slice(-4);

    // Create new payment record
    const payment = new Payment({
      cardholderName,
      cardType: activeCard.toLowerCase(),
      lastFourDigits,
      expiryDate: expiry,
      amount: parseFloat(amount),
      status: 'completed'
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// Fetch All Payments Route
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      cardType, 
      dateFrom, 
      dateTo,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (cardType && cardType !== 'all') {
      filter.cardType = cardType;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;
    
    const payments = await Payment.find(filter)
      .sort(sortObj)
      .exec();
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// Add route to update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// Add this new route to handle milestone payments
router.post('/milestone-payment', async (req, res) => {
  try {
    const {
      workId,
      milestoneId,
      amount,
      paymentDetails
    } = req.body;

    // Create payment record
    const payment = new Payment({
      ...paymentDetails,
      amount: parseFloat(amount),
      status: 'completed',
      type: 'milestone',
      workId,
      milestoneId
    });

    await payment.save();

    // Update the milestone status
    await OngoingWork.findOneAndUpdate(
      { 
        _id: workId,
        'milestones._id': milestoneId 
      },
      {
        $set: {
          'milestones.$.status': 'completed',
          'milestones.$.actualAmountPaid': amount,
          'milestones.$.completedAt': new Date(),
          'milestones.$.paymentId': payment._id
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Milestone payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Milestone payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

module.exports = router;
