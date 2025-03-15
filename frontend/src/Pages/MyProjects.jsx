import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProjectsPage = () => {
  // Sample data for ongoing bids
  const [ongoingBids, setOngoingBids] = useState([
    {
      id: 'PRJ-2025-0042',
      name: 'Home Renovation Project',
      currentBid: 175000,
      deadline: 'March 25, 2025',
      isEditing: false,
      newBidAmount: ''
    },
    {
      id: 'PRJ-2025-0038',
      name: 'Office Interior Design',
      currentBid: 250000,
      deadline: 'March 20, 2025',
      isEditing: false,
      newBidAmount: ''
    }
  ]);

  // Sample data for ongoing work
  const [ongoingWork, setOngoingWork] = useState([
    {
      id: 'PRJ-2025-0035',
      name: 'Kitchen Remodeling',
      contractAmount: 320000,
      deadline: 'April 15, 2025',
      progress: 45,
      status: 'In Progress'
    },
    {
      id: 'PRJ-2025-0029',
      name: 'Bathroom Tiling',
      contractAmount: 180000,
      deadline: 'March 30, 2025',
      progress: 75,
      status: 'Almost Complete'
    }
  ]);

  // Track active tab
  const [activeTab, setActiveTab] = useState('ongoingWork');

  // Toggle edit mode for bids
  const toggleEditMode = (id) => {
    setOngoingBids(ongoingBids.map(bid => 
      bid.id === id ? { ...bid, isEditing: !bid.isEditing, newBidAmount: '' } : bid
    ));
  };
  
  // Update bid amount in state
  const handleBidAmountChange = (id, value) => {
    setOngoingBids(ongoingBids.map(bid => 
      bid.id === id ? { ...bid, newBidAmount: value } : bid
    ));
  };
  
  // Submit updated bid
  const updateBid = (id) => {
    setOngoingBids(ongoingBids.map(bid => {
      if (bid.id === id && bid.newBidAmount) {
        const numValue = parseFloat(bid.newBidAmount.replace(/,/g, ''));
        return { 
          ...bid, 
          currentBid: isNaN(numValue) ? bid.currentBid : numValue, 
          isEditing: false,
          newBidAmount: '' 
        };
      }
      return bid;
    }));
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
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { 
      style: 'currency', 
      currency: 'LKR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center">
            <img src="/api/placeholder/150/50" alt="BuildMart Logo" className="h-8" />
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-800">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-800">Auction</a>
            <a href="#" className="text-gray-700 hover:text-blue-800">About Us</a>
            <a href="#" className="text-gray-700 hover:text-blue-800">Contact Us</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100 text-gray-600">
              🔍
            </button>
            <button className="bg-blue-900 text-white py-2 px-4 rounded font-medium">
              Account
            </button>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1 
            className="text-4xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Projects
          </motion.h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            className="md:w-64 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                👤
              </div>
              <h3 className="text-lg font-semibold">Mr. Saman Perera</h3>
              <p className="text-sm text-gray-500 mb-2">samanperera@gmail.com</p>
              <a href="#" className="text-red-500 font-semibold hover:underline">Logout</a>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <nav>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="text-blue-800 font-semibold flex items-center">
                      → My Projects
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-700 hover:text-blue-800">My Requirements</a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-700 hover:text-blue-800">Transaction History</a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-700 hover:text-blue-800">Bidding History</a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-700 hover:text-blue-800">Account Settings</a>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
          
          {/* Projects Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Current Projects</h2>
             
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm mr-4 border-b-2 ${
                  activeTab === 'ongoingWork' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('ongoingWork')}
              >
                Ongoing Work
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'ongoingBids' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('ongoingBids')}
              >
                Ongoing Bids
              </button>
            </div>
            
            {/* Project Sections */}
            <div className="grid md:grid-cols-1 gap-6">
              {/* Ongoing Work Section */}
              {activeTab === 'ongoingWork' && (
                <motion.div 
                  className="bg-gray-100 rounded-lg p-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key="ongoingWork"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-blue-900">Ongoing Work</h3>
                    <a href="#" className="text-blue-600 text-sm font-medium hover:underline">View All</a>
                  </div>
                  
                  {ongoingWork.map(work => (
                    <motion.div 
                      key={work.id}
                      className="bg-white rounded-lg p-4 mb-4 shadow-sm"
                      variants={itemVariants}
                    >
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">{work.name}</h4>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-500">Project ID:</span>
                        <span>{work.id}</span>
                      </div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-500">Contract Amount:</span>
                        <span>{formatCurrency(work.contractAmount)}</span>
                      </div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-500">Deadline:</span>
                        <span>{work.deadline}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-medium text-blue-600">{work.status}</span>
                      </div>
                      
                      <div className="mt-2 mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{work.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <motion.div 
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${work.progress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${work.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          ></motion.div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <motion.button
                          className="bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Update Progress
                        </motion.button>
                        <motion.button
                          className="bg-gray-200 text-gray-600 py-2 px-4 rounded text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {/* Ongoing Bids Section */}
              {activeTab === 'ongoingBids' && (
                <motion.div 
                  className="bg-gray-100 rounded-lg p-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key="ongoingBids"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-blue-900">Ongoing Bids</h3>
                    <a href="#" className="text-blue-600 text-sm font-medium hover:underline">View All</a>
                  </div>
                  
                  {ongoingBids.map(bid => (
                    <motion.div 
                      key={bid.id}
                      className="bg-white rounded-lg p-4 mb-4 shadow-sm"
                      variants={itemVariants}
                    >
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">{bid.name}</h4>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-500">Project ID:</span>
                        <span>{bid.id}</span>
                      </div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-500">Current Bid:</span>
                        <span>{formatCurrency(bid.currentBid)}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-gray-500">Deadline:</span>
                        <span>{bid.deadline}</span>
                      </div>
                      
                      {bid.isEditing ? (
                        <div className="mt-4">
                          <div className="mb-2">
                            <label className="block text-sm text-gray-500 mb-1">Update Bid Amount</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                              placeholder="Enter new amount"
                              value={bid.newBidAmount}
                              onChange={(e) => handleBidAmountChange(bid.id, e.target.value)}
                            />
                          </div>
                          <div className="flex justify-between">
                            <motion.button
                              className="bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium"
                              onClick={() => updateBid(bid.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Update Bid
                            </motion.button>
                            <motion.button
                              className="bg-gray-200 text-gray-600 py-2 px-4 rounded text-sm font-medium"
                              onClick={() => toggleEditMode(bid.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between mt-4">
                          <motion.button
                            className="bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium"
                            onClick={() => toggleEditMode(bid.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Update Bid
                          </motion.button>
                          <motion.button
                            className="bg-gray-200 text-gray-600 py-2 px-4 rounded text-sm font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View Details
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;