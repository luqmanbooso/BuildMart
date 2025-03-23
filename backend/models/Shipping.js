const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  driver: {
    type: String,
    required: true
  },
  vehicle: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Loading', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Returned'],
    default: 'Pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  eta: {
    type: String,
    default: 'Calculating...'
  },
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String,
    unique: true
  },
  notes: {
    type: String
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['Pending', 'Loading', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Returned']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      notes: String
    }
  ]
}, { timestamps: true });

// Generate tracking number on save if not provided
shippingSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    const prefix = 'SHP';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.trackingNumber = `${prefix}-${randomDigits}`;
  }
  
  // Add to status history if it's a new status or the first entry
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: 'Status updated'
    });
  }
  
  next();
});

const Shipping = mongoose.model('Shipping', shippingSchema);

module.exports = Shipping;