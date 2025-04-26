const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const qualificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Certification', 'Education', 'License', 'Award', 'Skill'],
    required: true
  },
  documentImage: {
    type: String,
    maxlength: 5000000
  },
  name: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  expiry: {
    type: String,
    default: 'N/A'
  },
  documentUrls: [String] // For proof documents
}, {
  timestamps: true
});

// Ensure user can't have duplicate qualifications
// qualificationSchema.index({ userId: 1, name: 1, issuer: 1 }, { unique: true });

const Qualification = mongoose.model('Qualification', qualificationSchema);
module.exports = Qualification;