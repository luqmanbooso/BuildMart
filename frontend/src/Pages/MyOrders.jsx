import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronDown, 
  Check, 
  Package, 
  Truck, 
  CheckCircle,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Search,
  X,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Info // Add this import
} from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientNavBar from '../components/ClientNavBar';
import ContractorUserNav from '../components/ContractorUserNav'; // Import ContractorUserNav
import { jwtDecode } from 'jwt-decode';

// Add this near the top of your file or in a style tag
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .modal-enter {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .modal-content-enter {
    animation: slideIn 0.3s ease-out forwards;
  }
`;

const FooterFallback = () => (
  <div className="bg-gray-800 p-4 text-center text-white">
    <div className="container mx-auto">
      © 2025 BuildMart. All rights reserved.
    </div>
  </div>
);

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // For development testing - set to false to use real API
  
  // Add a way to trigger a retry
  const [retryCount, setRetryCount] = useState(0);
  
  // Mock data for testing or fallback
  const mockOrders = [
    {
      _id: '65f8234a7bcef1001',
      orderDate: '2025-03-15T08:30:00',
      items: [
        { name: 'Cement (50kg bag)', quantity: 5, totalPrice: 5000 },
        { name: 'Steel Bars (10mm)', quantity: 10, totalPrice: 12000 }
      ],
      totalAmount: 17000,
      orderStatus: 'delivered',
      paymentDetails: { method: 'Credit Card' },
      customer: { name: 'John Doe', email: 'john@example.com' },
      shippingAddress: {
        address: '123 Main Street',
        city: 'Colombo',
        postalCode: '10100',
        phone: '071-1234567'
      }
    },
    {
      _id: '65f8234a7bcef1002',
      orderDate: '2025-03-17T10:15:00',
      items: [
        { name: 'Bricks', quantity: 200, totalPrice: 10000 },
        { name: 'Sand (cubic m)', quantity: 2, totalPrice: 15000 }
      ],
      totalAmount: 25000,
      orderStatus: 'shipped',
      paymentDetails: { method: 'Bank Transfer' },
      customer: { name: 'John Doe', email: 'john@example.com' },
      shippingAddress: {
        address: '123 Main Street',
        city: 'Colombo',
        postalCode: '10100',
        phone: '071-1234567'
      }
    },
    {
      _id: '65f8234a7bcef1003',
      orderDate: '2025-03-19T15:45:00',
      items: [
        { name: 'PVC Pipes (20mm)', quantity: 15, totalPrice: 7500 }
      ],
      totalAmount: 7500,
      orderStatus: 'processing',
      paymentDetails: { method: 'Cash on Delivery' },
      customer: { name: 'John Doe', email: 'john@example.com' },
      shippingAddress: {
        address: '123 Main Street',
        city: 'Colombo',
        postalCode: '10100',
        phone: '071-1234567',
        notes: 'Please deliver in the evening after 5pm'
      }
    },
    {
      _id: '65f8234a7bcef1004',
      orderDate: '2025-03-20T09:30:00',
      items: [
        { name: 'Roof Tiles', quantity: 100, totalPrice: 35000 },
        { name: 'Wood Panels', quantity: 20, totalPrice: 18000 }
      ],
      totalAmount: 53000,
      orderStatus: 'placed',
      paymentDetails: { method: 'Credit Card' },
      customer: { name: 'John Doe', email: 'john@example.com' },
      shippingAddress: {
        address: '123 Main Street',
        city: 'Colombo',
        postalCode: '10100',
        phone: '071-1234567'
      }
    }
  ];

  // Load user details from localStorage and token
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          // Decode the token to get user data
          const decoded = jwtDecode(token);
          
          // Set user role from token
          setUserRole(decoded.role || decoded.userType);
          setIsLoggedIn(true);
          
          // Extract userId correctly - handle all possible property names
          const userId = decoded.userId || decoded.id || decoded._id;
          
          if (!userId) {
            console.warn("No valid userId found in token");
            setError("Unable to identify your account. Please try logging in again.");
            setIsLoggedIn(false);
          } else {
            setUserId(userId);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          setError("Authentication error. Please try logging in again.");
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } else {
        // No token found
        setIsLoggedIn(false);
        setUserRole(null);
        navigate('/login', { state: { from: '/orders', message: 'Please log in to view your orders' } });
      }
    };
    
    checkAuthStatus();
  }, []);

  // Fetch orders - either from API or use mock data
  useEffect(() => {
    const fetchOrders = async () => {
      // Only fetch if we have a userId
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get the auth token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Set the headers with the auth token
        const config = token ? {
          headers: { Authorization: `Bearer ${token}` }
        } : {};
        
        // Make API call
        const response = await axios.get(`http://localhost:5000/api/orders`, {
          ...config,
          params: { userId: userId }
        });
        
        if (response.data && Array.isArray(response.data.orders)) {
          // Format the order data
          const formattedOrders = response.data.orders.map(order => ({
            ...order,
            orderDate: order.orderDate || new Date().toISOString(),
            orderStatus: order.orderStatus ? order.orderStatus.toLowerCase() : 'placed'
          }));
          
          // Sort orders by date (newest first)
          formattedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          
          setOrders(formattedOrders);
          
          // Clear any previous error
          setError(null);
        } else {
          // Empty array is valid - just means no orders yet
          if (response.data && Array.isArray(response.data.orders) && response.data.orders.length === 0) {
            setOrders([]);
          } else {
            console.warn("Invalid response format:", response.data);
            setError("We couldn't properly load your orders. Please try again later.");
          }
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("We couldn't load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [userId, retryCount]);

  // Function to get appropriate status badge styling
  const getOrderStatusBadge = (status) => {
    let bgColor, textColor;
    
    switch (status?.toLowerCase()) {
      case 'delivered':
        bgColor = 'bg-green-100';
        textColor = 'text-green-600';
        break;
      case 'shipped':
      case 'in transit':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-600';
        break;
      case 'processing':
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-600';
        break;
      case 'placed':
      case 'pending':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-600';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-600';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-600';
    }
    
    return `px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`;
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Update viewOrderDetails function to remove mockMode references
const viewOrderDetails = async (order) => {
  // If the order already has complete details, just use those
  if (order.items && order.shippingAddress) {
    setSelectedOrderDetails(order);
    return;
  }
  
  // Otherwise, fetch the complete order details from the API
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await axios.get(`http://localhost:5000/api/orders/${order._id}`, config);
    
    if (response.data.success) {
      const orderData = response.data.order;
      
      // If shipping information is available, include it
      let shippingData = {};
      try {
        const shippingResponse = await axios.get(`http://localhost:5000/api/shipments/order/${order._id}`, config);
        if (shippingResponse.data && shippingResponse.data.shipment) {
          shippingData = {
            shippingProgress: shippingResponse.data.shipment.progress || 0,
            estimatedDelivery: shippingResponse.data.shipment.estimatedDeliveryDate,
            shippedDate: shippingResponse.data.shipment.createdAt || orderData.updatedAt
          };
        }
      } catch (shippingError) {
        console.log("No shipping information available");
      }
      
      setSelectedOrderDetails({
        ...orderData,
        ...shippingData,
        orderStatus: orderData.orderStatus ? orderData.orderStatus.toLowerCase() : 'placed'
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch order details');
    }
  } catch (err) {
    console.error("Error fetching order details:", err);
    toast.error("Couldn't load complete order details.");
    
    // Still show what we have
    setSelectedOrderDetails(order);
  } finally {
    setLoading(false);
  }
};

  // Function to close modal
const closeModal = () => {
  setSelectedOrderDetails(null);
};

  // Fix the getFilteredOrders function
  const getFilteredOrders = () => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    
    return orders.filter(order => 
      (order.orderStatus?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order._id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  };

  // Fix the formatStatus function
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Map statuses to more user-friendly terms
    const statusMap = {
      'placed': 'Order Placed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'in transit': 'In Transit',
      'delivering': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };
    
    const formattedStatus = statusMap[status.toLowerCase()];
    return formattedStatus || (status.charAt(0).toUpperCase() + status.slice(1));
  };

  // Function to render the appropriate navbar based on user role - matches Shop.jsx
  const renderNavbar = () => {
    console.log("Current userRole in renderNavbar:", userRole);
    
    switch(userRole) {
      case 'Service Provider':
        console.log("Rendering ContractorUserNav");
        return <ContractorUserNav />;
      case 'Client':
        console.log("Rendering ClientNavBar");
        return <ClientNavBar />;
      default:
        console.log("Rendering default ClientNavBar");
        return <ClientNavBar />;
    }
  };

  // Add a retry function
  const retryFetchOrders = () => {
    setRetryCount(prev => prev + 1);
  };

  // Add this useEffect for keyboard events (Escape key)
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && selectedOrderDetails) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedOrderDetails]);

  // Add this function to handle outside clicks
  const handleModalBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop (not on the modal content)
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {renderNavbar()}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6">
          <br /><br /><br /><br />
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
          {orders.length === 0 && !loading && !error && (
            <div className="mt-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-md inline-flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <p>You haven't placed any orders yet</p>
            </div>
          )}
        </div>

        {loading && !orders.length ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">In-Progress</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {orders.filter(order => order.orderStatus === 'processing' || order.orderStatus === 'shipped').length}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {orders.filter(order => order.orderStatus === 'delivered').length}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Your Orders</h3>
                <div className="relative">
                  
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {!orders || orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                          You haven't placed any orders yet.
                        </td>
                      </tr>
                    ) : getFilteredOrders().length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                          No orders match your search.
                        </td>
                      </tr>
                    ) : (
                      getFilteredOrders().map((order) => (
                        <tr 
                          key={order._id} 
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-150"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order._id ? `#${order._id.substring(0, 8)}` : 'No ID'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.items?.length || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Rs. {order.totalAmount?.toLocaleString() || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getOrderStatusBadge(order.orderStatus)}>
                              {formatStatus(order.orderStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => viewOrderDetails(order)}
                              className="group inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium rounded-md
                              bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 
                              border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                              aria-label="View order details"
                            >
                              <Eye className="h-4 w-4 mr-1.5 transition-transform group-hover:scale-110" />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedOrderDetails && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm modal-enter p-4"
            onClick={handleModalBackdropClick}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden modal-content-enter">
              {/* Header with gradient background - more compact */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2.5 rounded-full">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Order #{selectedOrderDetails._id.substring(0, 8)}</h3>
                      <p className="text-blue-100 text-xs mt-0.5">Placed on {formatDate(selectedOrderDetails.orderDate)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Content area - more compact padding */}
              <div className="p-5 max-h-[80vh] overflow-y-auto">
                {/* Order Summary - more compact */}
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div className="md:w-1/2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {formatStatus(selectedOrderDetails.orderStatus).toUpperCase()}
                    </span>
                    <h4 className="text-lg font-bold text-gray-800 mt-2">Rs. {selectedOrderDetails.totalAmount?.toLocaleString() || 0}</h4>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Payment via {selectedOrderDetails.paymentDetails?.method || "N/A"}
                    </p>
                  </div>
                  
                  {selectedOrderDetails.orderStatus !== 'delivered' && selectedOrderDetails.orderStatus !== 'cancelled' && (
                    <div className="mt-4 md:mt-0 md:w-1/2 md:text-right">
                      <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                      <p className="text-lg font-bold text-gray-800 mt-0.5">
                        {selectedOrderDetails.estimatedDelivery ? 
                          formatDate(selectedOrderDetails.estimatedDelivery) : 
                          formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 4*24*60*60*1000))}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Timeline - More compact */}
                <div className="mb-6">
                  <h4 className="text-base font-bold text-gray-800 mb-4">Order Progress</h4>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-4 relative">
                    <div 
                      className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ 
                        width: 
                          selectedOrderDetails.orderStatus === 'delivered' ? '100%' :
                          selectedOrderDetails.orderStatus === 'shipped' ? '66%' :
                          selectedOrderDetails.orderStatus === 'processing' ? '33%' :
                          '10%'
                      }}
                    ></div>
                    
                    {/* Step indicators */}
                    <div className="absolute top-0 left-0 transform -translate-y-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                    <div className="absolute top-0 left-1/3 transform -translate-y-1/2 w-2.5 h-2.5 
                      bg-indigo-600 rounded-full"></div>
                    <div className="absolute top-0 left-2/3 transform -translate-y-1/2 w-2.5 h-2.5 
                      bg-indigo-600 rounded-full"></div>
                    <div className="absolute top-0 right-0 transform -translate-y-1/2 w-2.5 h-2.5 
                      bg-indigo-600 rounded-full"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">Placed</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(selectedOrderDetails.orderDate).split(' ').slice(0, 2).join(' ')}</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) ? 'text-gray-800' : 'text-gray-400'}`}>
                        Processing
                      </div>
                      {['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedOrderDetails.processedDate ? 
                            formatDate(selectedOrderDetails.processedDate).split(' ').slice(0, 2).join(' ') : 
                            formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 24*60*60*1000)).split(' ').slice(0, 2).join(' ')}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${['shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) ? 'text-gray-800' : 'text-gray-400'}`}>
                        Shipped
                      </div>
                      {['shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedOrderDetails.shippedDate ? 
                            formatDate(selectedOrderDetails.shippedDate).split(' ').slice(0, 2).join(' ') : 
                            formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 2*24*60*60*1000)).split(' ').slice(0, 2).join(' ')}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${selectedOrderDetails.orderStatus === 'delivered' ? 'text-gray-800' : 'text-gray-400'}`}>
                        Delivered
                      </div>
                      {selectedOrderDetails.orderStatus === 'delivered' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedOrderDetails.deliveredDate ? 
                            formatDate(selectedOrderDetails.deliveredDate).split(' ').slice(0, 2).join(' ') : 
                            formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 4*24*60*60*1000)).split(' ').slice(0, 2).join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items and Shipping Info in a Compact Card Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Items Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-blue-600" />
                      Order Items
                    </h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {selectedOrderDetails.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            <div className="mt-0.5 flex items-center text-xs text-gray-500">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <p className="font-bold text-gray-800 text-sm">Rs. {item.totalPrice?.toLocaleString() || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Customer & Delivery Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-blue-600" />
                      Delivery Details
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="flex items-start">
                          <User className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{selectedOrderDetails.customer?.name || 'N/A'}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{selectedOrderDetails.customer?.email || ''}</p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedOrderDetails.shippingAddress && (
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                            <div>
                              <p className="font-bold text-gray-800 text-sm">Shipping Address</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {selectedOrderDetails.shippingAddress.address}<br />
                                {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.postalCode}
                              </p>
                            </div>
                          </div>
                          
                          {selectedOrderDetails.shippingAddress.phone && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Phone className="h-3.5 w-3.5 text-blue-600 mr-1" />
                              {selectedOrderDetails.shippingAddress.phone}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tracking Information for In-Transit Orders - More compact */}
                {selectedOrderDetails.orderStatus === 'shipped' && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-blue-800 flex items-center">
                          <Truck className="h-4 w-4 mr-1.5" />
                          Your order is on the way!
                        </h4>
                        <p className="text-blue-700 mt-1 text-xs">
                          Your package is out for delivery. You can expect it within 2-3 business days.
                        </p>
                      </div>
                      <button className="mt-3 md:mt-0 bg-white px-3 py-1.5 rounded text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-700 hover:text-white transition-colors">
                        Track Package
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Footer Actions - More compact */}
                <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium text-sm transition-all duration-200"
                  >
                    Close
                  </button>
                
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <FooterFallback />
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Add this near the top of your render function */}
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
    </div>
  );
};

export default MyOrders;