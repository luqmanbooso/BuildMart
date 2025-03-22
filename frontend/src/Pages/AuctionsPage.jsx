import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContractorUserNav from '../components/ContractorUserNav';

// Update the AuctionCard component to better match the Job model
const AuctionCard = ({ auction }) => {
  const navigate = useNavigate();
  
  // Calculate time left with error handling
  const calculateTimeLeft = (endDateString) => {
    try {
      const endDate = new Date(endDateString);
      const now = new Date();
      const difference = endDate - now;
      
      if (isNaN(difference) || difference <= 0) return "Ended";
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
    } catch (e) {
      return "N/A";
    }
  };

  // Determine display status
  const determineStatus = () => {
    try {
      const now = new Date().getTime();
      const endDate = new Date(auction.biddingEndTime).getTime();
      const startTime = new Date(auction.biddingStartTime).getTime();
      
      if (auction.status === 'Closed') {
        return "ended";
      }
      
      if (now > endDate) {
        return "ended";
      } 
      
      if (auction.status === 'Active' || (now >= startTime && now <= endDate)) {
        return "active";
      }
      
      return "pending";
    } catch (e) {
      console.error("Error determining auction status:", e);
      return auction.status?.toLowerCase() || "pending";
    }
  };
  
  const displayStatus = determineStatus();
  
  // Format budget as a range
  const formatBudget = () => {
    if (!auction.minBudget && !auction.maxBudget) return 'Not specified';
    
    if (auction.minBudget && auction.maxBudget) {
      return `LKR ${auction.minBudget} - ${auction.maxBudget}`;
    }
    
    return auction.minBudget ? `LKR ${auction.minBudget}+` : `Up to LKR ${auction.maxBudget}`;
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-blue-200 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      <div className="relative">
        {/* Color bar at the top indicating status */}
        <div className={`h-1.5 w-full ${
          displayStatus === 'active' ? 'bg-green-500' : 
          displayStatus === 'ended' ? 'bg-red-500' : 
          'bg-amber-400'
        }`}></div>
        
        {/* Main content */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{auction.title || 'Untitled Project'}</h3>
            <p className="text-sm text-gray-500">Posted by {auction.username || 'Unknown'}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {auction.categories && auction.categories.map((category, index) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{auction.area || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-500">Budget</p>
              <p className="font-medium">{formatBudget()}</p>
            </div>
          </div>
          
          {/* Add bids count */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
              <span className="font-medium">{auction.bids || 0}</span> {auction.bids === 1 ? 'bid' : 'bids'}
            </div>
            
            <div className="text-sm text-gray-500">
              {displayStatus !== 'ended' && (
                <>Ends in <span className="font-medium">{calculateTimeLeft(auction.biddingEndTime)}</span></>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${
                displayStatus === 'active' ? 'bg-green-500 animate-pulse' : 
                displayStatus === 'ended' ? 'bg-red-500' : 
                'bg-amber-400'
              } mr-2`}></div>
              <span className={`text-xs font-medium ${
                displayStatus === 'active' ? 'text-green-700' : 
                displayStatus === 'ended' ? 'text-red-700' : 
                'text-amber-700'
              }`}>
                {displayStatus === 'active' ? 'Active' : 
                 displayStatus === 'ended' ? 'Auction Ended' : 
                 'Pending'}
              </span>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Posted on</p>
              <p className="font-semibold text-sm">
                {new Date(auction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action button */}
        <div className="bg-gray-50 p-4 flex justify-end">
          <motion.button 
            className={`${
              displayStatus === 'ended' 
                ? "bg-gray-500 hover:bg-gray-600" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white py-2 px-5 rounded-lg font-medium text-sm flex items-center transition-colors`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/project/${auction._id}`)}
          >
            {displayStatus === 'ended' ? "View Results" : "View Details"}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const auctionsPerPage = 8;
  
  const categories = ['All', 'Construction', 'Plumbing', 'Electrical', 'Renovation', 'Interior'];
  const statuses = ['All', 'active', 'pending', 'ended'];
  
  // Fetch auctions from API
  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        // Make API call to get jobs from backend
        const response = await axios.get('http://localhost:5000/api/jobs');
        
        // Map the backend data structure to match the frontend component
        const formattedJobs = response.data.map(job => {
          // Process budget information
          let minBudget, maxBudget;
          
          // Extract from the budget if it's a string containing a range like "50000-100000"
          if (job.budget && typeof job.budget === 'string' && job.budget.includes('-')) {
            const [min, max] = job.budget.split('-').map(val => parseInt(val.replace(/[^\d]/g, '')) || 0);
            minBudget = min;
            maxBudget = max;
          } else {
            // Otherwise use the explicit minBudget and maxBudget fields if available
            minBudget = job.minBudget || 0;
            maxBudget = job.maxBudget || 0;
          }
          
          // Format the budget range as a string for display
          const budgetDisplay = formatBudgetRange(minBudget, maxBudget);
          
          return {
            _id: job._id,
            id: job._id,
            title: job.title,
            categories: Array.isArray(job.categories) ? job.categories : [job.category || 'General'],
            username: job.username || 'Unknown User', 
            contractor: job.username || 'Unknown',
            area: job.area || 'Not specified',
            description: job.description || 'No description provided',
            minBudget: minBudget,
            maxBudget: maxBudget,
            budget: budgetDisplay,
            biddingStartTime: job.biddingStartTime,
            biddingEndTime: job.biddingEndTime || new Date().toISOString(),
            startTime: job.biddingStartTime,
            endDate: job.biddingEndTime || new Date().toISOString(),
            status: job.status || 'Pending',
            date: job.date || new Date().toISOString(),
            bids: job.bids?.length || 0 // Use the length of the bids array if available
          };
        });
        
        console.log('Jobs fetched from database:', formattedJobs);
        setAuctions(formattedJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setLoading(false);
        // Optionally show an error message to the user
      }
    };
    
    // Helper function to format budget range
    const formatBudgetRange = (min, max) => {
      if (!min && !max) return 'Not specified';
      
      if (min && max) {
        return `LKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
      
      return min ? `LKR ${min.toLocaleString()}+` : `Up to LKR ${max.toLocaleString()}`;
    };
    
    fetchAuctions();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...auctions];
    
    // Apply category filter
    if (activeCategory !== 'All') {
      result = result.filter(auction => 
        auction.categories.includes(activeCategory)
      );
    }
    
    // Apply status filter
    if (activeStatus !== 'All') {
      if (activeStatus === 'ended') {
        // For ended auctions, check end date
        result = result.filter(auction => {
          const now = new Date();
          const endDate = new Date(auction.endDate);
          return now > endDate;
        });
      } else {
        // For active/pending, use the existing status
        result = result.filter(auction => 
          auction.status === activeStatus &&
          // For active, also ensure it hasn't ended
          (activeStatus !== 'active' || new Date() < new Date(auction.endDate))
        );
      }
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(auction => 
        auction.title.toLowerCase().includes(query) ||
        auction.contractor.toLowerCase().includes(query) ||
        auction.area.toLowerCase().includes(query) ||
        auction.description.toLowerCase().includes(query)
      );
    }
    
    // Get auction status for sorting
    const getAuctionStatusPriority = (auction) => {
      const now = new Date().getTime();
      const endDate = new Date(auction.endDate).getTime();
      const startTime = new Date(auction.startTime || auction.biddingStartTime).getTime();
      
      if (auction.status === 'Closed' || now > endDate) {
        return 3; // Ended auctions (lowest priority)
      } else if (auction.status === 'Active' || (now >= startTime && now <= endDate)) {
        return 1; // Active auctions (highest priority)
      } else {
        return 2; // Pending auctions (medium priority)
      }
    };
    
    // Apply sorting
    switch(sortOrder) {
      case 'budget-high-low':
        result = result.sort((a, b) => {
          // First sort by status priority
          const statusDiff = getAuctionStatusPriority(a) - getAuctionStatusPriority(b);
          if (statusDiff !== 0) return statusDiff;
          
          // Then by budget high to low
          const aBudget = parseInt(a.budget.replace(/[^\d]/g, '')) || 0;
          const bBudget = parseInt(b.budget.replace(/[^\d]/g, '')) || 0;
          return bBudget - aBudget;
        });
        break;
      case 'budget-low-high':
        result = result.sort((a, b) => {
          // First sort by status priority
          const statusDiff = getAuctionStatusPriority(a) - getAuctionStatusPriority(b);
          if (statusDiff !== 0) return statusDiff;
          
          // Then by budget low to high
          const aBudget = parseInt(a.budget.replace(/[^\d]/g, '')) || 0;
          const bBudget = parseInt(b.budget.replace(/[^\d]/g, '')) || 0;
          return aBudget - bBudget;
        });
        break;
      case 'date-newest':
        result = result.sort((a, b) => {
          // First sort by status priority
          const statusDiff = getAuctionStatusPriority(a) - getAuctionStatusPriority(b);
          if (statusDiff !== 0) return statusDiff;
          
          // Then by end date (soonest first)
          const aDate = new Date(a.endDate);
          const bDate = new Date(b.endDate);
          return aDate - bDate;
        });
        break;
      default:
        // Default sort: just by status priority (active first, then pending, then ended)
        result = result.sort((a, b) => {
          return getAuctionStatusPriority(a) - getAuctionStatusPriority(b);
        });
        break;
    }
    
    setFilteredAuctions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [auctions, activeCategory, activeStatus, searchQuery, sortOrder]);
  
  // Get current page auctions
  const indexOfLastAuction = currentPage * auctionsPerPage;
  const indexOfFirstAuction = indexOfLastAuction - auctionsPerPage;
  const currentAuctions = filteredAuctions.slice(indexOfFirstAuction, indexOfLastAuction);
  
  // Calculate page numbers
  const totalPages = Math.ceil(filteredAuctions.length / auctionsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add ContractorUserNav at the top */}
      <ContractorUserNav />
      
      {/* Hero Banner */}
      <motion.div 
        className="relative bg-gradient-to-r from-blue-800 to-indigo-900 overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0">
          <svg className="absolute right-0 bottom-0" width="440" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle opacity="0.1" cx="320" cy="250" r="320" fill="white" />
            <circle opacity="0.1" cx="350" cy="150" r="200" fill="white" />
            <circle opacity="0.05" cx="400" cy="350" r="250" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              <span className="block">Discover Active</span>
              <span className="block text-blue-200">Construction Auctions</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
              Explore and bid on active construction projects from professional homeowners around Sri Lanka.
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12">
        <motion.div 
          className="bg-white rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        ><br></br><br></br>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Search */}
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Projects</label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Search by title, contractor, location or description"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                      onClick={() => setActiveCategory(category)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <motion.button
                      key={status}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                      onClick={() => setActiveStatus(status)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex justify-end mt-6 border-t pt-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Sort by</span>
                <select 
                  className="border border-gray-300 text-gray-700 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="budget-high-low">Budget: High to Low</option>
                  <option value="budget-low-high">Budget: Low to High</option>
                  <option value="date-newest">Ending Soon</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {loading ? 'Loading auctions...' : (
              `${filteredAuctions.length} ${filteredAuctions.length === 1 ? 'auction' : 'auctions'} available`
            )}
          </h2>
        </div>
      </div>
      
      {/* Auction Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {loading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-1.5 bg-gray-300 w-full"></div>
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-end">
                  <div className="h-8 bg-gray-300 rounded w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAuctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentAuctions.map(auction => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                    } text-sm font-medium text-gray-500`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {pageNumbers.map(number => (
                    <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === number 
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                    } text-sm font-medium text-gray-500`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          // No results state
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No auctions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeCategory !== 'All' || activeStatus !== 'All' || searchQuery 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no active jobs in the system yet. Check back later or add a new job request.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setActiveStatus('All');
                  setSortOrder('default');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsPage;
