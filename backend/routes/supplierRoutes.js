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
  const supplier = new Supplier({
    name: req.body.name,
    value: req.body.value,
    contact: req.body.contact,
    email: req.body.email,
    address: req.body.address,
    category: req.body.category
  });

  try {
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

    // Update only provided fields
    if (req.body.name) supplier.name = req.body.name;
    if (req.body.value !== undefined) supplier.value = req.body.value;
    if (req.body.contact !== undefined) supplier.contact = req.body.contact;
    if (req.body.email !== undefined) supplier.email = req.body.email;
    if (req.body.address !== undefined) supplier.address = req.body.address;
    if (req.body.category !== undefined) supplier.category = req.body.category;
    
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

module.exports = router;