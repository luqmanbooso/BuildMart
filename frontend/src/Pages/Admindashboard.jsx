import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaClipboardList, FaSearch, FaBell, FaSignOutAlt, 
  FaChartLine, FaUsers, FaBuilding, FaTasks, FaBoxOpen,
  FaTruckMoving, FaWrench, FaChevronRight, FaEllipsisH, 
  FaCircle, FaAngleDown, FaCalendar, FaCheck, FaClock, FaTimes,
  FaUserShield, FaPaperPlane, FaComments, FaFilePdf
} from 'react-icons/fa';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import buildMartLogo from '../assets/images/buildmart_logo1.png';
import { useNavigate } from 'react-router-dom';
import UsersManagement from '../components/UserManagement';
import AdminManagement from '../components/AdminManagement';
import AdminInquiries from '../components/AdminInquiries';

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
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  // Add states for bids management
  const [allBids, setAllBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [bidStats, setBidStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  });
  const [bidSearchTerm, setBidSearchTerm] = useState('');
  const [bidStatusFilter, setBidStatusFilter] = useState('all');

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

  // Add this state for viewing job details
  const [selectedJob, setSelectedJob] = useState(null);

  // Function to handle viewing job details
  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
  };

  // Add these new states for messages management
  const [allMessages, setAllMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');
  
  // Fetch messages data with improved counter calculation
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeMenu === 'Messages') {
        setMessagesLoading(true);
        try {
          let messagesData = [];
          
          // API endpoint
          try {
            const response = await axios.get('http://localhost:5000/api/contact-messages');
            console.log("Successfully fetched contact messages from API");
            messagesData = Array.isArray(response.data) ? response.data : [response.data];
          } catch (apiError) {
            console.warn("API endpoint not available, using local storage fallback");
            
            // Fallback to localStorage if API fails
            const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messagesData = localMessages;
            console.log("Fetched messages from local storage:", messagesData.length);
          }
          
          // Process and store messages data
          setAllMessages(messagesData);
          
          // Calculate message statistics explicitly
          let unreadCount = 0;
          let readCount = 0;
          
          messagesData.forEach(msg => {
            if (msg.isRead) {
              readCount++;
            } else {
              unreadCount++;
            }
          });
          
          const stats = {
            total: messagesData.length,
            unread: unreadCount,
            read: readCount
          };
          
          console.log("Message statistics calculated:", stats);
          setMessageStats(stats);
        } catch (error) {
          console.error("Failed to fetch contact messages:", error);
          setAllMessages([]);
          setMessageStats({ total: 0, unread: 0, read: 0 });
        } finally {
          setMessagesLoading(false);
        }
      }
    };
    
    fetchMessages();
  }, [activeMenu]);

  // Handle viewing message details
  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    
    // If message is unread, mark it as read
    if (!message.isRead) {
      try {
        if (message._id.startsWith('msg_')) {
          // This is a local message, update in localStorage
          const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
          const updatedMessages = localMessages.map(msg => 
            msg._id === message._id ? { ...msg, isRead: true } : msg
          );
          localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
          console.log("Marked local message as read:", message._id);
        } else {
          try {
            await axios.put(`http://localhost:5000/api/contact-messages/${message._id}/read`);
            console.log("Marked API message as read:", message._id);
          } catch (apiError) {
            console.error("API error when marking as read:", apiError);
          }
        }
        
        // Update local state to reflect the change
        setAllMessages(prev => 
          prev.map(msg => 
            msg._id === message._id ? { ...msg, isRead: true } : msg
          )
        );
        
        // Update statistics - explicitly calculate new values to avoid reference issues
        setMessageStats(prev => {
          const newUnread = Math.max(0, prev.unread - 1);
          const newRead = prev.read + 1;
          console.log(`Updating message stats: unread ${prev.unread} → ${newUnread}, read ${prev.read} → ${newRead}`);
          return {
            total: prev.total,
            unread: newUnread,
            read: newRead
          };
        });
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  // Function to delete a message
  const handleDeleteMessage = async (messageId) => {
    try {
      if (messageId.startsWith('msg_')) {

        const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const updatedMessages = localMessages.filter(msg => msg._id !== messageId);
        localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
        console.log("Deleted local message");
      } else {

        await axios.delete(`http://localhost:5000/api/contact-messages/${messageId}`);
        console.log("Deleted API message");
      }
      
      // Update local state to remove the deleted message
      const deletedMessage = allMessages.find(msg => msg._id === messageId);
      setAllMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Update statistics
      if (deletedMessage) {
        setMessageStats(prev => ({
          total: prev.total - 1,
          unread: deletedMessage.isRead ? prev.unread : prev.unread - 1,
          read: deletedMessage.isRead ? prev.read - 1 : prev.read
        }));
      }
      
      // Close the message detail view if it was open
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Function to toggle message read/unread status
  const handleToggleReadStatus = async (messageId, currentStatus) => {
    try {
      // First get the message being updated
      const message = allMessages.find(msg => msg._id === messageId);
      if (!message) {
        console.error(`Message with ID ${messageId} not found`);
        return;
      }
      
      if (messageId.startsWith('msg_')) {
        // This is a local message, update in localStorage
        const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const updatedMessages = localMessages.map(msg => 
          msg._id === messageId ? { ...msg, isRead: !currentStatus } : msg
        );
        localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
        console.log(`Toggled read status for local message ${messageId} to ${!currentStatus}`);
      } else {
        try {
          if (currentStatus) {
            await axios.put(`http://localhost:5000/api/contact-messages/${messageId}/unread`);
          } else {
            await axios.put(`http://localhost:5000/api/contact-messages/${messageId}/read`);
          }
          console.log(`Toggled API message ${messageId} read status to ${!currentStatus}`);
        } catch (apiError) {
          console.error("API error when toggling read status:", apiError);
        }
      }
      
      // Update local state to reflect the change
      setAllMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: !currentStatus } : msg
        )
      );
      
      // Update statistics with explicit calculation
      setMessageStats(prev => {
        // If switching from read to unread, increase unread count and decrease read count
        const newUnread = currentStatus ? prev.unread + 1 : Math.max(0, prev.unread - 1);
        const newRead = currentStatus ? Math.max(0, prev.read - 1) : prev.read + 1;
        
        console.log(`Toggle read stats: unread ${prev.unread} → ${newUnread}, read ${prev.read} → ${newRead}`);
        
        return {
          total: prev.total,
          unread: newUnread,
          read: newRead
        };
      });
      
      // Update selected message if it's currently being viewed
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(prev => ({ ...prev, isRead: !currentStatus }));
      }
    } catch (error) {
      console.error("Failed to update message status:", error);
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
        // First fetch all users
        const response = await axios.get('http://localhost:5000/auth/users');
        
        const clients = response.data.filter(user => user.role === 'Client');
        const serviceProviders = response.data.filter(user => user.role === 'Service Provider');
        
        // Then fetch all contractors to get verification status
        try {
          const contractorsResponse = await axios.get('http://localhost:5000/api/contractors');
          
          if (contractorsResponse.data && Array.isArray(contractorsResponse.data)) {
            console.log("Fetched contractors:", contractorsResponse.data);
            
            // Map contractors to service providers by userId
            const enhancedProviders = serviceProviders.map(provider => {
              // Find the matching contractor (convert IDs to strings for reliable comparison)
              const matchingContractor = contractorsResponse.data.find(
                contractor => String(contractor.userId) === String(provider._id)
              );
              
              console.log(`Provider ID: ${provider._id}, matching contractor:`, matchingContractor);
              
              // Return provider with contractor data if found
              return {
                ...provider,
                verified: matchingContractor ? matchingContractor.verified : false,
                contractorId: matchingContractor ? matchingContractor._id : null,
                specialization: matchingContractor ? matchingContractor.specialization : [],
                experienceYears: matchingContractor ? matchingContractor.experienceYears : 0,
                completedProjects: matchingContractor ? matchingContractor.completedProjects : 0
              };
            });
            
            setAllServiceProviders(enhancedProviders);
          } else {
            console.error("Invalid contractors data format:", contractorsResponse.data);
            setAllServiceProviders(serviceProviders);
          }
        } catch (contractorError) {
          console.error("Failed to fetch contractor data:", contractorError);
          setAllServiceProviders(serviceProviders);
        }
        
        setUserStats({
          clients: clients.length,
          serviceProviders: serviceProviders.length,
        });
        
        // Get most recently active users
        setActiveUsers({
          clients: clients.slice(0, 5),
          serviceProviders: serviceProviders.slice(0, 5)
        });
        
        setAllClients(clients);
        
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

  // function to render content based on active menu
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

  // Render Client Requests content
  const renderClientRequestsContent = () => {
    const filteredJobs = allJobs.filter(job => {
      const matchesSearch = job.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                          job.description?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                          job.username?.toLowerCase().includes(jobSearchTerm.toLowerCase());
      const matchesStatus = jobStatusFilter === 'all' || job.status?.toLowerCase() === jobStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Client's Job Requests</h3>
            <p className="text-sm text-gray-500">Manage all job requests from clients</p>
          </div>
          <div className="flex items-center">
            <div className="relative mr-4">
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                placeholder="Search job requests..."
                value={jobSearchTerm}
                onChange={(e) => setJobSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select 
              className="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {jobsLoading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full mr-3 flex items-center justify-center font-semibold">
                          {job.username ? job.username.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{job.username || 'Unknown Client'}</p>
                          <p className="text-xs text-gray-500">{job.userid || 'No ID'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{job.title || 'Untitled Project'}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{job.description?.substring(0, 60) || 'No description'}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-800">
                          {job.minBudget && job.maxBudget ? 
                            `LKR ${parseInt(job.minBudget).toLocaleString()} - ${parseInt(job.maxBudget).toLocaleString()}` : 
                            job.minBudget ? 
                              `From LKR ${parseInt(job.minBudget).toLocaleString()}` : 
                              'Budget not specified'
                          }
                        </p>
                        {job.milestones && job.milestones.length > 0 && (
                          <p className="text-xs text-gray-500">{job.milestones.length} milestones</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-800">{new Date(job.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(job.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        job.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        job.status === 'Closed' ? 'bg-gray-100 text-gray-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewJobDetails(job)} 
                        className="text-indigo-600 hover:text-indigo-900 font-medium mr-2 text-sm transition-colors flex items-center"
                      >
                        <span>View Details</span>
                        <FaChevronRight className="ml-1 text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaClipboardList className="mx-auto text-5xl mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No job requests found</h3>
            <p className="text-gray-500">There are currently no job requests in the system.</p>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Project Details: {selectedJob.title}
                </h3>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="py-6">
                {/* Client and basic information section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Client</p>
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full mr-3 flex items-center justify-center font-semibold text-lg">
                        {selectedJob.username ? selectedJob.username.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{selectedJob.username || 'Unknown Client'}</p>
                        <p className="text-sm text-gray-600">Client ID: {selectedJob.userid || 'No ID'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Project Status</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        selectedJob.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        selectedJob.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedJob.status}
                      </span>
                      <div>
                        <p className="text-sm text-gray-500">Created on:</p>
                        <p className="font-medium">{new Date(selectedJob.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project details section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Budget Range</p>
                    <p className="font-bold text-lg text-gray-800">
                      {selectedJob.minBudget && selectedJob.maxBudget ? 
                        `LKR ${parseInt(selectedJob.minBudget).toLocaleString()} - ${parseInt(selectedJob.maxBudget).toLocaleString()}` : 
                        selectedJob.minBudget ? 
                          `From LKR ${parseInt(selectedJob.minBudget).toLocaleString()}` : 
                          'Not specified'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Bidding Period</p>
                    <div>
                      <div className="flex items-center text-sm">
                        <FaCalendar className="text-gray-400 mr-2" />
                        <span>Start: {new Date(selectedJob.biddingStartTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm mt-1">
                        <FaCalendar className="text-gray-400 mr-2" />
                        <span>End: {new Date(selectedJob.biddingEndTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Categories</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedJob.categories && selectedJob.categories.length > 0 ? 
                        selectedJob.categories.map((category, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {category}
                          </span>
                        )) : 
                        <span className="text-gray-500">No categories specified</span>
                      }
                    </div>
                  </div>
                </div>
                
                {/* Project description */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <p className="text-sm text-gray-500 mb-2">Project Description</p>
                  <p className="text-gray-800 whitespace-pre-line">
                    {selectedJob.description || 'No description provided.'}
                  </p>
                </div>
                
                {/* Project milestones */}
                {selectedJob.milestones && selectedJob.milestones.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <p className="text-sm text-gray-500 mb-3">Milestones</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedJob.milestones.map((milestone, idx) => (
                            <tr key={idx} className="border-t border-gray-200">
                              <td className="px-4 py-2 font-medium">{milestone.name}</td>
                              <td className="px-4 py-2 text-gray-800">LKR {parseInt(milestone.amount).toLocaleString()}</td>
                              <td className="px-4 py-2 text-gray-600">{milestone.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Bids information for this project */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Project Bids</p>
                    <p className="font-medium text-gray-800">Total Bids: {selectedJob.bids || 0}</p>
                  </div>
                  
                  {/* Show related bids if we have them */}
                  {allBids.filter(bid => bid.projectId === selectedJob._id).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-2 text-left">Service Provider</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Timeline</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allBids
                            .filter(bid => bid.projectId === selectedJob._id)
                            .map((bid) => (
                              <tr key={bid._id} className="border-t border-gray-200 hover:bg-gray-100">
                                <td className="px-4 py-2">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full mr-2 flex items-center justify-center font-semibold">
                                      {bid.contractorname.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{bid.contractorname}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 font-medium">LKR {bid.price.toLocaleString()}</td>
                                <td className="px-4 py-2">{bid.timeline} days</td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                    bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No bids received for this project yet.</p>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="border-t pt-4 flex justify-between">
                <div>
                  <button 
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium mr-3"
                    onClick={() => {
                      // Placeholder for delete functionality
                      alert('Delete functionality will be implemented soon');
                    }}
                  >
                    Delete Project
                  </button>
                  
                  {selectedJob.status === 'Pending' && (
                    <button 
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                      onClick={() => {
                        // Placeholder for activation functionality
                        alert('Activation functionality will be implemented soon');
                      }}
                    >
                      Activate Project
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-800 font-medium transition-colors"
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

  // Add this function for PDF generation
  const generateBidsPDF = () => {
    // Get the current filtered bids
    const currentFilteredBids = allBids.filter(bid => {
      const matchesSearch = bid.contractorname?.toLowerCase().includes(bidSearchTerm.toLowerCase()) ||
                          (allJobs.find(job => job._id === bid.projectId)?.title?.toLowerCase().includes(bidSearchTerm.toLowerCase()));
      const matchesStatus = bidStatusFilter === 'all' || bid.status?.toLowerCase() === bidStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    // Create a new jsPDF instance
    const doc = new window.jspdf.jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('BuildMart - Bids Management Report', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add filter information
    doc.setFontSize(10);
    doc.text(`Search Term: ${bidSearchTerm || 'None'}`, 14, 38);
    doc.text(`Status Filter: ${bidStatusFilter}`, 14, 45);
    
    // Add statistics
    doc.setFontSize(12);
    doc.text('Statistics', 14, 60);
    doc.setFontSize(10);
    doc.text(`Total Bids: ${currentFilteredBids.length}`, 14, 68);
    doc.text(`Accepted: ${currentFilteredBids.filter(bid => bid.status === 'accepted').length}`, 14, 75);
    doc.text(`Pending: ${currentFilteredBids.filter(bid => bid.status === 'pending').length}`, 14, 82);
    doc.text(`Rejected: ${currentFilteredBids.filter(bid => bid.status === 'rejected').length}`, 14, 89);
    
    // Prepare table data
    const tableData = currentFilteredBids.map(bid => {
      const relatedJob = allJobs.find(job => job._id === bid.projectId);
      return [
        bid.contractorname || 'Unknown Provider',
        relatedJob ? relatedJob.title : 'Project #' + bid.projectId?.substring(0, 8),
        `LKR ${bid.price?.toLocaleString() || '0'}`,
        `${bid.timeline || '0'} days`,
        bid.status.charAt(0).toUpperCase() + bid.status.slice(1)
      ];
    });
    
    // Add table
    doc.autoTable({
      startY: 100,
      head: [['Service Provider', 'Project', 'Bid Amount', 'Timeline', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      margin: { left: 14 }
    });
    
    // Save the PDF
    doc.save('buildmart-bids-report.pdf');
  };

  // Add state for report filters
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    serviceProvider: ''
  });

  // Add this function for custom PDF generation
  const generateCustomBidsPDF = () => {
    // Get the current filtered bids based on report filters
    const filteredBids = allBids.filter(bid => {
      const matchesDate = (!reportFilters.startDate || new Date(bid.createdAt) >= new Date(reportFilters.startDate)) &&
                        (!reportFilters.endDate || new Date(bid.createdAt) <= new Date(reportFilters.endDate));
      const matchesStatus = reportFilters.status === 'all' || bid.status === reportFilters.status;
      const matchesAmount = (!reportFilters.minAmount || bid.price >= parseFloat(reportFilters.minAmount)) &&
                          (!reportFilters.maxAmount || bid.price <= parseFloat(reportFilters.maxAmount));
      const matchesProvider = !reportFilters.serviceProvider || 
                            bid.contractorname?.toLowerCase().includes(reportFilters.serviceProvider.toLowerCase());
      
      return matchesDate && matchesStatus && matchesAmount && matchesProvider;
    });

    // Create a new jsPDF instance
    const doc = new window.jspdf.jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('BuildMart - Bids Report', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add filter information
    doc.setFontSize(10);
    doc.text('Report Criteria:', 14, 38);
    doc.text(`Date Range: ${reportFilters.startDate ? new Date(reportFilters.startDate).toLocaleDateString() : 'Any'} - ${reportFilters.endDate ? new Date(reportFilters.endDate).toLocaleDateString() : 'Any'}`, 14, 45);
    doc.text(`Status: ${reportFilters.status === 'all' ? 'All' : reportFilters.status.charAt(0).toUpperCase() + reportFilters.status.slice(1)}`, 14, 52);
    doc.text(`Amount Range: ${reportFilters.minAmount ? `LKR ${parseFloat(reportFilters.minAmount).toLocaleString()}` : 'Any'} - ${reportFilters.maxAmount ? `LKR ${parseFloat(reportFilters.maxAmount).toLocaleString()}` : 'Any'}`, 14, 59);
    doc.text(`Service Provider: ${reportFilters.serviceProvider || 'Any'}`, 14, 66);
    
    // Add statistics
    doc.setFontSize(12);
    doc.text('Statistics', 14, 80);
    doc.setFontSize(10);
    doc.text(`Total Bids: ${filteredBids.length}`, 14, 88);
    doc.text(`Accepted: ${filteredBids.filter(bid => bid.status === 'accepted').length}`, 14, 95);
    doc.text(`Pending: ${filteredBids.filter(bid => bid.status === 'pending').length}`, 14, 102);
    doc.text(`Rejected: ${filteredBids.filter(bid => bid.status === 'rejected').length}`, 14, 109);
    
    // Calculate total amount
    const totalAmount = filteredBids.reduce((sum, bid) => sum + (bid.price || 0), 0);
    doc.text(`Total Amount: LKR ${totalAmount.toLocaleString()}`, 14, 116);
    
    // Prepare table data
    const tableData = filteredBids.map(bid => {
      const relatedJob = allJobs.find(job => job._id === bid.projectId);
      return [
        bid.contractorname || 'Unknown Provider',
        relatedJob ? relatedJob.title : 'Project #' + bid.projectId?.substring(0, 8),
        `LKR ${bid.price?.toLocaleString() || '0'}`,
        `${bid.timeline || '0'} days`,
        bid.status.charAt(0).toUpperCase() + bid.status.slice(1),
        new Date(bid.createdAt).toLocaleDateString()
      ];
    });
    
    // Add table
    doc.autoTable({
      startY: 130,
      head: [['Service Provider', 'Project', 'Bid Amount', 'Timeline', 'Status', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      margin: { left: 14 }
    });
    
    // Save the PDF
    doc.save('buildmart-custom-bids-report.pdf');
  };

  // Add this component for the custom report modal
  const CustomReportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-xl font-semibold text-gray-800">Export Report</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={reportFilters.status}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Filter by service provider"
                  value={reportFilters.serviceProvider}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, serviceProvider: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Amount (LKR)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimum bid amount"
                  value={reportFilters.minAmount}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Amount (LKR)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Maximum bid amount"
                  value={reportFilters.maxAmount}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                generateCustomBidsPDF();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaFilePdf className="mr-2" />
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add state for modal visibility
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState(false);

  // Render Bids Management content
  const renderBidsManagementContent = () => {
    const filteredBids = allBids.filter(bid => {
      const matchesSearch = bid.contractorname?.toLowerCase().includes(bidSearchTerm.toLowerCase()) ||
                          (allJobs.find(job => job._id === bid.projectId)?.title?.toLowerCase().includes(bidSearchTerm.toLowerCase()));
      const matchesStatus = bidStatusFilter === 'all' || bid.status?.toLowerCase() === bidStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Bids Management</h3>
            <p className="text-sm text-gray-500">Review and manage all bids in the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative mr-4">
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                placeholder="Search bids..."
                value={bidSearchTerm}
                onChange={(e) => setBidSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select 
              className="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={bidStatusFilter}
              onChange={(e) => setBidStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button
              onClick={() => setIsCustomReportModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaFilePdf className="mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Bid statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Total Bids</p>
            <p className="text-3xl font-bold text-gray-800">{filteredBids.length}</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl">
            <p className="text-sm text-green-600 mb-1">Accepted</p>
            <p className="text-3xl font-bold text-green-700">{filteredBids.filter(bid => bid.status === 'accepted').length}</p>
          </div>
          <div className="bg-yellow-50 p-5 rounded-xl">
            <p className="text-sm text-yellow-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-700">{filteredBids.filter(bid => bid.status === 'pending').length}</p>
          </div>
          <div className="bg-red-50 p-5 rounded-xl">
            <p className="text-sm text-red-600 mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-700">{filteredBids.filter(bid => bid.status === 'rejected').length}</p>
          </div>
        </div>

        {bidsLoading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : filteredBids.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBids.map((bid) => {
                  const relatedJob = allJobs.find(job => job._id === bid.projectId);
                  return (
                    <tr key={bid._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full mr-3 flex items-center justify-center font-semibold">
                            {bid.contractorname ? bid.contractorname.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{bid.contractorname || 'Unknown Provider'}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              {bid.rating > 0 && (
                                <div className="flex items-center mr-2">
                                  <FaCircle className="text-yellow-400 mr-1 text-xs" />
                                  <span>{bid.rating.toFixed(1)}</span>
                                </div>
                              )}
                              {bid.completedProjects > 0 && (
                                <div className="flex items-center">
                                  <FaCheck className="text-green-500 mr-1 text-xs" />
                                  <span>{bid.completedProjects} completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-800">
                          {relatedJob ? relatedJob.title : 'Project #' + bid.projectId?.substring(0, 8)}
                        </p>
                        {relatedJob && (
                          <p className="text-xs text-gray-500">{relatedJob.categories?.join(', ') || 'No categories'}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-800">LKR {bid.price?.toLocaleString() || '0'}</p>
                        {bid.previousPrices && bid.previousPrices.length > 0 && (
                          <p className="text-xs text-gray-500">{bid.previousPrices.length} previous {bid.previousPrices.length === 1 ? 'price' : 'prices'}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-800">{bid.timeline || '0'} days</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewBidDetails(bid)} 
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors flex items-center"
                        >
                          <span>View Details</span>
                          <FaChevronRight className="ml-1 text-xs" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaBoxOpen className="mx-auto text-5xl mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No bids found</h3>
            <p className="text-gray-500">There are currently no bids in the system.</p>
          </div>
        )}
        <CustomReportModal 
          isOpen={isCustomReportModalOpen}
          onClose={() => setIsCustomReportModalOpen(false)}
        />
      </div>
    );
  };

  // Render Messages content
  const renderMessagesContent = () => {
    const filteredMessages = messageFilter === 'all' 
      ? allMessages
      : messageFilter === 'read' 
        ? allMessages.filter(msg => msg.isRead)
        : allMessages.filter(msg => !msg.isRead);
        
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Contact Messages</h3>
            <p className="text-sm text-gray-500">Messages from users through the Contact page</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                placeholder="Search messages..."
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select 
              className="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {/* Message statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Total Messages</p>
            <p className="text-2xl font-bold text-gray-800">{messageStats.total}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-600 mb-1">Unread</p>
            <p className="text-2xl font-bold text-blue-700">{messageStats.unread}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm text-green-600 mb-1">Read</p>
            <p className="text-2xl font-bold text-green-700">{messageStats.read}</p>
          </div>
        </div>

        {messagesLoading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="flex">
            {/* Message list */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredMessages.map((message) => {
                  // Adapt to the new contact message structure
                  const username = message.name || 'Unknown User';
                  const email = message.email || '';
                  const content = message.message || '';
                  const title = message.title || 'Contact Message';
                  
                  return (
                    <div 
                      key={message._id} 
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedMessage && selectedMessage._id === message._id 
                          ? 'bg-blue-50' 
                          : 'hover:bg-gray-50'
                      } ${!message.isRead ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full mr-3 flex items-center justify-center font-semibold text-white ${
                            !message.isRead ? 'bg-blue-600' : 'bg-gray-400'
                          }`}>
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-medium ${!message.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                              {username}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{email}</p>
                          </div>
                        </div>
                        {!message.isRead && (
                          <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Message details or placeholder */}
            <div className="w-2/3 p-6">
              {selectedMessage ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 mr-4 flex items-center justify-center font-semibold text-lg">
                        {(selectedMessage.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedMessage.name || 'Unknown User'}
                        </h3>
                        <p className="text-gray-500">{selectedMessage.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleToggleReadStatus(selectedMessage._id, selectedMessage.isRead)}
                        className={`p-2 rounded-full ${
                          selectedMessage.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        } hover:bg-opacity-80`}
                        title={selectedMessage.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {selectedMessage.isRead ? <FaCircle className="h-4 w-4" /> : <FaCheck className="h-4 w-4" />}
                      </button>
                      
                      <a 
                        href={`mailto:${selectedMessage.email}?subject=Re: BuildMart Contact`}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                        title="Reply by email"
                      >
                        <FaPaperPlane className="h-4 w-4" />
                      </a>
                      
                      <button 
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        title="Delete message"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800">
                      {selectedMessage.title || 'Contact Message'}
                    </h4>
                  </div>
                  
                  <div className="border-t border-b border-gray-100 py-6 my-4">
                    <p className="text-sm text-gray-500 mb-2">Received on {new Date(selectedMessage.createdAt).toLocaleDateString()} at {new Date(selectedMessage.createdAt).toLocaleTimeString()}</p>
                    <div className="mt-4 bg-gray-50 p-6 rounded-xl text-gray-800 whitespace-pre-line leading-relaxed">
                      {selectedMessage.message || ''}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <a 
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.title || 'BuildMart Contact'}&body=Dear ${selectedMessage.name},%0D%0A%0D%0AThank you for contacting BuildMart.%0D%0A%0D%0ARegarding your message:%0D%0A"${selectedMessage.message}"%0D%0A%0D%0A`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FaPaperPlane className="mr-2" />
                      Reply to Message
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <FaComments className="text-6xl mb-4" />
                  <h3 className="text-xl font-medium mb-2">No message selected</h3>
                  <p className="text-center text-gray-500">
                    Select a message from the list to view its contents
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaComments className="mx-auto text-5xl mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No messages found</h3>
            <p className="text-gray-500">There are currently no messages in the system.</p>
          </div>
        )}
      </div>
    );
  };

  // Render Inquiries content
  const renderInquiriesContent = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800">Inquiries Management</h3>
          <p className="text-sm text-gray-500">Handle customer inquiries and support requests</p>
        </div>
        <div className="p-6">
          <AdminInquiries />
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