// App.jsx
import React, { useState } from 'react';
import { FaUser, FaClipboardList, FaSearch, FaBell, FaSignOutAlt, FaEllipsisV } from 'react-icons/fa';
import buildMartLogo from '../assets/images/buildmart_logo1.png'; // You'll need to add your logo

function Admindashboard() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  
  const menuItems = [
    'Dashboard',
    'Users',
    'Client\'s Requests',
    'Messages',
    'Inquiries',
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <img src={buildMartLogo} alt="BuildMart Logo" className="h-12" />
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <div
              key={item}
              className={`px-6 py-3 flex items-center cursor-pointer ${
                activeMenu === item
                  ? 'bg-blue-950 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveMenu(item)}
            >
              <span>{item}</span>
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 w-60 border-t border-gray-200">
          <div className="px-6 py-3 flex items-center text-gray-700 cursor-pointer hover:bg-gray-100">
            <FaSignOutAlt className="mr-2" />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-3">
            <h1 className="text-2xl font-medium text-gray-700">Dashboard</h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="relative mr-4">
                <FaBell className="text-gray-500" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-sm">
                  <FaUser className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">Mr.Sakith</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-4">
            <p className="text-gray-500">Hi, Sakith. Welcome back to Admin Panel</p>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Clients */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
                  <FaUser size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold">75</h2>
                  <p className="text-gray-500">Total Clients</p>
                </div>
              </div>
            </div>

            {/* Total Service Providers */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
                  <FaUser size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold">357</h2>
                  <p className="text-gray-500">Total Service Providers</p>
                </div>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
                  <FaClipboardList size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold">128</h2>
                  <p className="text-gray-500">Completed Tasks</p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
                  <FaUser size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold">120</h2>
                  <p className="text-gray-500">Products</p>
                </div>
              </div>
            </div>

            {/* Suppliers */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
                  <FaUser size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold">20</h2>
                  <p className="text-gray-500">Suppliers</p>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
                  <FaClipboardList size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-semibold">200</h2>
                  <p className="text-gray-500">Completed Orders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 items-center">
                <div className="flex items-center">
                  <input type="checkbox" id="chart" className="mr-2" />
                  <label htmlFor="chart">Chart</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="showValue" checked className="mr-2" />
                  <label htmlFor="showValue">Show Value</label>
                </div>
              </div>
              <button>
                <FaEllipsisV />
              </button>
            </div>

            {/* Donut Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="relative h-40 w-40">
                  <div className="h-40 w-40 rounded-full border-16 border-red-400 flex items-center justify-center">
                    <div className="h-28 w-28 rounded-full bg-white"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold">81%</span>
                  </div>
                </div>
                <p className="mt-4 text-center font-medium">Total Biddings</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative h-40 w-40">
                  <div className="h-40 w-40 rounded-full border-16 border-green-400 flex items-center justify-center">
                    <div className="h-28 w-28 rounded-full bg-white"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold">22%</span>
                  </div>
                </div>
                <p className="mt-4 text-center font-medium">Client Growth</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative h-40 w-40">
                  <div className="h-40 w-40 rounded-full border-16 border-blue-400 flex items-center justify-center">
                    <div className="h-28 w-28 rounded-full bg-white"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold">62%</span>
                  </div>
                </div>
                <p className="mt-4 text-center font-medium">Total Revenue</p>
              </div>
            </div>

            {/* Visits Chart */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Visits</h3>
                <div className="flex items-center">
                  <div className="relative">
                    <select className="appearance-none border border-gray-300 rounded pl-4 pr-10 py-1">
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Yearly</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  <button className="ml-2">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64 flex items-end space-x-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-red-400 h-48"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-yellow-400 h-64"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-red-400 h-32"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-yellow-400 h-56"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-red-400 h-48"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-yellow-400 h-24"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-red-400 h-48"></div>
                  <span className="mt-2 text-sm">Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admindashboard;