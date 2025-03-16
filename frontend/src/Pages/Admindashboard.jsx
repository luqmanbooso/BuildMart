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

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Admindashboard() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [userStats, setUserStats] = useState({ clients: 0, serviceProviders: 0 });
  const [activeUsers, setActiveUsers] = useState({ clients: [], serviceProviders: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const menuItems = [
    { name: 'Dashboard', icon: <FaChartLine /> },
    { name: 'Users', icon: <FaUsers /> },
    { name: 'Client\'s Requests', icon: <FaClipboardList /> },
    { name: 'Messages', icon: <FaWrench /> },
    { name: 'Inquiries', icon: <FaBuilding /> },
  ];

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with your actual API endpoint
        const response = await axios.get('http://localhost:5000/api/users');
        
        const clients = response.data.filter(user => user.role === 'Client');
        const serviceProviders = response.data.filter(user => user.role === 'Service Provider');
        
        setUserStats({
          clients: clients.length,
          serviceProviders: serviceProviders.length,
        });
        
        // Get most recently active users (just a sample)
        setActiveUsers({
          clients: clients.slice(0, 5),
          serviceProviders: serviceProviders.slice(0, 5)
        });
        
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Use sample data for demonstration
        setUserStats({ clients: 75, serviceProviders: 357 });
        setActiveUsers({
          clients: Array(5).fill().map((_, i) => ({ 
            id: `c${i}`, 
            username: `Client${i+1}`, 
            email: `client${i+1}@example.com`,
            lastActive: new Date(Date.now() - Math.random() * 8640000).toISOString()
          })),
          serviceProviders: Array(5).fill().map((_, i) => ({ 
            id: `sp${i}`, 
            username: `Provider${i+1}`, 
            email: `provider${i+1}@example.com`,
            lastActive: new Date(Date.now() - Math.random() * 8640000).toISOString()
          }))
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Doughnut chart data for biddings
  const biddingData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [81, 12, 7],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // Chart data for client growth
  const clientData = {
    labels: ['New', 'Returning'],
    datasets: [{
      data: [22, 78],
      backgroundColor: ['#10B981', '#E5E7EB'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // Chart data for revenue
  const revenueData = {
    labels: ['Direct', 'Commissions', 'Affiliates'],
    datasets: [{
      data: [62, 28, 10],
      backgroundColor: ['#3B82F6', '#A855F7', '#EC4899'],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  // Bar chart data
  const visitsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'This Week',
        data: [65, 92, 58, 87, 77, 42, 63],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      },
      {
        label: 'Last Week',
        data: [54, 73, 47, 80, 65, 35, 58],
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Modern and sleek design */}
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
          <div className="px-4 py-3 flex items-center text-blue-200 cursor-pointer hover:bg-blue-800/50 hover:text-white transition-all">
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Sakith</p>
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
                  <p className="text-sm font-medium text-gray-800">Mr.Sakith</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <FaAngleDown className="text-gray-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Clients Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
                  <FaUsers size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Clients</p>
                  <div className="flex items-end">
                    <h2 className="text-3xl font-bold text-gray-800">{userStats.clients}</h2>
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

            {/* Total Service Providers Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg">
                  <FaWrench size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Service Providers</p>
                  <div className="flex items-end">
                    <h2 className="text-3xl font-bold text-gray-800">{userStats.serviceProviders}</h2>
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

            {/* Completed Tasks Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-lg">
                  <FaTasks size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                  <div className="flex items-end">
                    <h2 className="text-3xl font-bold text-gray-800">128</h2>
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

            {/* Active Projects Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <FaBuilding size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <div className="flex items-end">
                    <h2 className="text-3xl font-bold text-gray-800">86</h2>
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">-3%</span>
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

          {/* Active Users Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          {client.profilePic ? 
                            <img src={client.profilePic} alt="Profile" className="h-10 w-10 rounded-full" /> : 
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
                    <div key={provider.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          {provider.profilePic ? 
                            <img src={provider.profilePic} alt="Profile" className="h-10 w-10 rounded-full" /> : 
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

          {/* Charts Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Biddings Chart */}
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
                    <h4 className="text-3xl font-bold text-gray-800">81%</h4>
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
                    <h4 className="text-3xl font-bold text-gray-800">22%</h4>
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
      </main>
    </div>
  );
}

export default Admindashboard;