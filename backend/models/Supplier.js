const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  value: { 
    type: Number, 
    default: 0 
  },
  contact: String,
  email: String,
  phone: String, // Added field
  address: String,
  city: String, // Added field
  country: String, // Added field
  category: String,
  website: String, // Added field
  paymentTerms: String, // Added field
  minimumOrder: Number, // Added field
  leadTime: Number, // Added field
  taxId: String, // Added field
  rating: { // Added field
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  preferredPayment: String, // Added field
  notes: String, // Added field
  active: { // Added field to mark inactive suppliers
    type: Boolean,
    default: true
  },
  productCategories: [String], // Added field - list of product categories they supply
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the 'updatedAt' field on save
supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Supplier', supplierSchema);