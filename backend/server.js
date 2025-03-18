const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const bidRoutes = require('./routes/bids');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const qualifyRoutes = require('./routes/Qualify');
const jobRoutes = require('./routes/JobRoutes');
const contractorRoutes = require('./routes/contractorprofile');
const paymentRoutes = require('./routes/PaymentRoutes');

// Use Routes
app.use('/api/bids', bidRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/qualify', qualifyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/payments', paymentRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit process on DB connection failure
  });

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API Server 🚀' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
