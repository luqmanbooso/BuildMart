const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product routes with proper error handling
router.post('/products', async (req, res) => {
  try {
    await productController.createProduct(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    await productController.getAllProducts(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    await productController.updateProduct(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await productController.deleteProduct(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Validation middleware
const validateProduct = (req, res, next) => {
  const { name, sku, category, price, stock, threshold } = req.body;
  
  if (!name || !sku || !category || !price || !stock || !threshold) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid price'
    });
  }
  
  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid stock quantity'
    });
  }
  
  next();
};

// Add validation middleware to routes that need it
router.post('/products', validateProduct);
router.put('/products/:id', validateProduct);

module.exports = router;