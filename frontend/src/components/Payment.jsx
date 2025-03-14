import React, { useState } from 'react';

const Payment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle payment submission logic here
    console.log({ cardNumber, expiryDate, cvv, amount });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Payment Gateway</h2>

        {/* Card Number */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cardNumber">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="expiryDate">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="MM/YY"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cvv">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="123"
              required
            />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="100.00"
            required
          />
        </div>

        {/* Pay Now Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
        >
          Pay Now
        </button>

        {/* Additional Info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Your payment is secure and encrypted.
        </p>
      </form>
    </div>
  );
};

export default Payment;





