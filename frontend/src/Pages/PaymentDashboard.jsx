import React, { useState } from 'react';
import { ChevronDown, Search, LogOut } from 'lucide-react';

function PaymentDashboard() {
  const [activeTab, setActiveTab] = useState('service-providers');

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

  const getStatusBadge = (status) => {
    if (status === 'Succeeded') {
      return <span className="flex items-center text-xs"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Succeeded</span>;
    } else if (status === 'Pending') {
      return <span className="flex items-center text-xs"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span> Pending</span>;
    } else if (status === 'Declined') {
      return <span className="flex items-center text-xs"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Declined</span>;
    } else if (status === 'Create') {
      return <span className="flex items-center text-xs"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Create</span>;
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
          <span className="bg-red-50 text-red-700 p-1 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-1"></span>
          <span className="text-gray-500 text-xs">**** 2332</span>
        </div>
      );
    }
    return null;
  };

  const renderPaymentTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-white">
          <tr>
            <th className="w-6 px-2 py-3 text-left">
              <input type="checkbox" className="h-4 w-4" />
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              Payment ID
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              {activeTab === 'service-providers' ? 'Provider Name' : 'Item Name'}
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              Status
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              Amount
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              P. Method
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              Creation Date
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((payment, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-2 py-3 whitespace-nowrap">
                <input type="checkbox" className="h-4 w-4" />
              </td>
              <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                {payment.id}
              </td>
              <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {activeTab === 'service-providers' ? payment.providerName : payment.itemName}
              </td>
              <td className="px-2 py-3 whitespace-nowrap">
                {getStatusBadge(payment.status)}
              </td>
              <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                {payment.amount}
              </td>
              <td className="px-2 py-3 whitespace-nowrap">
                {getCardIcon(payment.method)}
              </td>
              <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                {payment.date}
              </td>
              <td className="px-2 py-3 whitespace-nowrap text-right text-sm">
                <button className="text-gray-400 hover:text-gray-500">
                  <ChevronDown size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <img src="/logo.png" alt="BuildMart Logo" className="h-8" />
            <h1 className="ml-2 text-xl font-bold text-blue-900">BuildMart</h1>
          </div>
        </div>
        <nav className="mt-8">
          <div className="px-4">
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Client's Requests</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Biddings</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Feedbacks</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Inventory</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              <span>Suppliers</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-blue-700 bg-blue-50 rounded-md">
              <span>Finance</span>
            </a>
          </div>
          <div className="px-8 mt-auto py-4 absolute bottom-0">
            <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src="https://via.placeholder.com/40"
                alt="User"
              />
              <div className="ml-2">
                <div className="text-sm font-medium text-gray-900">Mr.S.S.Silva</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Finance</h1>
            <div className="mt-1">
              {activeTab === 'service-providers' ? (
                <h2 className="text-sm text-gray-600">Service Providers</h2>
              ) : (
                <h2 className="text-sm text-gray-600">Items</h2>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex space-x-4">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'service-providers' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('service-providers')}
              >
                Service Providers
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'items' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('items')}
              >
                Items
              </button>
            </div>

            {/* Content */}
            <div className="bg-white shadow">
              {activeTab === 'service-providers' ? renderPaymentTable(serviceProviderPayments) : renderPaymentTable(itemsPayments)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PaymentDashboard;