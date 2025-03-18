import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const BidUpdate = ({ bid, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      price: bid.price,
      timeline: bid.timeline,
      additionalDetails: ''
    }
  });

  // Get the form values for validation
  const watchedPrice = watch('price');

  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo({
          userId: decoded.userId,
          username: decoded.username
        });
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Authentication error. Please log in again.');
      }
    }
  }, []);

  const onSubmit = async (data) => {
    if (!userInfo) {
      setError('You must be logged in to update a bid');
      return;
    }

    // Validate that user owns this bid
    if (userInfo.userId !== bid.contractorId) {
      setError('You can only update your own bids');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        price: parseFloat(data.price),
        timeline: parseInt(data.timeline),
        qualifications: bid.qualifications + (data.additionalDetails ? 
          `\n[Update ${bid.updateCount + 1}]: ${data.additionalDetails}` : ''),
        contractorId: userInfo.userId
      };

      const response = await axios.put(
        `http://localhost:5000/bids/update/${bid._id}`, 
        updateData
      );

      if (response.data) {
        onSuccess(response.data.bid, response.data.updatesRemaining);
      } else {
        throw new Error('Failed to update bid');
      }
    } catch (err) {
      console.error('Error updating bid:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Update Your Bid</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-700 font-medium">Updates Remaining: {3 - bid.updateCount}/3</span>
          </div>
          <p className="text-sm text-blue-600">
            You can update your bid up to 3 times. This will be update #{bid.updateCount + 1}.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
            <div className="flex">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Bid</label>
            <div className="mt-1 py-2 px-3 bg-gray-100 rounded-md text-gray-700">
              LKR {parseFloat(bid.price).toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Bid Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">LKR</span>
              </div>
              <input
                type="text"
                {...register('price', {
                  required: 'Bid amount is required',
                  pattern: {
                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                    message: 'Please enter a valid number (e.g., 1000 or 1000.50)'
                  },
                  validate: {
                    positive: v => parseFloat(v) > 0 || 'Bid must be greater than 0',
                    lowerThanCurrent: v => parseFloat(v) < parseFloat(bid.price) || 
                      'New bid must be lower than your current bid'
                  }
                })}
                className={`block w-full pl-10 pr-12 py-2 sm:text-sm rounded-md ${
                  errors.price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Timeline (Days)</label>
            <input
              type="number"
              {...register('timeline', {
                required: 'Timeline is required',
                min: { value: 1, message: 'Timeline must be at least 1 day' },
                max: { value: 365, message: 'Timeline must not exceed 1 year' }
              })}
              className={`mt-1 block w-full py-2 px-3 sm:text-sm rounded-md ${
                errors.timeline ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {errors.timeline && (
              <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Details (Optional)</label>
            <textarea
              {...register('additionalDetails')}
              rows={3}
              className="mt-1 block w-full py-2 px-3 sm:text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why you're adjusting your bid (optional)"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Bid'}
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BidUpdate;