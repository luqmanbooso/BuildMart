import React, { useState } from 'react';
import { ChevronDown, Search, LogOut, Filter, Download, RefreshCw, Plus, MoreHorizontal, Calendar } from 'lucide-react';

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
              B
            </div>
            <h1 className="ml-2 text-xl font-bold text-gray-900">BuildMart</h1>
          </div>
        </div>
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Dashboard</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Users</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Client's Requests</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Biddings</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Feedbacks</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Inventory</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition duration-150">
              <span className="truncate">Suppliers</span>
            </a>
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-md transition duration-150">
              <span className="truncate">Finance</span>
            </a>
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-200">
          <div className="px-6 py-4">
            <a href="#" className="group flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition duration-150">
              <LogOut size={18} className="mr-3 text-gray-400 group-hover:text-gray-500" />
              <span>Log out</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-600 transition duration-150">
                  <Calendar size={20} />
                </button>
                <button className="text-gray-500 hover:text-gray-600 transition duration-150">
                  <RefreshCw size={20} />
                </button>
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                        src="https://via.placeholder.com/40"
                        alt="User"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Mr. S.S. Silva</span>
                      <span className="text-xs text-gray-500">Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
              <p className="mt-1 text-sm text-gray-600">
                {activeTab === 'service-providers' ? 'Manage payments to service providers' : 'Manage payments for inventory items'}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
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