import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2, FiMinus, FiPlus, FiChevronRight, FiArrowLeft, FiBox, FiShoppingBag, FiCreditCard, FiUser, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
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
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: ""
  });
  const [shippingErrors, setShippingErrors] = useState({});

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

  // Update your validateShipping function with more comprehensive validation
  const validateShipping = () => {
    const errors = {};
    
    // Full Name validation
    if (!shippingDetails.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (shippingDetails.fullName.trim().length < 3) {
      errors.fullName = "Name must be at least 3 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(shippingDetails.fullName)) {
      errors.fullName = "Name contains invalid characters";
    }
    
    // Email validation
    if (!shippingDetails.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(shippingDetails.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone validation - Sri Lankan format
    if (!shippingDetails.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^(?:\+94|0)[0-9]{9,10}$/.test(shippingDetails.phone.replace(/\s+/g, ''))) {
      errors.phone = "Please enter a valid Sri Lankan phone number";
    }
    
    // Address validation
    if (!shippingDetails.address.trim()) {
      errors.address = "Address is required";
    } else if (shippingDetails.address.trim().length < 5) {
      errors.address = "Please enter a complete address";
    }
    
    // City validation
    if (!shippingDetails.city.trim()) {
      errors.city = "City is required";
    } else if (!/^[a-zA-Z\s.-]+$/.test(shippingDetails.city)) {
      errors.city = "City name contains invalid characters";
    }
    
    // Postal code validation - Sri Lankan format
    if (!shippingDetails.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    } else if (!/^\d{5}$/.test(shippingDetails.postalCode.trim())) {
      errors.postalCode = "Please enter a valid 5-digit postal code";
    }
    
    return errors;
  };

  const handleCheckout = () => {
    if (step === 'cart') {
      setStep('shipping');
      return;
    }
    
    if (step === 'shipping') {
      // Validate shipping details
      const errors = validateShipping();
      if (Object.keys(errors).length > 0) {
        setShippingErrors(errors);
        return;
      }
      
      setStep('payment');
      setShowPayment(true);
      return;
    }
  };

  // Add this function for real-time validation
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    
    // Update the shipping details
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate the field in real-time
    validateField(name, value);
  };

  // Add this new function for field-level validation
  const validateField = (name, value) => {
    let error = null;
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.trim().length < 3) {
          error = "Name must be at least 3 characters";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
          error = "Name contains invalid characters";
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = "Email address is required";
        } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^(?:\+94|0)[0-9]{9,10}$/.test(value.replace(/\s+/g, ''))) {
          error = "Please enter a valid Sri Lankan phone number";
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 5) {
          error = "Please enter a complete address";
        }
        break;
        
      case 'city':
        if (!value.trim()) {
          error = "City is required";
        } else if (!/^[a-zA-Z\s.-]+$/.test(value)) {
          error = "City name contains invalid characters";
        }
        break;
        
      case 'postalCode':
        if (!value.trim()) {
          error = "Postal code is required";
        } else if (!/^\d{5}$/.test(value.trim())) {
          error = "Please enter a valid 5-digit postal code";
        }
        break;
        
      default:
        break;
    }
    
    // Update only this specific field error
    setShippingErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === null;
  };

  const handlePaymentSuccess = (paymentData) => {
    // Save payment details for the invoice
    const cardNumber = paymentData?.cardNumber || "";
    setPaymentDetails({
      cardholderName: paymentData?.name || "Card Holder",
      cardType: paymentData?.cardType || "visa",
      lastFourDigits: cardNumber.slice(-4),
      date: new Date().toISOString(),
      shippingDetails: shippingDetails // Add shipping details to paymentDetails
    });
    
    setShowPayment(false);
    setShowInvoice(true); // Show invoice instead of closing immediately
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    // Pass both payment and shipping details
    onCheckout(total, paymentDetails, uniqueItems, shippingDetails);
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
  
  // Add this function to check if the form is valid
  const isFormValid = () => {
    if (step !== 'shipping') return true;
    
    // If we're on shipping step, validate all fields
    const errors = validateShipping();
    const hasErrors = Object.keys(errors).length > 0;
    
    // Also check if all required fields have values
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const allFieldsHaveValues = requiredFields.every(field => 
      shippingDetails[field] && shippingDetails[field].trim() !== ''
    );
    
    return !hasErrors && allFieldsHaveValues;
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

                {step === 'shipping' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                      <h3 className="font-semibold text-lg text-gray-800 mb-4">Shipping Information</h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="fullName"
                                value={shippingDetails.fullName}
                                onChange={handleShippingChange}
                                className={`pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                  shippingErrors.fullName 
                                    ? 'border-red-500' 
                                    : shippingDetails.fullName.trim() 
                                      ? 'border-green-500'
                                      : 'border-gray-300'
                                }`}
                                placeholder="John Doe"
                              />
                              
                              {/* Add this check icon for valid fields */}
                              {shippingDetails.fullName.trim() && !shippingErrors.fullName && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {shippingErrors.fullName && (
                              <p className="mt-1 text-sm text-red-600">{shippingErrors.fullName}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="text-gray-400" />
                              </div>
                              <input
                                type="email"
                                name="email"
                                value={shippingDetails.email}
                                onChange={handleShippingChange}
                                className={`pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                  shippingErrors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="john@example.com"
                              />
                              
                              {/* Add this check icon for valid fields */}
                              {shippingDetails.email.trim() && !shippingErrors.email && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {shippingErrors.email && (
                              <p className="mt-1 text-sm text-red-600">{shippingErrors.email}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiPhone className="text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={shippingDetails.phone}
                              onChange={handleShippingChange}
                              className={`pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                shippingErrors.phone ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="+94 XX XXX XXXX"
                            />
                            
                            {/* Add this check icon for valid fields */}
                            {shippingDetails.phone.trim() && !shippingErrors.phone && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {shippingErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiMapPin className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="address"
                              value={shippingDetails.address}
                              onChange={handleShippingChange}
                              className={`pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                shippingErrors.address ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="123 Main St"
                            />
                            
                            {/* Add this check icon for valid fields */}
                            {shippingDetails.address.trim() && !shippingErrors.address && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {shippingErrors.address && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="city"
                                value={shippingDetails.city}
                                onChange={handleShippingChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                  shippingErrors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Colombo"
                              />
                              
                              {/* Add this check icon for valid fields */}
                              {shippingDetails.city.trim() && !shippingErrors.city && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {shippingErrors.city && (
                              <p className="mt-1 text-sm text-red-600">{shippingErrors.city}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="postalCode"
                                value={shippingDetails.postalCode}
                                onChange={handleShippingChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                                  shippingErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="10000"
                              />
                              
                              {/* Add this check icon for valid fields */}
                              {shippingDetails.postalCode.trim() && !shippingErrors.postalCode && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {shippingErrors.postalCode && (
                              <p className="mt-1 text-sm text-red-600">{shippingErrors.postalCode}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Special Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            value={shippingDetails.notes}
                            onChange={handleShippingChange}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Delivery instructions or other information"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    {/* Add this before the end of your shipping form section */}
                    {step === 'shipping' && (
                      <div className="flex items-center justify-between mt-4 text-sm">
                        <div className="flex items-center">
                          {isFormValid() ? (
                            <div className="flex items-center text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>All fields are valid</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-amber-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Please fill in all required fields</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-red-500 mr-1">*</span> Required fields
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 'cart' && (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-5 mb-10">
                      {/* Existing cart items */}
                    </div>
                    {/* Rest of the cart content */}
                  </>
                )}
              </div>
              
              {/* Bottom Actions Bar - Fixed at bottom */}
              {uniqueItems.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                  <motion.button
                    whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
                    whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
                    onClick={handleCheckout}
                    disabled={step === 'shipping' && !isFormValid()}
                    className={`w-full ${
                      step === 'shipping' && !isFormValid()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                    } text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 shadow-md`}
                  >
                    <span>
                      {step === 'cart' && 'Continue to Shipping'}
                      {step === 'shipping' && 'Continue to Payment'}
                      {step === 'payment' && 'Complete Payment'}
                    </span>
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
