import React, { useState } from 'react';
import { 
  ChevronDown, Search, LogOut, Filter, Download, 
  Plus, MoreHorizontal, Calendar, CreditCard, 
  DollarSign, TrendingUp, Users, Box, Activity,
  LayoutDashboard, ShoppingCart, Wallet, 
  ArrowDownRight, ArrowUpRight // Add these new icons
} from 'lucide-react';

function PaymentDashboard() {
  const [activePage, setActivePage] = useState('Dashboard');
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

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Service Providers', icon: <Users size={20} /> },
    { name: 'Inventory Sales', icon: <ShoppingCart size={20} /> },
    { name: 'Wages', icon: <Wallet size={20} /> },
    { name: 'Incomes', icon: <ArrowUpRight size={20} /> },
    { name: 'Expenses', icon: <ArrowDownRight size={20} /> }
  ];

  const renderPageContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
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
          </div>
        );

      case 'Service Providers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Service Provider Management</h2>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Plus size={16} className="mr-2" />
                  Add Provider
                </button>
              </div>
              {renderPaymentTable(serviceProviderPayments)}
            </div>
          </div>
        );

      case 'Inventory Sales':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Inventory Sales Records</h2>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Plus size={16} className="mr-2" />
                  New Sale
                </button>
              </div>
              {renderPaymentTable(itemsPayments)}
            </div>
          </div>
        );

      case 'Wages':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Employee Wages</h2>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Plus size={16} className="mr-2" />
                  New Payment
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { name: 'John Doe', position: 'Mason', hours: 40, rate: 'Rs. 200/hr', total: 'Rs. 8,000', status: 'Paid' },
                    { name: 'Jane Smith', position: 'Carpenter', hours: 35, rate: 'Rs. 180/hr', total: 'Rs. 6,300', status: 'Pending' },
                    { name: 'Mike Johnson', position: 'Electrician', hours: 45, rate: 'Rs. 250/hr', total: 'Rs. 11,250', status: 'Processing' }
                  ].map((employee, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.hours}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.rate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(employee.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Incomes':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Income Tracking</h2>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Plus size={16} className="mr-2" />
                  Record Income
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Income', value: 'Rs. 450,000', trend: '+12.5%' },
                  { label: 'This Month', value: 'Rs. 125,000', trend: '+5.2%' },
                  { label: 'Last Month', value: 'Rs. 115,000', trend: '+3.8%' }
                ].map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Expenses':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Expense Management</h2>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Plus size={16} className="mr-2" />
                  Add Expense
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: 'Materials', amount: 'Rs. 250,000', items: 45 },
                  { category: 'Equipment', amount: 'Rs. 180,000', items: 12 },
                  { category: 'Labor', amount: 'Rs. 320,000', items: 28 },
                  { category: 'Transportation', amount: 'Rs. 45,000', items: 15 },
                  { category: 'Utilities', amount: 'Rs. 25,000', items: 8 },
                  { category: 'Miscellaneous', amount: 'Rs. 30,000', items: 20 }
                ].map((expense, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900">{expense.category}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{expense.amount}</p>
                    <p className="text-sm text-gray-500 mt-1">{expense.items} items</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.name);
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.name === activePage
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex items-center justify-center mr-3 text-gray-500">
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
                {item.name === activePage && (
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
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">{activePage}</h1>
              <p className="mt-2 text-sm text-gray-500">
                Manage your {activePage.toLowerCase()} and related activities
              </p>
            </div>
            
            {/* Dynamic Page Content */}
            {renderPageContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PaymentDashboard;