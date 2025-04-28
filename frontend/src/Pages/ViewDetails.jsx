import React from "react";
import { motion } from "framer-motion";
import { FiX, FiShoppingCart, FiStar, FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Import required utility functions and styles
const formatCurrency = (amount) => {
  return `LKR ${amount.toFixed(2)}`;
};

// Helper function to get correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('http')) return imagePath;
  return `https://build-mart-backend.vercel.app/${imagePath}`;
};

// Category colors for visual consistency
const categoryColors = {
  "Building Materials": "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200",
  "Hardware": "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200",
  "Tools": "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200",
  "Plumbing": "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border border-orange-200",
  "Electrical": "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200",
  "Paint & Supplies": "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 border border-pink-200",
  "Flooring": "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border border-indigo-200",
  "Doors & Windows": "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border border-teal-200",
  "Safety Equipment": "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200",
  "Landscaping": "bg-gradient-to-r from-lime-50 to-lime-100 text-lime-800 border border-lime-200",
  "Roofing": "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200",
  "HVAC": "bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-800 border border-cyan-200",
  "Fasteners": "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border border-slate-200",
  "Adhesives & Sealants": "bg-gradient-to-r from-violet-50 to-violet-100 text-violet-800 border border-violet-200",
  "Cleaning Supplies": "bg-gradient-to-r from-sky-50 to-sky-100 text-sky-800 border border-sky-200",
  "Other": "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200"
};

const ViewDetails = ({ product, onClose, onAddToCart, isLoggedIn }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      // Close the details modal
      onClose();
      // Navigate to login page
      navigate('/login');
      return;
    }
    
    onAddToCart(product);
    onClose(); // Close the details modal after adding to cart
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Product Image */}
        <div className="md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="max-h-80 max-w-full object-contain mx-auto filter drop-shadow-lg"
          />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs mb-3 ${categoryColors[product.category]}`}>
                {product.category}
              </span>
              <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
              {product.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(product.price)}</p>
            
            <div className="flex items-center space-x-1 my-4">
              {[...Array(5)].map((_, i) => (
                <FiStar 
                  key={i} 
                  className={`${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  size={18}
                />
              ))}
              <span className="text-sm text-gray-500 ml-2">({product.reviews || '24'} reviews)</span>
            </div>
            
            <div className="h-0.5 bg-gray-200 my-6"></div>

            {/* Stock Status */}
            <div className="mb-6">
              <span className={`px-3 py-1 text-sm rounded-full ${
                product.stock <= 0 
                  ? 'bg-red-100 text-red-800' 
                  : product.stock < 5 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-green-100 text-green-800'
              }`}>
                {product.stock <= 0 
                  ? 'Out of stock' 
                  : product.stock < 5 
                    ? `Low stock: ${product.stock} remaining` 
                    : `In stock: ${product.stock} available`}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Description</h3>
              <p className="text-gray-600">
                {product.description || `${product.name} is a high-quality building material perfect for your construction needs.`}
              </p>

              {/* Only show features for sample products or when features are available */}
              {!product._id && (
                <div className="space-y-2">
                 
                  
                </div>
              )}
            </div>

            <div className="mt-8">
              {/* Show different button based on auth state and stock availability */}
              {product.stock <= 0 ? (
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  <FiShoppingCart size={20} />
                  <span>Out of Stock</span>
                </button>
              ) : isLoggedIn ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <FiShoppingCart size={20} />
                  <span>Add to Cart</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart} // This will navigate to login
                  className="w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <FiLogIn size={20} />
                  <span>Log in to Purchase</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewDetails;