import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/buildmart_logo1.png';
import BidListingSection from '../components/BidListingSection';
import { jwtDecode } from 'jwt-decode';
import ClientNavBar from '../components/ClientNavBar';

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
  
  // Add new state variables for sorting
  const [sortField, setSortField] = useState('price');  // Default sort by price
  const [sortDirection, setSortDirection] = useState('asc');  // Default ascending order

  // Add this state in your component
  const [contractorDetails, setContractorDetails] = useState({
    id: null,
    name: 'Contractor',
    email: 'contractor@example.com',
    phone: '',
    experience: 0,
    completedProjects: 0,
    specializations: [],
    rating: 0
  });

  
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
            minBudget: jobData.minBudget || '0',
            maxBudget: jobData.maxBudget || '0',
            location: jobData.area,
            area: jobData.area, // Add this field to ensure area is accessible in both formats
            categories: jobData.categories || [], // Properly store categories as an array
            category: jobData.category, // Keep this for backward compatibility
            createdAt: jobData.date,
            auctionStarted: jobData.status === 'Active',
            status: jobData.status || 'Pending',
            milestones: jobData.milestones || [],
            biddingStartTime: jobData.biddingStartTime,
            biddingEndTime: jobData.biddingEndTime
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

  // Add this useEffect hook to fetch contractor details when component mounts
  useEffect(() => {
    const fetchContractorDetails = async () => {
      try {
        // Get token from storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        // Decode token to get userId
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.id || decoded._id || decoded.userId;
          
          if (!userId) {
            console.error('No user ID found in token');
            return;
          }
          
          // Store userId in localStorage for convenience
          localStorage.setItem('userId', userId);
          
          // Fetch contractor profile using the token
          const contractorResponse = await axios.get(`http://localhost:5000/api/contractors/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (contractorResponse.data) {
            const data = contractorResponse.data;
            
            // Update contractor details state
            setContractorDetails({
              id: userId,
              name: data.companyName || decoded.name || 'Contractor',
              email: decoded.email || data.email || 'contractor@example.com',
              phone: data.phone || '',
              experience: data.experienceYears || 0,
              completedProjects: data.completedProjects || 0,
              specializations: data.specialization || [],
              rating: data.rating || 0,
              verified: data.verified || false
            });
            
            // Also store basic info in localStorage for components that might need it
            localStorage.setItem('name', data.companyName || decoded.name || 'Contractor');
            localStorage.setItem('email', decoded.email || data.email || 'contractor@example.com');
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          
          // Fallback to try direct API request with the token
          try {
            const userResponse = await axios.get(`http://localhost:5000/api/users/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userResponse.data) {
              const userData = userResponse.data;
              setContractorDetails({
                id: userData._id,
                name: userData.name || 'Contractor',
                email: userData.email || 'contractor@example.com',
                phone: userData.phone || '',
                verified: userData.verified || false
              });
              
              localStorage.setItem('userId', userData._id);
              localStorage.setItem('name', userData.name || 'Contractor');
              localStorage.setItem('email', userData.email || 'contractor@example.com');
            }
          } catch (userError) {
            console.error('Error fetching user profile:', userError);
          }
        }
      } catch (err) {
        console.error('Error fetching contractor details:', err);
      }
    };
  
    fetchContractorDetails();
  }, []);

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
      setError(null);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Prepare data for API, ensuring proper field names
      const jobData = {
        title: editedJob.title,
        description: editedJob.description,
        minBudget: editedJob.minBudget,
        maxBudget: editedJob.maxBudget,
        area: editedJob.area || editedJob.location, // Send area in the correct field
        categories: Array.isArray(editedJob.categories) ? editedJob.categories : 
                   (editedJob.category ? [editedJob.category] : []),
        status: editedJob.status,
        biddingStartTime: editedJob.biddingStartTime,
        biddingEndTime: editedJob.biddingEndTime,
        milestones: editedJob.milestones
      };
      
      // Use the PUT endpoint
      const response = await axios.put(
        `http://localhost:5000/api/jobs/${jobId}`,
        jobData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.job) {
        // Remove reference to formattedJob - use current job state and response data
        const updatedJob = response.data.job;
        
        // Format the response data properly
        setJob({
          ...job, // Use existing job as base instead of formattedJob
          id: updatedJob._id || updatedJob.id || job.id,
          title: updatedJob.title,
          description: updatedJob.description || 'No description provided',
          minBudget: updatedJob.minBudget || '0',
          maxBudget: updatedJob.maxBudget || '0',
          location: updatedJob.area,
          area: updatedJob.area,
          categories: updatedJob.categories || [],
          category: updatedJob.category,
          status: updatedJob.status || 'Pending',
          auctionStarted: updatedJob.status === 'Active',
          milestones: updatedJob.milestones || []
        });
        
        setIsEditing(false);
        setSuccessMessage('Job details updated successfully!');
      }
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job details: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
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
      
      // FIXED: Update local job state WITHOUT creating a new job
      setJob(prevJob => ({
        ...prevJob,
        status: 'Active',
        auctionStarted: true,
        biddingStartTime: jobData.biddingStartTime
      }));
      
      setEditedJob(prevEdited => ({
        ...prevEdited,
        status: 'Active',
        auctionStarted: true,
        biddingStartTime: jobData.biddingStartTime
      }));
      
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

// Similarly update the handleStopAuction function
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
      
      // FIXED: Update local job state WITHOUT creating a new job
      setJob(prevJob => ({
        ...prevJob,
        status: 'Closed',
        auctionStarted: false,
        biddingEndTime: jobData.biddingEndTime
      }));
      
      setEditedJob(prevEdited => ({
        ...prevEdited,
        status: 'Closed',
        auctionStarted: false,
        biddingEndTime: jobData.biddingEndTime
      }));
      
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

// Add a new effect to check if the auction has ended automatically
useEffect(() => {
  // Only run this check if the auction is active
  if (job?.auctionStarted && job?.status === 'Active') {
    const checkAuctionEnd = () => {
      const now = new Date();
      const endTime = new Date(job.biddingEndTime);
      
      // If current time is past the end time, update status to Closed
      if (now > endTime) {
        // Update status in backend
        axios.put(`http://localhost:5000/api/jobs/${job._id}/auction-status`, {
          status: 'Closed'
        })
        .then(() => {
          // Update local state
          setJob(prevJob => ({
            ...prevJob,
            auctionStarted: false,
            status: 'Closed'
          }));
          setSuccessMessage('Auction has ended.');
          setTimeout(() => setSuccessMessage(''), 3000);
        })
        .catch(error => {
          console.error('Error updating auction status:', error);
          // Don't show error to user as this is automatic
        });
      }
    };

    // Check immediately
    checkAuctionEnd();
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkAuctionEnd, 60000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }
}, [job?.auctionStarted, job?.biddingEndTime, job?._id, job?.status]);

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

  // Add sorting function
  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to get sorted bids
  const getSortedBids = () => {
    if (!bids.length) return [];
    
    return [...bids].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'timeline':
          comparison = parseInt(a.timeline) - parseInt(b.timeline);
          break;
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'contractor':
          comparison = (a.contractor?.name || '').localeCompare(b.contractor?.name || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Replace the bids table header in the render section with this:
  const renderSortableHeader = (label, field) => {
    const isActive = sortField === field;
    
    return (
      <th 
        scope="col" 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <svg 
              className={`w-2 h-2 ${isActive && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg 
              className={`w-2 h-2 ${isActive && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </th>
    );
  };

  // Add a dedicated restart function that uses the correct endpoint
const handleRestartAuction = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Use the dedicated restart endpoint instead of the auction-status endpoint
    const response = await axios.put(
      `http://localhost:5000/api/jobs/${jobId}/restart`,
      {}, // Default to 7 days auction duration
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data && response.data.job) {
      const jobData = response.data.job;
      
      // Update local state with new job data
      setJob(prevJob => ({
        ...prevJob,
        status: 'Active',
        auctionStarted: true,
        biddingStartTime: jobData.biddingStartTime,
        biddingEndTime: jobData.biddingEndTime,
        wasReopened: true
      }));
      
      setEditedJob(prevEdited => ({
        ...prevEdited,
        status: 'Active',
        auctionStarted: true,
        biddingStartTime: jobData.biddingStartTime,
        biddingEndTime: jobData.biddingEndTime,
        wasReopened: true
      }));
      
      setSuccessMessage('Auction restarted successfully!');
    }
  } catch (err) {
    console.error('Error restarting auction:', err);
    setError('Failed to restart auction: ' + (err.response?.data?.error || err.message));
  } finally {
    setLoading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
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
    <ClientNavBar />
    
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <br /><br /><br /><br /><br />
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
  {/* Only show Edit button when auction is not active (status is not 'Active') */}
  {job?.status !== 'Active' && (
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
  
  {/* Start Auction button - only show if status is Pending */}
  {job?.status === 'Pending' && (
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
  
  {/* Stop Auction button - only show if status is Active */}
  {job?.status === 'Active' && (
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
  
  {/* Delete Job button - only show when auction is not active */}
  {job?.status !== 'Active' && (
    <button
      onClick={() => setShowDeleteConfirm(true)}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors"
    >
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete Job
    </button>
  )}

  {/* Restart Auction button */}
  {job?.status === 'Closed' && (
    <button
      onClick={handleRestartAuction} // Use the new function instead of handleStartAuction
      disabled={loading}
      className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Restart Auction
    </button>
  )}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
        <div className="mt-2 border border-gray-300 rounded-lg p-4 bg-white max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {['Plumbing', 'Electrical', 'Carpentry', 'Masonry', 'Painting', 'Roofing', 'Landscaping', 'Flooring', 'Interior Design'].map(category => (
              <div key={category} className="flex items-center">
                <input
                  id={`category-${category}`}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={Array.isArray(editedJob.categories) ? 
                    editedJob.categories.includes(category) : 
                    (editedJob.category === category)}
                  onChange={(e) => {
                    let currentCategories = Array.isArray(editedJob.categories) ? 
                      [...editedJob.categories] : 
                      (editedJob.category ? [editedJob.category] : []);
                    
                    if (e.target.checked) {
                      if (!currentCategories.includes(category)) {
                        currentCategories.push(category);
                      }
                    } else {
                      currentCategories = currentCategories.filter(cat => cat !== category);
                    }
                    
                    setEditedJob({
                      ...editedJob,
                      categories: currentCategories
                    });
                  }}
                />
                <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Area/Location</label>
  <select
    name="area"
    value={editedJob.area || editedJob.location || ''}
    onChange={(e) => {
      setEditedJob({
        ...editedJob,
        area: e.target.value,
        location: e.target.value, // Update both fields
      });
    }}
    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="" disabled>Select a district</option>
    {[
      'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
      'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
      'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
      'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
      'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ].map(district => (
      <option key={district} value={district}>
        {district}
      </option>
    ))}
  </select>
</div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Budget (LKR)</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">LKR</span>
          </div>
          <input
            type="text"
            name="minBudget"
            value={editedJob.minBudget || ''}
            onChange={(e) => {
              // Validate numeric input
              const value = e.target.value.replace(/[^\d.]/g, '');
              setEditedJob({...editedJob, minBudget: value});
            }}
            className="block w-full pl-12 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Budget (LKR)</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">LKR</span>
          </div>
          <input
            type="text"
            name="maxBudget"
            value={editedJob.maxBudget || ''}
            onChange={(e) => {
              // Validate numeric input
              const value = e.target.value.replace(/[^\d.]/g, '');
              setEditedJob({...editedJob, maxBudget: value});
            }}
            className="block w-full pl-12 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Budget validation message */}
      {parseFloat(editedJob.minBudget) > 0 && parseFloat(editedJob.maxBudget) > 0 && 
        parseFloat(editedJob.minBudget) >= parseFloat(editedJob.maxBudget) && (
        <div className="col-span-2 mt-0 mb-4">
          <p className="text-sm text-red-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Maximum budget must be greater than minimum budget
          </p>
        </div>
      )}
      
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
      
      {/* Milestones Section */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Project Milestones</h3>
        {(editedJob.milestones || []).map((milestone, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</span>
                <input
                  type="text"
                  value={milestone.name || ''}
                  onChange={(e) => {
                    const updatedMilestones = [...(editedJob.milestones || [])];
                    updatedMilestones[index].name = e.target.value;
                    setEditedJob({...editedJob, milestones: updatedMilestones});
                  }}
                  className="ml-2 border-0 bg-transparent font-medium focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Milestone name"
                />
              </div>
              <button 
                onClick={() => {
                  const updatedMilestones = (editedJob.milestones || []).filter((_, i) => i !== index);
                  setEditedJob({...editedJob, milestones: updatedMilestones});
                }}
                className="text-red-500 hover:text-red-700 focus:outline-none"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                value={milestone.description || ''}
                onChange={(e) => {
                  const updatedMilestones = [...(editedJob.milestones || [])];
                  updatedMilestones[index].description = e.target.value;
                  setEditedJob({...editedJob, milestones: updatedMilestones});
                }}
                rows="2"
                className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe this milestone..."
              ></textarea>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => {
            const updatedMilestones = [
              ...(editedJob.milestones || []), 
              {
                name: `Milestone ${(editedJob.milestones || []).length + 1}`,
                description: '',
                id: (editedJob.milestones || []).length + 1
              }
            ];
            setEditedJob({...editedJob, milestones: updatedMilestones});
          }}
          className="flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Milestone
        </button>
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
        disabled={loading || 
          !editedJob.title || 
          !(editedJob.categories || []).length || 
          !editedJob.area || 
          !editedJob.minBudget || 
          !editedJob.maxBudget ||
          parseFloat(editedJob.minBudget) >= parseFloat(editedJob.maxBudget)
        }
        className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors ${
          loading || 
          !editedJob.title || 
          !(editedJob.categories || []).length || 
          !editedJob.area || 
          !editedJob.minBudget || 
          !editedJob.maxBudget ||
          parseFloat(editedJob.minBudget) >= parseFloat(editedJob.maxBudget)
            ? 'opacity-50 cursor-not-allowed' 
            : ''
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
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
          <h3 className="text-lg font-medium text-gray-900 mb-3">Project Milestones</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 rounded-l-lg">Name</th>
                    <th scope="col" className="px-4 py-3 rounded-r-lg">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {job?.milestones?.length > 0 ? (
                    job.milestones.map((milestone, index) => (
                      <tr key={index} className="bg-white border-b">
                        <td className="px-4 py-3 font-medium text-gray-900">{milestone.name}</td>
                        <td className="px-4 py-3 text-gray-600">{milestone.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white border-b">
                      <td colSpan="2" className="px-4 py-3 text-gray-500 text-center">
                        No milestones have been defined yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Estimated Budget</p>
            <div className="mt-1">
              <span className="text-2xl font-bold text-gray-800">
                LKR {job?.minBudget || '0'} - {job?.maxBudget || '0'}
              </span>
            </div>
          </div>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            job?.status === 'Closed' 
              ? 'bg-red-100 text-red-800'
              : job?.status === 'Active'
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}> 
            <span className={`w-2 h-2 mr-2 rounded-full ${
              job?.status === 'Closed'
                ? 'bg-red-600'
                : job?.status === 'Active'
                  ? 'bg-green-600' 
                  : 'bg-yellow-500'
            }`}></span>
            {job?.status === 'Closed' 
              ? "Auction Ended" 
              : job?.status === 'Active'
                ? "Auction Active" 
                : "Auction Not Started"}
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
    {job?.status === 'Active' && (
      <BidListingSection 
        bids={bids} 
        jobId={jobId} 
        refreshBids={() => {
          // Function to refresh bids from the server
          const fetchBids = async () => {
            try {
              const bidsResponse = await axios.get(`http://localhost:5000/bids/project/${jobId}`);
              
              const formattedBids = bidsResponse.data.map(bid => ({
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
              }));
              
              setBids(formattedBids);
            } catch (err) {
              console.error('Error fetching bids:', err);
            }
          };
          
          fetchBids();
        }}
      />
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
