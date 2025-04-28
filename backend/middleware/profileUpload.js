const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if running on Vercel
const isVercel = process.env.VERCEL === '1';

// Create a function to ensure directory exists
const ensureDirectoryExists = (directory) => {
  if (!isVercel && !fs.existsSync(directory)) {
    try {
      fs.mkdirSync(directory, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory: ${error.message}`);
    }
  }
};

// Configure storage based on environment
const storage = isVercel 
  ? multer.memoryStorage() // Use memory storage on Vercel
  : multer.diskStorage({
      destination: function(req, file, cb) {
        const uploadPath = 'uploads/profiles';
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
      },
      filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      }
    });

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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