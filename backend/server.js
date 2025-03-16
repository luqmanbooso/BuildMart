const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bidRoutes = require('./routes/bids');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/bids', bidRoutes);
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

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