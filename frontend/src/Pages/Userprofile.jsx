import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import logo from '../assets/images/buildmart_logo1.png';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

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
    budget: '',
    description: '',
    biddingStartTime: new Date().toISOString().substr(0, 16),
    biddingEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 16), // Default 3 days later
    milestones: [
      { id: 1, name: 'Initial Payment', amount: '', description: 'Payment made at the start of the project' }
    ]
  });

  // Add these state variables at the top of the component
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Fetch user info from token
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

        // Set the user state from the decoded data
        setUser(prevUser => ({
          ...prevUser,
          name: userData.username || prevUser.name,
          email: userData.email || prevUser.email,
        }));
        
        // Fetch jobs from API
        fetchJobs();
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

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
        { id: newId, name: `Milestone ${newId}`, amount: '', description: '' }
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
      if (!newJob.title || !newJob.category || !newJob.area || !newJob.budget || 
        !newJob.biddingStartTime || !newJob.biddingEndTime) {
        alert('Please fill all required fields including bidding start and end times.');
        return;
      }
      
      // Format the job data for API submission
      const jobData = {
        userid: userId, // Add the user ID from the token
        title: newJob.title,
        category: newJob.category,
        area: newJob.area,
        budget: newJob.budget,
        description: newJob.description, // Make sure description is included
        biddingStartTime: newJob.biddingStartTime,
        biddingEndTime: newJob.biddingEndTime, // Added bidding end time
        milestones: newJob.milestones.map(milestone => ({
          name: milestone.name,
          amount: milestone.amount,
          description: milestone.description
        }))
      };
      
      // Make the API request using axios with the full URL
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
        budget: `LKR : ${data.job.budget}`,
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
        budget: '',
        description: '',
        biddingStartTime: new Date().toISOString().substr(0, 16),
        biddingEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 16), // Default 3 days later
        milestones: [
          { id: 1, name: 'Initial Payment', amount: '', description: 'Payment made at the start of the project' }
        ]
      });
      
      // Show success message
      alert('Job created successfully!');
      
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
    // Initialize form with current user data
    setEditedProfile({
      name: user.name || '',
      email: user.email || ''
    });
    setShowEditProfileForm(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would make an API call to update the user profile
      // For now, just update the local state
      setUser({
        ...user,
        name: editedProfile.name,
        email: editedProfile.email
      });
      
      setShowEditProfileForm(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Here you would make an API call to delete the account
      // Using the auth endpoint we can see in the attached files
      
      // Clear tokens from storage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Redirect to login page
      navigate('/login');
      
      alert('Your account has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
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


  const pastWorks = [
    { id: '01', title: 'Living Room Painting', contractor: 'Color Masters', completionDate: '10 Jan 2025', rating: 4.5 },
    { id: '02', title: 'Fence Installation', contractor: 'Garden Pros', completionDate: '5 Dec 2024', rating: 5.0 }
  ];

  const paymentHistory = [
    { id: 'PMT001', description: 'Advance Payment - Kitchen Renovation', amount: 'LKR 25,000', date: '15 Jan 2025', status: 'Completed' },
    { id: 'PMT002', description: 'Final Payment - Living Room Painting', amount: 'LKR 15,000', date: '12 Jan 2025', status: 'Completed' },
    { id: 'PMT003', description: 'Advance Payment - Bathroom Plumbing', amount: 'LKR 8,000', date: '1 Mar 2025', status: 'Pending' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="BuildMart Logo" className="h-15" />
          </div>
          <nav className="hidden lg:flex space-x-8">
            {['Home', 'Auction', 'Projects', 'About Us', 'Contact Us'].map((item) => (
              <a key={item} href="#" className="font-medium relative group text-gray-600 hover:text-gray-900 transition-colors duration-300">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 p-2">
                  <div className="p-3">
                    <h3 className="font-medium">Notifications</h3>
                    <div className="mt-2 p-2 rounded-lg bg-blue-50 flex items-start space-x-3">
                      <div className="bg-blue-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">New bid received</p>
                        <p className="text-gray-500">You received a new bid on your kitchen project</p>
                        <p className="text-xs text-blue-500 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-800">
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
                <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="relative px-6 pb-6">
                  <div className="flex justify-center">
                    <div className="absolute -top-10 rounded-full border-4 border-white p-1 bg-white">
                      <div className="h-16 w-16 bg-blue-500 rounded-full flex justify-center items-center">
                        <span className="text-white text-xl">{user.name ? user.name[0] : 'U'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 text-center">
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
                {['requirements', 'ongoing', 'past', 'payments', 'transactions'].map((tab) => (
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
                     tab === 'payments' ? 'Payment History' :
                     'Transaction History'}
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
                    {user.requests.map((request, index) => (
                      <div
                        key={`${request.id}-${index}`}
                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300 flex justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleJobClick(request.id)} // Add onClick handler
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
                  </div>
                )}

                {activeTab === 'ongoing' && (
                  <div className="space-y-4">
                    {ongoingWorks.map((work) => (
                      <div
                        key={work.id}
                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-800">{work.title}</h3>
                          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-500 text-white">
                            In Progress
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Contractor: {work.contractor}</p>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 w-20">Progress:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: work.progress }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs font-medium text-gray-500">{work.progress}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex text-xs text-gray-500">
                          <p>Started: {work.startDate}</p>
                          <p className="ml-4">Due: {work.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'past' && (
                  <div className="space-y-4">
                    {pastWorks.map((work) => (
                      <div
                        key={work.id}
                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-800">{work.title}</h3>
                          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-500 text-white">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Contractor: {work.contractor}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-xs text-gray-500">Completed on: {work.completionDate}</p>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 mr-1">Rating:</span>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(work.rating) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-xs text-gray-600">({work.rating})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'payments' && (
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{payment.description}</div>
                              <div className="text-xs text-gray-500">{payment.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <p className="mt-4 text-gray-500">Your transaction history will be displayed here soon.</p>
                )}

                {showAddJobForm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      {/* Background overlay with blur effect */}
                      <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-md transition-opacity" 
                        aria-hidden="true"
                        onClick={() => setShowAddJobForm(false)}
                      ></div>

                      {/* Modal Panel */}
                      <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-blue-100">
                        <div className="relative">
                          {/* Enhanced Header with pattern background */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '15px 15px'}}></div>
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                              <div className="flex items-start">
                                <div className="bg-white/20 p-3 rounded-xl mr-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h2 className="text-3xl font-bold text-white leading-tight">Create New Project</h2>
                                  <p className="text-blue-200 text-sm mt-2">Fill in the details to post your construction project and receive bids from qualified professionals</p>
                                  <div className="flex items-center mt-3 text-xs text-blue-200">
                                    <div className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>All fields marked with * are required</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowAddJobForm(false)}
                                className="rounded-full p-2 text-white bg-white/20 hover:bg-white/30 focus:outline-none transition-colors duration-200 hover:rotate-90 transform"
                              >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Form with progress steps */}
                          <div className="bg-white px-0 py-0 max-h-[80vh] overflow-y-auto">
                            {/* Progress Bar */}
                            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                              <div className="flex items-center justify-between max-w-3xl mx-auto">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">1</div>
                                  <span className="text-xs font-medium mt-1 text-blue-600">Basic Info</span>
                                </div>
                                <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">2</div>
                                  <span className="text-xs font-medium mt-1 text-gray-500">Timeline</span>
                                </div>
                                <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">3</div>
                                  <span className="text-xs font-medium mt-1 text-gray-500">Milestones</span>
                                </div>
                              </div>
                            </div>

                            <form onSubmit={handleSubmitJob} className="px-8 py-6">
                              {/* Form Content with Cards */}
                              <div className="space-y-8">
                                {/* Project Details Card */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                      Project Details
                                    </h3>
                                  </div>

                                  <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </div>
                                          <input
                                            type="text"
                                            value={newJob.title}
                                            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                            className="pl-10 block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                            placeholder="Enter a descriptive title for your project"
                                            required
                                          />
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500">Be specific and clear to attract the right professionals</p>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                          </div>
                                          <select
                                            value={newJob.category}
                                            onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                                            className="pl-10 block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none text-gray-900"
                                            required
                                          >
                                            <option value="">Select a category</option>
                                            <option value="Plumbing">Plumbing</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Carpentry">Carpentry</option>
                                            <option value="Masonry">Masonry</option>
                                            <option value="Painting">Painting</option>
                                            <option value="Roofing">Roofing</option>
                                            <option value="Landscaping">Landscaping</option>
                                            <option value="Other">Other</option>
                                          </select>
                                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Area/Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                          </div>
                                          <input
                                            type="text"
                                            value={newJob.area}
                                            onChange={(e) => setNewJob({ ...newJob, area: e.target.value })}
                                            className="pl-10 block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                            placeholder="City, District, or Region"
                                            required
                                          />
                                        </div>
                                      </div>

                                      <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Description <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <textarea
                                            value={newJob.description}
                                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                            className="block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                            rows="4"
                                            placeholder="Provide detailed information about your project requirements, specifications, materials needed, and any special considerations..."
                                            required
                                          ></textarea>
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500">
                                          The more details you provide, the more accurate bids you'll receive. Be sure to include dimensions, materials, timeline constraints, etc.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Budget & Timeline Card */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Budget & Timeline
                                    </h3>
                                  </div>

                                  <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Total Budget (LKR) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative rounded-lg shadow-sm">
                                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm font-medium">LKR</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={newJob.budget}
                                            onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                                            className="pl-14 block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                            placeholder="0.00"
                                            required
                                          />
                                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                          </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500">Enter your approximate budget for the entire project</p>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Bidding Start Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                          </div>
                                          <input
                                            type="datetime-local"
                                            value={newJob.biddingStartTime}
                                            onChange={(e) => setNewJob({ ...newJob, biddingStartTime: e.target.value })}
                                            className="pl-10 block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                            required
                                          />
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500">When should professionals start bidding on your project?</p>
                                      </div>

                                      <div className="col-span-2">
                                        <label htmlFor="biddingEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                                          Bidding End Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                          <input
                                            type="datetime-local"
                                            id="biddingEndTime"
                                            name="biddingEndTime"
                                            value={newJob.biddingEndTime}
                                            onChange={(e) => {
                                              const startTime = new Date(newJob.biddingStartTime);
                                              const selectedEndTime = new Date(e.target.value);
                                              const maxEndTime = new Date(startTime.getTime() + 3 * 24 * 60 * 60 * 1000);
                                              
                                              // If selected time is beyond 3 days, use the max allowed time
                                              const validEndTime = selectedEndTime > maxEndTime ? 
                                                maxEndTime.toISOString().substr(0, 16) : 
                                                e.target.value;
                                                
                                              setNewJob({...newJob, biddingEndTime: validEndTime});
                                            }}
                                            className="pl-10 block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                                            min={newJob.biddingStartTime}
                                            required
                                          />
                                        </div>
                                        <div className="mt-1.5 flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <p className="text-xs text-gray-500">Set a deadline for bids to ensure you receive timely responses. Maximum bidding period is 3 days from start time.</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Milestones Card */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        Payment Milestones
                                      </h3>
                                      <button
                                        type="button"
                                        onClick={addMilestone}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Milestone
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Break down your project into manageable payment phases</p>
                                  </div>

                                  <div className="p-6">
                                    <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                                      {newJob.milestones.map((milestone, index) => (
                                        <div 
                                          key={milestone.id} 
                                          className="bg-blue-50 p-5 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors relative"
                                        >
                                          {/* Milestone header with decorative elements */}
                                          <div className="flex justify-between mb-4">
                                            <div className="flex items-center">
                                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mr-3 border-2 border-white shadow-sm">
                                                {index + 1}
                                              </div>
                                              <h4 className="font-medium text-gray-800 text-base">Milestone {index + 1}</h4>
                                            </div>
                                            {newJob.milestones.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => removeMilestone(milestone.id)}
                                                className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors absolute top-2 right-2"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                              </button>
                                            )}
                                          </div>
                                          
                                          {/* Milestone form fields with enhanced styling */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Milestone Name <span className="text-red-500">*</span>
                                              </label>
                                              <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                  </svg>
                                                </div>
                                                <input
                                                  type="text"
                                                  value={milestone.name}
                                                  onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                                  className="pl-9 block w-full px-4 py-3 border border-blue-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                                  placeholder="e.g., Foundation Completion"
                                                  required
                                                />
                                              </div>
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Amount (LKR) <span className="text-red-500">*</span>
                                              </label>
                                              <div className="relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                  <span className="text-gray-500 sm:text-xs font-medium">LKR</span>
                                                </div>
                                                <input
                                                  type="text"
                                                  value={milestone.amount}
                                                  onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                                                  className="pl-12 block w-full px-4 py-3 border border-blue-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                                  placeholder="0.00"
                                                  required
                                                />
                                              </div>
                                            </div>
                                            <div className="md:col-span-2">
                                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                                              <div className="relative">
                                                <textarea
                                                  value={milestone.description}
                                                  onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                                  className="block w-full px-4 py-3 border border-blue-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                                  rows="2"
                                                  placeholder="What does this milestone involve?"
                                                ></textarea>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-10 flex justify-end space-x-4">
                                <button
                                  type="button"
                                  onClick={() => setShowAddJobForm(false)}
                                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all hover:shadow-lg"
                                >
                                  Post Project
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Profile Modal */}
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
                      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-blue-100">
                        <div className="relative">
                          {/* Modal Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 relative">
                            <div className="flex justify-between items-center relative">
                              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                              <button 
                                onClick={() => setShowEditProfileForm(false)}
                                className="rounded-full p-1 text-white bg-white/20 hover:bg-white/30 focus:outline-none transition-colors"
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Form Content */}
                          <form onSubmit={handleSaveProfile} className="p-6">
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  value={editedProfile.name}
                                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Your name"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  value={editedProfile.email}
                                  onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Your email address"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => setShowEditProfileForm(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
