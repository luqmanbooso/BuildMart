const express = require('express');
const router = express.Router();
const RestockRequest = require('../models/RestockRequest');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Get all restock requests
router.get('/', async (req, res) => {
  try {
    const restockRequests = await RestockRequest.find()
      .sort({ createdAt: -1 });
    res.json(restockRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a restock request
router.post('/', async (req, res) => {
  try {
    // Find the product
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find an appropriate supplier based on product category
    let supplier = null;
    if (product.category) {
      supplier = await Supplier.findOne({ 
        $or: [
          { category: product.category },
          { productCategories: { $in: [product.category] } }
        ],
        active: true
      });
    }
    
    const restockRequest = new RestockRequest({
      productId: product._id,
      productName: req.body.productName || product.name,
      sku: product.sku,
      currentStock: product.stock,
      threshold: product.threshold,
      quantity: req.body.quantity || (product.threshold - product.stock + 10), // Default to threshold + buffer
      priority: req.body.priority || (product.stock <= 0 ? 'urgent' : product.stock < product.threshold/2 ? 'high' : 'medium'),
      supplierId: supplier ? supplier._id : null,
      supplierName: supplier ? supplier.name : 'Not assigned',
      status: 'requested',
      notes: req.body.notes || `Automatic restock request for ${product.name}`,
    });

    const savedRequest = await restockRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update restock request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['requested', 'approved', 'ordered', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const request = await RestockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Restock request not found' });
    }
    
    request.status = status;
    
    // If delivered, update the product stock
    if (status === 'delivered') {
      const product = await Product.findById(request.productId);
      if (product) {
        product.stock += request.quantity;
        await product.save();
      }
    }
    
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Process payment for a restock request
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentMethod, amount, transactionId } = req.body;
    
    const request = await RestockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Restock request not found' });
    }
    
    // Only allow payment for delivered items
    if (request.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only pay for delivered items' });
    }
    
    request.paymentStatus = 'paid';
    request.paymentDetails = {
      method: paymentMethod,
      amount: amount,
      transactionId: transactionId,
      paidDate: new Date()
    };
    
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add this new route after your existing routes

// Get all possible restock request status types
router.get('/status-types', async (req, res) => {
  try {
    // Get the status enum values directly from the mongoose schema
    const statusEnum = RestockRequest.schema.path('status').enumValues;
    
    // Return the array of possible status values
    res.json({
      statusTypes: statusEnum,
      // Also include priority types for convenience
      priorityTypes: RestockRequest.schema.path('priority').enumValues,
      // Include payment status types
      paymentStatusTypes: RestockRequest.schema.path('paymentStatus').enumValues
    });
  } catch (err) {
    console.error('Error fetching status types:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;