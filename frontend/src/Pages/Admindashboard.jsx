import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaClipboardList, FaSearch, FaBell, FaSignOutAlt, 
  FaChartLine, FaUsers, FaBuilding, FaTasks, FaBoxOpen,
  FaTruckMoving, FaWrench, FaChevronRight, FaEllipsisH, 
  FaCircle, FaAngleDown, FaCalendar, FaCheck, FaClock, FaTimes,
  FaUserShield
} from 'react-icons/fa';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import buildMartLogo from '../assets/images/buildmart_logo1.png';
import { useNavigate } from 'react-router-dom';
import UsersManagement from '../components/UserManagement';
import AdminManagement from '../components/AdminManagement';

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
  
  // Add state for admin users
  const [allAdmins, setAllAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  
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
    { name: 'Admin Management', icon: <FaUserShield /> },
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

  // Fetch admin users
  useEffect(() => {
    const fetchAdmins = async () => {
      setAdminsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/auth/admins');
        setAllAdmins(response.data);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        // Set empty array as fallback
        setAllAdmins([]);
      } finally {
        setAdminsLoading(false);
      }
    };
    
    fetchAdmins();
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
      case 'Admin Management':
        return (
          <AdminManagement 
            allAdmins={allAdmins}
            setAllAdmins={setAllAdmins}
            isLoading={adminsLoading}
          />
        );
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