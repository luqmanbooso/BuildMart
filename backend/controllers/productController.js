const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

exports.createProduct = async (req, res) => {
  try {
    // Create product data object
    const productData = {
      name: req.body.name,
      sku: req.body.sku,
      category: req.body.category,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      threshold: parseInt(req.body.threshold),
      description: req.body.description || '',
      lastUpdated: new Date()
    };

    // Handle image if uploaded
    if (req.file) {
      // Save relative path to image
      productData.image = `/uploads/products/${req.file.filename}`;
    } else if (req.body.image && req.body.image.startsWith('data:image')) {
      // Handle base64 image data
      const base64Data = req.body.image.split(';base64,').pop();
      const imageType = req.body.image.split(';')[0].split('/')[1];
      const imageName = `${Date.now()}.${imageType}`;
      const imagePath = path.join(__dirname, '../uploads/products/', imageName);
      
      // Create directory if it doesn't exist
      const dir = path.join(__dirname, '../uploads/products/');
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write image file
      fs.writeFileSync(imagePath, base64Data, { encoding: 'base64' });
      productData.image = `/uploads/products/${imageName}`;
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Get existing product
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Create update data
    const updateData = {
      name: req.body.name,
      sku: req.body.sku,
      category: req.body.category,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      threshold: parseInt(req.body.threshold),
      description: req.body.description || '',
      lastUpdated: new Date()
    };

    // Handle image update
    if (req.file) {
      // If there's a new file upload
      updateData.image = `/uploads/products/${req.file.filename}`;
      
      // Delete old image if it exists
      if (existingProduct.image) {
        const oldImagePath = path.join(__dirname, '..', existingProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (req.body.image) {
      // Check if it's a new base64 image or the existing image path
      if (req.body.image.startsWith('data:image')) {
        // Handle base64 image data
        const base64Data = req.body.image.split(';base64,').pop();
        const imageType = req.body.image.split(';')[0].split('/')[1];
        const imageName = `${Date.now()}.${imageType}`;
        const imagePath = path.join(__dirname, '../uploads/products/', imageName);
        
        // Create directory if it doesn't exist
        const dir = path.join(__dirname, '../uploads/products/');
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write image file
        fs.writeFileSync(imagePath, base64Data, { encoding: 'base64' });
        updateData.image = `/uploads/products/${imageName}`;
        
        // Delete old image if it exists
        if (existingProduct.image) {
          const oldImagePath = path.join(__dirname, '..', existingProduct.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      } else {
        // Keep existing image
        updateData.image = existingProduct.image;
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Delete image if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};