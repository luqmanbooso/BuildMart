const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Add this field for order numbers
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // Allow some documents to not have this field
  },
  
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    lastFourDigits: String,
    cardholderName: String,
    date: Date
  },
  customer: {
    name: String,
    email: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    phone: String,
    notes: String
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a pre-save hook to generate order numbers if not present
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const prefix = 'ORD';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `${prefix}-${randomDigits}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);