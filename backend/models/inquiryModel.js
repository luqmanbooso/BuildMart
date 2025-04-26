const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'quality', 'timeline', 'communication', 'other'],
    default: 'technical'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  projectId: {
    type: String,
    required: false // Optional, as some inquiries might not be tied to a project
  },
  projectName: {
    type: String,
    required: false // Add projectName field to store project names directly
  },
  userId: {
    type: String,
    required: false // Optional for anonymous reports
  },
  username: {
    type: String,
    required: false // Store the actual username
  },
  userRole: {
    type: String,
    enum: ['Client', 'Service Provider', 'Guest', 'Admin', 'User'], // Add 'User' to enum
    required: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
