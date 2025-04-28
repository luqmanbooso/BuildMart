const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/qualifications';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `qualification-${uniqueSuffix}${fileExt}`);
  }
});

// File filter for images with improved validation
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG images and PDF files are allowed'), false);
  }
};

// Create multer instance
const qualificationUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024, // 1MB limit aligned with frontend
  }
});

module.exports = qualificationUpload;