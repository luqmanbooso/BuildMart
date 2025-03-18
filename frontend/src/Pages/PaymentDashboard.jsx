import React, { useState } from 'react';
import { ChevronDown, Search, LogOut, Filter, Download, RefreshCw, Plus, MoreHorizontal, Calendar } from 'lucide-react';

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
        </nav>
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