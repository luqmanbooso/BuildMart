import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const IssueReportModal = ({ isOpen, onClose, projectId, projectName, title, userId, username, userRole, category, work }) => {
  const [issueData, setIssueData] = useState({
    title: '',
    description: '',
    category: category || 'technical',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add validation state
  const [validation, setValidation] = useState({
    title: { valid: true, message: '' },
    description: { valid: true, message: '' }
  });
  
  // Define issue categories - ensure all match backend allowed values
  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Payment/Billing Problem' },
    { value: 'quality', label: 'Quality Concern' },
    { value: 'timeline', label: 'Timeline Delay' },
    { value: 'communication', label: 'Communication Problem' },
    { value: 'other', label: 'Other' },
  ];
  
  // Define valid backend categories for validation
  const validBackendCategories = ['technical', 'billing', 'quality', 'timeline', 'communication', 'other'];
  
  // Define priority levels
  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
  
  // Title validation function
  const validateTitle = (title) => {
    if (!title || title.trim().length === 0) {
      return { valid: false, message: 'Title is required' };
    }
    
    if (title.trim().length < 5) {
      return { valid: false, message: 'Title must be at least 5 characters' };
    }
    
    if (title.length > 100) {
      return { valid: false, message: 'Title must not exceed 100 characters' };
    }
    
    // Check for invalid characters - only allow alphanumeric, spaces and basic punctuation
    const validTitleRegex = /^[a-zA-Z0-9\s,.?!()-]+$/;
    if (!validTitleRegex.test(title)) {
      return { valid: false, message: 'Title contains invalid characters' };
    }
    
    return { valid: true, message: '' };
  };
  
  // Description validation function
  const validateDescription = (description) => {
    if (!description || description.trim().length === 0) {
      return { valid: false, message: 'Description is required' };
    }
    
    if (description.trim().length < 20) {
      return { valid: false, message: 'Description should be at least 20 characters' };
    }
    
    if (description.length > 1000) {
      return { valid: false, message: 'Description cannot exceed 1000 characters' };
    }
    
    // Check for excessive special characters
    const specialChars = description.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || [];
    if (specialChars.length > description.length * 0.3) {
      return { valid: false, message: 'Description contains too many special characters' };
    }
    
    return { valid: true, message: '' };
  };
  
  // Sanitize title input to prevent special characters
  const sanitizeTitle = (input) => {
    // Remove disallowed special characters, keeping only alphanumeric, spaces and basic punctuation
    return input.replace(/[^a-zA-Z0-9\s,.?!()-]/g, '');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      // Sanitize title input
      const sanitizedValue = sanitizeTitle(value);
      setIssueData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      
      // Validate the sanitized input
      setValidation(prev => ({
        ...prev,
        title: validateTitle(sanitizedValue)
      }));
    } else if (name === 'description') {
      setIssueData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate description
      setValidation(prev => ({
        ...prev,
        description: validateDescription(value)
      }));
    } else {
      // For other fields, just update without validation
      setIssueData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Check if form is valid
  const isFormValid = () => {
    return validation.title.valid && validation.description.valid && 
           issueData.title.trim() !== '' && issueData.description.trim() !== '';
  };
  
  // Reset validation when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setValidation({
        title: { valid: true, message: '' },
        description: { valid: true, message: '' }
      });
    }
  }, [isOpen]);
  
  // Effect to normalize category if it's invalid
  useEffect(() => {
    if (isOpen && category) {
      // If the provided category is not in valid list, default to 'other'
      if (!validBackendCategories.includes(category.toLowerCase())) {
        setIssueData(prev => ({
          ...prev,
          category: 'other'
        }));
        console.log(`Normalized invalid category '${category}' to 'other'`);
      }
    }
  }, [isOpen, category]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const titleValidation = validateTitle(issueData.title);
    const descriptionValidation = validateDescription(issueData.description);
    
    setValidation({
      title: titleValidation,
      description: descriptionValidation
    });
    
    if (!titleValidation.valid || !descriptionValidation.valid) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get current date and time
      const submissionDate = new Date().toISOString();
      
      // Get authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Normalize category to ensure it's valid for backend
      let normalizedCategory = issueData.category.toLowerCase();
      if (!validBackendCategories.includes(normalizedCategory)) {
        normalizedCategory = 'other'; // Default to 'other' if invalid
        console.log(`Normalized invalid category '${issueData.category}' to '${normalizedCategory}'`);
      }
      
      // Simplify the payload - only send absolutely required fields
      const payload = {
        title: issueData.title,
        description: issueData.description,
        category: normalizedCategory, // Use normalized category
        priority: issueData.priority || 'medium',
        status: 'pending',
        submittedAt: submissionDate
      };
      
      // Only add these fields if they exist and are not null/undefined
      if (projectName) payload.projectName = projectName;
      if (projectId) payload.projectId = projectId;
      if (userId) payload.userId = userId;
      if (username) payload.username = username;
      if (userRole) payload.userRole = userRole;
      
      console.log('Sending simplified payload with username:', payload);
      
      // Make the request with auth token
      const response = await axios.post(
        'http://localhost:5000/api/inquiries', 
        payload,
        {
          headers: token ? { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } : {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Issue submission successful:', response.data);
      toast.success("Issue reported successfully! An administrator will review it shortly.");
      onClose();
      
      // Reset form
      setIssueData({
        title: '',
        description: '',
        category: category || 'technical',
        priority: 'medium',
      });
    } catch (error) {
      console.error("Error submitting issue:", error);
      
      // More detailed error handling for validation errors
      if (error.response?.data?.errors) {
        // Display specific validation error messages
        const errorDetails = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');
        toast.error(`Validation error: ${errorDetails}`);
      } else if (error.response) {
        // The server responded with an error status
        console.error('Server error details:', error.response.data);
        console.error('Status code:', error.response.status);
        
        // Try to provide more specific error messages based on the response
        const errorMessage = error.response.data?.message || 'Unknown server error';
        toast.error(`Server error: ${errorMessage}`);
        
        // If it's a 400 error, it might be a validation issue
        if (error.response.status === 400) {
          toast.error("Please check that all required fields are filled correctly.");
        }
      } else if (error.request) {
        // The request was made but no response received
        console.error('No response received:', error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something else happened
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-90vh overflow-y-auto">
        <div className="border-b px-4 py-3 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-lg font-semibold text-white">Report an Issue</h3>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={issueData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              className={`w-full px-3 py-2 border ${
                !validation.title.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } rounded-md focus:outline-none focus:border-blue-500`}
              required
              maxLength={100}
            />
            {!validation.title.valid && (
              <p className="mt-1 text-sm text-red-600">{validation.title.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Only letters, numbers, spaces, and basic punctuation allowed (5-100 characters)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={issueData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={issueData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map(pri => (
                  <option key={pri.value} value={pri.value}>{pri.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={issueData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Please describe the issue in detail, including any steps to reproduce it"
              className={`w-full px-3 py-2 border ${
                !validation.description.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } rounded-md focus:outline-none focus:border-blue-500`}
              required
              maxLength={1000}
            ></textarea>
            {!validation.description.valid && (
              <p className="mt-1 text-sm text-red-600">{validation.description.message}</p>
            )}
            <div className="mt-1 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Minimum 20 characters, maximum 1000
              </p>
              <p className={`text-xs ${
                issueData.description.length > 1000 ? 'text-red-500' : 
                issueData.description.length < 20 ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {issueData.description.length}/1000 characters
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none ${
                isSubmitting || !isFormValid() ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueReportModal;
