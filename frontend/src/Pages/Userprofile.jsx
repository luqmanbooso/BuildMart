import React, { useState } from 'react';

const UserProfilePage = () => {
  const [user, setUser] = useState({
    name: 'Mr.Saman Perera',
    email: 'samanperera@gmail.com',
    memberSince: 'January 2023',
    completedProjects: 12,
    ongoingProjects: 3,
    rating: 4.8,
    requests: [
      {
        id: '01',
        title: 'Fix a Leaking Water Sink',
        category: 'Plumbing',
        area: 'Colombo',
        budget: 'LKR : 5000-8000',
        status: 'Active',
        date: '12 Mar 2025',
        bids: 4
      },
      {
        id: '02',
        title: 'Kitchen Cabinet Installation',
        category: 'Carpentry',
        area: 'Kandy',
        budget: 'LKR : 15000-25000',
        status: 'Pending',
        date: '10 Mar 2025',
        bids: 2
      }
    ]
  });

  const [activeTab, setActiveTab] = useState('requirements');
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Modern Header with Glass Effect */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg shadow-lg py-4 px-6`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <img src="/logo.png" alt="BuildMart Logo" className="h-8" />
            </div>
            <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>BuildMart</span>
          </div>
          
          <nav className="hidden lg:flex space-x-8">
            {['Home', 'Auction', 'Projects', 'About Us', 'Contact Us'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className={`font-medium relative group ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-700'} transition-colors duration-300`}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-300`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 p-2`}>
                  <div className="p-3">
                    <h3 className="font-medium">Notifications</h3>
                    <div className={`mt-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} flex items-start space-x-3`}>
                      <div className="bg-blue-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">New bid received</p>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>You received a new bid on your kitchen project</p>
                        <p className="text-xs text-blue-500 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              <span>Account</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Stylish Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-70"></div>
          <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1920x300')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-500/30 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold text-white leading-tight">My <span className="text-blue-300">Account</span></h1>
          <p className="mt-4 text-blue-200 max-w-xl">Manage your projects, track bids, and connect with top professionals in the construction industry.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar with user card */}
            <div className="lg:w-1/4">
              {/* User Profile Card */}
              <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden mb-6`}>
                <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="relative px-6 pb-6">
                  <div className="flex justify-center">
                    <div className="absolute -top-10 rounded-full border-4 border-white dark:border-gray-800 p-1 bg-white dark:bg-gray-800">
                      <div className="h-16 w-16 bg-blue-500 rounded-full flex justify-center items-center">
                        <span className="text-white text-xl">{user.name[0]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 text-center">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{user.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{`Member since ${user.memberSince}`}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white">Completed Projects</span>
                          <span className="block text-gray-600 dark:text-gray-300">{user.completedProjects}</span>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white">Ongoing Projects</span>
                          <span className="block text-gray-600 dark:text-gray-300">{user.ongoingProjects}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white">Rating</span>
                          <span className="block text-gray-600 dark:text-gray-300">{user.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:w-3/4">
              <div className="flex justify-start space-x-8 mb-6">
                {['requirements', 'transactions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-medium py-2 px-6 rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'requirements' ? 'My Requirements' : 'Transaction History'}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    {user.requests.map((request, index) => (
                      <div
                        key={`${request.id}-${index}`}
                        className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'} flex justify-between`}
                      >
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">{request.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{request.category}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{request.date}</p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              request.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <p className="mt-4 text-gray-500">Your transaction history will be displayed here soon.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2025 BuildMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserProfilePage;
