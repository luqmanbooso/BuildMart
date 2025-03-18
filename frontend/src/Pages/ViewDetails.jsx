import React from "react";
import { motion } from "framer-motion";
import { FiX, FiShoppingCart } from "react-icons/fi";

const ViewDetails = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const handleAddToCart = () => {
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
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mt-6">
            <p className="text-2xl font-bold text-indigo-600">${product.price}</p>
            <div className="h-0.5 bg-gray-200 my-6"></div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Description</h3>
              <p className="text-gray-600">
                {product.description || `${product.name} is a high-quality building material perfect for your construction needs. Made with premium materials to ensure durability and long-lasting performance.`}
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Features</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Premium quality materials</li>
                  <li>Durable and long-lasting</li>
                  <li>Easy to use and install</li>
                  <li>Industry-standard specifications</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <FiShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewDetails;