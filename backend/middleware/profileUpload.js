const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Determine if running on Vercel's serverless environment
const isServerlessEnvironment = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

let storage;
if (isServerlessEnvironment) {
  // Use memory storage for serverless environments
  storage = multer.memoryStorage();
  console.log('Using memory storage for serverless environment');
} else {
  // For local development, use disk storage
  const uploadDir = 'uploads/profiles';
  
  // Create directory if it doesn't exist (only in local environment)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
}

// Configure multer with the appropriate storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .jpeg, .jpg and .png files are allowed!"));
  }
});

module.exports = upload;