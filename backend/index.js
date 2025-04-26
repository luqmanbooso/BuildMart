const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import models first
require('./models/SupplierPayment');
require('./models/RestockRequest');

// Import routes
const supplierPaymentsRouter = require('./routes/supplierPaymentRoutes');
const restockRouter = require('./routes/restockRoutes');
const inventoryRouter = require('./routes/productRoutes');

// Initialize express app
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('--------------------');
  console.log('New Request:');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  console.log('--------------------');
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Registered MongoDB Models:', Object.keys(mongoose.models));
})
.catch((err) => console.error('Could not connect to MongoDB:', err));

// Register routes
app.use('/api/supplier-payments', supplierPaymentsRouter);
app.use('/api/restock', restockRouter);
app.use('/api/inventory', inventoryRouter);

// Test route for supplier payments
app.get('/api/test-supplier-payments', (req, res) => {
  res.json({
    message: 'Supplier payments route test',
    models: Object.keys(mongoose.models),
    supplierPaymentModel: !!mongoose.models.SupplierPayment
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('BuildMart API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`Router: ${middleware.regexp}`);
    }
  });
});

module.exports = app; 