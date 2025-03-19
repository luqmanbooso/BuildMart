import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import ContractorUserNav from './ContractorUserNav';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const BiddingHistoryPage = () => {
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All Bids');
  const [statistics, setStatistics] = useState({
    total: 0,
    won: 0,
    lost: 0,
    active: 0,
    expired: 0
  });
  const [contractorData, setContractorData] = useState({
    id: '',
    name: 'Contractor',
    email: 'contractor@example.com'
  });
  
  const navigate = useNavigate();
  
  // First effect to extract contractor ID and details from token
  useEffect(() => {
    const getContractorDetails = () => {
      try {
        // Try to get from localStorage first
        const storedId = localStorage.getItem('userId');
        
        if (storedId) {
          setContractorData({
            id: storedId,
            name: localStorage.getItem('name') || 'Contractor',
            email: localStorage.getItem('email') || 'contractor@example.com'
          });
          return;
        }
        
        // If not in localStorage, try to extract from token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          toast.error("Authentication required");
          navigate('/login');
          return;
        }
        
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
        
        if (!userId) {
          toast.error("Invalid authentication token");
          navigate('/login');
          return;
        }
        
        // Save extracted ID and details
        localStorage.setItem('userId', userId);
        
        if (decoded.name) localStorage.setItem('name', decoded.name);
        if (decoded.email) localStorage.setItem('email', decoded.email);
        
        setContractorData({
          id: userId,
          name: decoded.name || 'Contractor',
          email: decoded.email || 'contractor@example.com'
        });
        
      } catch (error) {
        console.error("Error extracting user details:", error);
        toast.error("Please log in again");
        navigate('/login');
      }
    };
    
    getContractorDetails();
  }, [navigate]);
  
  // Second effect to fetch bids once we have the contractor ID
  useEffect(() => {
    const fetchBids = async () => {
      // Only proceed if we have a contractor ID
      if (!contractorData.id) {
        return; // First useEffect will handle the error
      }
      
      setLoading(true);
      try {
        // Fetch all bids for this contractor using contractorData.id instead of contractorId
        const response = await axios.get(`http://localhost:5000/bids/contractor/${contractorData.id}`);
        
        if (response.data) {
          setBiddingHistory(response.data.map(bid => ({
            id: bid._id,
            projectId: bid.projectId,
            projectName: bid.projectName || "Project #" + bid.projectId.substring(0, 8),
            projectOwner: bid.clientName || "Client",
            bidAmount: bid.price,
            bidDate: new Date(bid.createdAt).toLocaleDateString(),
            status: bid.status.charAt(0).toUpperCase() + bid.status.slice(1), // Capitalize status
            deadline: bid.deadline || "Not specified",
            timeline: bid.timeline || 0,
            qualifications: bid.qualifications || "",
            updateCount: bid.updateCount || 0,
            updatesRemaining: 3 - (bid.updateCount || 0)
          })));
          
          // Calculate statistics
          const stats = {
            total: response.data.length,
            won: response.data.filter(bid => bid.status === 'accepted').length,
            lost: response.data.filter(bid => bid.status === 'rejected').length,
            active: response.data.filter(bid => bid.status === 'pending').length,
            expired: 0 // API doesn't have expired status yet
          };
          
          setStatistics(stats);
        }
      } catch (err) {
        console.error('Error fetching bids:', err);
        
        if (err.response?.status === 404) {
          setError('API endpoint not found. Please check if the backend server has the contractor bids endpoint implemented.');
        } else {
          setError('Failed to load bidding history. Please try again later.');
        }
        
        // Create some sample bids for development/testing
        if (process.env.NODE_ENV !== 'production') {
          console.log('Using sample bid data for development');
          const sampleBids = [
            {
              id: '1',
              projectId: '123456789',
              projectName: 'Sample Project 1',
              projectOwner: 'Test Client',
              bidAmount: 250000,
              bidDate: new Date().toLocaleDateString(),
              status: 'Pending',
              timeline: 30,
              qualifications: 'Sample qualifications',
              updateCount: 0,
              updatesRemaining: 3
            },
            {
              id: '2',
              projectId: '987654321',
              projectName: 'Sample Project 2',
              projectOwner: 'Test Client 2',
              bidAmount: 500000,
              bidDate: new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString(),
              status: 'Accepted',
              timeline: 45,
              qualifications: 'Sample qualifications 2',
              updateCount: 1,
              updatesRemaining: 2
            }
          ];
          
          setBiddingHistory(sampleBids);
          setStatistics({
            total: 2,
            won: 1,
            lost: 0,
            active: 1,
            expired: 0
          });
          
          // Remove error message when using sample data
          setError(null);
        }
        
        // Show error toast
        toast.error(`Error loading bids: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBids();
  }, [contractorData.id]); // Depend on contractorData.id instead of contractorId
  
  // Filter bids based on selected status
  const filteredBids = filter === 'All Bids' 
    ? biddingHistory
    : biddingHistory.filter(bid => bid.status === filter);
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      case 'Pending': return 'bg-blue-500';
      case 'Expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Handle bid update
  const handleEditBid = (bidId) => {
    // Navigate to bid edit page
    window.location.href = `/edit-bid/${bidId}`;
  };

  return (
    <div className="bg-white min-h-screen">
      <ContractorUserNav />

      <motion.div 
        className="bg-blue-900 text-white py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">Bidding History</h1>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            className="md:w-1/4 bg-white p-6 rounded shadow"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">{contractorData.name}</h2>
              <p className="text-gray-500 text-sm">{contractorData.email}</p>
              <Link to="/login" className="text-red-500 mt-2">Logout</Link>
            </div>
            
            <ul className="space-y-2 border-t pt-4">
              <li><Link to="/contractor-dashboard" className="block py-2 text-gray-700">Dashboard</Link></li>
              <li><Link to="/contractor-projects" className="block py-2 text-gray-700">Available Projects</Link></li>
              <li><Link to="/bidding-history" className="block py-2 text-blue-600 font-bold">Bidding History</Link></li>
              <li><Link to="/ongoing-works" className="block py-2 text-gray-700">Ongoing Works</Link></li>
              <li><Link to="/contractor-profile" className="block py-2 text-gray-700">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Profile Settings
                </span>
              </Link></li>
            </ul>
          </motion.div>

          {/* Main content */}
          <motion.div 
            className="md:w-3/4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white p-6 rounded shadow mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Bidding History</h2>
                <div className="flex space-x-2">
                  <select 
                    className="border rounded px-4 py-2 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option>All Bids</option>
                    <option>Pending</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="ml-3">Loading bids...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredBids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bids found in this category.</p>
                  {filter !== 'All Bids' && (
                    <button 
                      onClick={() => setFilter('All Bids')} 
                      className="mt-4 text-blue-600"
                    >
                      View all bids instead
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="overflow-x-auto"
                >
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Project Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Bid Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Timeline (days)</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Bid Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Updates</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBids.map((bid) => (
                        <motion.tr 
                          key={bid.id} 
                          variants={itemVariants}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{bid.projectName}</td>
                          <td className="py-3 px-4">LKR {bid.bidAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">{bid.timeline}</td>
                          <td className="py-3 px-4">{bid.bidDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(bid.status)}`}>
                              {bid.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {bid.status === 'Pending' ? (
                              `${bid.updatesRemaining}/3 remaining`
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link 
                                to={`/project/${bid.projectId}`}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>

            <motion.div
              className="bg-white p-6 rounded shadow"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4">Bidding Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Won Bids</p>
                  <p className="text-2xl font-bold">{statistics.won}</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Lost Bids</p>
                  <p className="text-2xl font-bold">{statistics.lost}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Active Bids</p>
                  <p className="text-2xl font-bold">{statistics.active}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BiddingHistoryPage;