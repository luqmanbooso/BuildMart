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

const Qualification = mongoose.model('Qualification', qualificationSchema);
module.exports = Qualification;