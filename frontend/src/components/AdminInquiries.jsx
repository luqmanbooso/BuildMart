import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch inquiries when component mounts
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inquiries');
      setInquiries(response.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setErrorMessage('Failed to load inquiries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/inquiries/${inquiryId}/status`, { status: newStatus });
      
      // Update inquiries in state
      setInquiries(prevInquiries => 
        prevInquiries.map(inquiry => 
          inquiry._id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
        )
      );
      
      toast.success(`Inquiry status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const deleteInquiry = async (inquiryId) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inquiries/${inquiryId}`);
        
        // Remove from state
        setInquiries(prevInquiries => prevInquiries.filter(inquiry => inquiry._id !== inquiryId));
        
        toast.success('Inquiry deleted successfully');
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error('Failed to delete inquiry');
      }
    }
  };

  // Filter inquiries based on status and search term
  const filteredInquiries = inquiries.filter(inquiry => {
    // Filter by status
    if (inquiryFilter !== 'all' && inquiry.status !== inquiryFilter) {
      return false;
    }
    
    // Filter by search term (in title or description)
    if (searchTerm && !inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !inquiry.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Get counts for different inquiry statuses
  const inquiryCounts = {
    all: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    'in-progress': inquiries.filter(i => i.status === 'in-progress').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length,
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge color utility
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Priority badge color utility
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-800">User Inquiries and Issue Reports</h2>
        
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search inquiries..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={inquiryFilter}
            onChange={(e) => setInquiryFilter(e.target.value)}
            className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Inquiries ({inquiryCounts.all})</option>
            <option value="pending">Pending ({inquiryCounts.pending})</option>
            <option value="in-progress">In Progress ({inquiryCounts['in-progress']})</option>
            <option value="resolved">Resolved ({inquiryCounts.resolved})</option>
          </select>
          
          <button
            onClick={fetchInquiries}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {errorMessage && (
        <div className="text-center py-12">
          <p className="text-red-500">{errorMessage}</p>
          <button
            onClick={fetchInquiries}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {!errorMessage && filteredInquiries.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inquiries found</h3>
          <p className="mt-1 text-sm text-gray-500">No inquiries match your current filter criteria.</p>
        </div>
      )}
      
      {!errorMessage && filteredInquiries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{inquiry.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{inquiry.description}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(inquiry.priority)}`}>
                            {inquiry.priority}
                          </span>
                          <span className="mx-2 text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{formatDate(inquiry.submittedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {inquiry.projectId || 'General Inquiry'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.userId || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{inquiry.userRole || 'User'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {inquiry.status === 'pending' && (
                        <button 
                          onClick={() => updateInquiryStatus(inquiry._id, 'in-progress')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Start Progress
                        </button>
                      )}
                      {inquiry.status === 'in-progress' && (
                        <button 
                          onClick={() => updateInquiryStatus(inquiry._id, 'resolved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button 
                        onClick={() => deleteInquiry(inquiry._id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
