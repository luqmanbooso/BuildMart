const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bidRoutes = require('./routes/bids');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const qualifyRoutes = require('./routes/Qualify');
const ongoingWorksRoutes = require('./routes/ongoingworks');
const paymentRoutes = require('./routes/PaymentRoutes'); // Add this line
const productRoutes = require('./routes/productRoutes');
const path = require('path'); // Add this line
const supplierRoutes = require('./routes/supplierRoutes'); // Add this line
const orderRoutes = require('./routes/orderRoutes'); // Add this line
const shippingRoutes = require('./routes/shippingRoutes'); // Add this line
const reviewsRoutes = require('./routes/reviews'); // Add this line
const app = express();
const restockRoutes = require('./routes/restockRoutes'); // Add this line
const inquiriesRoutes = require('./routes/inquiries');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/bids', bidRoutes);
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/qualify', qualifyRoutes);
app.use('/product', productRoutes);
const jobRoutes = require('./routes/JobRoutes');
app.use('/api/jobs', jobRoutes);
app.use('/api/contractors', require('./routes/contractorprofile'));
app.use('/api/email', require('./routes/email'));
app.use('/api/orders', orderRoutes); // Add this line

// Register the contractors routes
app.use('/api/contractors', require('./routes/contractors'));

// Use routes
app.use('/api/ongoingworks', ongoingWorksRoutes);
app.use('/api/payments', paymentRoutes); // Add this line
app.use('/api/suppliers', supplierRoutes); // Add this line
app.use('/api/restock', restockRoutes); // Add this line
app.use('/api/shipping', shippingRoutes); // Add this line
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/reviews', reviewsRoutes); // Add this line

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Add this line

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from the server');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});