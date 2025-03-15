import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BiddingHistoryPage = () => {
  // Sample bidding history data
  const [biddingHistory, setBiddingHistory] = useState([
    {
      id: 1,
      projectName: "Modern Villa Construction",
      projectOwner: "Jane Smith",
      bidAmount: 8500000,
      bidDate: "2025-02-15",
      status: "Active",
      deadline: "2025-03-30"
    },
    {
      id: 2,
      projectName: "Office Building Renovation",
      projectOwner: "Acme Corp",
      bidAmount: 4200000,
      bidDate: "2025-02-01",
      status: "Won",
      deadline: "2025-02-28"
    },
    {
      id: 3,
      projectName: "Residential Complex",
      projectOwner: "Urban Developers",
      bidAmount: 12750000,
      bidDate: "2025-01-20",
      status: "Lost",
      deadline: "2025-02-10"
    },
    {
      id: 4,
      projectName: "Shopping Mall Interior",
      projectOwner: "Metro Retail",
      bidAmount: 3800000,
      bidDate: "2025-01-05",
      status: "Expired",
      deadline: "2025-01-25"
    }
  ]);

  // Sample notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your bid for Modern Villa Construction has been outbid",
      time: "30 minutes ago",
      read: false
    },
    {
      id: 2,
      message: "The auction for Shopping Mall Interior has closed",
      time: "5 hours ago",
      read: false
    },
    {
      id: 3,
      message: "You won the bid for Office Building Renovation!",
      time: "1 day ago",
      read: true
    }
  ]);
  
  // Show/hide notifications dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Won': return 'bg-green-500';
      case 'Lost': return 'bg-red-500';
      case 'Active': return 'bg-blue-500';
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

  return (
    <div className="bg-white min-h-screen">
      {/* Header with navigation */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/api/placeholder/120/50" alt="BuildMart Logo" className="h-12" />
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#" className="text-gray-800">Home</a>
              <a href="#" className="text-gray-800">Auction</a>
              <a href="#" className="text-gray-800">About Us</a>
              <a href="#" className="text-gray-800">Contact Us</a>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="p-2 rounded-full bg-gray-100 text-gray-600 focus:outline-none"
                  onClick={toggleNotifications}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 text-center border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              <button className="p-2 rounded-full bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
              <button className="bg-blue-900 text-white px-4 py-2 rounded">
                Account
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main title banner */}
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

      {/* Main content area */}
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
              <h2 className="text-xl font-bold">Mr. Saman Perera</h2>
              <p className="text-gray-500 text-sm">samanperera@gmail.com</p>
              <button className="text-red-500 mt-2">Logout</button>
            </div>
            
            <ul className="space-y-2 border-t pt-4">
              <li><a href="#" className="block py-2 text-gray-700">My Requirements</a></li>
              <li><a href="#" className="block py-2 text-gray-700">Transaction History</a></li>
              <li><a href="#" className="block py-2 text-blue-600 font-bold">Bidding History</a></li>
              <li><a href="#" className="block py-2 text-gray-700">Ongoing Works</a></li>
              <li><a href="#" className="block py-2 text-gray-700">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Account Settings
                </span>
              </a></li>
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
                  <select className="border rounded px-4 py-2 text-sm">
                    <option>All Bids</option>
                    <option>Active</option>
                    <option>Won</option>
                    <option>Lost</option>
                    <option>Expired</option>
                  </select>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Filter</button>
                </div>
              </div>

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
                      <th className="text-left py-3 px-4 font-semibold text-sm">Project Owner</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Bid Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Bid Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Deadline</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biddingHistory.map((bid) => (
                      <motion.tr 
                        key={bid.id} 
                        variants={itemVariants}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{bid.projectName}</td>
                        <td className="py-3 px-4">{bid.projectOwner}</td>
                        <td className="py-3 px-4">Rs. {bid.bidAmount.toLocaleString()}</td>
                        <td className="py-3 px-4">{bid.bidDate}</td>
                        <td className="py-3 px-4">{bid.deadline}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(bid.status)}`}>
                            {bid.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">View</button>
                            {bid.status === 'Active' && (
                              <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">Showing 1-4 of 4 entries</p>
                <div className="flex space-x-1">
                  <button className="px-3 py-1 border rounded bg-gray-100">&lt;</button>
                  <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
                  <button className="px-3 py-1 border rounded bg-gray-100">&gt;</button>
                </div>
              </div>
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
                  <p className="text-2xl font-bold">4</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Won Bids</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Lost Bids</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Active Bids</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="mb-4">Your all-in-one platform for finding top-rated contractors and architects. Compare bids, connect with professionals, and ensure secure payments with our escrow system. Build smarter, faster, and hassle-free!</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Register to bid</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-white text-blue-900 p-2 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="bg-white text-blue-900 p-2 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.46 6c-.77.34-1.6.57-2.46.67a4.28 4.28 0 001.88-2.37 8.56 8.56 0 01-2.72 1.04 4.27 4.27 0 00-7.29 3.89A12.13 12.13 0 013 4.67a4.27 4.27 0 001.32 5.7 4.27 4.27 0 01-1.93-.53v.05a4.27 4.27 0 003.42 4.18 4.27 4.27 0 01-1.92.07 4.27 4.27 0 003.99 2.97A8.56 8.56 0 012 19.54a12.07 12.07 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.72 8.72 0 0024 4.56a8.56 8.56 0 01-2.54.7z"/>
                  </svg>
                </a>
                <a href="#" className="bg-white text-blue-900 p-2 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.87 8.14 6.84 9.46.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.5-4.46-9.96-9.96-9.96z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BiddingHistoryPage;