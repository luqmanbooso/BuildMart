const express = require('express');
const router = express.Router();
const RestockRequest = require('../models/RestockRequest');
const Product = require('../models/Product'); // Assuming you have a Product model

// Submit a restock request
router.post('/restock-request', async (req, res) => {
  try {
    const {
      productId,
      productName,
      productSku,
      currentStock,
      threshold,
      quantity,
      priority,
      notes
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Check if there's already a pending request for this product
    const existingRequest = await RestockRequest.findOne({
      productId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'There is already a pending restock request for this product' 
      });
    }

    // Create new restock request
    const restockRequest = new RestockRequest({
      productId,
      productName,
      productSku,
      currentStock,
      threshold,
      quantity,
      priority,
      notes
    });

    await restockRequest.save();

    res.status(201).json({
      success: true,
      message: 'Restock request submitted successfully',
      request: restockRequest
    });
  } catch (error) {
    console.error('Error submitting restock request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting restock request',
      error: error.message
    });
  }
});

// Get all restock requests
router.get('/restock-requests', async (req, res) => {
  try {
    const requests = await RestockRequest.find().sort({ requestDate: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching restock requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restock requests',
      error: error.message
    });
  }
});

// Get pending restock requests
router.get('/restock-requests/pending', async (req, res) => {
  try {
    const requests = await RestockRequest.find({ status: 'pending' }).sort({ priority: -1, requestDate: 1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching pending restock requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending restock requests',
      error: error.message
    });
  }
});

// Update request status
router.patch('/restock-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    const updates = { 
      status,
      ...(status === 'approved' && { approvalDate: Date.now(), approvedBy })
    };

    const request = await RestockRequest.findByIdAndUpdate(
      id, 
      updates,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Restock request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Restock request ${status}`,
      request
    });
  } catch (error) {
    console.error(`Error updating restock request:`, error);
    res.status(500).json({
      success: false,
      message: 'Error updating restock request',
      error: error.message
    });
  }
});

// Get pending product IDs
router.get('/pending-product-ids', async (req, res) => {
  try {
    const pendingRequests = await RestockRequest.find(
      { status: 'pending' },
      { productId: 1 }
    );
    
    const productIds = pendingRequests.map(req => req.productId.toString());
    
    res.status(200).json({
      success: true,
      productIds
    });
  } catch (error) {
    console.error('Error fetching pending product IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending product IDs',
      error: error.message
    });
  }
});

module.exports = router;