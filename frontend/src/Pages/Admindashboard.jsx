import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaClipboardList, FaSearch, FaBell, FaSignOutAlt, 
  FaChartLine, FaUsers, FaBuilding, FaTasks, FaBoxOpen,
  FaTruckMoving, FaWrench, FaChevronRight, FaEllipsisH, 
  FaCircle, FaAngleDown, FaCalendar, FaCheck, FaClock, FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import buildMartLogo from '../assets/images/buildmart_logo1.png';
import { useNavigate } from 'react-router-dom';
import UsersManagement from '../components/UserManagement';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Admindashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [userStats, setUserStats] = useState({ clients: 0, serviceProviders: 0 });
  const [activeUsers, setActiveUsers] = useState({ clients: [], serviceProviders: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Add these new state variables for full user lists
  const [allClients, setAllClients] = useState([]);
  const [allServiceProviders, setAllServiceProviders] = useState([]);
  
  // Job/project data state variables
  const [jobStats, setJobStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    pending: 0
  });
  const [contractorStats, setContractorStats] = useState({
    total: 0,
    verified: 0,
    specializations: {}
  });
  const [visitorStats, setVisitorStats] = useState({
    thisWeek: [0, 0, 0, 0, 0, 0, 0],
    lastWeek: [0, 0, 0, 0, 0, 0, 0]
  });
  
  const menuItems = [
    { name: 'Dashboard', icon: <FaChartLine /> },
    { name: 'Users', icon: <FaUsers /> },
    { name: 'Client\'s Requests', icon: <FaClipboardList /> },
    { name: 'Bids Management', icon: <FaBoxOpen /> },
    { name: 'Messages', icon: <FaWrench /> },
    { name: 'Inquiries', icon: <FaBuilding /> },
  ];

  // Add this new state for client requests/jobs
  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Add states for bids management
  const [allBids, setAllBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [bidStats, setBidStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  });

  // Function to handle viewing bid details
  const [selectedBid, setSelectedBid] = useState(null);

  const handleViewBidDetails = (bid) => {
    setSelectedBid(bid);
  };

  // Function to handle bid status changes
  const handleBidStatusChange = async (bidId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/bids/${bidId}/status`, { status: newStatus });
      
      // Update local state to reflect the change
      setAllBids(prevBids => 
        prevBids.map(bid => 
          bid._id === bidId ? { ...bid, status: newStatus } : bid
        )
      );
      
      // Update statistics
      setBidStats(prev => {
        const bid = allBids.find(b => b._id === bidId);
        const oldStatus = bid ? bid.status : 'pending';
        
        return {
          ...prev,
          [oldStatus]: prev[oldStatus] - 1,
          [newStatus]: prev[newStatus] + 1
        };
      });
      
    } catch (error) {
      console.error("Failed to update bid status:", error);
    }
  };

  // Check for admin token when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/auth/users');
        
        const clients = response.data.filter(user => user.role === 'Client');
        const serviceProviders = response.data.filter(user => user.role === 'Service Provider');
        
        setUserStats({
          clients: clients.length,
          serviceProviders: serviceProviders.length,
        });
        
        // Get most recently active users
        setActiveUsers({
          clients: clients.slice(0, 5),
          serviceProviders: serviceProviders.slice(0, 5)
        });
        
        // Store all users
        setAllClients(clients);
        setAllServiceProviders(serviceProviders);
        
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Create dummy data as fallback
        setUserStats({
          clients: 12,
          serviceProviders: 8
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch job/project data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        
        // Calculate job statistics
        const total = response.data.length;
        const completed = response.data.filter(job => job.status === 'Closed').length;
        const active = response.data.filter(job => job.status === 'Active').length;
        const pending = response.data.filter(job => job.status === 'Pending').length;
        
        setJobStats({
          total,
          completed,
          active,
          pending
        });
        
        // Process job dates to generate visitor stats
        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        // Initialize daily counts
        const thisWeekCounts = [0, 0, 0, 0, 0, 0, 0];
        const lastWeekCounts = [0, 0, 0, 0, 0, 0, 0];
        
        // Count jobs created per day
        response.data.forEach(job => {
          const jobDate = new Date(job.date);
          
          if (jobDate >= oneWeekAgo) {
            // This week
            const dayOfWeek = jobDate.getDay();
            thisWeekCounts[dayOfWeek]++;
          } else if (jobDate >= twoWeeksAgo && jobDate < oneWeekAgo) {
            // Last week
            const dayOfWeek = jobDate.getDay();
            lastWeekCounts[dayOfWeek]++;
          }
        });
        
        setVisitorStats({
          thisWeek: thisWeekCounts,
          lastWeek: lastWeekCounts
        });
        
      } catch (error) {
        console.error("Failed to fetch job data:", error);
        // Set fallback data
        setJobStats({
          total: 25,
          completed: 12,
          active: 8,
          pending: 5
        });
      }
    };
    
    fetchJobs();
  }, []);

  // Fetch jobs data for the Client's Requests section
  useEffect(() => {
    const fetchAllJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        setAllJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch job requests:", error);
      } finally {
        setJobsLoading(false);
      }
    };
    
    fetchAllJobs();
  }, []);

  // Fetch bids data
  useEffect(() => {
    const fetchBids = async () => {
      setBidsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/bids');
        const bidsData = response.data;
        
        setAllBids(bidsData);
        
        // Calculate bid statistics
        const total = bidsData.length;
        const accepted = bidsData.filter(bid => bid.status === 'accepted').length;
        const pending = bidsData.filter(bid => bid.status === 'pending').length;
        const rejected = bidsData.filter(bid => bid.status === 'rejected').length;
        
        setBidStats({
          total,
          accepted,
          pending,
          rejected
        });
        
      } catch (error) {
        console.error("Failed to fetch bids data:", error);
      } finally {
        setBidsLoading(false);
      }
    };
    
    fetchBids();
  }, []);

  // Handler for logout
  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  // Calculate completion percentage
  const completionPercentage = jobStats.total > 0 
    ? Math.round((jobStats.completed / jobStats.total) * 100) 
    : 0;

  // Calculate client growth rate (new vs. returning - using dummy values for now)
  const clientGrowthRate = userStats.clients > 0 ? 22 : 0; // Replace with actual calculation when data available

  // Updated Doughnut chart data for biddings with real data
  const biddingData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [jobStats.completed, jobStats.active, jobStats.pending],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // Chart data for client growth
  const clientData = {
    labels: ['New', 'Returning'],
    datasets: [{
      data: [clientGrowthRate, 100 - clientGrowthRate],
      backgroundColor: ['#10B981', '#E5E7EB'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // Chart data for revenue (using dummy data as this isn't in your backend yet)
  const revenueData = {
    labels: ['Direct', 'Commissions', 'Affiliates'],
    datasets: [{
      data: [62, 28, 10],
      backgroundColor: ['#3B82F6', '#A855F7', '#EC4899'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // Bar chart data updated with real visitor stats
  const visitsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'This Week',
        data: visitorStats.thisWeek,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      },
      {
        label: 'Last Week',
        data: visitorStats.lastWeek,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(226, 232, 240, 0.7)'
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          usePointStyle: true
        }
      }
    }
  };

  // Add this function to render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return renderDashboardContent();
      case 'Users':
        return (
          <UsersManagement 
            allClients={allClients}
            allServiceProviders={allServiceProviders}
            setAllClients={setAllClients}
            setAllServiceProviders={setAllServiceProviders}
            isLoading={isLoading}
          />
        );
      case 'Client\'s Requests':
        return renderClientRequestsContent();
      case 'Bids Management':
        return renderBidsManagementContent();
      case 'Messages':
        return renderMessagesContent();
      case 'Inquiries':
        return renderInquiriesContent();
      default:
        return renderDashboardContent();
    }
  };

  // Render dashboard content (existing charts and cards)
  const renderDashboardContent = () => {
    return (
      <div>
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Existing stats cards */}
          {/* Total Clients card */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <FaUsers size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Clients</p>
                <div className="flex items-end">
                  <h2 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : userStats.clients}</h2>
                  
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
        
              
            </div>
          </div>

          {/* Service Providers card */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg">
                <FaWrench size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Service Providers</p>
                <div className="flex items-end">
                  <h2 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : userStats.serviceProviders}</h2>
                  
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              
            </div>
          </div>

          {/* Completed Projects card */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-lg">
                <FaTasks size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed Projects</p>
                <div className="flex items-end">
                  <h2 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : jobStats.completed}</h2>
                  
                </div>
              </div>
            </div>
            
          </div>

          {/* Active Projects card */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg">
                <FaBuilding size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Projects</p>
                <div className="flex items-end">
                  <h2 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : jobStats.active}</h2>
                  
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              
            </div>
          </div>
        </div>

        {/* User lists */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Existing code for active users */}
          {/* Active Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <FaUsers size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Active Clients</h3>
                  
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-5 flex justify-center">
                  <div className="animate-pulse flex space-x-4 w-full">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : activeUsers.clients.length > 0 ? (
                activeUsers.clients.map(client => (
                  <div key={client._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        {client.profilePic ? 
                          <img 
                            src={`http://localhost:5000${client.profilePic}`} 
                            alt={`${client.username}'s profile`} 
                            className="h-10 w-10 rounded-full object-cover" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=User";
                            }}
                          /> : 
                          <FaUser className="text-gray-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{client.username}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      
                      
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">No active clients found</div>
              )}
              
              <div className="p-4 bg-gray-50 text-center">
                <button 
                  className="text-sm text-blue-600 font-medium hover:text-blue-800"
                  onClick={() => {
                    setActiveMenu('Users');
                    // Pre-select the clients tab in UserManagement
                    if (window.tabSelector) {
                      window.tabSelector('clients');
                    }
                  }}
                >
                  View All Clients
                </button>
              </div>
            </div>
          </div>

          {/* Active Service Providers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <FaWrench size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Active Service Providers</h3>
                  
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-5 flex justify-center">
                  <div className="animate-pulse flex space-x-4 w-full">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : activeUsers.serviceProviders.length > 0 ? (
                activeUsers.serviceProviders.map(provider => (
                  <div key={provider._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        {provider.profilePic ? 
                          <img 
                            src={`http://localhost:5000${provider.profilePic}`} 
                            alt={`${provider.username}'s profile`} 
                            className="h-10 w-10 rounded-full object-cover" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=User";
                            }}
                          /> : 
                          <FaUser className="text-gray-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{provider.username}</p>
                        <p className="text-xs text-gray-500">{provider.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      
                      
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">No active service providers found</div>
              )}
              
              <div className="p-4 bg-gray-50 text-center">
                <button 
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                  onClick={() => {
                    setActiveMenu('Users');
                    // Pre-select the service providers tab in UserManagement
                    if (window.tabSelector) {
                      window.tabSelector('serviceProviders');
                    }
                  }}
                >
                  View All Service Providers
                </button>
              </div>
            </div>
          </div>
        </div>

        
        
      </div>
    );
  };

  // Placeholder for Client Requests content
  const renderClientRequestsContent = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Client's Requests</h2>
          <p className="text-gray-600">Manage all client job listings and bidding processes</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-72">
            
          </div>
          
        </div>
        
        {/* Jobs List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title/Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading job requests...</td>
                </tr>
              ) : allJobs.length > 0 ? (
                allJobs.map(job => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{job.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.username || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{job.area}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs. {job.minBudget} - {job.maxBudget}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          job.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <select 
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={job.status}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Active">Active</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => window.open(`/job/${job._id}`, '_blank')}
                        >
                          View
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No job requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {allJobs.length > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, allJobs.length)}</span> of{" "}
                  <span className="font-medium">{allJobs.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Job Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <FaClipboardList size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Requests</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">{allJobs.length}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-lg">
                <FaTasks size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Biddings</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {allJobs.filter(job => job.status === 'Active').length}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>
      </div>
    );
  };

  // Add this function to handle job status update
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/jobs/${jobId}/auction-status`, { status: newStatus });
      
      // Update local state to reflect the change
      setAllJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  // Add this function to handle job deletion
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
      
      // Remove the job from local state
      setAllJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  // Placeholder for Messages content
  const renderMessagesContent = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Messages</h2>
        <p className="text-gray-600 mb-6">Manage all platform messages</p>
        
        {/* Implement the messages list here */}
        <div className="text-center py-10 text-gray-500">
          Messages feature coming soon
        </div>
      </div>
    );
  };

  // Placeholder for Inquiries content
  const renderInquiriesContent = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Inquiries</h2>
        <p className="text-gray-600 mb-6">Manage all customer inquiries</p>
        
        {/* Implement the inquiries list here */}
        <div className="text-center py-10 text-gray-500">
          Inquiries feature coming soon
        </div>
      </div>
    );
  };

  // Render Bids Management content
  const renderBidsManagementContent = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bids Overview</h2>
          <p className="text-gray-600">Monitor all bids across projects</p>
        </div>
        
        {/* Bid Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <FaBoxOpen size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Bids</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">{bidStats.total}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-lg">
                <FaCheck size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Accepted Bids</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">{bidStats.accepted}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white shadow-lg">
                <FaClock size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Bids</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">{bidStats.pending}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg">
                <FaTimes size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rejected Bids</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">{bidStats.rejected}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-72">
            
          </div>
          
        </div>
        
        {/* Bids Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bidsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading bids data...</td>
                </tr>
              ) : allBids.length > 0 ? (
                allBids.map(bid => (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bid.contractorname}</div>
                          <div className="text-xs text-gray-500">ID: {bid.contractorId.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bid.projectId}</div>
                      <div className="text-xs text-gray-500">ID: {bid.projectId.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Rs. {bid.price.toLocaleString()}</div>
                      {bid.updateCount > 0 && (
                        <div className="text-xs text-gray-500">
                          Updated {bid.updateCount} time{bid.updateCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{bid.timeline} days</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewBidDetails(bid)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No bids found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {allBids.length > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, allBids.length)}</span> of{" "}
                  <span className="font-medium">{allBids.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* View-only Bid Details Modal */}
        {selectedBid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Bid Details</h3>
                <button 
                  onClick={() => setSelectedBid(null)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Contractor</p>
                  <p className="font-medium text-gray-800">{selectedBid.contractorname}</p>
                  <p className="text-xs text-gray-500">ID: {selectedBid.contractorId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project ID</p>
                  <p className="font-medium text-gray-800">{selectedBid.projectId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bid Amount</p>
                  <p className="font-medium text-gray-800">Rs. {selectedBid.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timeline</p>
                  <p className="font-medium text-gray-800">{selectedBid.timeline} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                    ${selectedBid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                    selectedBid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {selectedBid.status.charAt(0).toUpperCase() + selectedBid.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedBid.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Qualifications</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded">{selectedBid.qualifications}</p>
              </div>
              
              {selectedBid.updateCount > 0 && selectedBid.previousPrices && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Price History</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBid.previousPrices.map((priceRecord, index) => (
                          <tr key={index}>
                            <td className="py-1">{new Date(priceRecord.updatedAt).toLocaleString()}</td>
                            <td className="py-1">Rs. {priceRecord.price.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td className="py-1">Current</td>
                          <td className="py-1">Rs. {selectedBid.price.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedBid(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-950 text-white shadow-xl">
        <div className="p-5 border-b border-blue-800/30">
          <div className="flex items-center">
            <img src={buildMartLogo} alt="BuildMart Logo" className="h-9" />
            <div className="ml-3">
              <h1 className="text-xl font-bold">BuildMart</h1>
              <p className="text-xs text-blue-300">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="mt-6 px-4">
          <p className="px-2 text-xs font-semibold text-blue-400 uppercase mb-4">Main</p>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`mb-2 rounded-lg flex items-center cursor-pointer transition-all ${
                activeMenu === item.name
                  ? 'bg-blue-700 text-white shadow-md px-3 py-3'
                  : 'text-blue-200 hover:bg-blue-800/50 hover:text-white px-3 py-3'
              }`}
              onClick={() => setActiveMenu(item.name)}
            >
              <div className={`${activeMenu === item.name ? 'text-white' : 'text-blue-400'} mr-3`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
              {activeMenu === item.name && <FaChevronRight className="ml-auto text-xs" />}
            </div>
          ))}
          
          
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-blue-800/30">
          <div 
            className="px-4 py-3 flex items-center text-blue-200 cursor-pointer hover:bg-blue-800/50 hover:text-white transition-all"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {activeMenu === 'Dashboard' ? 'Dashboard' : activeMenu}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-5">
              <div className="relative">
                
              </div>
              
              <div className="relative">
                <button className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <FaBell className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    3
                  </span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 border-l pl-5 border-gray-200">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <FaUser />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
               
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content - Replace this with conditional rendering */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Admindashboard;