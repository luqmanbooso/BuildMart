const express = require('express');
const router = express.Router();
const Qualification = require('../models/Qualification');

// Update the GET route for qualifications

router.get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const qualifications = await Qualification.find({ userId });
      
      // Ensure all document images have proper format
      const processedQualifications = qualifications.map(qual => {
        const qualObj = qual.toObject();
        
        // Check if image exists but doesn't have the data:image prefix
        if (qualObj.documentImage && !qualObj.documentImage.startsWith('data:')) {
          // Add the proper prefix if missing
          qualObj.documentImage = `data:image/jpeg;base64,${qualObj.documentImage}`;
        }
        
        return qualObj;
      });
      
      res.json(processedQualifications);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      res.status(500).json({ error: 'Failed to fetch qualifications' });
    }
  });

// GET a specific qualification
router.get('/:id', async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);
    if (!qualification) return res.status(404).json({ error: 'Qualification not found' });
    res.json(qualification);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching qualification' });
  }
});

// POST a new qualification
// POST a new qualification
router.post('/', async (req, res) => {
    try {
      const { userId, type, name, issuer, year, expiry, documentUrls } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const qualification = new Qualification({
        userId,  // Get from request body for now
        type,
        name,
        issuer,
        year,
        expiry,
        documentUrls
      });
      
      const savedQualification = await qualification.save();
      res.status(201).json(savedQualification);
    } catch (error) {
      console.error('Error creating qualification:', error);
      res.status(500).json({ error: 'Error creating qualification', details: error.message });
    }
  });

// PUT (update) a qualification
// PUT (update) a qualification
// On your backend route for updating qualifications
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Update route
// Update route - FIXED VERSION
router.put('/:id', upload.single('documentImage'), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      console.log('Update request received for qualification:', id);
      console.log('Fields being updated:', Object.keys(updateData));
      
      // Handle file upload if present
      if (req.file) {
        console.log('Received file upload:', req.file.originalname, req.file.size, 'bytes');
        
        // Convert buffer to base64 for storage
        const base64Image = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        
        // Update the documentImage field directly
        updateData.documentImage = imageUrl;
        
        // Also add to documentUrls array if your schema uses that
        if (!updateData.documentUrls) updateData.documentUrls = [];
        updateData.documentUrls.push(imageUrl);
      }
      // Handle base64 string if no file but base64 string is provided
      else if (req.body.documentImageBase64) {
        console.log('Received base64 image data');
        
        // Update both fields
        updateData.documentImage = req.body.documentImageBase64;
        
        if (!updateData.documentUrls) updateData.documentUrls = [];
        updateData.documentUrls.push(req.body.documentImageBase64);
        
        // Remove the temporary field
        delete updateData.documentImageBase64;
      }
      
      // THIS IS THE MISSING PART - ACTUALLY PERFORM THE DATABASE UPDATE
      const updatedQualification = await Qualification.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedQualification) {
        return res.status(404).json({ error: 'Qualification not found' });
      }
      
      console.log('Qualification updated successfully');
      res.json(updatedQualification);
    } catch (error) {
      console.error('Error updating qualification:', error);
      res.status(500).json({ error: 'Error updating qualification', details: error.message });
    }
  });

// DELETE a qualification
router.delete('/:id', async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);
    if (!qualification) return res.status(404).json({ error: 'Qualification not found' });
    
   
    await Qualification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Qualification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting qualification' });
  }
});

module.exports = router;