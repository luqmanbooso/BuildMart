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
  address: String,
  category: String,
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