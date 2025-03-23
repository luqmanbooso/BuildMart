import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock, CheckCircle, AlertCircle, X, DollarSign } from 'lucide-react';
import { formatLKR } from '../utils/formatters';
import { jwtDecode } from 'jwt-decode';

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .bg-gradient-to-r {
      background: white !important;
    }
    .invoice-section, .invoice-section * {
      visibility: visible;
    }
    .invoice-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none;
    }
  }
`;

// Add this constant at the top of the file, outside the component
const COMMISSION_RATE = 0.10; // 10% commission

// Add a new prop for payment context
const EnhancedPaymentGateway = ({ amount: initialAmount, onSuccess, onCancel, context = 'customer', order = null, userData = null }) => {
  // State management
  const [activeCard, setActiveCard] = useState('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState(
    initialAmount ? parseFloat(initialAmount).toFixed(2) : '0.00'
  );
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [manuallySelectedCard, setManuallySelectedCard] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [focused, setFocused] = useState({});
  const [originalAmount, setOriginalAmount] = useState(0);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Available card types
  const cardTypes = [
    { id: 'visa', name: 'Visa' },
    { id: 'mastercard', name: 'Mastercard' },
    { id: 'amex', name: 'American Express' },
    { id: 'discover', name: 'Discover' }
  ];

  // Format card number as user types (adds spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiry = (value) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (cleanValue.length >= 3) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
    } else if (cleanValue.length === 2) {
      return `${cleanValue}/`;
    }
    return cleanValue;
  };

  // Handle focus state for input fields
  const handleFocus = (field) => {
    setFocused({...focused, [field]: true});
  };
  
  const handleBlur = (field) => {
    setFocused({...focused, [field]: false});
  };

  // Detect card type based on number
  useEffect(() => {
    if (!manuallySelectedCard) {
      const cardNumberClean = cardNumber.replace(/\s+/g, '');
      if (cardNumberClean.startsWith('4')) {
        setActiveCard('visa');
      } else if (/^5[1-5]/.test(cardNumberClean)) {
        setActiveCard('mastercard');
      } else if (/^3[47]/.test(cardNumberClean)) {
        setActiveCard('amex');
      } else if (/^6(?:011|5)/.test(cardNumberClean)) {
        setActiveCard('discover');
      } else {
        setActiveCard('default');
      }
    }
  }, [cardNumber, manuallySelectedCard]);

  // Handle card selection
  const handleCardSelection = (cardType) => {
    setActiveCard(cardType);
    setManuallySelectedCard(cardType);
  };

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = "Cardholder name is required";
    
    const cardNumberClean = cardNumber.replace(/\s+/g, '');
    if (!cardNumberClean || cardNumberClean.length < 13) {
      newErrors.cardNumber = "Valid card number is required";
    }
    
    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2 || !expiry.trim()) {
      newErrors.expiry = "Valid expiry date is required";
    } else {
      const month = parseInt(expiryParts[0], 10);
      const year = parseInt(`20${expiryParts[1]}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      if (month < 1 || month > 12) {
        newErrors.expiry = "Invalid month";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = "Card has expired";
      }
    }
    
    const cvvLength = activeCard === 'amex' ? 4 : 3;
    if (!cvv.trim() || cvv.length < cvvLength) {
      newErrors.cvv = `${cvvLength}-digit CVV is required`;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (amountValue > 1000000) {
      newErrors.amount = "Amount cannot exceed LKR 1,000,000.00";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process payment
  const handlePayment = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      setIsProcessing(true);
      
      try {
        // Remove spaces from card number
        const cleanCardNumber = cardNumber.replace(/\s+/g, '');
        
        // Use provided userData if available, otherwise extract from token
        let currentUserData = userData;
        if (!currentUserData) {
          try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
              const decoded = jwtDecode(token);
              currentUserData = {
                id: decoded.userId || decoded.id || decoded._id,
                email: decoded.email || '',
                name: decoded.name || decoded.fullName || name,  // Use cardholderName as fallback
                role: decoded.role || '',
                userType: decoded.userType || '',
              };
            }
          } catch (tokenError) {
            console.error("Error decoding token:", tokenError);
          }
        }
        
        // Create payment payload
        const paymentData = {
          name,
          cardNumber: cleanCardNumber,
          expiry,
          amount: totalAmount,
          activeCard,
          originalAmount,
          commissionAmount,
          commissionRate: context === 'milestone' ? COMMISSION_RATE : 0,
          context,
          user: currentUserData, // Include user data
        };
        
        // Add order data if available
        if (order) {
          paymentData.order = order;
        }
        
        // Add work/milestone data if available
        if (window.workId) {
          paymentData.workId = window.workId;
        }
        
        if (window.milestoneId) {
          paymentData.milestoneId = window.milestoneId;
        }
        
        console.log("Sending payment data:", paymentData);
        
        const response = await fetch('http://localhost:5000/api/payments/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(paymentData)
        });

        // Improved error handling with more detailed logging
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Payment API error response:", {
            status: response.status,
            statusText: response.statusText,
            responseBody: errorText
          });
          
          let errorMessage = 'Payment processing failed';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error("Parsed error details:", errorData);
          } catch (e) {
            console.error("Failed to parse error response:", e);
            errorMessage = `Payment failed with status: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        console.log("Payment response:", data);

        if (data.success) {
          setInvoiceData({
            ...data.payment,
            originalAmount,
            commissionAmount,
            totalAmount,
            userData
          });
          setIsComplete(true);
          showNotificationMessage('success', 'Payment processed successfully!');
          onSuccess && onSuccess({
            ...data.payment,
            originalAmount,
            commissionAmount,
            totalAmount,
            userData
          });
        } else {
          throw new Error(data.message || 'Payment processing failed');
        }
      } catch (error) {
        console.error("Payment error:", error);
        showNotificationMessage('error', error.message || 'Payment processing failed');
      } finally {
        setIsProcessing(false);
      }
    } else {
      showNotificationMessage('error', 'Please fix the errors in the form');
    }
  };

  // Show notification message
  const showNotificationMessage = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  // Reset form
  const resetForm = () => {
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setName('');
    setIsComplete(false);
    setErrors({});
    setManuallySelectedCard(null);
    setActiveCard('visa');
  };

  // Update amount when initialized
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  // Handle amount changes
  const handleAmountChange = (value) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    if (parseFloat(cleaned) > 1000000) return;
    setAmount(cleaned);
  };

  // Calculate commission when amount changes
  useEffect(() => {
    if (initialAmount) {
      const original = parseFloat(initialAmount);
      setOriginalAmount(original);
      
      // Only apply commission for milestone payments
      if (context === 'milestone') {
        const commission = original * COMMISSION_RATE;
        setCommissionAmount(commission);
        setTotalAmount(original + commission);
        // Update the displayed amount to include commission
        setAmount((original + commission).toFixed(2));
      } else {
        setCommissionAmount(0);
        setTotalAmount(original);
        setAmount(original.toFixed(2));
      }
    }
  }, [initialAmount, context]);

  // Extract user data from token when component mounts
  useEffect(() => {
    const extractUserData = () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          console.log("Token decoded successfully:", decoded);
          
          // Extract all available user data
          const userData = {
            id: decoded.userId || decoded.id || decoded._id,
            email: decoded.email,
            name: decoded.name || decoded.fullName,
            role: decoded.role,
            userType: decoded.userType,
            // Add any other fields that might be in the token
            ...decoded
          };
          
          setUserData(userData);
          return userData;
        }
      } catch (error) {
        console.error('Error extracting user data from token:', error);
      }
      return null;
    };
    
    extractUserData();
  }, []);

  // Card logo components
  const CardLogo = ({ type }) => {
    const logos = {
      visa: (
        <div className="flex items-center justify-center w-full h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md overflow-hidden group-hover:shadow-lg transition-all">
          <div className="text-white font-extrabold text-lg tracking-wide">VISA</div>
        </div>
      ),
      mastercard: (
        <div className="flex items-center justify-center w-full h-10 bg-gradient-to-r from-yellow-500 to-red-500 rounded-md overflow-hidden group-hover:shadow-lg transition-all">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
          </div>
        </div>
      ),
      amex: (
        <div className="flex items-center justify-center w-full h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-md overflow-hidden group-hover:shadow-lg transition-all">
          <div className="text-white text-sm font-bold uppercase">American Express</div>
        </div>
      ),
      discover: (
        <div className="flex items-center justify-center w-full h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-md overflow-hidden group-hover:shadow-lg transition-all">
          <div className="text-white text-sm font-bold">DISCOVER</div>
        </div>
      ),
      default: (
        <div className="flex items-center justify-center w-full h-10 bg-gray-200 rounded-md overflow-hidden">
          <CreditCard size={20} className="text-gray-500" />
        </div>
      )
    };
    
    return logos[type] || logos.default;
  };

  // Display success screen if payment is complete
  if (isComplete) {
    return (
      <>
        <style>{printStyles}</style>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full invoice-section border border-gray-100">
            {/* Company Header with enhanced styling */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-200 pb-6 mb-8">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-3">
                  <svg className="h-10 w-10 text-indigo-600 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M5 12C3.89543 12 3 11.1046 3 10V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V10C21 11.1046 20.1046 12 19 12M5 12L5 18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h1 className="text-4xl font-bold text-gray-800">BuildMart</h1>
                </div>
                <p className="text-gray-600">293/B, Galle Road, Colombo 03</p>
                <p className="text-gray-500">Tel: +94 11 234 5678</p>
                <p className="text-gray-500">Email: info@buildmart.lk</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold text-indigo-800">PAYMENT RECEIPT</h2>
                <p className="text-gray-600 mt-2">Receipt #: {invoiceData?.id || Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-gray-500">Time: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center justify-center py-6 mb-8 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-800">Payment Successful</h3>
                  <p className="text-green-600">Transaction completed successfully</p>
                </div>
              </div>
            </div>

            {/* Payment Details Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Customer Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">{userData?.name || name}</p>
                  <p className="text-gray-500 mt-1">Card ending in ****{cardNumber.slice(-4)}</p>
                  <p className="text-gray-500">Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  {userData?.email && (
                    <p className="text-gray-500">Email: {userData.email}</p>
                  )}
                  {userData?.role && (
                    <p className="text-gray-500">Account Type: {userData.role}</p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Payment Method
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CardLogo type={activeCard} />
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{activeCard}</p>
                      <p className="text-gray-500 text-sm">Expires: {expiry}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Payment Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Milestone Amount</span>
                  <span>{formatLKR(originalAmount)}</span>
                </div>
                
                {context === 'milestone' && (
                  <div className="flex justify-between text-gray-600">
                    <span>BuildMart Service Fee (10%)</span>
                    <span>{formatLKR(commissionAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold text-lg pt-4 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-green-600">{formatLKR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center no-print shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Receipt
              </button>
              
              <button 
                onClick={() => {
                  // Create a PDF-like blob and download it
                  const receiptContent = document.querySelector('.invoice-section').innerHTML;
                  const blob = new Blob([`
                    <html>
                      <head>
                        <title>BuildMart Receipt</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; }
                          .container { max-width: 800px; margin: 0 auto; }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          ${receiptContent}
                        </div>
                      </body>
                    </html>
                  `], {type: 'text/html'});
                  
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `buildmart-receipt-${new Date().toISOString().slice(0,10)}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center no-print shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Receipt
              </button>
              
              <button 
                onClick={resetForm}
                className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center no-print shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Make Another Payment
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
              <p className="mt-1">For any questions, please contact our support team.</p>
              <p className="mt-1">© {new Date().toLocaleDateString()} BuildMart. All rights reserved.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Update the amount input to be readonly if initialAmount is provided
  const amountInputProps = initialAmount
    ? { readOnly: true, className: 'bg-gray-50' }
    : {};

  // Modify the header text based on context
  const getHeaderText = () => {
    return context === 'supplier' ? 'Supplier Payment' : 'Payment Gateway';
  };

  // Add context-specific text in the payment form
  return (
    <>
      <style>{printStyles}</style>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#002855] to-[#0057B7] p-4">
        {/* Notification */}
        {showNotification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${
            notificationType === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            <div className="mr-3">
              {notificationType === 'success' ? 
                <CheckCircle size={20} className="text-green-500" /> : 
                <AlertCircle size={20} className="text-red-500" />
              }
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${notificationType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {notificationMessage}
              </p>
            </div>
            <button 
              className="ml-4 text-gray-400 hover:text-gray-500" 
              onClick={() => setShowNotification(false)}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Payment form with scrollable container */}
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header with more spacing */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
              {getHeaderText()}
            </h1>
            <div className="flex space-x-3">
              <CardLogo type="visa" />
              <CardLogo type="mastercard" />
              <CardLogo type="amex" />
              <CardLogo type="discover" />
            </div>
          </div>

          {/* Add context indicator if needed */}
          {context === 'supplier' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Processing payment for supplier services and materials.
              </p>
            </div>
          )}

          {/* Form with improved layout for wider container */}
          <form onSubmit={handlePayment} className="space-y-6">
            {/* Cardholder Name */}
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Cardholder Name<span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-md shadow-sm`}>
                <input 
                  type="text" 
                  className={`w-full p-4 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-12 transition-all duration-200`} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
            </div>

            {/* Card Type Selection with smaller, more compact buttons */}
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Card Type<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {cardTypes.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardSelection(card.id)}
                    className={`p-2 rounded-md border flex items-center justify-center transition-all ${
                      activeCard === card.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{minWidth: "70px", height: "40px"}}
                  >
                    <div className="scale-75">
                      {card.id === 'visa' && (
                        <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 rounded px-2 py-1">
                          <span className="text-white font-bold text-sm">VISA</span>
                        </div>
                      )}
                      {card.id === 'mastercard' && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
                        </div>
                      )}
                      {card.id === 'amex' && (
                        <div className="flex items-center justify-center bg-blue-500 px-2 py-1 rounded">
                          <span className="text-white text-xs font-bold">AMEX</span>
                        </div>
                      )}
                      {card.id === 'discover' && (
                        <div className="flex items-center justify-center bg-orange-500 px-2 py-1 rounded">
                          <span className="text-white text-xs font-bold">DISCOVER</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Number with more padding */}
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Card Number<span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-md shadow-sm`}>
                <input 
                  type="text" 
                  className={`w-full p-4 border ${errors.cardNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-12 pr-10 transition-all duration-200`} 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} 
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CreditCard size={20} className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CardLogo type={activeCard} />
                </div>
              </div>
              {errors.cardNumber && <p className="mt-1 text-red-500 text-xs">{errors.cardNumber}</p>}
            </div>

            {/* Expiry and CVV in a row with improved spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Expiry Date<span className="text-red-500">*</span>
                </label>
                <div className={`relative rounded-md shadow-sm`}>
                  <input 
                    type="text" 
                    className={`w-full p-4 border ${errors.expiry ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-12 transition-all duration-200`} 
                    value={expiry} 
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))} 
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={20} className="text-gray-400" />
                  </div>
                </div>
                {errors.expiry && <p className="mt-1 text-red-500 text-xs">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  CVV<span className="text-red-500">*</span>
                </label>
                <div className={`relative rounded-md shadow-sm`}>
                  <input 
                    type="text" 
                    className={`w-full p-4 border ${errors.cvv ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-12 transition-all duration-200`} 
                    value={cvv} 
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} 
                    placeholder={activeCard === 'amex' ? "4 digits" : "3 digits"}
                    maxLength={activeCard === 'amex' ? 4 : 3}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                </div>
                {errors.cvv && <p className="mt-1 text-red-500 text-xs">{errors.cvv}</p>}
              </div>
            </div>

            {/* Amount with larger input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Payment Details<span className="text-red-500">*</span>
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount:</span>
                  <span className="font-medium">{formatLKR(originalAmount)}</span>
                </div>
                
                {context === 'milestone' && (
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <span className="text-gray-700">BuildMart Service Fee (10%):</span>
                      <div className="ml-2 group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          BuildMart charges a 10% service fee on all milestone payments to maintain the platform and provide secure payment processing.
                        </div>
                      </div>
                    </div>
                    <span className="font-medium text-blue-600">{formatLKR(commissionAmount)}</span>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-700">{formatLKR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Security note */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full p-3 mr-4">
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-medium text-blue-800">Secure Payment</p>
                  <p className="text-sm text-blue-600">Your payment information is encrypted with 256-bit SSL. We never store your full card details.</p>
                </div>
              </div>
            </div>

            {/* Submit button with increased size */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full py-5 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-bold rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center" 
                disabled={isProcessing || parseFloat(amount) <= 0}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <span className="mr-3">Pay {formatLKR(totalAmount || 0)}</span>
                    <CreditCard size={22} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const handlePaymentSuccess = async (paymentResult) => {
  try {
    // Update milestone status and payment details
    const { workId, milestoneId } = location.state;
    
    const response = await axios.patch(
      `/api/ongoing-works/${workId}/milestone/${milestoneId}`,
      {
        status: 'completed',
        actualAmountPaid: paymentResult.amount,
        completedAt: new Date(),
        paymentId: paymentResult.id
      }
    );

    if (response.data) {
      setIsComplete(true);
      setInvoiceData({
        id: paymentResult.id,
        ...location.state,
        paymentDate: new Date(),
      });
      
      if (onSuccess) {
        onSuccess(paymentResult);
      }
    }
  } catch (error) {
    console.error('Error updating milestone payment:', error);
    showNotificationMessage('error', 'Payment recorded but milestone update failed');
  }
};

const handlePaymentSubmit = (e) => {
  e.preventDefault();
  
  // Process payment
  
  // If successful, pass payment details to parent
  onSuccess({
    cardholderName: cardholderName,
    cardType: getCardType(cardNumber), // Implement this function to detect card type
    lastFourDigits: cardNumber.slice(-4),
    expiryDate: `${expiryMonth}/${expiryYear}`,
    date: new Date().toISOString()
  });
};

export default EnhancedPaymentGateway;