import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Truck, 
  Package, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Trash, 
  Plus, 
  RefreshCw,
  Phone
} from 'lucide-react';

const ShippingManager = ({ 
  selectedOrderForShipment, 
  setSelectedOrderForShipment, 
  updateOrderStatus
}) => {
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [formData, setFormData] = useState({
    orderId: '',
    origin: '',
    destination: '',
    driver: '',
    vehicle: '',
    contactNumber: '',
    status: 'Pending',
    progress: 0,
    eta: '',
    estimatedDeliveryDate: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Add this function at the top of your component
  const mockUpdateOrderStatus = (orderId, status) => {
    console.log(`MOCK: Order ${orderId} status updated to ${status}`);
    toast.success(`Order #${orderId} status updated to ${status}`);
    return Promise.resolve({ success: true });
  };
  
  // Fetch active shipments
  const fetchActiveShipments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/shipping/active');
      setActiveShipments(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setError('Failed to load shipments. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    fetchActiveShipments();
  }, []);
  
  // Handle when a new order is selected for shipment from the dashboard
  useEffect(() => {
    if (selectedOrderForShipment) {
      // Populate the form with order data
      setFormData({
        ...formData,
        orderId: selectedOrderForShipment.id || '',
        origin: 'Warehouse', // Default value
        destination: selectedOrderForShipment.shippingAddress?.address || selectedOrderForShipment.customer || '',
        customerName: selectedOrderForShipment.customer || 'N/A',
        orderItems: selectedOrderForShipment.items || 'Various items',
        orderValue: selectedOrderForShipment.value ? `${selectedOrderForShipment.value}` : 'N/A',
        driver: '',
        vehicle: '',
        contactNumber: '',
        status: 'Pending',
        progress: 0,
        eta: '24 hours', // Default ETA
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        notes: `Order ${selectedOrderForShipment.id} - ${selectedOrderForShipment.items} items - ${selectedOrderForShipment.customer}`
      });
      setShowShipmentForm(true);
      
      // Keep the reference to update order status later
      setSelectedOrderForShipment(selectedOrderForShipment);
    }
  }, [selectedOrderForShipment]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent changes to order-related fields if creating from an order
    if (selectedOrderForShipment && (name === 'orderId' || name === 'destination')) {
      return; // Don't allow changes to these fields
    }
    
    // For contact number, only allow digits and limit to 10
    if (name === 'contactNumber') {
      const onlyDigits = value.replace(/\D/g, '');
      const limitedValue = onlyDigits.slice(0, 10);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
      
      // Validate contact number
      if (!limitedValue) {
        setFormErrors({...formErrors, [name]: 'Contact number is required'});
      } else if (limitedValue.length !== 10) {
        setFormErrors({...formErrors, [name]: 'Contact number must be 10 digits'});
      } else {
        setFormErrors({...formErrors, [name]: ''});
      }
      return;
    }
    
    // For progress, ensure it's between 0-100
    if (name === 'progress') {
      const numValue = parseInt(value) || 0;
      const clampedValue = Math.min(Math.max(numValue, 0), 100);
      
      setFormData({
        ...formData,
        [name]: clampedValue
      });
      
      setFormErrors({...formErrors, [name]: ''});
      return;
    }
    
    // For dates, validate not in past
    if (name === 'estimatedDeliveryDate' && value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      
      setFormData({
        ...formData,
        [name]: value
      });
      
      if (selectedDate < today) {
        setFormErrors({...formErrors, [name]: 'Delivery date cannot be in the past'});
      } else {
        setFormErrors({...formErrors, [name]: ''});
      }
      return;
    }
    
    // For other fields, check length constraints
    const maxLengths = {
      orderId: 50,
      origin: 100,
      destination: 100,
      driver: 50,
      vehicle: 30,
      eta: 30
    };
    
    let finalValue = value;
    if (maxLengths[name] && value.length > maxLengths[name]) {
      finalValue = value.slice(0, maxLengths[name]);
    }
    
    setFormData({
      ...formData,
      [name]: finalValue
    });
    
    // Check if it's a required field and validate
    if (['orderId', 'origin', 'destination', 'driver', 'vehicle'].includes(name)) {
      if (!finalValue.trim()) {
        setFormErrors({
          ...formErrors, 
          [name]: `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`
        });
      } else {
        setFormErrors({...formErrors, [name]: ''});
      }
    }
  };
  
  // Enhanced form validation function
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    const requiredFields = ['orderId', 'origin', 'destination', 'driver', 'vehicle', 'contactNumber'];
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    // Contact number validation - must be 10 digits
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber.trim())) {
      errors.contactNumber = 'Contact number must be a 10-digit number (e.g., 0777123456)';
    }
    
    // Length validations
    if (formData.orderId?.length > 50) {
      errors.orderId = 'Order ID cannot exceed 50 characters';
    }
    
    if (formData.origin?.length > 100) {
      errors.origin = 'Origin cannot exceed 100 characters';
    }
    
    if (formData.destination?.length > 100) {
      errors.destination = 'Destination cannot exceed 100 characters';
    }
    
    if (formData.driver?.length > 50) {
      errors.driver = 'Driver name cannot exceed 50 characters';
    }
    
    if (formData.vehicle?.length > 30) {
      errors.vehicle = 'Vehicle ID cannot exceed 30 characters';
    }
    
    if (formData.eta?.length > 30) {
      errors.eta = 'ETA cannot exceed 30 characters';
    }
    
    // Progress validation - must be between 0 and 100
    if (formData.progress < 0 || formData.progress > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }
    
    // Date validation - estimated delivery date should not be in the past
    if (formData.estimatedDeliveryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day for fair comparison
      const deliveryDate = new Date(formData.estimatedDeliveryDate);
      
      if (deliveryDate < today) {
        errors.estimatedDeliveryDate = 'Delivery date cannot be in the past';
      }
    }
    
    return errors;
  };
  
  // Modify handleSubmit to use the mock function as fallback
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    
    // Update all form errors
    setFormErrors(errors);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      // Display first error as toast notification
      toast.error(Object.values(errors)[0]);
      return;
    }
    
    try {
      setLoading(true);
      
      if (selectedShipment) {
        // Update existing shipment
        const response = await axios.put(`http://localhost:5000/api/shipping/${selectedShipment._id}`, formData);
        setActiveShipments(activeShipments.map(s => s._id === selectedShipment._id ? response.data : s));
        toast.success('Shipment updated successfully');
      } else {
        // Create new shipment
        const response = await axios.post('http://localhost:5000/api/shipping', formData);
        setActiveShipments([...activeShipments, response.data]);
        toast.success('Shipment created successfully');
        
        // Update the order status if this shipment was created from an order
        if (selectedOrderForShipment) {
          try {
            if (updateOrderStatus) {
              await updateOrderStatus(selectedOrderForShipment.id, 'In Transit');
            } else {
              // Use mock function if real function isn't available
              await mockUpdateOrderStatus(selectedOrderForShipment.id, 'In Transit');
            }
          } catch (orderError) {
            console.error('Failed to update order status:', orderError);
            toast.warning(`Shipment created, but couldn't update order status`);
          }
        }
      }
      
      // Reset form and order selection
      resetForm();
      if (setSelectedOrderForShipment) {
        setSelectedOrderForShipment(null);
      }
    } catch (error) {
      console.error('Error saving shipment:', error);
      toast.error(error.response?.data?.error || 'Failed to save shipment');
    } finally {
      setLoading(false);
    }
  };
  
  // Improved error handling in handleStatusUpdate
  const handleStatusUpdate = async (id, newStatus, newProgress) => {
    try {
      setLoading(true);
      
      // First, update UI optimistically
      const updatedShipments = activeShipments.map(s => 
        s._id === id 
          ? {...s, status: newStatus, progress: newProgress} 
          : s
      );
      setActiveShipments(updatedShipments);
      
      const response = await axios.put(`http://localhost:5000/api/shipping/${id}/status`, {
        status: newStatus,
        progress: newProgress
      });
      
      // Find the shipment to get order ID for order status update
      const updatedShipment = response.data;
      const orderIdForUpdate = updatedShipment.orderId;
      
      toast.success(`Status updated to ${newStatus}`);
      
      // Update order status based on shipment status
      if (updateOrderStatus && orderIdForUpdate) {
        let orderStatus = 'Processing';
        
        if (newStatus === 'In Transit') {
          orderStatus = 'In Transit';
        } else if (newStatus === 'Out for Delivery') {
          orderStatus = 'Out for Delivery';
        } else if (newStatus === 'Delivered') {
          orderStatus = 'Delivered';
        } else if (newStatus === 'Failed') {
          orderStatus = 'Failed Delivery';
        } else if (newStatus === 'Returned') {
          orderStatus = 'Returned';
        }
        
        try {
          await updateOrderStatus(orderIdForUpdate, orderStatus);
        } catch (orderError) {
          console.error('Failed to update order status:', orderError);
          toast.warning(`Shipment updated, but couldn't update order status`);
        }
      }
      
      // If delivered or failed, refresh the list after delay
      if (newStatus === 'Delivered' || newStatus === 'Failed') {
        setTimeout(() => {
          fetchActiveShipments();
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      
      // Revert the optimistic UI update
      fetchActiveShipments(); 
    } finally {
      setLoading(false);
    }
  };
  
  // Delete shipment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Find the shipment to get order ID before deletion
      const shipment = activeShipments.find(s => s._id === id);
      const orderIdForUpdate = shipment?.orderId;
      
      await axios.delete(`http://localhost:5000/api/shipping/${id}`);
      setActiveShipments(activeShipments.filter(s => s._id !== id));
      toast.success('Shipment deleted successfully');
      
      // Update order status if the shipment is deleted
      if (updateOrderStatus && orderIdForUpdate) {
        updateOrderStatus(orderIdForUpdate, 'Pending');
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast.error('Failed to delete shipment');
    } finally {
      setLoading(false);
    }
  };
  
  // Edit shipment
  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      orderId: shipment.orderId,
      origin: shipment.origin,
      destination: shipment.destination,
      driver: shipment.driver,
      vehicle: shipment.vehicle,
      contactNumber: shipment.contactNumber || '',
      status: shipment.status,
      progress: shipment.progress,
      eta: shipment.eta || '',
      estimatedDeliveryDate: shipment.estimatedDeliveryDate ? shipment.estimatedDeliveryDate.split('T')[0] : '',
      notes: shipment.notes || ''
    });
    setShowShipmentForm(true);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      orderId: '',
      origin: '',
      destination: '',
      driver: '',
      vehicle: '',
      contactNumber: '',
      status: 'Pending',
      progress: 0,
      eta: '',
      estimatedDeliveryDate: '',
      notes: ''
    });
    setSelectedShipment(null);
    setShowShipmentForm(false);
    
    // Clear any selected order when form is reset
    if (setSelectedOrderForShipment) {
      setSelectedOrderForShipment(null);
    }
  };
  
  // Generate status badge based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'Loading':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Loading</span>;
      case 'In Transit':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">In Transit</span>;
      case 'Out for Delivery':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Out for Delivery</span>;
      case 'Delivered':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Delivered</span>;
      case 'Failed':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Failed</span>;
      case 'Returned':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Returned</span>;
      default:
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Shipment Management</h2>
        <div className="space-x-2">
          <button 
            onClick={() => setShowShipmentForm(!showShipmentForm)}
            className="flex items-center text-blue-700 hover:text-blue-900"
          >
            {showShipmentForm ? (
              <>Cancel</>
            ) : (
              <>
                <Plus size={18} className="mr-1" /> New Shipment
              </>
            )}
          </button>
          <button 
            onClick={fetchActiveShipments}
            className="flex items-center text-green-700 hover:text-green-900"
            disabled={loading}
          >
            <RefreshCw size={18} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Display notification when order is selected */}
      {selectedOrderForShipment && !showShipmentForm && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4 flex items-center">
          <Truck className="mr-2" />
          <div>
            <p className="font-medium">Creating shipment for order #{selectedOrderForShipment.id}</p>
            <p className="text-sm mt-1">Customer: {selectedOrderForShipment.customer}, Items: {selectedOrderForShipment.items}</p>
          </div>
          <button 
            onClick={() => setShowShipmentForm(true)}
            className="ml-auto bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
          >
            Fill Details
          </button>
        </div>
      )}
      
      {/* Shipment Form */}
      {showShipmentForm && (
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {selectedShipment ? 'Edit Shipment' : (selectedOrderForShipment ? `Create Shipment for Order #${selectedOrderForShipment.id}` : 'Create New Shipment')}
          </h3>
          
          {/* Add order details section when creating from an order */}
          {selectedOrderForShipment && (
            <div className="mb-6 bg-blue-50 p-3 rounded-md border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Order Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium">{selectedOrderForShipment.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrderForShipment.customer}</p>
                </div>
                <div>
                  <p className="text-gray-500">Items</p>
                  <p className="font-medium">{selectedOrderForShipment.items}</p>
                </div>
                <div>
                  <p className="text-gray-500">Value</p>
                  <p className="font-medium">{selectedOrderForShipment.value ? `$${selectedOrderForShipment.value}` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{selectedOrderForShipment.shippingAddress?.address || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{selectedOrderForShipment.status || 'Pending'}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">Note: These order details cannot be changed</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order ID - visibly marked as read-only */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Order ID<span className="text-red-500">*</span>
                  {selectedOrderForShipment && <span className="text-xs text-blue-600 ml-2">(From order)</span>}
                </label>
                <input 
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.orderId ? 'border-red-500' : (selectedOrderForShipment ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-300')} rounded px-3 py-2`}
                  required
                  readOnly={selectedOrderForShipment !== null}
                />
                {selectedOrderForShipment && (
                  <p className="text-xs text-gray-500 mt-1">Order ID cannot be changed</p>
                )}
                {formErrors.orderId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.orderId}</p>
                )}
              </div>
              
              {/* Origin */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Origin<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.origin ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                  required
                />
                {formErrors.origin && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.origin}</p>
                )}
              </div>
              
              {/* Destination - visibly marked as from order */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Destination<span className="text-red-500">*</span>
                  {selectedOrderForShipment && <span className="text-xs text-blue-600 ml-2">(From order)</span>}
                </label>
                <input 
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.destination ? 'border-red-500' : (selectedOrderForShipment ? 'bg-gray-100 border-gray-300' : 'border-gray-300')} rounded px-3 py-2`}
                  required
                  readOnly={selectedOrderForShipment !== null}
                />
                {selectedOrderForShipment && (
                  <p className="text-xs text-gray-500 mt-1">Address from customer order</p>
                )}
                {formErrors.destination && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.destination}</p>
                )}
              </div>
              
              {/* Rest of the inputs remain the same */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Driver Name<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.driver ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                  required
                />
                {formErrors.driver && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.driver}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Vehicle ID<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.vehicle ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                  required
                />
                {formErrors.vehicle && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.vehicle}</p>
                )}
              </div>
              
              {/* Update the form inputs to display errors (example for contact number) */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Contact Number<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                  placeholder="0777123456"
                  required
                />
                {formErrors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Loading">Loading</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Progress (%)
                </label>
                <input 
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.progress ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                  min="0"
                  max="100"
                />
                {formErrors.progress && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.progress}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  ETA
                </label>
                <input 
                  type="text"
                  name="eta"
                  value={formData.eta}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.eta ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                  placeholder="e.g. 2 hours"
                />
                {formErrors.eta && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.eta}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Estimated Delivery Date
                </label>
                <input 
                  type="date"
                  name="estimatedDeliveryDate"
                  value={formData.estimatedDeliveryDate}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.estimatedDeliveryDate ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                />
                {formErrors.estimatedDeliveryDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.estimatedDeliveryDate}</p>
                )}
              </div>
              
              {/* Notes with order reference */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-1 text-sm font-medium">
                  Notes
                  {selectedOrderForShipment && <span className="text-xs text-blue-600 ml-2">(Pre-filled with order details)</span>}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? 'Saving...' : (selectedShipment ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Rest of the component remains the same */}
      <h3 className="text-lg font-medium mb-3">Active Shipments</h3>
      
      {loading && !showShipmentForm && (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!loading && activeShipments.length === 0 && (
        <div className="bg-gray-50 rounded-md p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No active shipments found.</p>
          <button 
            onClick={() => setShowShipmentForm(true)} 
            className="mt-3 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
          >
            Create New Shipment
          </button>
        </div>
      )}

      {!loading && activeShipments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeShipments.map(shipment => (
            <div key={shipment._id} className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-gray-500">Order #{shipment.orderId}</span>
                  <h4 className="font-medium">{shipment.destination}</h4>
                </div>
                {getStatusBadge(shipment.status)}
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${shipment.progress}%` }}
                ></div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-600">{shipment.origin} → {shipment.destination}</span>
                </div>
                
                <div className="flex items-center">
                  <User size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-600">{shipment.driver}</span>
                </div>
                
                <div className="flex items-center">
                  <Truck size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-600">{shipment.vehicle}</span>
                </div>
                
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-600">{shipment.contactNumber}</span>
                </div>
                
                {shipment.estimatedDeliveryDate && (
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-500 mr-2" />
                    <span className="text-gray-600">
                      {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {shipment.eta && (
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-500 mr-2" />
                    <span className="text-gray-600">ETA: {shipment.eta}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t mt-3 pt-3 flex flex-wrap justify-between">
                {/* Status update buttons */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {shipment.status !== 'In Transit' && (
                    <button
                      onClick={() => handleStatusUpdate(shipment._id, 'In Transit', 30)}
                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
                    >
                      Mark In Transit
                    </button>
                  )}
                  
                  {shipment.status !== 'Out for Delivery' && (
                    <button
                      onClick={() => handleStatusUpdate(shipment._id, 'Out for Delivery', 70)}
                      className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded"
                    >
                      Out for Delivery
                    </button>
                  )}
                  
                  {shipment.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusUpdate(shipment._id, 'Delivered', 100)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                    >
                      Mark Delivered
                    </button>
                  )}
                  
                  {shipment.status !== 'Failed' && (
                    <button
                      onClick={() => handleStatusUpdate(shipment._id, 'Failed', 0)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded"
                    >
                      Mark Failed
                    </button>
                  )}
                </div>
                
                {/* Edit/Delete buttons */}
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEdit(shipment)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(shipment._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingManager;