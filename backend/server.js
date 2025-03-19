const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bidRoutes = require('./routes/bids');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const qualifyRoutes = require('./routes/Qualify');
const ongoingWorksRoutes = require('./routes/ongoingworks');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/bids', bidRoutes);
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/qualify', qualifyRoutes);
const jobRoutes = require('./routes/JobRoutes');
app.use('/api/jobs', jobRoutes);
app.use('/api/contractors', require('./routes/contractorprofile'));
app.use('/api/email', require('./routes/email'));

// Use routes
app.use('/api/ongoingworks', ongoingWorksRoutes);

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