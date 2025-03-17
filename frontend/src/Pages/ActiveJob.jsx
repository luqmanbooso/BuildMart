import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/buildmart_logo1.png';

const ActiveJob = () => {
  const { jobId = "sample-project-id" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State variables for job data
  const [job, setJob] = useState(null);
  const [editedJob, setEditedJob] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  // State variable for bids
  const [bids, setBids] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sampleJobData = {
    id: "sample-project-id",
    title: 'Renovate Kitchen with Modern Design',
    description: 'Complete kitchen renovation including new countertops, cabinets, flooring, and appliances. The space is approximately 15x12 feet. Looking for a contractor with experience in modern kitchen designs. Materials will be provided by the homeowner.',
    budget: '350,000',
    timeline: 30,
    location: 'Colombo 5, Sri Lanka',
    category: 'Renovation',
    createdAt: '2025-03-01T10:30:00',
    auctionStarted: true,
    milestones: [
      { id: 1, name: 'Initial Payment', amount: '100,000', description: 'Payment upon signing contract' },
      { id: 2, name: 'Demolition Complete', amount: '75,000', description: 'When old kitchen is removed' },
      { id: 3, name: 'Cabinet Installation', amount: '100,000', description: 'When new cabinets are installed' },
      { id: 4, name: 'Final Payment', amount: '75,000', description: 'Upon project completion and inspection' }
    ]
  };

  
  // Fetch job details and bids when component mounts
  useEffect(() => {
    const fetchJobAndBids = async () => {
      try {
        setLoading(true);
        
        // Get token from storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Fetch job details based on jobId
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log("Job data from API:", jobResponse.data);
        
        if (jobResponse.data) {
          // Set job data from API response
          const jobData = jobResponse.data;
          
          // Map backend job data to frontend format
          const formattedJob = {
            id: jobData._id,
            title: jobData.title,
            description: jobData.description || 'No description provided',
            budget: jobData.budget,
            timeline: jobData.timeline || 30,  // Default to 30 days if not specified
            location: jobData.area,
            category: jobData.category,
            createdAt: jobData.date,
            auctionStarted: jobData.status !== 'Pending',
            milestones: jobData.milestones || []
          };
          
          setJob(formattedJob);
          setEditedJob(formattedJob);
        } else {
          // If job data is null or undefined, fall back to sample data
          setJob(sampleJobData);
          setEditedJob(sampleJobData);
        }
        
        // Continue with the existing code to fetch bids
        const bidsResponse = await axios.get(`http://localhost:5000/bids/project/${jobId}`);
        
        console.log(bidsResponse.data);
  
        const formattedBids = bidsResponse.data.map(bid => {
          console.log('Bid from backend:', bid);
          
          return {
            ...bid,
            id: bid._id,
            formattedAmount: `LKR ${parseFloat(bid?.price).toLocaleString()}`,
            message: bid.qualifications || 'No additional details provided by the contractor.',
            contractor: {
              name: bid.contractorname || 'Unknown Contractor',
              profileImage: 'default-profile-image-url.jpg',
              completedProjects: bid.completedProjects || 0,
              rating: bid.rating || 0,
            },
            status: bid.status || 'pending',
            createdAt: new Date(bid.createdAt).toLocaleDateString(),
            timeline: bid.timeline,
          };
        });
        
        console.log('Formatted Bids:', formattedBids);
        setBids(formattedBids);
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };
  
    fetchJobAndBids();
  }, [jobId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedJob({
      ...editedJob,
      [name]: value,
    });
  };

  // Save edited job details
  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      // Simulate API call with timeout
      setTimeout(() => {
        setJob(editedJob);
        setIsEditing(false);
        setSuccessMessage('Job details updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Failed to update job details. Please try again.');
      setLoading(false);
    }
  };

  // Update the Start Auction function to use the API
const handleStartAuction = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const response = await axios.put(
      `http://localhost:5000/api/jobs/${jobId}/auction-status`,
      { status: 'Active' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data && response.data.job) {
      const jobData = response.data.job;
      
      // Update local job state
      setJob({
        ...job,
        status: 'Active',
        auctionStarted: true,
        biddingStartTime: jobData.biddingStartTime
      });
      
      setEditedJob({
        ...editedJob,
        status: 'Active',
        auctionStarted: true,
        biddingStartTime: jobData.biddingStartTime
      });
      
      setSuccessMessage('Auction started successfully!');
    }
  } catch (err) {
    console.error('Error starting auction:', err);
    setError('Failed to start auction: ' + (err.response?.data?.error || err.message));
  } finally {
    setLoading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  }
};

// Add a Stop Auction function
const handleStopAuction = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const response = await axios.put(
      `http://localhost:5000/api/jobs/${jobId}/auction-status`,
      { status: 'Closed' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data && response.data.job) {
      const jobData = response.data.job;
      
      // Update local job state
      setJob({
        ...job,
        status: 'Closed',
        auctionStarted: false,
        biddingEndTime: jobData.biddingEndTime
      });
      
      setEditedJob({
        ...editedJob,
        status: 'Closed',
        auctionStarted: false,
        biddingEndTime: jobData.biddingEndTime
      });
      
      setSuccessMessage('Auction closed successfully!');
    }
  } catch (err) {
    console.error('Error stopping auction:', err);
    setError('Failed to stop auction: ' + (err.response?.data?.error || err.message));
  } finally {
    setLoading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  }
};

  // Accept a bid
  const handleAcceptBid = async (bidId) => {
    try {
      setLoading(true);
      setError(null);
  
      // Call the backend API to update the bid status
      const response = await axios.put(`http://localhost:5000/bids/${bidId}/status`, {
        status: 'accepted'
      });
  
      console.log('API Response:', response.data);
  
      if (response.data && response.data.bid) {
        // Update the local state with the accepted bid
        const updatedBids = bids.map(bid =>
          bid.id === bidId || bid._id === bidId
            ? { ...bid, status: 'accepted' }
            : { ...bid, status: 'rejected' } // The backend sets other bids to rejected
        );
        
        setBids(updatedBids);
        setSuccessMessage('Bid accepted successfully!');
        
        // Optional: Refresh data from the server to ensure consistency
        // await fetchBids();
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      setError(error.response?.data?.error || 'Failed to accept bid. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Add this function to handle job deletion
const handleDeleteJob = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const response = await axios.delete(
      `http://localhost:5000/api/jobs/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.status === 200) {
      setSuccessMessage('Job deleted successfully!');
      
      // Redirect to the dashboard or jobs list page after a brief delay
      setTimeout(() => {
        navigate('/userprofile');
      }, 1500);
    }
  } catch (err) {
    console.error('Error deleting job:', err);
    setError('Failed to delete job: ' + (err.response?.data?.error || err.message));
  } finally {
    setShowDeleteConfirm(false);
    setLoading(false);
  }
};

  if (loading && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-4xl mx-auto my-10 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="">
              <img src={logo} alt="BuildMart Logo" className="h-15" />
            </div>
          </div>

          <nav className="hidden lg:flex space-x-8">
            {['Home', 'Auction', 'Projects', 'About Us', 'Contact Us'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-medium relative group text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              <span>Account</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <nav className="text-sm text-gray-500">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="flex items-center">
                <Link to="/jobs" className="hover:text-blue-600">My Projects</Link>
                <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-700">Project Details</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto my-8 px-4">
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex justify-between w-full">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6m2 12L6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Card header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Job Details' : 'Active Job Details'}
            </h1>
            <div className="flex space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              
              {/* Start Auction button */}
              {!job?.auctionStarted && (
                <button
                  onClick={handleStartAuction}
                  disabled={loading}
                  className={`px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Auction Now
                </button>
              )}
              
              {/* Stop Auction button - only show if auction is active */}
              {job?.auctionStarted && (
                <button
                  onClick={handleStopAuction}
                  disabled={loading}
                  className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop Auction
                </button>
              )}
              
              {/* Delete Job button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Job
              </button>
            </div>
          </div>

          {/* Card content */}
          <div className="p-6">
            {isEditing ? (
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editedJob.title || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">LKR</span>
                      </div>
                      <input
                        type="text"
                        name="budget"
                        value={editedJob.budget || ''}
                        onChange={handleInputChange}
                        className="block w-full pl-12 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={4}
                      name="description"
                      value={editedJob.description || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (in days)</label>
                    <input
                      type="number"
                      name="timeline"
                      value={editedJob.timeline || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editedJob.location || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={editedJob.category || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedJob(job);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{job?.title}</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-2">Project Description</h3>
                      <p className="text-gray-600">{job?.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs text-blue-500 uppercase font-semibold">Timeline</p>
                        <p className="text-lg font-medium">{bids?.timeline} days</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs text-blue-500 uppercase font-semibold">Location</p>
                        <p className="text-lg font-medium">{job?.location}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs text-blue-500 uppercase font-semibold">Posted Date</p>
                        <p className="text-lg font-medium">{new Date(job?.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Milestones section */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Milestones</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="relative overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-3 rounded-l-lg">Name</th>
                                <th scope="col" className="px-4 py-3">Description</th>
                                <th scope="col" className="px-4 py-3 rounded-r-lg text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {job?.milestones?.map((milestone, index) => (
                                <tr key={milestone.id} className="bg-white border-b">
                                  <td className="px-4 py-3 font-medium text-gray-900">{milestone.name}</td>
                                  <td className="px-4 py-3 text-gray-600">{milestone.description}</td>
                                  <td className="px-4 py-3 text-right font-medium">LKR {milestone.amount}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">Total</td>
                                <td className="px-4 py-3"></td>
                                <td className="px-4 py-3 text-right font-bold">
                                  LKR {job?.milestones?.reduce((sum, m) => sum + parseInt(m.amount.replace(/,/g, ''), 10), 0).toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-medium text-gray-500">Project Budget</p>
                        <span className="text-2xl font-bold text-gray-800">LKR {job?.budget}</span>
                      </div>
                      
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        job?.auctionStarted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}> 
                        <span className={`w-2 h-2 mr-2 rounded-full ${
                          job?.auctionStarted ? 'bg-green-600' : 'bg-yellow-500'
                        }`}></span>
                        {job?.auctionStarted ? "Auction Started" : "Auction Not Started"}
                      </span>
                      
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          {job?.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bids section */}
                {job?.auctionStarted && (
                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                      Bids 
                      <span className="ml-2 text-sm font-medium bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
                        {bids.length}
                      </span>
                    </h3>
                    {bids.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contractor
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bid Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timeline
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bids.map((bid) => (
                              <tr key={bid.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-800 font-medium">
                                        {(bid.contractor?.name || 'Unknown').charAt(0)}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {bid.contractor?.name || 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">LKR {parseFloat(bid.price).toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{bid.timeline} days</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {new Date(bid.createdAt).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                    ${bid.status === 'accepted' 
                                      ? 'bg-green-100 text-green-800' 
                                      : bid.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>{bid.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {bid.status === 'pending' && (
                                    <button 
                                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      onClick={() => handleAcceptBid(bid.id)}
                                      disabled={loading}
                                    >
                                      Accept Bid
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">No bids yet</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>No bids have been placed yet for this job. Check back later or adjust your job details to attract more contractors.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Card footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Active Jobs
            </button>

            {job?.auctionStarted && (
              <span className="text-sm text-gray-500">
                {bids.length} {bids.length === 1 ? 'bid' : 'bids'} received
              </span>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Delete Job</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this job? This action cannot be undone.
                  {job?.auctionStarted && (
                    <span className="block text-red-600 font-medium mt-2">
                      Warning: This job has an ongoing auction. Deleting it will cancel all bids.
                    </span>
                  )}
                </p>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteJob}
                    disabled={loading}
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : 'Yes, Delete Job'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveJob;
