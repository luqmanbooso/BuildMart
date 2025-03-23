const express = require('express');
const router = express.Router();
const Shipping = require('../models/Shipping');

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipping.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Get active shipments (not delivered)
router.get('/active', async (req, res) => {
  try {
    const activeShipments = await Shipping.find({
      status: { $ne: 'Delivered' }
    }).sort({ createdAt: -1 });
    
    res.json(activeShipments);
  } catch (error) {
    console.error('Error fetching active shipments:', error);
    res.status(500).json({ error: 'Failed to fetch active shipments' });
  }
});

// Get shipment by ID
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipping.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// Get shipment by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const shipment = await Shipping.findOne({ trackingNumber: req.params.trackingNumber });
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(shipment);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({ error: 'Failed to track shipment' });
  }
});

// Create new shipment
router.post('/', async (req, res) => {
  try {
    const {
      orderId,
      origin,
      destination,
      driver,
      vehicle,
      contactNumber,
      status,
      progress,
      eta,
      estimatedDeliveryDate,
      notes
    } = req.body;
    
    // Validation
    if (!orderId || !origin || !destination || !driver || !vehicle || !contactNumber) {
      return res.status(400).json({ error: 'Missing required shipment details' });
    }
    
    // Create new shipment
    const shipment = new Shipping({
      orderId,
      origin,
      destination,
      driver,
      vehicle,
      contactNumber,
      status: status || 'Pending',
      progress: progress || 0,
      eta: eta || 'Calculating...',
      estimatedDeliveryDate: estimatedDeliveryDate || null,
      notes: notes || ''
    });
    
    const savedShipment = await shipment.save();
    
    // If you have an Order model, you would update the order here
    // const Order = require('../models/Order');
    // const order = await Order.findById(orderId);
    // if (order) {
    //   order.deliveryStatus = 'In Transit';
    //   order.trackingNumber = savedShipment.trackingNumber;
    //   await order.save();
    // }
    
    res.status(201).json(savedShipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// Update shipment status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, eta, notes } = req.body;
    
    const shipment = await Shipping.findById(id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Update fields
    if (status) shipment.status = status;
    if (progress !== undefined) shipment.progress = progress;
    if (eta) shipment.eta = eta;
    
    // Add to status history
    shipment.statusHistory.push({
      status: status || shipment.status,
      timestamp: new Date(),
      notes: notes || 'Status updated'
    });
    
    // If delivered, set actual delivery date
    if (status === 'Delivered' && !shipment.actualDeliveryDate) {
      shipment.actualDeliveryDate = new Date();
      shipment.progress = 100;
    }
    
    // Save the updated shipment
    const updatedShipment = await shipment.save();
    
    // You would update the associated order here if you have an Order model
    
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ error: 'Failed to update shipment status' });
  }
});

// Update shipment details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be directly updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const updatedShipment = await Shipping.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedShipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Delete shipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipment = await Shipping.findById(id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    await Shipping.findByIdAndDelete(id);
    
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

module.exports = router;