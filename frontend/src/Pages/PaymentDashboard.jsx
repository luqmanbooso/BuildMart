import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Search, LogOut, Filter, Download, 
  Plus, MoreHorizontal, Calendar, CreditCard, 
  DollarSign, TrendingUp, Users, Box, Activity,
  LayoutDashboard, ShoppingCart, Wallet, 
  ArrowDownRight, ArrowUpRight, Loader, RefreshCw
} from 'lucide-react';

function PaymentDashboard() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('service-providers');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // New state variables for API data
  const [payments, setPayments] = useState([]);
  const [serviceProviderPayments, setServiceProviderPayments] = useState([]);
  const [itemsPayments, setItemsPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    activeProviders: 0,
    itemsPurchased: 0,
    pendingAmount: 0
  });
  const [paymentMethodsData, setPaymentMethodsData] = useState([
    { method: 'Visa', percentage: 0 },
    { method: 'Mastercard', percentage: 0 },
    { method: 'Other', percentage: 0 }
  ]);

  // Fetch payments from the backend API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/payments');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setPayments(data);
      
      // Process payment data
      processPaymentData(data);
      
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch payment data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process and categorize payment data
  const processPaymentData = (data) => {
    // Initialize counters and arrays
    const stats = {
      totalAmount: 0,
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0,
      activeProviders: new Set(),
      itemsPurchased: 0,
      pendingAmount: 0
    };

    const cardTypes = {
      visa: 0,
      mastercard: 0,
      amex: 0,
      discover: 0
    };

    const serviceProviders = [];
    const inventoryItems = [];

    // Process each payment
    data.forEach(payment => {
      // Calculate total amount
      stats.totalAmount += payment.amount;
      
      // Format the payment for display
      const formattedPayment = {
        id: payment._id,
        status: convertStatus(payment.status),
        amount: `Rs. ${payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        method: payment.cardType,
        cardNumber: payment.lastFourDigits,
        date: new Date(payment.createdAt).toLocaleString('en-US', {
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Count by status
      if (payment.status === 'completed') {
        stats.completedCount++;
      } else if (payment.status === 'pending') {
        stats.pendingCount++;
        stats.pendingAmount += payment.amount;
      } else if (payment.status === 'failed') {
        stats.failedCount++;
      }
      
      // Count card types
      if (payment.cardType in cardTypes) {
        cardTypes[payment.cardType]++;
      }

      // For demo purposes, let's categorize payments by a simple rule:
      // If the cardholder name contains "Provider" or amount > 5000, it's a service provider
      // Otherwise it's an inventory item
      if (payment.cardholderName.includes('Provider') || payment.amount > 5000) {
        stats.activeProviders.add(payment.cardholderName);
        serviceProviders.push({
          ...formattedPayment,
          providerName: payment.cardholderName
        });
      } else {
        stats.itemsPurchased++;
        inventoryItems.push({
          ...formattedPayment,
          itemName: `Item ${payment.lastFourDigits}` // In a real app, you'd have actual item names
        });
      }
    });

    // Update state with processed data
    setServiceProviderPayments(serviceProviders);
    setItemsPayments(inventoryItems);
    
    // Calculate payment method percentages
    const totalPayments = data.length;
    if (totalPayments > 0) {
      setPaymentMethodsData([
        { 
          method: 'Visa', 
          percentage: Math.round((cardTypes.visa / totalPayments) * 100) 
        },
        { 
          method: 'Mastercard', 
          percentage: Math.round((cardTypes.mastercard / totalPayments) * 100) 
        },
        { 
          method: 'Other', 
          percentage: Math.round(((cardTypes.amex + cardTypes.discover) / totalPayments) * 100) 
        }
      ]);
    }

    // Update payment stats
    setPaymentStats({
      ...stats,
      activeProviders: stats.activeProviders.size
    });
  };

  // Helper function to convert backend status to UI status
  const convertStatus = (backendStatus) => {
    const statusMap = {
      'completed': 'Succeeded',
      'pending': 'Pending',
      'failed': 'Declined'
    };
    return statusMap[backendStatus] || 'Create';
  };

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

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
          <span className="text-gray-500 text-xs">**** {serviceProviderPayments[0]?.cardNumber || '4242'}</span>
        </div>
      );
    } else if (method === 'mastercard') {
      return (
        <div className="flex items-center space-x-1.5">
          <div className="bg-red-100 text-red-700 p-1 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
            MC
          </div>
          <span className="text-gray-500 text-xs">**** {serviceProviderPayments[0]?.cardNumber || '2332'}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5">
        <div className="bg-gray-100 text-gray-700 p-1 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
          CD
        </div>
        <span className="text-gray-500 text-xs">**** {serviceProviderPayments[0]?.cardNumber || '0000'}</span>
      </div>
    );
  };

  const renderPaymentTable = (data) => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading payments...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button 
            onClick={fetchPayments} 
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Box className="h-12 w-12 mb-2" />
          <p>No payment records found</p>
        </div>
      ) : (
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
              <tr key={payment.id || index} className={`${selectedRows.includes(index) ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
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
      )}
    </div>
  );

  // Updated stats based on API data
  const stats = [
    {
      title: "Total Payments",
      value: `Rs. ${paymentStats.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      change: "+12.5%", // In a real app, you would calculate this from historical data
      icon: <DollarSign className="h-6 w-6 text-blue-600" />,
      trend: "up"
    },
    {
      title: "Active Providers",
      value: paymentStats.activeProviders.toString(),
      change: "+5.6%",
      icon: <Users className="h-6 w-6 text-green-600" />,
      trend: "up"
    },
    {
      title: "Pending Payments",
      value: `Rs. ${paymentStats.pendingAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      change: "-2.3%",
      icon: <CreditCard className="h-6 w-6 text-yellow-600" />,
      trend: "down"
    },
    {
      title: "Items Purchased",
      value: paymentStats.itemsPurchased.toString(),
      change: "+18.2%",
      icon: <Box className="h-6 w-6 text-purple-600" />,
      trend: "up"
    }
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
            {/* Dashboard Refresh Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Payment Overview</h2>
              <button 
                onClick={fetchPayments}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 ${
                  loading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-lg transition`}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Data
                  </>
                )}
              </button>
            </div>

            {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="p-3 bg-gray-200 rounded-lg h-10 w-10"></div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                <h3 className="font-medium">Error loading payment data</h3>
                <p>{error}</p>
                <button 
                  onClick={fetchPayments}
                  className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : (
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
            )}
            
            {/* Payment Methods Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-gray-300 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {paymentMethodsData.map((method, index) => (
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
              )}
            </div>
          </div>
        );
  
      case 'Service Providers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Service Provider Management</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={fetchPayments}
                    disabled={loading}
                    className={`inline-flex items-center px-3 py-1.5 ${
                      loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100'
                    } text-blue-700 rounded-lg transition`}
                  >
                    {loading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <Plus size={16} className="mr-2" />
                    Add Provider
                  </button>
                </div>
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
                <div className="flex space-x-2">
                  <button 
                    onClick={fetchPayments}
                    disabled={loading}
                    className={`inline-flex items-center px-3 py-1.5 ${
                      loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100'
                    } text-blue-700 rounded-lg transition`}
                  >
                    {loading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <Plus size={16} className="mr-2" />
                    New Sale
                  </button>
                </div>
              </div>
              {renderPaymentTable(itemsPayments)}
            </div>
          </div>
        );
  
      // ... rest of your cases remain the same
      case 'Wages':
        // Your existing Wages case content
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
                    { name: 'John Doe', position: 'Mason', hours: 40, rate: 'Rs. 200/hr', total: 'Rs. 8,000', status: 'Succeeded' },
                    { name: 'Jane Smith', position: 'Carpenter', hours: 35, rate: 'Rs. 180/hr', total: 'Rs. 6,300', status: 'Pending' },
                    { name: 'Mike Johnson', position: 'Electrician', hours: 45, rate: 'Rs. 250/hr', total: 'Rs. 11,250', status: 'Pending' }
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
  
      // Other cases remain the same
      default:
        return null;
    }
  };

  // Rest of the component remains the same
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
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Page Header with animation */}
            <div className="mb-8 animate-fade-in-down">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                {activePage}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-2xl">
                Manage your {activePage.toLowerCase()} and related activities with our 
                comprehensive dashboard tools and analytics
              </p>
              <div className="mt-4 flex space-x-4">
                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
                <div className="h-1 w-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            
            {/* Dynamic Page Content with container styling */}
            <div className="transform transition-all duration-300 ease-in-out">
              <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-gray-100/50">
                <div className="p-6">
                  {renderPageContent()}
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
