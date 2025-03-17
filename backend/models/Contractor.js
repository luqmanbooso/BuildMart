const mongoose = require('mongoose');

const VALID_SPECIALIZATIONS = [
    'General Construction',
    'Electrical',
    'Plumbing',
    'HVAC',
    'Roofing',
    'Carpentry',
    'Masonry',
    'Painting',
    'Flooring',
    'Landscaping',
    'Interior Design',
    'Demolition',
    'Concrete Work',
    'Steel Work',
    'Glass & Windows',
    'Kitchen Remodeling',
    'Bathroom Remodeling'
  ];

const contractorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Contact details (basic required info)
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  // Basic business details
  companyName: {
    type: String
  },
  // Professional details
  specialization: {
    type:  [{
      type: String,
      enum: VALID_SPECIALIZATIONS
    }],
    default: []
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  // Verification status
  verified: {
    type: Boolean,
    default: false
  },
  // Brief description
  bio: {
    type: String
  }
}, { timestamps: true });

// Add cascade delete middleware
contractorSchema.pre('findOneAndDelete', async function(next) {
  try {
    const contractorId = this.getFilter()._id;
    // You can add logic to delete related contractor data here
    // Example: await Qualification.deleteMany({ contractorId });
    next();
  } catch (error) {
    next(error);
  }
});

const Contractor = mongoose.model('Contractor', contractorSchema);

module.exports = Contractor;