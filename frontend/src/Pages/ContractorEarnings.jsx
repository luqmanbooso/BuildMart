import React, { useState } from 'react';
import { FaUserCircle, FaFileInvoiceDollar, FaDownload, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ContractorEarnings = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Saman',
    lastName: 'Perera',
    username: 'saman',
    email: 'samanperera@gmail.com'
  });

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Payment of Rs. 120,000 has been processed",
      time: "10 minutes ago",
      read: false
    },
    {
      id: 2,
      message: "New milestone payment available for Modern Villa project",
      time: "2 hours ago",
      read: false
    },
    {
      id: 3,
      message: "Monthly earnings summary is ready",
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

  // Sample earnings data
  const [earnings, setEarnings] = useState({
    totalEarnings: 1850000,
    pendingPayments: 450000,
    availableForWithdrawal: 250000,
    recentPayments: [
      { id: 1, projectName: "Office Building Renovation", amount: 420000, date: "2025-02-15", status: "Completed" },
      { id: 2, projectName: "Modern Villa Construction", amount: 850000, date: "2025-01-20", status: "Completed" },
      { id: 3, projectName: "Shopping Mall Interior", amount: 380000, date: "2024-12-10", status: "Completed" }
    ],
    pendingInvoices: [
      { id: 1, projectName: "Residential Complex", amount: 450000, date: "2025-03-10", status: "Pending" }
    ]
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/buildmart-logo.png" alt="BuildMart" className="h-10" />
          </div>
          <nav className="flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Auction</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">About Us</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Contact Us</a>
          </nav>
          <div className="flex items-center space-x-4">
            {/* Notification button */}
            <div className="relative">
              <button 
                className="p-2 rounded-full bg-gray-100 text-gray-600 focus:outline-none"
                onClick={toggleNotifications}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            <button className="p-2 rounded-full bg-gray-100">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="bg-blue-900 text-white px-4 py-2 rounded">Account</button>
          </div>
        </div>
      </header>

      {/* Main Title Banner */}
      <div className="bg-blue-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white">My Earnings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center pb-4 border-b">
              <FaUserCircle className="w-24 h-24 text-gray-500" />
              <h2 className="mt-2 text-xl font-bold">Mr. {personalInfo.firstName} {personalInfo.lastName}</h2>
              <p className="text-gray-500">{personalInfo.email}</p>
              <button className="mt-2 text-red-500 hover:text-red-700">Logout</button>
            </div>

            <nav className="mt-6 space-y-4">
              <a href="#" className="block py-2 hover:text-blue-700">My Requirements</a>
              <a href="#" className="block py-2 text-blue-700 flex items-center font-bold">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                My Earnings
              </a>
              <a href="#" className="block py-2 hover:text-blue-700">Bidding History</a>
              <a href="#" className="block py-2 hover:text-blue-700">Ongoing Works</a>
              <a href="#" className="block py-2 hover:text-blue-700">Account Settings</a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Earnings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                className="bg-white shadow-md rounded-md p-6 border-t-4 border-blue-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-gray-500 text-sm">Total Earnings</h3>
                <p className="text-3xl font-bold">Rs. {earnings.totalEarnings.toLocaleString()}</p>
                <div className="mt-2 flex items-center text-green-600">
                  <FaChartLine className="mr-1" />
                  <span className="text-sm">12% increase from last month</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white shadow-md rounded-md p-6 border-t-4 border-yellow-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className="text-gray-500 text-sm">Pending Payments</h3>
                <p className="text-3xl font-bold">Rs. {earnings.pendingPayments.toLocaleString()}</p>
                <p className="mt-2 text-gray-600 text-sm">Expected within 14 days</p>
              </motion.div>
              
              <motion.div 
                className="bg-white shadow-md rounded-md p-6 border-t-4 border-green-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="text-gray-500 text-sm">Available for Withdrawal</h3>
                <p className="text-3xl font-bold">Rs. {earnings.availableForWithdrawal.toLocaleString()}</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  <FaDownload className="mr-1" /> Withdraw Funds
                </button>
              </motion.div>
            </div>
            
            {/* Recent Payments */}
            <motion.div 
              className="bg-white shadow-md rounded-md p-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Payments</h2>
                <button className="flex items-center text-blue-700 hover:text-blue-900">
                  <FaFileInvoiceDollar className="mr-1" /> View All Transactions
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Project Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.recentPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{payment.projectName}</td>
                        <td className="py-3 px-4">Rs. {payment.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">{payment.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <FaDownload /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* Pending Payments */}
            <motion.div 
              className="bg-white shadow-md rounded-md p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pending Invoices</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Project Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Expected Payment Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.pendingInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{invoice.projectName}</td>
                        <td className="py-3 px-4">Rs. {invoice.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">{invoice.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="mb-4">Your all-in-one platform for finding top-rated contractors and architects. Compare bids, connect with professionals, and ensure secure payments with our escrow system. Build smarter, faster, and hassle-free!</p>
              <p className="text-sm mt-8">© 2025 BuildMart . All rights reserved</p>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:underline">About Us</a></li>
                    <li><a href="#" className="hover:underline">Register to bid</a></li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
                    <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
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

export default ContractorEarnings;