import React from "react";
import { motion } from "framer-motion";
import { FiX, FiTrash2 } from "react-icons/fi";

const Cart = ({ isOpen, onClose, cartItems, removeFromCart }) => {
  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price, 0).toFixed(2);

  const handleRemove = (index) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      removeFromCart(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${
        isOpen ? "flex" : "hidden"
      } items-center justify-end`}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Your Cart</h2>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-indigo-600 font-bold">${item.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(index)}
                      aria-label={`Remove ${item.name}`}
                      className="text-red-500 hover:text-red-700 p-2 focus:outline-none focus:ring focus:ring-red-200 rounded-full"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total and Checkout */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-lg font-semibold mb-6">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <button
                  onClick={() => alert("Proceeding to checkout...")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring focus:ring-indigo-300"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Cart;
