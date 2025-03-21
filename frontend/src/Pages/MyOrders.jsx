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
  User
} from 'lucide-react';

// Define simple fallback components
const NavbarFallback = () => (
  <div className="bg-blue-800 p-4 text-white">
    <div className="container mx-auto">
      <h1 className="text-xl font-bold">BuildMart</h1>
    </div>
  </div>
);

const FooterFallback = () => (
  <div className="bg-gray-800 p-4 text-center text-white">
    <div className="container mx-auto">
      © 2025 BuildMart. All rights reserved.
    </div>
  </div>
);

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // For development testing - set to false to use real API
  const [mockMode, setMockMode] = useState(false);
  
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

  // Load user details from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setMockMode(true);
        toast.warning("Using demo data - not connected to your account");
      }
    } else {
      // No user found, show a notification
      toast.info("Please log in to view your actual orders");
      setMockMode(true);
    }
  }, []);

  // Fetch orders - either from API or use mock data
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      
      if (mockMode) {
        // Use mock data instead of API call
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 500); // Simulate network delay for better UX
        return;
      }
      
      if (!userId) {
        setMockMode(true);
        setOrders(mockOrders);
        setLoading(false);
        return;
      }
      
      try {
        // Get the auth token if you need it for authenticated requests
        const token = localStorage.getItem('token');
        
        // Set the headers with the auth token
        const config = token ? {
          headers: { Authorization: `Bearer ${token}` }
        } : {};
        
        // Make the API call to get the user's orders
        // Modified to fetch only user's orders by properly passing the userId parameter
        const response = await axios.get(`/api/orders?userId=${userId}`, config);
        
        if (response.data.success) {
          // Filter orders by the current user's ID if backend doesn't already filter them
          const userOrders = response.data.orders.filter(order => 
            order.customer?.userId === userId || 
            (order.customer?.email && order.customer?.email === JSON.parse(localStorage.getItem('user'))?.email)
          );
          
          if (userOrders.length > 0) {
            setOrders(userOrders);
          } else {
            // If no orders found for user, check if we need to show all orders (for admin)
            const userRole = JSON.parse(localStorage.getItem('user'))?.role;
            if (userRole === 'admin') {
              setOrders(response.data.orders);
              toast.info("Showing all orders (admin view)");
            } else {
              setOrders([]);
              toast.info("You haven't placed any orders yet");
            }
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Couldn't load your orders. Showing sample data instead.");
        
        // Fallback to mock data if API call fails
        setMockMode(true);
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [userId, mockMode]);

  // Function to get appropriate status badge styling
  const getOrderStatusBadge = (status) => {
    let bgColor, textColor;
    
    switch (status) {
      case 'delivered':
        bgColor = 'bg-green-100';
        textColor = 'text-green-600';
        break;
      case 'shipped':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-600';
        break;
      case 'processing':
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-600';
        break;
      case 'placed':
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

  // Function to handle view order details
  const viewOrderDetails = async (order) => {
    // If we're in mock mode or already have details, just set them
    if (mockMode || (order.items && order.shippingAddress)) {
      setSelectedOrderDetails(order);
      return;
    }
    
    // Otherwise, fetch the complete order details from the API
    try {
      setLoading(true);
      
      // Get the auth token if needed
      const token = localStorage.getItem('token');
      
      // Set the headers with the auth token
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};
      
      // Fetch complete order details
      const response = await axios.get(`/api/orders/${order._id}`, config);
      
      if (response.data.success) {
        setSelectedOrderDetails(response.data.order);
      } else {
        throw new Error(response.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error("Couldn't load order details.");
      
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

  // Function to get filtered orders
  const getFilteredOrders = () => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return orders.filter(order => 
      (order.orderStatus?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order._id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  };

  // Function to display status text in a more user-friendly way
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavbarFallback />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
          {mockMode && (
            <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md inline-block">
              <p>Viewing sample data</p>
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
                  <input 
                    type="text" 
                    className="px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Search by order ID or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <Search className="h-5 w-5" />
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
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order._id.substring(0, 8)}</div>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                              onClick={() => viewOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-0 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between border-b pb-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Order Number</h4>
                    <p className="text-xl font-semibold">#{selectedOrderDetails._id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {formatDate(selectedOrderDetails.orderDate)}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 text-right">
                    <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                    <p className="text-xl font-semibold">Rs. {selectedOrderDetails.totalAmount?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment via {selectedOrderDetails.paymentDetails?.method || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-base font-medium mb-4">Order Timeline</h4>
                  <div className="relative pb-4">
                    {/* Order Placed */}
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">Order Placed</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedOrderDetails.orderDate)}</p>
                      </div>
                    </div>
                    <div className="absolute top-8 left-4 h-full w-0 border-l-2 border-gray-200"></div>

                    {/* Processing */}
                    <div className="flex items-center mt-6">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 
                        ${['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) 
                          ? 'bg-blue-100' : 'bg-gray-100'}`}
                      >
                        <Package className={`h-5 w-5 ${['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) 
                          ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-4">
                        <p className={`font-medium ${['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) ? '' : 'text-gray-400'}`}>
                          Processing
                        </p>
                        {['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) && (
                          <p className="text-sm text-gray-600">
                            {formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 24*60*60*1000))}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipped */}
                    <div className="flex items-center mt-6">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 
                        ${['shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) 
                          ? 'bg-blue-100' : 'bg-gray-100'}`}
                      >
                        <Truck className={`h-5 w-5 ${['shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) 
                          ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-4">
                        <p className={`font-medium ${['shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) ? '' : 'text-gray-400'}`}>
                          Shipped
                        </p>
                        {['shipped', 'delivered'].includes(selectedOrderDetails.orderStatus) && (
                          <p className="text-sm text-gray-600">
                            {formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 2*24*60*60*1000))}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivered */}
                    <div className="flex items-center mt-6">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 
                        ${selectedOrderDetails.orderStatus === 'delivered'
                          ? 'bg-green-100' : 'bg-gray-100'}`}
                      >
                        <CheckCircle className={`h-5 w-5 ${selectedOrderDetails.orderStatus === 'delivered'
                          ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-4">
                        <p className={`font-medium ${selectedOrderDetails.orderStatus === 'delivered' ? '' : 'text-gray-400'}`}>
                          Delivered
                        </p>
                        {selectedOrderDetails.orderStatus === 'delivered' && (
                          <p className="text-sm text-gray-600">
                            {formatDate(new Date(new Date(selectedOrderDetails.orderDate).getTime() + 4*24*60*60*1000))}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-medium mb-3">Items</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                      {selectedOrderDetails.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">Rs. {item.totalPrice?.toLocaleString() || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium mb-3">Shipping Details</h4>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedOrderDetails.customer?.name || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {selectedOrderDetails.customer?.email && (
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <p>{selectedOrderDetails.customer.email}</p>
                        </div>
                      )}
                      
                      {selectedOrderDetails.shippingAddress && (
                        <>
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                            <p>
                              {selectedOrderDetails.shippingAddress.address}<br />
                              {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.postalCode}
                            </p>
                          </div>
                          
                          {selectedOrderDetails.shippingAddress.phone && (
                            <div className="flex items-start">
                              <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                              <p>{selectedOrderDetails.shippingAddress.phone}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {selectedOrderDetails.shippingAddress?.notes && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Notes</h5>
                        <p className="text-sm text-gray-600 border-l-2 border-gray-300 pl-3">
                          {selectedOrderDetails.shippingAddress.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedOrderDetails.orderStatus !== 'delivered' && selectedOrderDetails.orderStatus !== 'cancelled' && (
                  <div className="mt-6 border-t pt-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800">Track Your Shipment</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedOrderDetails.orderStatus === 'shipped' ? 
                          'Your order is on its way! You can expect delivery within 2-3 business days.' :
                          'Your order is being processed and will be shipped soon.'
                        }
                      </p>
                      
                      {selectedOrderDetails.orderStatus === 'shipped' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Shipped</span>
                            <span>Out for delivery</span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t text-right">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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
    </div>
  );
};

export default MyOrders;