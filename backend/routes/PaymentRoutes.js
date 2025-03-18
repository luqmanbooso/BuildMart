const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

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


    // Validate expiry date (MM/YY) and check if it's expired
    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (!month || !year || month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
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

module.exports = router;
