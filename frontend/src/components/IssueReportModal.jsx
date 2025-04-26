import React, { useState } from 'react';
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
  
  // Define issue categories
  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Payment/Billing Problem' },
    { value: 'quality', label: 'Quality Concern' },
    { value: 'timeline', label: 'Timeline Delay' },
    { value: 'communication', label: 'Communication Problem' },
    { value: 'other', label: 'Other' },
  ];
  
  // Define priority levels
  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIssueData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!issueData.title.trim() || !issueData.description.trim()) {
      toast.error("Please provide both a title and description for your issue");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get current date and time
      const submissionDate = new Date().toISOString();
      
      // Get authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Simplify the payload - only send absolutely required fields
      const payload = {
        title: issueData.title,
        description: issueData.description,
        category: issueData.category || 'technical',
        priority: issueData.priority || 'medium',
        status: 'pending',
        submittedAt: submissionDate
      };
      
      // Only add these fields if they exist and are not null/undefined
      if (projectName) payload.projectName = projectName;
      if (projectId) payload.projectId = projectId;
      if (userId) payload.userId = userId;
      if (username) payload.username = username; // Add username to payload
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
      
      // More detailed error logging
      if (error.response) {
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
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
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
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
