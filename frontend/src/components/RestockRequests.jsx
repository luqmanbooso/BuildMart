import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Add axios import
import {
  RefreshCw, Search, Loader, CheckCircle, Clock, DollarSign, X,
  Download, Filter, ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSupplierPayments } from '../context/SupplierPaymentContext';
import { restockService } from "../services/restockService";
import { supplierPaymentService } from '../services/supplierPaymentService';

const RestockRequests = ({ inventory, setInventory }) => {
  const [restockRequests, setRestockRequests] = useState([]);
  const [restockLoading, setRestockLoading] = useState(true);
  const [restockError, setRestockError] = useState(null);
  const [showRestockPaymentModal, setShowRestockPaymentModal] = useState(false);
  const [selectedRestockRequest, setSelectedRestockRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addSupplierPayment } = useSupplierPayments();
  
  // Add state for status types
  const [statusTypes, setStatusTypes] = useState([]);
  const [statusTransitions, setStatusTransitions] = useState({});
  const [statusTypesLoading, setStatusTypesLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Add state for payment status types
  const [paymentStatusTypes, setPaymentStatusTypes] = useState([]);

  // Fetch status types
  useEffect(() => {
    const fetchStatusTypes = async () => {
      try {
        console.log("Fetching restock status types...");
        const response = await axios.get('http://localhost:5000/api/restock/status-types');
        console.log("Status types response:", response.data);
        
        const { statusTypes, paymentStatusTypes } = response.data;
        setStatusTypes(statusTypes);
        setPaymentStatusTypes(paymentStatusTypes || ["pending", "paid", "rejected"]);
        
        // Create status transitions map
        const transitions = {};
        statusTypes.forEach((status, index) => {
          const lowerStatus = status.toLowerCase();
          
          if (lowerStatus === 'delivered' || lowerStatus === 'cancelled') {
            transitions[lowerStatus] = [];
          } 
          else if (index < statusTypes.length - 1) {
            // Find next status that's not 'cancelled'
            const nextStatuses = statusTypes.slice(index + 1);
            const nextValidStatus = nextStatuses.find(s => s.toLowerCase() !== 'cancelled');
            
            // Create transitions with both lowercase keys
            transitions[lowerStatus] = nextValidStatus ? 
              ['cancelled', nextValidStatus.toLowerCase()] : 
              ['cancelled'];
            
            // Also add with original case for robustness
            transitions[status] = transitions[lowerStatus];
          }
        });
        
        // Add explicit transitions for common status flows
        const explicitTransitions = {
          'requested': ['approved', 'cancelled'],
          'approved': ['ordered', 'cancelled'],
          'ordered': ['shipped', 'cancelled'],
          'shipped': ['delivered', 'cancelled']
        };
        
        // Merge explicit transitions with API-derived ones
        Object.keys(explicitTransitions).forEach(status => {
          if (!transitions[status]) {
            transitions[status] = explicitTransitions[status];
          }
        });
        
        console.log("Created status transitions:", transitions);
        setStatusTransitions(transitions);
      } catch (error) {
        console.error("Error fetching status types:", error);
        // Fallback to hardcoded transitions
        setStatusTransitions({
          requested: ['approved', 'cancelled'],
          approved: ['ordered', 'cancelled'],
          ordered: ['shipped', 'cancelled'],
          shipped: ['delivered', 'cancelled'],
          delivered: [],
          cancelled: []
        });
      } finally {
        setStatusTypesLoading(false);
      }
    };
    
    fetchStatusTypes();
  }, []);

  // Fetch restock requests
  useEffect(() => {
    const fetchRestockRequests = async () => {
      setRestockLoading(true);
      try {
        const data = await restockService.getAllRequests();
        console.log("Fetched restock requests:", data);
        setRestockRequests(data);
        setRestockError(null);
      } catch (error) {
        console.error("Error fetching restock requests:", error);
        setRestockError("Failed to load restock requests");
      } finally {
        setRestockLoading(false);
      }
    };

    fetchRestockRequests();
  }, []);

  // Process payment to supplier
  const processRestockPayment = async (requestId, paymentDetails) => {
    try {
      setRestockLoading(true);
      const updatedRequest = await restockService.processPayment(requestId, paymentDetails);
      
      setRestockRequests(prev => 
        prev.map(req => req._id === requestId ? {
          ...req,
          paymentStatus: 'paid',
          paymentDetails
        } : req)
      );
      
      // Update inventory payment status if inventory is provided
      const request = restockRequests.find(req => req._id === requestId);
      if (request && setInventory) {
        setInventory(prev => 
          prev.map(item => 
            item._id === request.productId ? {
              ...item,
              paymentStatus: "Paid"
            } : item
          )
        );
      }
      
      // Add payment to supplier payment records if we're using context
      if (typeof addSupplierPayment === 'function') {
        addSupplierPayment({
          id: paymentDetails.transactionId,
          amount: paymentDetails.amount,
          supplier: request.supplierName,
          supplierId: request.supplierId,
          date: paymentDetails.paymentDate || new Date().toISOString(),
          product: request.productName,
          requestId: request._id
        });
      }
      
      toast.success(`Payment of Rs. ${paymentDetails.amount.toLocaleString()} to ${request?.supplierName} processed successfully`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment: " + (error.message || "Server error"));
    } finally {
      setRestockLoading(false);
      setShowRestockPaymentModal(false);
    }
  };

  // Handle successful payment
  const handleRestockPaymentSuccess = (paymentDetails) => {
    if (selectedRestockRequest) {
      const processedPayment = {
        paymentMethod: paymentDetails.method || 'Credit Card',
        amount: paymentDetails.amount,
        transactionId: paymentDetails.transactionId || `PAY-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        supplierName: selectedRestockRequest.supplierName,
        supplierId: selectedRestockRequest.supplierId,
        productName: selectedRestockRequest.productName,
        requestId: selectedRestockRequest._id
      };
      
      // Process the payment
      processRestockPayment(selectedRestockRequest._id, processedPayment);
    }
  };

  // Update restock status
  const updateRestockStatus = async (requestId, newStatus) => {
    try {
      setRestockLoading(true);
      
      // Call API to update status
      const updatedRequest = await restockService.updateStatus(requestId, newStatus);
      
      // Find the existing request to get product info
      const request = restockRequests.find(req => req._id === requestId);
      
      // Update the restock requests state
      setRestockRequests(prev => 
        prev.map(req => req._id === requestId ? {
          ...req,
          status: newStatus,
          updatedAt: new Date().toISOString()
        } : req)
      );
      
      // Special handling for terminal statuses (delivered or cancelled)
      const isTerminalStatus = ['delivered', 'cancelled'].includes(newStatus.toLowerCase());
      
      if (request && setInventory) {
        // Update inventory based on status
        if (newStatus.toLowerCase() === 'delivered') {
          // For delivered: increase stock and update status
          setInventory(prev => 
            prev.map(item => 
              item._id === request.productId ? 
              {
                ...item,
                stock: item.stock + request.quantity,
                status: getStockStatus(item.stock + request.quantity, item.threshold),
                deliveryStatus: "Delivered",
                // Clear the restock requested flag since request is complete
                restockRequested: false
              } : item
            )
          );
        } else if (newStatus.toLowerCase() === 'cancelled') {
          // For cancelled: just clear the restock requested flag
          setInventory(prev => 
            prev.map(item => 
              item._id === request.productId ? 
              {
                ...item,
                restockRequested: false
              } : item
            )
          );
        }
      }
      
      toast.success(`Request status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating restock status:", error);
      toast.error("Failed to update restock status");
    } finally {
      setRestockLoading(false);
    }
  };

  // Add function to handle payment status update
  const updatePaymentStatus = async (requestId, newPaymentStatus) => {
    try {
      setRestockLoading(true);
      
      // Call API to update payment status
      const updatedRequest = await restockService.updatePaymentStatus(requestId, newPaymentStatus);
      
      // Find the existing request to get product info
      const request = restockRequests.find(req => req._id === requestId);
      
      // Update the restock requests state
      setRestockRequests(prev => 
        prev.map(req => req._id === requestId ? {
          ...req,
          paymentStatus: newPaymentStatus,
          updatedAt: new Date().toISOString()
        } : req)
      );
      
      // Update inventory payment status if applicable
      if (request && setInventory) {
        setInventory(prev => 
          prev.map(item => 
            item._id === request.productId ? 
            {
              ...item,
              paymentStatus: newPaymentStatus === 'paid' ? "Paid" : "Pending"
            } : item
          )
        );
      }
      
      toast.success(`Payment status updated to ${newPaymentStatus}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setRestockLoading(false);
    }
  };

  // Update the getStatusUpdateOptions function
  const getStatusUpdateOptions = (currentStatus) => {
    // First check if we're still loading
    if (statusTypesLoading) {
      return <option value="" disabled>Loading status options...</option>;
    }
    
    // Normalize the current status to lowercase for lookup
    const normalizedCurrentStatus = currentStatus ? currentStatus.toLowerCase() : '';
    console.log("Current status:", currentStatus, "Normalized:", normalizedCurrentStatus);
    console.log("Available transitions:", statusTransitions);
    console.log("Options for this status:", statusTransitions[normalizedCurrentStatus]);
    
    // Get the transitions for this status or empty array if none
    const options = statusTransitions[normalizedCurrentStatus] || [];
    
    // If no options are available, show a message
    if (!options || options.length === 0) {
      // If we should have options but don't, fall back to all status types
      console.log("No transitions found, showing all status types:", statusTypes);
      
      // Get all valid next statuses based on current status index
      const currentIndex = statusTypes.indexOf(normalizedCurrentStatus);
      let availableStatuses = [];
      
      if (currentIndex !== -1 && currentIndex < statusTypes.length - 1) {
        // Show next status in flow and cancelled option
        availableStatuses = ['cancelled', statusTypes[currentIndex + 1]];
      } else if (normalizedCurrentStatus === 'delivered' || normalizedCurrentStatus === 'cancelled') {
        // Terminal statuses have no transitions
        return <option value="" disabled>No status changes available</option>;
      } else {
        // Fallback - show approved, ordered, shipped, delivered, cancelled
        availableStatuses = ['approved', 'ordered', 'shipped', 'delivered', 'cancelled']
          .filter(s => s !== normalizedCurrentStatus);
      }
      
      return availableStatuses.map(status => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ));
    }
    
    // Map the available options to <option> elements
    return options.map(status => (
      <option key={status} value={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </option>
    ));
  };

  // Update getPaymentStatusOptions to show all statuses
  const getPaymentStatusOptions = (currentStatus) => {
    if (statusTypesLoading || !paymentStatusTypes.length) {
      return <option value="" disabled>Loading options...</option>;
    }
    
    console.log("Available payment status types:", paymentStatusTypes);
    
    // Show all payment status types except the current one
    const currentPaymentStatus = currentStatus ? currentStatus.toLowerCase() : '';
    return paymentStatusTypes
      .filter(status => status !== currentPaymentStatus) // Don't show current status
      .map(status => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ));
  };

  // Helper function to determine stock status
  const getStockStatus = (stock, threshold) => {
    if (stock <= 0) return "Critical";
    if (stock < threshold) return "Low Stock";
    return "In Stock";
  };

  // Add a helper function to calculate total amount if not provided
  const calculateTotalAmount = (request) => {
    if (request.totalAmount) {
      return request.totalAmount;
    }
    
    if (request.unitPrice && request.quantity) {
      return request.unitPrice * request.quantity;
    }
    
    return 0;
  };

  // Update the payment modal open function
  const openPaymentModal = (request) => {
    const totalAmount = calculateTotalAmount(request);
    
    setSelectedRestockRequest({
      ...request,
      totalAmount: totalAmount
    });
    setShowRestockPaymentModal(true);
  };

  // Function to filter restock requests
  const getFilteredRequests = () => {
    if (!restockRequests) return [];
    
    return restockRequests.filter(request => {
      // Filter by search term
      const matchesSearch = searchTerm.trim() === "" || 
        (request.productName && request.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.supplierName && request.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
        
      // Filter by status
      const matchesStatus = statusFilter === "all" || 
        (request.status && request.status.toLowerCase() === statusFilter.toLowerCase());
        
      return matchesSearch && matchesStatus;
    });
  };
  
  // Function to download restock requests as CSV
  const downloadRestockData = () => {
    // Create CSV content
    const headers = ["Product", "Supplier", "Quantity", "Total Amount", "Status", "Payment Status", "Date Created"];
    const data = getFilteredRequests().map(request => [
      request.productName || "",
      request.supplierName || "",
      request.quantity || "",
      calculateTotalAmount(request),
      request.status || "",
      request.paymentStatus || "",
      new Date(request.createdAt).toLocaleDateString()
    ]);
    
    // Generate CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `restock_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Payment Modal */}
      {showRestockPaymentModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Record Supplier Payment</h3>
                  <button
                    onClick={() => setShowRestockPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    You are about to record payment for the following restock request:
                  </p>
                  <div className="mt-3 bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Product:</span> {selectedRestockRequest?.productName}</p>
                    <p><span className="font-medium">Supplier:</span> {selectedRestockRequest?.supplierName}</p>
                    <p><span className="font-medium">Quantity:</span> {selectedRestockRequest?.quantity}</p>
                    <p className="font-bold mt-2">Total Amount: Rs. {selectedRestockRequest?.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRestockPaymentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setRestockLoading(true);
                        
                        // Create payment record with proper data formatting
                        const paymentRecord = {
                          amount: selectedRestockRequest.totalAmount,
                          supplier: selectedRestockRequest.supplierName,
                          supplierId: selectedRestockRequest.supplierId || '507f1f77bcf86cd799439011', // Fallback ID if missing
                          product: selectedRestockRequest.productName,
                          quantity: selectedRestockRequest.quantity,
                          requestId: selectedRestockRequest._id,
                          paymentDate: new Date().toISOString(),
                          status: 'paid'
                        };

                        console.log('Attempting to create payment:', paymentRecord);
                        
                        // Save payment to database
                        const savedPayment = await supplierPaymentService.createPayment(paymentRecord);
                        console.log('Payment saved successfully:', savedPayment);
                        
                        // Add to supplier payments context with the saved payment data
                        addSupplierPayment({
                          ...savedPayment,
                          id: savedPayment._id // Ensure ID is properly set for the context
                        });
                        
                        // Update local state to reflect the payment
                        setRestockRequests(prev => 
                          prev.map(req => 
                            req._id === selectedRestockRequest._id
                              ? { ...req, paymentStatus: 'pending payment' }
                              : req
                          )
                        );
                        
                        // Show success message
                        toast.success(`Payment of Rs. ${paymentRecord.amount.toLocaleString()} recorded successfully`);
                        
                        // Close modal
                        setShowRestockPaymentModal(false);
                      } catch (error) {
                        console.error("Error recording payment:", error);
                        console.error("Error details:", {
                          response: error.response?.data,
                          status: error.response?.status,
                          headers: error.response?.headers
                        });
                        const errorMessage = error.response?.data?.message || error.message;
                        toast.error(`Failed to record payment: ${errorMessage}`);
                      } finally {
                        setRestockLoading(false);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Record Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Management Header - styled like other dashboards */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Restock Management
            </h2>
            <p className="text-blue-100 mt-1">
              Manage inventory restock requests and supplier orders
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                className="py-2 pl-10 pr-4 bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <Search className="h-5 w-5 text-blue-100" />
              </div>
            </div>
            <button 
              onClick={() => {
                setRestockLoading(true);
                restockService.getAllRequests()
                  .then(data => {
                    setRestockRequests(data);
                    setRestockError(null);
                  })
                  .catch(error => {
                    console.error("Error refreshing restock requests:", error);
                    setRestockError("Failed to refresh restock requests");
                  })
                  .finally(() => setRestockLoading(false));
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
            <button 
              onClick={downloadRestockData}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Download restock data"
            >
              <Download size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Status Filter */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statusTypes.map(status => (
                <option key={status} value={status.toLowerCase()}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
              {/* Add additional status options if statusTypes is empty */}
              {statusTypes.length === 0 && (
                <>
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {restockLoading ? (
          <div className="flex justify-center items-center p-10">
            <Loader className="h-8 w-8 text-blue-600 animate-spin mr-3" />
            <p className="text-gray-600">Loading restock requests...</p>
          </div>
        ) : restockError ? (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-4 m-4">
            <p className="font-medium text-lg mb-1">Error loading restock requests</p>
            <p>{restockError}</p>
            <button
              onClick={() => {
                setRestockLoading(true);
                restockService.getAllRequests()
                  .then(data => {
                    setRestockRequests(data);
                    setRestockError(null);
                  })
                  .catch(error => {
                    console.error("Error refreshing restock requests:", error);
                    setRestockError("Failed to refresh restock requests");
                  })
                  .finally(() => setRestockLoading(false));
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : getFilteredRequests().length === 0 ? (
          <div className="text-center p-10">
            <div className="h-20 w-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No restock requests found</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter !== 'all' 
                ? `There are no restock requests with status "${statusFilter}".` 
                : "There are no active restock requests at the moment."
              }
              {statusFilter !== 'all' && (
                <button 
                  onClick={() => setStatusFilter('all')}
                  className="text-blue-600 ml-1 hover:underline"
                >
                  Show all instead
                </button>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredRequests().map(request => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">{request.productName}</div>
                          {request.priority && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              request.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                              request.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {request.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.supplierName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.quantity} {request.unitPrice && <span className="text-xs text-gray-500">(Rs. {request.unitPrice.toLocaleString()} each)</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {calculateTotalAmount(request).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          request.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'ordered' ? 'bg-amber-100 text-amber-800' :
                          request.status === 'approved' ? 'bg-cyan-100 text-cyan-800' :
                          request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {request.status !== 'delivered' && request.status !== 'cancelled' && (
                            <div className="relative inline-block text-left">
                              <select
                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateRestockStatus(request._id, e.target.value);
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  {statusTypesLoading ? "Loading..." : "Update status"}
                                </option>
                                {getStatusUpdateOptions(request.status)}
                              </select>
                            </div>
                          )}
                          
                          {request.status === 'delivered' && request.paymentStatus === 'pending payment' && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Pending Payment
                            </span>
                          )}
                          {request.status === 'delivered' && request.paymentStatus !== 'paid' && request.paymentStatus !== 'pending payment' && (
                            <button
                              onClick={() => openPaymentModal(request)}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              Showing {getFilteredRequests().length} of {restockRequests.length} restock requests
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestockRequests;