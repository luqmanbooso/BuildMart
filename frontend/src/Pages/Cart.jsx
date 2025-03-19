import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2, FiMinus, FiPlus, FiChevronRight, FiArrowLeft, FiBox, FiShoppingBag, FiCreditCard } from "react-icons/fi";
import { HiOutlineShieldCheck, HiOutlineTruck } from "react-icons/hi";
import EnhancedPaymentGateway from '../components/Payment';
import Invoice from '../components/Invoice'; // Import the Invoice component

// Helper function for currency formatting
const formatCurrency = (amount) => {
  return `LKR ${amount.toFixed(2)}`;
};

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, onCheckout }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false); // Add this state
  const [paymentDetails, setPaymentDetails] = useState(null); // Add this state
  const [step, setStep] = useState('cart'); // 'cart', 'shipping', 'payment'
  const [itemQuantities, setItemQuantities] = useState({});
  const [animateItems, setAnimateItems] = useState(false);

  // Calculate quantities for items
  useEffect(() => {
    const quantities = {};
    cartItems.forEach((item) => {
      quantities[item.id] = quantities[item.id] ? quantities[item.id] + 1 : 1;
    });
    setItemQuantities(quantities);

    // Animate items when cart opens
    if (isOpen) {
      setTimeout(() => setAnimateItems(true), 300);
    } else {
      setAnimateItems(false);
    }
  }, [cartItems, isOpen]);

  // Calculate totals with more details
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = cartItems.length > 0 ? 350 : 0;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;
  
  // Count unique items, preserving IDs
  const uniqueItems = Object.entries(
    cartItems.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item, quantity: 0 };
      }
      acc[item.id].quantity += 1;
      return acc;
    }, {})
  ).map(([id, item]) => item);

  const handleRemove = (id) => {
    // Find all indices with this product ID
    const indices = cartItems.reduce((acc, item, index) => {
      if (item.id === id) acc.push(index);
      return acc;
    }, []);
    
    // Remove all instances of this product
    indices.reverse().forEach(index => removeFromCart(index));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    const currentQuantity = itemQuantities[id] || 0;
    
    if (newQuantity > currentQuantity) {
      // Add items
      const itemToAdd = cartItems.find(item => item.id === id);
      if (itemToAdd) {
        const toAdd = newQuantity - currentQuantity;
        for (let i = 0; i < toAdd; i++) {
          cartItems.push(itemToAdd); // This is simplified - would need proper state handling
        }
      }
    } else if (newQuantity < currentQuantity) {
      // Remove items
      const toRemove = currentQuantity - newQuantity;
      const indices = cartItems
        .map((item, index) => item.id === id ? index : -1)
        .filter(index => index !== -1)
        .slice(0, toRemove);
      
      indices.reverse().forEach(index => removeFromCart(index));
    }
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Save payment details for the invoice
    const cardNumber = paymentData?.cardNumber || "";
    setPaymentDetails({
      cardholderName: paymentData?.name || "Card Holder",
      cardType: paymentData?.cardType || "visa",
      lastFourDigits: cardNumber.slice(-4),
      date: new Date().toISOString()
    });
    
    setShowPayment(false);
    setShowInvoice(true); // Show invoice instead of closing immediately
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    onCheckout(total); // Call the original onCheckout handler when invoice is closed
    onClose();
  };
  
  // Transition variants for animations
  const cartVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.5 } 
    })
  };
  

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Cart Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={cartVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full md:w-[550px] z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full w-full flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-2xl overflow-hidden">
              {/* Cart Header */}
              <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {step !== 'cart' && (
                      <button 
                        onClick={() => setStep('cart')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <FiArrowLeft size={18} />
                      </button>
                    )}
                    <h2 className="text-2xl font-bold tracking-tight">
                      {step === 'cart' && 'Your Cart'}
                      {step === 'shipping' && 'Shipping Details'}
                      {step === 'payment' && 'Payment Method'}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close cart"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <FiX size={22} />
                  </button>
                </div>
                
                {/* Checkout Progress */}
                <div className="flex justify-between mt-6 text-xs font-medium">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'cart' ? 'bg-white text-purple-700' : 'bg-white/20'}`}>
                      <FiShoppingBag size={16} />
                    </div>
                    <span className="mt-1 opacity-90">Cart</span>
                  </div>
                  
                  <div className="flex-1 flex items-center px-2">
                    <div className={`h-1 w-full ${step !== 'cart' ? 'bg-white/80' : 'bg-white/20'} rounded-full`}></div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-white text-purple-700' : 'bg-white/20'}`}>
                      <HiOutlineTruck size={16} />
                    </div>
                    <span className="mt-1 opacity-90">Shipping</span>
                  </div>
                  
                  <div className="flex-1 flex items-center px-2">
                    <div className={`h-1 w-full ${step === 'payment' ? 'bg-white/80' : 'bg-white/20'} rounded-full`}></div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-white text-purple-700' : 'bg-white/20'}`}>
                      <FiCreditCard size={16} />
                    </div>
                    <span className="mt-1 opacity-90">Payment</span>
                  </div>
                </div>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto p-6 pb-40 relative">
                {uniqueItems.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center"
                  >
                    <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <FiShoppingBag size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-8 text-center max-w-xs">
                      Looks like you haven't added anything to your cart yet. Start shopping to fill it with amazing products!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      Continue Shopping
                    </motion.button>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {/* Cart Items */}
                    <div className="space-y-5 mb-10">
                      {uniqueItems.map((item, index) => (
                        <motion.div
                          key={`${item.id}-card`}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate={animateItems ? "visible" : "hidden"}
                          className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow group"
                        >
                          <div className="flex">
                            <div className="w-28 h-28 bg-gray-50 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex justify-between">
                                <h3 className="font-medium text-gray-800">{item.name}</h3>
                                <button
                                  onClick={() => handleRemove(item.id)}
                                  aria-label={`Remove ${item.name}`}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                              
                              {item.sku && (
                                <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                              )}
                              
                              <div className="flex justify-between items-end mt-4">
                                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                    className="px-2 py-1 text-gray-500 hover:text-indigo-600 transition-colors"
                                    disabled={item.quantity <= 1}
                                  >
                                    <FiMinus size={14} />
                                  </button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="px-2 py-1 text-gray-500 hover:text-indigo-600 transition-colors"
                                  >
                                    <FiPlus size={14} />
                                  </button>
                                </div>
                                <p className="font-semibold text-indigo-600">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="font-semibold text-lg text-gray-800 mb-4">Order Summary</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span>{formatCurrency(shipping)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax (15%)</span>
                          <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="h-px bg-gray-100 my-2"></div>
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-lg">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Services */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-start space-x-4 bg-indigo-50 p-4 rounded-lg">
                        <HiOutlineTruck className="text-indigo-600 mt-1" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-800">Free Delivery for Orders over LKR 15,000</h4>
                          <p className="text-sm text-gray-600">Your order qualifies for free delivery</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 bg-green-50 p-4 rounded-lg">
                        <HiOutlineShieldCheck className="text-green-600 mt-1" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-800">Secure Transaction</h4>
                          <p className="text-sm text-gray-600">Your payment is protected with SSL encryption</p>
                        </div>
                      </div>
                    </div>
                  </AnimatePresence>
                )}
              </div>
              
              {/* Bottom Actions Bar - Fixed at bottom */}
              {uniqueItems.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 shadow-md"
                  >
                    <span>Proceed to Checkout</span>
                    <FiChevronRight size={18} />
                  </motion.button>
                  
                  <p className="text-xs text-center text-gray-500 mt-3">
                    By proceeding, you agree to our Terms of Service & Privacy Policy
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      {showPayment && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl mx-auto bg-white md:rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={handlePaymentCancel}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-800" />
            </button>
            <EnhancedPaymentGateway
              amount={total.toString()}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Invoice Modal - Add this */}
      <AnimatePresence>
        {showInvoice && (
          <Invoice 
            isOpen={showInvoice}
            onClose={handleInvoiceClose}
            cartItems={uniqueItems}
            total={total}
            paymentDetails={paymentDetails}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;
