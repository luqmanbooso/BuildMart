import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import logo from '../assets/images/buildmart_logo1.png';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import ClientNavBar from '../components/ClientNavBar';
import AddJobForm from '../components/AddJobForm';
import EditUserDetails from '../components/EditUserDetails'; // Add this import

// Enhanced ProfileImage component with larger size options

function ProfileImage({ profilePicPath, className = "", size = "medium" }) {
  // Check if the path is a full URL or just a relative path
  const imgSrc = profilePicPath
    ? profilePicPath.startsWith('http') 
      ? profilePicPath 
      : `http://localhost:5000${profilePicPath}`
    : '/default-profile.png'; // Fallback image

  // Size map with expanded options
  const sizeMap = {
    small: "h-10 w-10",
    medium: "h-16 w-16", 
    large: "h-20 w-20",
    xlarge: "h-24 w-24",  // New larger size (96px)
    xxlarge: "h-32 w-32"  // New extra large size (128px)
  };
  
  // Get size class or default to passed dimensions
  const sizeClass = sizeMap[size] || "";
  
  // Combine size with passed className
  const containerClasses = `${sizeClass} ${className} rounded-full overflow-hidden flex-shrink-0 bg-gray-50`;

  return (
    <div className={containerClasses} style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Background placeholder with subtle pattern */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.2) 100%)"
        }}
      ></div>
      {/* Perfect circle mask with aspect ratio enforcement */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative' 
        }}>
          <img 
            src={imgSrc} 
            alt="Profile" 
            className="absolute inset-0 w-full h-full rounded-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              e.target.src = '/default-profile.png';
              console.log("Failed to load profile image:", profilePicPath);
            }} 
          />
        </div>
      </div>
    </div>
  );
}

const UserProfilePage = () => {
  const navigate = useNavigate(); // Add this hook
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    memberSince: 'January 2023',
    completedProjects: 12,
    ongoingProjects: 3,
    rating: 4.8,
    requests: []
  });

  const [activeTab, setActiveTab] = useState('requirements');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    category: '',
    area: '',
    minBudget: '',
    maxBudget: '',
    description: '',
    biddingStartTime: new Date().toISOString().substr(0, 16),
    biddingEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 16),
    milestones: [] // Add this empty array for milestones
  });

  // Add these state variables at the top of the component
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: ''
  });

  // Add these state variables
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add this state to track form steps
  const [formStep, setFormStep] = useState(1);

  // Add these state variables in the UserProfilePage component
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Fetch user info from token and then get complete profile from API
    if (token) {
      try {
        // Decode the token to get user data
        const decoded = jwtDecode(token);

        // Create a user object from the decoded token
        const userData = {
          _id: decoded.userId,
          username: decoded.username,
          email: decoded.email, 
          role: decoded.role,
        };

        // Set basic user data from token
        setUser(prevUser => ({
          ...prevUser,
          name: userData.username || prevUser.name,
          email: userData.email || prevUser.email,
        }));
        
        // Fetch complete user profile including profile pic
        fetchUserProfile(decoded.userId, token);
        
        // Fetch jobs from API
        fetchJobs();
        
        // Add these lines:
        fetchPaymentHistory();
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Add this new function to fetch complete user profile
  const fetchUserProfile = async (userId, token) => {
    try {
      const response = await axios.get(`http://localhost:5000/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.user) {
        setUser(prevUser => ({
          ...prevUser,
          name: response.data.user.username || prevUser.name,
          email: response.data.user.email || prevUser.email,
          profilePic: response.data.user.profilePic || null
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Function to fetch jobs
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Decode token to get userId
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      
      // Include userId as query parameter
      const response = await axios.get(`http://localhost:5000/api/jobs?userid=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch jobs');
      }
      
      const jobs = response.data;
      
      // Format jobs for display
      const formattedJobs = jobs.map(job => ({
        id: job._id,
        title: job.title,
        category: job.category,
        area: job.area,
        budget: `LKR : ${job.budget}`,
        status: job.status,
        date: new Date(job.date).toLocaleDateString('en-GB', { 
          day: '2-digit', month: 'short', year: 'numeric' 
        }),
        bids: job.bids
      }));
      
      // Update user state with fetched jobs
      setUser(prevUser => ({
        ...prevUser,
        requests: formattedJobs
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleAddJob = () => {
    setShowAddJobForm(true);
  };

  const addMilestone = () => {
    const newId = newJob.milestones.length + 1;
    setNewJob({
      ...newJob,
      milestones: [
        ...newJob.milestones,
        { id: newId, name: `Milestone ${newId}`, description: '' }
      ]
    });
  };

  const removeMilestone = (id) => {
    setNewJob({
      ...newJob,
      milestones: newJob.milestones.filter(milestone => milestone.id !== id)
    });
  };

  const updateMilestone = (id, field, value) => {
    setNewJob({
      ...newJob,
      milestones: newJob.milestones.map(milestone => 
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    });
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    
    try {
      // Get the token from storage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Decode token to get userId
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      
      // Validate form
      if (!newJob.title || !newJob.category || !newJob.area || 
          !newJob.minBudget || !newJob.maxBudget || 
          !newJob.biddingStartTime || !newJob.biddingEndTime) {
        alert('Please fill all required fields including budgets and bidding times.');
        return;
      }
      
      // Validate that maxBudget is greater than minBudget
      if (Number(newJob.minBudget) >= Number(newJob.maxBudget)) {
        alert('Maximum budget must be greater than minimum budget.');
        return;
      }
      
      // Format the job data for API submission
      const jobData = {
        userid: userId,
        title: newJob.title,
        category: newJob.category,
        area: newJob.area,
        minBudget: newJob.minBudget,
        maxBudget: newJob.maxBudget,
        description: newJob.description,
        biddingStartTime: newJob.biddingStartTime,
        biddingEndTime: newJob.biddingEndTime,
        milestones: newJob.milestones // Add this line to include milestones
      };
      
      // Make the API request using axios
      const response = await axios.post('http://localhost:5000/api/jobs', jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Extract data from axios response
      const data = response.data;
      
      // Update UI with the new job from API response
      const newJobRequest = {
        id: data.job._id || (user.requests.length + 1).toString().padStart(2, '0'),
        title: data.job.title,
        category: data.job.category,
        area: data.job.area,
        budget: `LKR ${data.job.minBudget} - ${data.job.maxBudget}`,
        status: data.job.status || 'Pending',
        date: new Date(data.job.date).toLocaleDateString('en-GB', { 
          day: '2-digit', month: 'short', year: 'numeric' 
        }),
        bids: data.job.bids || 0
      };
      
      // Update local state with the new job
      setUser({
        ...user,
        requests: [...user.requests, newJobRequest]
      });
      
      // Reset form and close modal
      setShowAddJobForm(false);
      setNewJob({
        title: '',
        category: '',
        area: '',
        minBudget: '',
        maxBudget: '',
        description: '',
        biddingStartTime: new Date().toISOString().substr(0, 16),
        biddingEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 16),
        milestones: [] // Add this empty array for milestones
      });
      
      // Show success message
      alert('Job created successfully! You can set up milestones after accepting a bid.');
      
    } catch (error) {
      console.error('Error creating job:', error.response ? error.response.data : error.message);
      alert(`Failed to create job: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  // Add these functions to handle user actions
  const handleLogout = () => {
    // Clear tokens from storage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/login');
  };

  const handleEditProfileClick = () => {
    setShowEditProfileForm(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      // Get the authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to delete your account");
        return;
      }
      
      // Get user ID from token
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      
      // Make the API call to delete the account
      const response = await axios.delete(
        `http://localhost:5000/auth/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Handle successful deletion
      if (response.status === 200) {
        // Clear tokens from storage
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Show success message (could use a more subtle approach like toast)
        alert('Your account has been deleted successfully.');
        
        // Redirect to login page
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Show a meaningful error message
      const errorMessage = error.response?.data?.error || 
                          'Failed to delete account. Please try again.';
      setError(errorMessage);
      
      // Hide the error message after a few seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`); // Navigate to the ActiveJob page with the job ID
  };

  const handleTabClick = (tab) => {
    if (tab === 'ongoing') {
      // Navigate to the ongoing works page
      navigate('/ongoing-works');
    } else {
      // For other tabs, just update the active tab state
      setActiveTab(tab);
    }
  };

  const validateBudgetInput = (value) => {
    // Remove any non-digit characters except decimal point
    const sanitized = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return sanitized;
  };
  
  const handleBudgetChange = (field, value) => {
    const validValue = validateBudgetInput(value);
    setNewJob({ ...newJob, [field]: validValue });
  };

  // Add these navigation functions
  const nextStep = () => {
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const pastWorks = [
    { id: '01', title: 'Living Room Painting', contractor: 'Color Masters', completionDate: '10 Jan 2025', rating: 4.5 },
    { id: '02', title: 'Fence Installation', contractor: 'Garden Pros', completionDate: '5 Dec 2024', rating: 5.0 }
  ];

  const paymentHistoryStatic = [
    { id: 'PMT001', description: 'Advance Payment - Kitchen Renovation', amount: 'LKR 25,000', date: '15 Jan 2025', status: 'Completed' },
    { id: 'PMT002', description: 'Final Payment - Living Room Painting', amount: 'LKR 15,000', date: '12 Jan 2025', status: 'Completed' },
    { id: 'PMT003', description: 'Advance Payment - Bathroom Plumbing', amount: 'LKR 8,000', date: '1 Mar 2025', status: 'Pending' }
  ];

  // Add this function to fetch payment history
const fetchPaymentHistory = async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return;

  try {
    setIsLoadingPayments(true);
    setPaymentError(null);
    
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    
    // Fetch payments for this user - ensure userId is properly passed
    const response = await axios.get(`http://localhost:5000/api/payments`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { userId: userId } // This will properly include userId as a query param
    });
    
    // Check if response contains payments data
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid payment data received:', response.data);
      setPaymentError('Failed to load payment history: Invalid data format');
      setPaymentHistory([]);
      return;
    }
    
    // Filter payments to include only this user's payments
    // This is a client-side safety measure in case server filtering isn't working
    const userPayments = response.data.filter(payment => 
      payment.user && 
      (payment.user.userId === userId || payment.user.userId?.toString() === userId.toString())
    );
    
    // Format the payment data for display
    const formattedPayments = userPayments.map(payment => ({
      id: payment._id,
      description: getPaymentDescription(payment),
      amount: `LKR ${payment.amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      date: new Date(payment.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
      status: payment.status === 'completed' ? 'Completed' : 
              payment.status === 'pending' ? 'Pending' : 'Failed',
      paymentType: payment.paymentType || 'other',
      cardType: payment.cardType,
      lastFourDigits: payment.lastFourDigits
    }));
    
    console.log(`Found ${formattedPayments.length} payments for user ${userId}`);
    setPaymentHistory(formattedPayments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    setPaymentError('Failed to load payment history. Please try again later.');
  } finally {
    setIsLoadingPayments(false);
  }
};

  // Helper function to generate payment descriptions
  const getPaymentDescription = (payment) => {
    if (payment.paymentType === 'milestone') {
      return `Milestone Payment - Work #${payment.workId}`;
    } else if (payment.paymentType === 'inventory') {
      return `Purchase - ${payment.order?.items.length || 0} items`;
    } else if (payment.paymentType === 'agreement_fee') {
      return 'Agreement Fee';
    } else {
      return 'Payment';
    }
  };
  

  // Add this debugging function
const debugPaymentData = async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return;
  
  try {
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    
    console.log('Current user ID:', userId);
    
    // Fetch all payments without filtering
    const response = await axios.get(`http://localhost:5000/api/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('All payments:', response.data);
    
    // Check which payments match this user
    const matchingPayments = response.data.filter(payment => 
      payment.user && payment.user.userId === userId
    );
    
    console.log('Matching payments count:', matchingPayments.length);
    console.log('Matching payments:', matchingPayments);
  } catch (error) {
    console.error('Debug error:', error);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
   
    <ClientNavBar/>
    
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-800">
        <br /><br /><br />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold text-white leading-tight">My <span className="text-blue-300">Account</span></h1>
          <p className="mt-4 text-blue-200 max-w-xl">Manage your projects, track bids, and connect with top professionals in the construction industry.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Updated Left Sidebar */}
            <div className="lg:w-1/4">
  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
    <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600"></div> {/* Increased header height */}
    <div className="relative px-6 pb-6">
      <div className="flex justify-center">
        <div className="absolute -top-14 rounded-full border-4 border-white p-1 bg-white shadow-md"> {/* Lower position and add shadow */}
          {user.profilePic ? (
            <ProfileImage 
              profilePicPath={user.profilePic}
              size="xlarge" // Use xlarge size instead of explicit dimensions
              className="rounded-full object-cover shadow-inner"
            />
          ) : (
            <div className="h-24 w-24 bg-blue-500 rounded-full flex justify-center items-center"> {/* Increased size */}
              <span className="text-white text-2xl font-semibold">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-20 text-center"> {/* Increased margin-top to accommodate larger image */}
        <h2 className="text-lg font-bold text-gray-800">{user.name || 'User'}</h2>
        <p className="text-sm text-gray-500 mb-6">{user.email || 'email@example.com'}</p>
        
        <div className="space-y-3">
          <button 
            onClick={handleEditProfileClick}
            className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profile
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

            {/* Right Content */}
            <div className="lg:w-3/4">
              <div className="flex flex-wrap justify-start gap-2 mb-6">
                {['requirements', 'ongoing', 'past', 'payments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`font-medium py-2 px-4 rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'requirements' ? 'My Requirements' : 
                     tab === 'ongoing' ? 'Ongoing Works' :
                     tab === 'past' ? 'Past Works' :
                     'Payment History'}
                  </button>
                ))}
                <button
                  onClick={handleAddJob}
                  className="font-medium py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
                >
                  Add New Job
                </button>
              </div>

              <div className="mt-8">
                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    {user.requests.length > 0 ? (
                      <>
                        <div className="flex justify-end mb-4">
  <button 
    onClick={() => handleTabClick('ongoing')}
    className="text-sm text-blue-600 hover:text-blue-800 flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
  >
    <span>View Ongoing Work</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>

                        {/* Existing requirements list */}
                        {user.requests.map((request, index) => (
                          <div
                            key={`${request.id}-${index}`}
                            className="p-4 rounded-lg shadow-md bg-white border border-gray-300 flex justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleJobClick(request.id)}
                          >
                            <div>
                              <h3 className="font-medium text-gray-800">{request.title}</h3>
                              <p className="text-sm text-gray-600">{request.category}</p>
                              <p className="text-xs text-gray-400">{request.date}</p>
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                  request.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      // Empty state with guidance
                      <div className="bg-white rounded-lg shadow-md p-10 text-center border border-dashed border-gray-300">
                        <div className="flex justify-center">
                          <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mt-5">No Job Requirements Yet</h3>
                        <p className="text-gray-600 mt-2 max-w-md mx-auto">
                          Post your first construction project requirement to start receiving bids from qualified contractors.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={handleAddJob}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center mx-auto"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Post Your First Project
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ongoing' && (
                  <div className="bg-white rounded-lg shadow-md p-10 text-center border border-dashed border-gray-300">
                    <div className="flex justify-center">
                      <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mt-5">No Ongoing Projects</h3>
                    <p className="text-gray-600 mt-2 max-w-md mx-auto">
                      You don't have any ongoing projects at the moment. When contractors begin working on your projects, they'll appear here.
                    </p>
                  </div>
                )}

                {activeTab === 'past' && (
                  <div className="bg-white rounded-lg shadow-md p-10 text-center border border-dashed border-gray-300">
                    <div className="flex justify-center">
                      <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mt-5">No Completed Projects</h3>
                    <p className="text-gray-600 mt-2 max-w-md mx-auto">
                      Your completed projects will be shown here once contractors finish their work. You'll be able to leave reviews and ratings.
                    </p>
                  </div>
                )}

                {activeTab === 'payments' && (
  <div>
    <div className="mb-4 flex justify-between items-center">
      <h3 className="text-xl font-semibold text-gray-800">Payment History</h3>
      
    </div>
    
    {isLoadingPayments ? (
      <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-gray-200">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    ) : paymentError ? (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">{paymentError}</p>
        <button 
          onClick={fetchPaymentHistory}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    ) : paymentHistory.length === 0 ? (
      <div className="bg-white rounded-lg shadow-md p-10 text-center border border-dashed border-gray-300">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-medium text-gray-800 mt-5">No Payment History Yet</h3>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Your payment history will appear here once you make payments for projects or purchase construction materials.
        </p>
      </div>
    ) : (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Card
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentHistory.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                  <div className="text-xs text-gray-500">{payment.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="capitalize">{payment.cardType}</span>
                    <span className="ml-1 text-xs">•••• {payment.lastFourDigits}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

                {showAddJobForm && (
  <AddJobForm 
    onClose={() => setShowAddJobForm(false)} 
    onJobAdded={(newJob) => {
      setUser({
        ...user,
        requests: [...user.requests, newJob]
      });
    }}
  />
)}

                {/* Replace the existing Edit Profile Modal with EditUserDetails component */}
{showEditProfileForm && (
  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        onClick={() => setShowEditProfileForm(false)}
      ></div>

      {/* Modal Panel */}
      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <EditUserDetails 
          userData={{
            _id: undefined, // Will be extracted from token in the component
            username: user.name,
            email: user.email,
            profilePic: user.profilePic
          }}
          onClose={() => setShowEditProfileForm(false)}
          onUserUpdate={(updatedUser) => {
            setUser({
              ...user,
              name: updatedUser.username,
              email: updatedUser.email,
              profilePic: updatedUser.profilePic
            });
            // Show success message
            setSuccessMessage("Profile updated successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
          }}
        />
      </div>
    </div>
  </div>
)}

                {/* Delete Account Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      {/* Background overlay */}
                      <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" 
                        aria-hidden="true"
                        onClick={() => setShowDeleteConfirm(false)}
                      ></div>

                      {/* Modal Panel */}
                      <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-6 pt-5 pb-6">
                          <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Your Account</h3>
                            <div className="mt-3">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete your account? All of your data including projects, bids, and payment history will be permanently removed. This action cannot be undone.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Delete Account
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading, Error, and Success Messages */}
                {isLoading && (
                  <div className="fixed top-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md shadow-md z-50">
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating profile...
                    </div>
                  </div>
                )}

                {error && (
                  <div className="fixed top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-md z-50">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="fixed top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-md shadow-md z-50">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {successMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
