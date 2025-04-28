import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewModal = ({ isOpen, onClose, projectId, contractorId, contractorName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Please provide a comment (minimum 10 characters)');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Log the request details for debugging
      console.log('Submitting review with:', {
        projectId,
        contractorId,
        rating,
        comment,
        hasToken: !!token
      });
      
      const response = await axios.post(
        'http://localhost:5000/api/reviews', 
        {
          projectId,
          contractorId,
          rating,
          comment
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Review submission successful:', response.data);
      
      setIsSubmitting(false);
      
      // Call the callback to notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
      
      // Close modal
      onClose();
      
    } catch (err) {
      setIsSubmitting(false);
      
      // Log detailed error information
      console.error('Error submitting review:', err);
      
      // Check for different types of error responses
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Server error details:', err.response.data);
        setError(err.response.data.message || 'Failed to submit review. Please try again.');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError('Error setting up request. Please try again.');
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Review Your Contractor</h2>
            <button 
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            {/* Contractor Name */}
            <div className="mb-6">
              <p className="text-gray-600">You're reviewing: <span className="font-medium text-blue-600">{contractorName}</span></p>
            </div>
            
            {/* Rating Stars */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Your Rating</label>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  
                  return (
                    <motion.button
                      type="button"
                      key={ratingValue}
                      className={`text-3xl focus:outline-none ${
                        ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(ratingValue)}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(null)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaStar />
                    </motion.button>
                  );
                })}
                <span className="ml-2 text-gray-600 self-center">
                  {rating} out of 5
                </span>
              </div>
            </div>
            
            {/* Comment */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="comment">
                Your Review
              </label>
              <textarea
                id="comment"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="4"
                placeholder="Share your experience working with this contractor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Debug Info - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-gray-50 text-gray-500 text-xs rounded border border-gray-200">
                <p>Debug Info:</p>
                <p>Project ID: {projectId}</p>
                <p>Contractor ID: {contractorId}</p>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
