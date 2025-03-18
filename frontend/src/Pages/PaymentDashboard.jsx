import React, { useState } from 'react';
import { ChevronDown, Search, LogOut, Filter, Calendar, Download, MoreHorizontal, ChevronRight, DollarSign, CreditCard, AlertTriangle, Clock, BarChart2 } from 'lucide-react';

function PaymentDashboard() {
  const [activeTab, setActiveTab] = useState('service-providers');
  const [dateRange, setDateRange] = useState('This month');
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
    if (status === 'Succeeded') {
      return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>Succeeded</span>;
    } else if (status === 'Pending') {
      return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>Pending</span>;
    } else if (status === 'Declined') {
      return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>Declined</span>;
    } else if (status === 'Create') {
      return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>Create</span>;
    }
    return null;
  };

  const getCardIcon = (method) => {
    if (method === 'visa') {
      return (
        <div className="flex items-center">
          <span className="bg-blue-50 text-blue-700 p-1 rounded text-xs font-bold mr-1">VISA</span>
          <span className="text-gray-500 text-xs">**** 4242</span>
        </div>
      );
    } else if (method === 'mastercard') {
      return (
        <div className="flex items-center">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-1 rounded text-xs font-bold mr-1">MC</span>
          <span className="text-gray-500 text-xs">**** 2332</span>
        </div>
      );
    }
    return null;
  };

  // Dashboard metrics
  const metrics = [
    { title: "Total Payments", value: "Rs. 135,500.00", icon: <DollarSign size={20} className="text-green-500" />, change: "+12.5%", trend: "up", bgColor: "bg-green-50" },
    { title: "Pending", value: "Rs. 4,500.00", icon: <Clock size={20} className="text-yellow-500" />, change: "-3.2%", trend: "down", bgColor: "bg-yellow-50" },
    { title: "Declined", value: "Rs. 1,500.00", icon: <AlertTriangle size={20} className="text-red-500" />, change: "-8.1%", trend: "down", bgColor: "bg-red-50" },
    { title: "Card Payments", value: "42", icon: <CreditCard size={20} className="text-blue-500" />, change: "+5.3%", trend: "up", bgColor: "bg-blue-50" },
  ];

  const renderPaymentTable = (data) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-6 px-4 py-3.5 text-left">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment ID
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {activeTab === 'service-providers' ? 'Provider Name' : 'Item Name'}
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              P. Method
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creation Date
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((payment, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-4 py-4 whitespace-nowrap">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                {payment.id}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {activeTab === 'service-providers' ? payment.providerName : payment.itemName}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(payment.status)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {payment.amount}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getCardIcon(payment.method)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.date}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100">
                    <Download size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg z-10 relative">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <img src="/logo.png" alt="BuildMart Logo" className="h-8" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-800">BuildMart</h1>
          </div>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <BarChart2 size={18} className="mr-3 text-gray-400 group-hover:text-blue-600" />
              <span className="group-hover:text-blue-600">Dashboard</span>
            </a>
            
            {/* More menu items */}
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <span className="group-hover:text-blue-600">Users</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <span className="group-hover:text-blue-600">Client's Requests</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <span className="group-hover:text-blue-600">Biddings</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <span className="group-hover:text-blue-600">Feedbacks</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <span className="group-hover:text-blue-600">Inventory</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <span className="group-hover:text-blue-600">Suppliers</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-blue-700 bg-blue-50 rounded-lg">
              <span>Finance</span>
              <ChevronRight size={16} className="ml-auto" />
            </a>
          </div>
          
          <div className="px-4 mt-8 pt-6 border-t border-gray-200">
            <a href="#" className="flex items-center text-gray-600 hover:text-gray-900 group">
              <LogOut size={18} className="mr-3 text-gray-400 group-hover:text-red-500" />
              <span className="group-hover:text-red-500">Logout</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center px-8 py-4">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search payments, providers, or items..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                  <span className="sr-only">Notifications</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </div>
              
              <div className="flex items-center pl-4 border-l">
                <img
                  className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                  src="https://via.placeholder.com/40"
                  alt="User"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Mr.S.S.Silva</div>
                  <div className="text-xs text-gray-500">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Monitor and manage all financial transactions
                </p>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Calendar size={16} className="mr-2" />
                    {dateRange}
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Download size={16} className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className={`p-6 rounded-xl shadow-sm border border-gray-100 ${metric.bgColor}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    {metric.icon}
                  </div>
                </div>
                <div className={`mt-4 flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend === 'up' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                    </svg>
                  )}
                  <span>{metric.change} from last month</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Tabs with filter */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button 
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'service-providers' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('service-providers')}
                >
                  Service Providers
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'items' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('items')}
                >
                  Items
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">
                  <Filter size={16} className="mr-2 text-gray-400" />
                  Filter
                  <ChevronDown size={16} className="ml-2 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow">
              {activeTab === 'service-providers' ? renderPaymentTable(serviceProviderPayments) : renderPaymentTable(itemsPayments)}
              
              {/* Pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                      Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">12</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        1
                      </a>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100">
                        2
                      </a>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        3
                      </a>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        8
                      </a>
                      <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
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