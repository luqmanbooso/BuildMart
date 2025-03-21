import React, { useState, useEffect } from 'react';
import { FaChartLine, FaMoneyBillWave, FaHourglassHalf, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ContractorUserNav from '../components/ContractorUserNav';

const MyEarningsPage = () => {
  // Replace the AuthContext with direct token access
  const [currentUser, setCurrentUser] = useState({ id: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    totalPending: 0,
    ongoingWorks: [],
    milestones: []
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedTab, setSelectedTab] = useState('summary');

  // Get user ID from token on component mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        // Try to get user ID from localStorage first (for convenience)
        const userId = localStorage.getItem('userId');
        
        if (userId) {
          setCurrentUser({ id: userId });
        } else {
          // If not in localStorage, decode from token
          const decoded = jwtDecode(token);
          const id = decoded.id || decoded._id || decoded.userId;
          setCurrentUser({ id });
          
          // Store for convenience
          if (id) localStorage.setItem('userId', id);
        }
      } else {
        setError('You must be logged in to view earnings');
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Authentication error. Please log in again.');
    }
  }, []);

  // Fetch earnings data once we have the user ID
  useEffect(() => {
    if (!currentUser.id) return;
    
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:5000/api/ongoingworks/contractor/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Process the data
        processEarningsData(response.data);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError('Failed to load your earnings data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [currentUser.id]);

  const processEarningsData = (ongoingWorks) => {
    let totalEarned = 0;
    let totalPending = 0;
    let allMilestones = [];

    // Process each ongoing work
    ongoingWorks.forEach(work => {
      // Add total earned from this work
      totalEarned += work.totalAmountPaid || 0;
      
      // Add total pending from this work
      totalPending += work.totalAmountPending || 0;
      
      // Process milestones
      if (work.milestones && work.milestones.length > 0) {
        work.milestones.forEach(milestone => {
          allMilestones.push({
            ...milestone,
            jobTitle: work.jobId?.title || 'Unnamed Job',
            jobId: work.jobId?._id || work.jobId,
            clientId: work.clientId,
            workId: work._id
          });
        });
      }
    });

    // Set the processed data
    setEarnings({
      totalEarned,
      totalPending,
      ongoingWorks,
      milestones: allMilestones
    });
  };

  // Filter milestones based on selected timeframe
  const filteredMilestones = () => {
    if (selectedTimeframe === 'all') return earnings.milestones;
    
    const now = new Date();
    let startDate;
    
    switch (selectedTimeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return earnings.milestones;
    }
    
    return earnings.milestones.filter(milestone => {
      if (milestone.completedAt) {
        const completionDate = new Date(milestone.completedAt);
        return completionDate >= startDate && completionDate <= now;
      }
      return false;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
                  <ContractorUserNav/>
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <br /><br /><br /><br />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Earnings</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Earnings Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaMoneyBillWave className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800">LKR {earnings.totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Pending Earnings Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <FaHourglassHalf className="text-yellow-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-800">LKR {earnings.totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Projects Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaClipboardList className="text-blue-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Projects</p>
              <p className="text-2xl font-bold text-gray-800">{earnings.ongoingWorks.filter(w => w.jobStatus !== 'Completed').length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          <button 
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              selectedTab === 'summary' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('summary')}
          >
            Earnings Summary
          </button>
          <button 
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              selectedTab === 'milestones' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('milestones')}
          >
            Milestone Payments
          </button>
        </nav>
      </div>

      {/* Timeframe Filter */}
      <div className="mb-6 flex justify-end">
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'summary' ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Earnings Summary</h3>
          </div>
          
          {/* Chart placeholder - You can integrate Chart.js here */}
          <div className="h-64 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Earnings visualization goes here</p>
              <p className="text-sm text-gray-400">You can integrate Chart.js for detailed analytics</p>
            </div>
          </div>
          
          {/* Projects Summary */}
          <div className="px-6 py-5">
            <h4 className="text-md font-medium text-gray-800 mb-4">Project Earnings</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Earned</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earnings.ongoingWorks.map((work) => (
                    <tr key={work._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {work.jobId?.title || 'Unnamed Job'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${work.jobStatus === 'Completed' ? 'bg-green-100 text-green-800' : 
                           work.jobStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                           work.jobStatus === 'On Hold' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-gray-100 text-gray-800'}
                        `}>
                          {work.jobStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        LKR {work.totalAmountPaid?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        LKR {work.totalAmountPending?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Milestone Payments</h3>
          </div>
          
          {filteredMilestones().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Amount</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Paid</th>
                    <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMilestones().map((milestone, idx) => (
                    <tr key={`${milestone.workId}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {milestone.jobTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{milestone.name}</div>
                        {milestone.description && (
                          <div className="text-xs text-gray-500 mt-1">{milestone.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        LKR {parseInt(milestone.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {milestone.status === 'Completed' ? 
                          <span className="font-medium text-green-600">
                            LKR {milestone.actualAmountPaid?.toLocaleString() || '0'}
                          </span> : 
                          <span className="text-gray-400">-</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                           milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                           'bg-yellow-100 text-yellow-800'}
                        `}>
                          {milestone.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {milestone.completedAt ? 
                          new Date(milestone.completedAt).toLocaleDateString() : 
                          <span className="text-gray-400">-</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No milestone payments found for the selected timeframe.</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>

  );
};

export default MyEarningsPage;