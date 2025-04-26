const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get active suppliers only 
router.get('/active', async (req, res) => {
  try {
    const suppliers = await Supplier.find({ active: true });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get suppliers by category
router.get('/category/:category', async (req, res) => {
  try {
    const suppliers = await Supplier.find({ 
      category: req.params.category,
      active: true 
    });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single supplier
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a supplier
router.post('/', async (req, res) => {
  try {
    // Check if a supplier already exists for this product
    const existingSupplier = await Supplier.findOne({ productId: req.body.productId });
    if (existingSupplier) {
      return res.status(400).json({ message: 'A supplier already exists for this product' });
    }

    const supplier = new Supplier({
      name: req.body.name,
      contact: req.body.contact,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      category: req.body.category,
      website: req.body.website,
      paymentTerms: req.body.paymentTerms,
      minimumOrder: req.body.minimumOrder,
      leadTime: req.body.leadTime,
      taxId: req.body.taxId,
      rating: req.body.rating,
      preferredPayment: req.body.preferredPayment,
      notes: req.body.notes,
      active: req.body.active !== undefined ? req.body.active : true,
      productId: req.body.productId,
      price: req.body.price || 0
    });

    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // If productId is being changed, check if another supplier exists for that product
    if (req.body.productId && req.body.productId !== supplier.productId.toString()) {
      const existingSupplier = await Supplier.findOne({ productId: req.body.productId });
      if (existingSupplier) {
        return res.status(400).json({ message: 'A supplier already exists for this product' });
      }
    }

    // Update fields if they exist in the request body
    const updateFields = [
      'name', 'contact', 'email', 'phone', 'address', 
      'city', 'country', 'category', 'website', 'paymentTerms', 
      'minimumOrder', 'leadTime', 'taxId', 'rating', 
      'preferredPayment', 'notes', 'active', 'productId', 'price'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        supplier[field] = req.body[field];
      }
    });
    
    supplier.updatedAt = Date.now();
    
    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark supplier as inactive (soft delete)
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    supplier.active = false;
    supplier.updatedAt = Date.now();
    await supplier.save();
    
    res.json({ message: 'Supplier deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get products by supplier category match
router.get('/:id/products', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const Product = require('../models/Product');
    const products = await Product.find({ 
      category: { $in: [supplier.category, ...supplier.productCategories || []] } 
    });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;