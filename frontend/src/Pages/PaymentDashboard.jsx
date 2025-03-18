import React, { useState } from 'react';
import { 
  ChevronDown, Search, LogOut, Filter, Download, 
  Plus, MoreHorizontal, Calendar, CreditCard, 
  DollarSign, TrendingUp, Users, Box, Activity 
} from 'lucide-react';

function PaymentDashboard() {
  const [activeTab, setActiveTab] = useState('service-providers');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const serviceProviderPayments = [
    { id: '06c1774-7f3d-46dd...90a8', status: 'Succeeded', amount: 'Rs. 1500.00', method: 'visa', cardNumber: '4242', date: 'Mar 23, 2022, 13:00 PM', providerName: 'John Construction' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Pending', amount: 'Rs. 1500.00', method: 'mastercard', cardNumber: '2332', date: 'Mar 23, 2022, 13:00 PM', providerName: 'Elite Plumbing Services' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Declined', amount: 'Rs. 1500.00', method: 'mastercard', cardNumber: '2332', date: 'Mar 23, 2022, 13:00 PM', providerName: 'Supreme Electrical' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Succeeded', amount: 'Rs. 1500.00', method: 'mastercard', cardNumber: '2332', date: 'Mar 23, 2022, 13:00 PM', providerName: 'Perfect Interiors' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Create', amount: 'Rs. 1500.00', method: 'mastercard', cardNumber: '2332', date: 'Mar 23, 2022, 13:00 PM', providerName: 'Quality Painting Co.' }
  ];

  const itemsPayments = [
    { id: '06c1774-7f3d-46dd...90a8', status: 'Succeeded', amount: 'Rs. 1500.00', method: 'visa', cardNumber: '4242', date: 'Mar 23, 2022, 13:00 PM', itemName: 'Cement Bags (50kg)' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Pending', amount: 'Rs. 1500.00', method: 'mastercard', cardNumber: '2332', date: 'Mar 23, 2022, 13:00 PM', itemName: 'Steel Rods (Bundle)' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Succeeded', amount: 'Rs. 1500.00', method: 'visa', cardNumber: '4242', date: 'Mar 23, 2022, 13:00 PM', itemName: 'Plumbing Fixtures' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Succeeded', amount: 'Rs. 1500.00', method: 'visa', cardNumber: '4242', date: 'Mar 23, 2022, 13:00 PM', itemName: 'Electrical Wiring (100m)' },
    { id: '06c1774-7f3d-46dd...90a8', status: 'Succeeded', amount: 'Rs. 1500.00', method: 'visa', cardNumber: '4242', date: 'Mar 23, 2022, 13:00 PM', itemName: 'Paint (20L Bucket)' }
  ];

  const toggleSelectAll = () => {
    setIsAllSelected(!isAllSelected);
    setSelectedRows(isAllSelected ? [] : 
      activeTab === 'service-providers' 
        ? serviceProviderPayments.map((_, index) => index) 
        : itemsPayments.map((_, index) => index));
  };

  const toggleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Succeeded': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      'Declined': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
      'Create': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    
    return (
      <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 ${config.dot} rounded-full mr-1.5`}></span>
        {status}
      </span>
    );
  };

  const getCardIcon = (method) => {
    if (method === 'visa') {
      return (
        <div className="flex items-center space-x-1.5">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">VISA</span>
          <span className="text-gray-500 text-xs">**** 4242</span>
        </div>
      );
    } else if (method === 'mastercard') {
      return (
        <div className="flex items-center space-x-1.5">
          <div className="bg-red-100 text-red-700 p-1 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
            MC
          </div>
          <span className="text-gray-500 text-xs">**** 2332</span>
        </div>
      );
    }
    return null;
  };

  const renderPaymentTable = (data) => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </div>
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment ID
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {activeTab === 'service-providers' ? 'Provider Name' : 'Item Name'}
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creation Date
            </th>
            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((payment, index) => (
            <tr key={index} className={`${selectedRows.includes(index) ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={selectedRows.includes(index)}
                    onChange={() => toggleSelectRow(index)}
                  />
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {payment.id}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {activeTab === 'service-providers' ? payment.providerName : payment.itemName}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {getStatusBadge(payment.status)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{payment.amount}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {getCardIcon(payment.method)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{payment.date}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Add new stats data
  const stats = [
    {
      title: "Total Payments",
      value: "Rs. 124,500.00",
      change: "+12.5%",
      icon: <DollarSign className="h-6 w-6 text-blue-600" />,
      trend: "up"
    },
    {
      title: "Active Providers",
      value: "45",
      change: "+5.6%",
      icon: <Users className="h-6 w-6 text-green-600" />,
      trend: "up"
    },
    {
      title: "Pending Payments",
      value: "Rs. 23,500.00",
      change: "-2.3%",
      icon: <CreditCard className="h-6 w-6 text-yellow-600" />,
      trend: "down"
    },
    {
      title: "Items Purchased",
      value: "289",
      change: "+18.2%",
      icon: <Box className="h-6 w-6 text-purple-600" />,
      trend: "up"
    }
  ];

  // Add payment method distribution data
  const paymentMethods = [
    { method: 'Visa', percentage: 45 },
    { method: 'Mastercard', percentage: 35 },
    { method: 'Bank Transfer', percentage: 20 }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Modern Sidebar */}
      <div className="w-64 bg-white shadow-xl">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              BuildMart
            </h1>
          </div>
        </div>

        {/* Updated Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {['Dashboard', 'Users', "Client's Requests", 'Biddings', 'Feedbacks', 'Inventory', 'Suppliers', 'Finance'].map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item === 'Finance'
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{item}</span>
                {item === 'Finance' && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Active
                  </span>
                )}
              </a>
            ))}
          </div>
        </nav>

        {/* Updated Logout Section */}
        <div className="absolute bottom-0 w-64 border-t border-gray-100">
          <div className="px-6 py-4">
            <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <LogOut size={18} className="mr-2 text-gray-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Enhanced Search */}
              <div className="relative w-96">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments, providers, items..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* User Profile Section */}
              <div className="flex items-center space-x-6">
                <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Calendar size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Activity size={20} />
                </button>
                
                {/* Enhanced Profile Button */}
                <div className="relative">
                  <button className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <img
                      className="h-10 w-10 rounded-lg object-cover ring-2 ring-gray-100"
                      src="https://via.placeholder.com/40"
                      alt="User"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-700">Mr. S.S. Silva</span>
                      <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <TrendingUp 
                      size={16} 
                      className={`ml-2 ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      } ${stat.trend === 'down' ? 'transform rotate-180' : ''}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Methods Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
              <div className="flex items-center space-x-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">{method.method}</span>
                      <span className="text-sm font-semibold text-gray-900">{method.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Existing Table Section with updated styling */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button 
                    className={`px-6 py-4 text-sm font-medium transition duration-150 border-b-2 ${activeTab === 'service-providers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('service-providers')}
                  >
                    Service Providers
                  </button>
                  <button 
                    className={`px-6 py-4 text-sm font-medium transition duration-150 border-b-2 ${activeTab === 'items' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('items')}
                  >
                    Items
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                      <Download size={16} className="mr-2" />
                      Export
                    </button>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                    <Plus size={16} className="mr-2" />
                    New Payment
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden">
                {activeTab === 'service-providers' 
                  ? renderPaymentTable(serviceProviderPayments) 
                  : renderPaymentTable(itemsPayments)
                }
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </a>
                  <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </a>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">20</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <ChevronDown className="h-5 w-5 rotate-90" />
                      </a>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 bg-blue-50">
                        1
                      </a>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        2
                      </a>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        3
                      </a>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        8
                      </a>
                      <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <ChevronDown className="h-5 w-5 -rotate-90" />
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PaymentDashboard;