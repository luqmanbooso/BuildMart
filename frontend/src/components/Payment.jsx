import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';

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

const EnhancedPaymentGateway = () => {
  // State management
  const [activeCard, setActiveCard] = useState('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('100.00');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [manuallySelectedCard, setManuallySelectedCard] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

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

  // Detect card type based on number (only if user hasn't manually selected a card)
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
    
    if (!amount.trim() || parseFloat(amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      setIsProcessing(true);
      
      try {
        // Remove spaces from card number before sending to backend
        const cleanCardNumber = cardNumber.replace(/\s+/g, '');
        
        const response = await fetch('http://localhost:5000/api/payments/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            cardNumber: cleanCardNumber, // Use the cleaned card number
            expiry,
            amount,
            activeCard
          })
        });

        const data = await response.json();

        if (data.success) {
          setInvoiceData(data.payment);
          setIsComplete(true);
          showNotificationMessage('success', 'Payment processed successfully!');
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
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

  // Card logo components
  const CardLogo = ({ type }) => {
    const logos = {
      visa: (
        <div className="flex items-center justify-center w-12 h-8 bg-white rounded">
          <div className="text-blue-600 font-bold text-lg">VISA</div>
        </div>
      ),
      mastercard: (
        <div className="flex items-center justify-center w-12 h-8 bg-white rounded">
          <div className="flex">
            <div className="w-4 h-4 bg-red-500 rounded-full overflow-hidden"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded-full overflow-hidden ml-1"></div>
          </div>
        </div>
      ),
      amex: (
        <div className="flex items-center justify-center w-12 h-8 bg-blue-500 rounded">
          <div className="text-white text-xs font-bold">AMEX</div>
        </div>
      ),
      discover: (
        <div className="flex items-center justify-center w-12 h-8 bg-orange-500 rounded">
          <div className="text-white text-xs font-bold">DISC</div>
        </div>
      ),
      default: (
        <div className="flex items-center justify-center w-12 h-8 bg-gray-200 rounded">
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#002855] to-[#0057B7] p-6">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full invoice-section">
            {/* Company Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">BuildMart</h1>
                  <p className="text-gray-500 mt-1">Building Materials & Hardware</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold text-gray-800">INVOICE</h2>
                  <p className="text-gray-500 mt-1">#{invoiceData?.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center justify-center py-6 mb-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">Payment Successful</h2>
                <p className="text-green-600">Transaction completed successfully</p>
              </div>
            </div>

            {/* Payment Details Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Customer Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">{name}</p>
                  <p className="text-gray-500 mt-1">Card ending in {cardNumber.slice(-4)}</p>
                  <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Payment Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CardLogo type={activeCard} />
                    <span className="ml-2 font-medium text-gray-800 capitalize">{activeCard}</span>
                  </div>
                  <p className="text-gray-500">Card ending in {cardNumber.slice(-4)}</p>
                  <p className="text-gray-500">Exp: {expiry}</p>
                </div>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">LKR {parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                <span>Transaction Fee</span>
                <span>LKR 0.00</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-800">Total Paid</span>
                <span className="text-lg font-bold text-green-600">LKR {parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Download Invoice
              </button>
              <button 
                onClick={resetForm}
                className="flex-1 py-3 px-4 bg-[#002855] hover:bg-[#0057B7] text-white font-bold rounded-lg transition-colors duration-300"
              >
                Make Another Payment
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Thank you for your payment. For any queries, please contact support.</p>
              <p className="mt-1">© {new Date().getFullYear()} BuildMart. All rights reserved.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{printStyles}</style>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#002855] to-[#0057B7]">
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

        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Payment Gateway</h1>
            <div className="flex space-x-2">
              <CardLogo type="visa" />
              <CardLogo type="mastercard" />
              <CardLogo type="amex" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePayment}>
            {/* Cardholder Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Cardholder Name<span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-md shadow-sm`}>
                <input 
                  type="text" 
                  className={`w-full p-3 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-10 transition-all duration-200`} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
            </div>

            {/* Card Type Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Card Type<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {cardTypes.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardSelection(card.id)}
                    className={`p-2 rounded-md border flex items-center justify-center ${
                      activeCard === card.id 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CardLogo type={card.id} />
                  </button>
                ))}
              </div>
            </div>

            {/* Card Number */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Card Number<span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-md shadow-sm`}>
                <input 
                  type="text" 
                  className={`w-full p-3 border ${errors.cardNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-10 pr-10 transition-all duration-200`} 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} 
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CardLogo type={activeCard} />
                </div>
              </div>
              {errors.cardNumber && <p className="mt-1 text-red-500 text-xs">{errors.cardNumber}</p>}
            </div>

            {/* Expiry and CVV */}
            <div className="flex space-x-4 mb-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Expiry Date<span className="text-red-500">*</span>
                </label>
                <div className={`relative rounded-md shadow-sm`}>
                  <input 
                    type="text" 
                    className={`w-full p-3 border ${errors.expiry ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-10 transition-all duration-200`} 
                    value={expiry} 
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))} 
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                </div>
                {errors.expiry && <p className="mt-1 text-red-500 text-xs">{errors.expiry}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  CVV<span className="text-red-500">*</span>
                </label>
                <div className={`relative rounded-md shadow-sm`}>
                  <input 
                    type="text" 
                    className={`w-full p-3 border ${errors.cvv ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-10 transition-all duration-200`} 
                    value={cvv} 
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} 
                    placeholder={activeCard === 'amex' ? "4 digits" : "3 digits"}
                    maxLength={activeCard === 'amex' ? 4 : 3}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                </div>
                {errors.cvv && <p className="mt-1 text-red-500 text-xs">{errors.cvv}</p>}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Amount<span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-md shadow-sm`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">LKR</span>
                </div>
                <input 
                  type="text" 
                  className={`w-full p-3 border ${errors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md pl-12 transition-all duration-200`} 
                  value={amount} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    setAmount(value);
                  }} 
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-1 text-red-500 text-xs">{errors.amount}</p>}
            </div>

            {/* Security note */}
            <div className="mb-6 bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex items-center">
                <Lock size={16} className="text-gray-500 mr-2" />
                <p className="text-xs text-gray-500">Your payment information is encrypted and secure. We never store your full card details.</p>
              </div>
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-[#002855] hover:bg-[#0057B7] text-white font-bold rounded-md shadow-md transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Pay LKR {parseFloat(amount || 0).toFixed(2)}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EnhancedPaymentGateway;