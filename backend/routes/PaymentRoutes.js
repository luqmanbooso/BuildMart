// paymentController.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');  // Import your payment model
const jwt = require('jsonwebtoken');

// Add this middleware to extract user data from token
const extractUserFromToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Add user data to request
      req.userData = {
        id: decoded.userId || decoded.id || decoded._id,
        email: decoded.email,
        name: decoded.name || decoded.fullName,
        role: decoded.role,
        userType: decoded.userType,
        ...decoded // Include any other fields from token
      };
    }
    next();
  } catch (error) {
    console.error('Error extracting user data from token:', error);
    // Continue without user data
    next();
  }
};

// Use the middleware
router.post('/process-payment', extractUserFromToken, async (req, res) => {
  try {
    // Extract payment details from request body
    const {
      name: cardholderName,
      cardNumber,
      expiry,
      amount,
      activeCard,
      // Additional fields
      originalAmount,
      commissionAmount,
      commissionRate,
      context,
      order,
      workId,
      milestoneId,
      user: requestUser
    } = req.body;

    // Get user data either from request body or from token
    const userData = requestUser || req.userData || null;
    
    console.log('Processing payment with user data:', userData);

    // Basic validation
    if (!cardholderName || !cardNumber || !expiry || !amount || !activeCard) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields'
      });
    }

    // Validate card number - simple length check
    if (cardNumber.length < 12 || cardNumber.length > 19) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number'
      });
    }

    // Validate expiry - simple format check (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date format (MM/YY)'
      });
    }

    // Extract last 4 digits of card
    const lastFourDigits = cardNumber.slice(-4);

    // Create user object from available data
    const userObject = userData ? {
      userId: userData.id || userData.userId || null,
      email: userData.email || null,
      name: userData.name || cardholderName,
      role: userData.role || null,
      userType: userData.userType || null
    } : null;

    // Create payment record
    const payment = new Payment({
      cardholderName,
      cardType: activeCard.toLowerCase(),
      lastFourDigits,
      expiryDate: expiry,
      amount: parseFloat(amount),
      originalAmount: originalAmount ? parseFloat(originalAmount) : parseFloat(amount),
      commissionAmount: commissionAmount ? parseFloat(commissionAmount) : 0,
      commissionRate: commissionRate || 0,
      status: 'completed',
      paymentType: context || 'other',
      user: userObject,
      workId: workId || null,
      milestoneId: milestoneId || null,
      order: order ? {
        orderId: order.orderId || `ORDER-${Date.now()}`,
        items: order.items || [],
        shippingDetails: order.shippingDetails || {}
      } : null
    });

    await payment.save();
    console.log('Payment saved successfully:', payment._id);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        originalAmount: payment.originalAmount,
        commissionAmount: payment.commissionAmount,
        commissionRate: payment.commissionRate,
        status: payment.status,
        context: context,
        cardType: payment.cardType,
        lastFourDigits,
        cardholderName,
        user: userObject,
        timestamp: new Date()
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
