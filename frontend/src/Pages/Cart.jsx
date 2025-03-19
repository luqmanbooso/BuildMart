import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiTrash2 } from "react-icons/fi";
import EnhancedPaymentGateway from '../components/Payment';

const formatCurrency = (amount) => {
  return `LKR ${amount.toFixed(2)}`;
};

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, onCheckout }) => {
  const [showPayment, setShowPayment] = useState(false);
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleRemove = (index) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      removeFromCart(index);
    }
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPayment(false);
    onCheckout(total);
    // You might want to show a success message or redirect
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: isOpen ? "0%" : "100%" }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-40"
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
                          <p className="text-indigo-600 font-bold">
                            {formatCurrency(item.price)}
                          </p>
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
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring focus:ring-indigo-300"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl mx-auto">
            <button
              onClick={handlePaymentCancel}
              className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
            <EnhancedPaymentGateway
              amount={total.toString()}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
