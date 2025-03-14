import React, { useState } from 'react';
import { CreditCard, Calendar, Lock, CheckCircle } from 'lucide-react';

const EnhancedPaymentGateway = () => {
  const [activeCard, setActiveCard] = useState('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('100.00');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
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

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    
    // Auto-detect card type
    if (formattedValue.startsWith('4')) {
      setActiveCard('visa');
    } else if (formattedValue.startsWith('5')) {
      setActiveCard('mastercard');
    } else if (formattedValue.startsWith('3')) {
      setActiveCard('amex');
    } else {
      setActiveCard('generic');
    }
  };

  const handleExpiryChange = (e) => {
    const formattedValue = formatExpiry(e.target.value);
    setExpiry(formattedValue);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#002855] to-[#0057B7]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center">
            <CheckCircle size={60} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your transaction has been processed successfully.</p>
            <div className="bg-gray-100 p-4 rounded-lg w-full mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">Rs. {amount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Card:</span>
                <span className="font-bold">**** **** **** {cardNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-bold text-xs">TXN{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
            </div>
            <button 
              className="w-full py-3 px-4 bg-[#002855] hover:bg-[#0057B7] text-white font-bold rounded-md transition-colors"
              onClick={() => {
                setIsComplete(false);
                setCardNumber('');
                setCvv('');
                setExpiry('');
              }}
            >
              Make Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#002855] to-[#0057B7]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Payment Gateway</h1>
        
        <div className="flex justify-center mb-6">
          <div className="flex space-x-3">
            <button 
              className={`p-2 rounded-md border ${activeCard === 'visa' ? 'border-[#002855] bg-[#0057B7]/10' : 'border-gray-300'}`}
              onClick={() => setActiveCard('visa')}
            >
              <div className="bg-blue-50 text-blue-700 p-1 rounded text-xs font-bold w-12 text-center">VISA</div>
            </button>
            <button 
              className={`p-2 rounded-md border ${activeCard === 'mastercard' ? 'border-[#002855] bg-[#0057B7]/10' : 'border-gray-300'}`}
              onClick={() => setActiveCard('mastercard')}
            >
              <div className="bg-red-50 text-red-700 p-1 rounded text-xs font-bold w-12 h-5 flex items-center justify-center">MC</div>
            </button>
            <button 
              className={`p-2 rounded-md border ${activeCard === 'amex' ? 'border-[#002855] bg-[#0057B7]/10' : 'border-gray-300'}`}
              onClick={() => setActiveCard('amex')}
            >
              <div className="bg-green-50 text-green-700 p-1 rounded text-xs font-bold w-12 text-center">AMEX</div>
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Cardholder Name
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0057B7] pl-10"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0057B7] pl-10"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Expiry Date
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0057B7] pl-10"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              CVV
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0057B7] pl-10"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength={4}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">Rs.</span>
            </div>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0057B7] pl-10"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </div>
        </div>
        
        <button 
          className="w-full py-3 px-4 bg-[#002855] hover:bg-[#0057B7] text-white font-bold rounded-md transition-colors relative"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : "Pay Now"}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
          <Lock size={14} className="mr-1" />
          <span>Your payment is secure and encrypted.</span>
        </div>
        
        <div className="mt-4 flex justify-center space-x-3">
          <div className="bg-blue-50 text-blue-700 p-1 rounded text-xs font-bold w-10 h-6 flex items-center justify-center">VISA</div>
          <div className="bg-red-50 text-red-700 p-1 rounded text-xs font-bold w-10 h-6 flex items-center justify-center">MC</div>
          <div className="bg-green-50 text-green-700 p-1 rounded text-xs font-bold w-10 h-6 flex items-center justify-center">AMEX</div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentGateway;