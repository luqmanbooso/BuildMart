import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaClipboardList, FaSearch, FaBell, FaSignOutAlt, 
  FaChartLine, FaUsers, FaBuilding, FaTasks, FaBoxOpen,
  FaTruckMoving, FaWrench, FaChevronRight, FaEllipsisH, 
  FaCircle, FaAngleDown, FaCalendar
} from 'react-icons/fa';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import buildMartLogo from '../assets/images/buildmart_logo1.png';
import { useNavigate } from 'react-router-dom';

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
    { name: 'Messages', icon: <FaWrench /> },
    { name: 'Inquiries', icon: <FaBuilding /> },
  ];

  // Add this new state for client requests/jobs
  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

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
        const response = await axios.get('http://localhost:5000/api/users');
        
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
        return renderUsersContent();
      case 'Client\'s Requests':
        return renderClientRequestsContent();
      case 'Messages':
        return renderMessagesContent();
      case 'Inquiries':
        return renderInquiriesContent();
      default:
        return renderDashboardContent();
    }
  };

  // Render the users page with tabs for clients and service providers
  const renderUsersContent = () => {
    const [activeTab, setActiveTab] = React.useState('clients');
    
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Users Management</h2>
          <p className="text-gray-600">Manage all users in the BuildMart platform</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`py-3 px-6 text-sm font-medium ${activeTab === 'clients' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('clients')}
          >
            Clients ({allClients.length})
          </button>
          <button 
            className={`py-3 px-6 text-sm font-medium ${activeTab === 'serviceProviders' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('serviceProviders')}
          >
            Service Providers ({allServiceProviders.length})
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex space-x-3">
            <select className="text-sm border border-gray-300 rounded-md px-3 py-2">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-2">
              <option>Sort By</option>
              <option>Name A-Z</option>
              <option>Name Z-A</option>
              <option>Date Joined</option>
            </select>
          </div>
        </div>
        
        {/* User List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading users...</td>
                </tr>
              ) : activeTab === 'clients' ? (
                allClients.length > 0 ? (
                  allClients.map(client => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {client.profilePic ? (
                              <img className="h-10 w-10 rounded-full" src={`data:image/jpeg;base64,${client.profilePic}`} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUser className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.username}</div>
                            <div className="text-xs text-gray-500">Client</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No clients found</td>
                  </tr>
                )
              ) : allServiceProviders.length > 0 ? (
                allServiceProviders.map(provider => (
                  <tr key={provider._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {provider.profilePic ? (
                            <img className="h-10 w-10 rounded-full" src={`data:image/jpeg;base64,${provider.profilePic}`} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{provider.username}</div>
                          <div className="text-xs text-gray-500">Service Provider</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{provider.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(provider.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No service providers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
                <span className="font-medium">{activeTab === 'clients' ? allClients.length : allServiceProviders.length}</span> results
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
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
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
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">+12%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-gray-500">Since last month</span>
              <span className="text-blue-600 font-medium cursor-pointer flex items-center">
                View Details <FaChevronRight className="ml-1 text-xs" />
              </span>
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
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">+8%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-gray-500">Since last month</span>
              <span className="text-blue-600 font-medium cursor-pointer flex items-center">
                View Details <FaChevronRight className="ml-1 text-xs" />
              </span>
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
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">+22%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-gray-500">Since last month</span>
              <span className="text-blue-600 font-medium cursor-pointer flex items-center">
                View Details <FaChevronRight className="ml-1 text-xs" />
              </span>
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
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    {jobStats.active > 0 ? '+' : '-'}3%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-gray-500">Since last month</span>
              <span className="text-blue-600 font-medium cursor-pointer flex items-center">
                View Details <FaChevronRight className="ml-1 text-xs" />
              </span>
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
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <FaEllipsisH />
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
                          <img src={`data:image/jpeg;base64,${client.profilePic}`} alt="Profile" className="h-10 w-10 rounded-full" /> : 
                          <FaUser className="text-gray-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{client.username}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center text-xs text-gray-500 mr-4">
                        <FaCircle className="mr-1 h-2 w-2 text-green-500" />
                        Online
                      </span>
                      <button className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-3 rounded-lg">
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">No active clients found</div>
              )}
              
              <div className="p-4 bg-gray-50 text-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
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
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <FaEllipsisH />
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
                          <img src={`data:image/jpeg;base64,${provider.profilePic}`} alt="Profile" className="h-10 w-10 rounded-full" /> : 
                          <FaUser className="text-gray-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{provider.username}</p>
                        <p className="text-xs text-gray-500">{provider.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center text-xs text-gray-500 mr-4">
                        <FaCircle className="mr-1 h-2 w-2 text-green-500" />
                        Online
                      </span>
                      <button className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1 px-3 rounded-lg">
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">No active service providers found</div>
              )}
              
              <div className="p-4 bg-gray-50 text-center">
                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                  View All Service Providers
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Existing charts */}
          {/* Bidding Status Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800">Bidding Status</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">This Month</span>
                <button className="text-gray-500">
                  <FaCalendar />
                </button>
              </div>
            </div>
            <div className="relative h-56">
              <Doughnut data={biddingData} options={{ plugins: { legend: { position: 'bottom', align: 'center' } } }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-3xl font-bold text-gray-800">{completionPercentage}%</h4>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Client Growth Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800">Client Growth</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">This Month</span>
                <button className="text-gray-500">
                  <FaCalendar />
                </button>
              </div>
            </div>
            <div className="relative h-56">
              <Doughnut data={clientData} options={{ plugins: { legend: { position: 'bottom', align: 'center' } } }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-3xl font-bold text-gray-800">{clientGrowthRate}%</h4>
                  <p className="text-xs text-gray-500">New</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800">Revenue</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">This Month</span>
                <button className="text-gray-500">
                  <FaCalendar />
                </button>
              </div>
            </div>
            <div className="relative h-56">
              <Doughnut data={revenueData} options={{ plugins: { legend: { position: 'bottom', align: 'center' } } }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-3xl font-bold text-gray-800">62%</h4>
                  <p className="text-xs text-gray-500">Direct</p>
                </div>
              </div>
            </div>
          </div>
        </div>
          
        {/* Visitor Stats */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-gray-800">Visitors Overview</h3>
                <p className="text-sm text-gray-500">Platform activity by day</p>
              </div>
              <div className="flex items-center space-x-3">
                <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5">
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
                <button className="text-gray-400 hover:text-gray-500">
                  <FaEllipsisH />
                </button>
              </div>
            </div>
            
            <div className="h-80">
              <Bar data={visitsData} options={barOptions} />
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
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex space-x-3">
            <select className="text-sm border border-gray-300 rounded-md px-3 py-2">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Closed</option>
            </select>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-2">
              <option>All Categories</option>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Carpentry</option>
              <option>Other</option>
            </select>
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
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white shadow-lg">
                <FaBoxOpen size={22} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Approval</p>
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {allJobs.filter(job => job.status === 'Pending').length}
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
          
          <p className="px-2 text-xs font-semibold text-blue-400 uppercase mt-8 mb-4">Settings</p>
          <div className="px-3 py-3 text-blue-200 hover:bg-blue-800/50 hover:text-white rounded-lg flex items-center cursor-pointer transition-all">
            <div className="text-blue-400 mr-3">
              <FaWrench />
            </div>
            <span>System Settings</span>
          </div>
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
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-64 text-sm"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
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
                <FaAngleDown className="text-gray-500 cursor-pointer" />
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