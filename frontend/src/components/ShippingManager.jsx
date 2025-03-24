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
  const [viewMode, setViewMode] = useState('active'); // 'active', 'completed', or 'returned'
  const [completedShipments, setCompletedShipments] = useState([]);
  const [returnedShipments, setReturnedShipments] = useState([]);
  const [expandedShipmentId, setExpandedShipmentId] = useState(null); // Add this state for tracking expanded rows
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false); // Add this state for toggling additional details
  
  // Add this function at the top of your component
  const mockUpdateOrderStatus = (orderId, status) => {
    console.log(`MOCK: Order ${orderId} status updated to ${status}`);
    toast.success(`Order #${orderId} status updated to ${status}`);
    return Promise.resolve({ success: true });
  };
  
  // Add this function at the top of your component to properly map shipping statuses to order statuses
const mapShippingStatusToOrderStatus = (shippingStatus) => {
  // Map shipping status to valid order status values from Order.js model
  // Assuming valid order statuses: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  switch(shippingStatus) {
    case 'Pending':
    case 'Loading':
      return 'processing';
      
    case 'In Transit':
    case 'Out for Delivery':
      return 'shipped';
      
    case 'Delivered':
      return 'delivered';
      
    case 'Failed':
      return 'processing'; // Failed delivery means we need to try again
      
    case 'Returned':
      return 'cancelled';
      
    default:
      return 'processing';
  }
};

// Add this improved function to safely update order status using the correct endpoint
const safeUpdateOrderStatus = async (orderId, shippingStatus) => {
  try {
    // Map shipping status to valid order status
    const orderStatus = mapShippingStatusToOrderStatus(shippingStatus);
    
    console.log(`Updating order ${orderId} to status: ${orderStatus} (from shipping status: ${shippingStatus})`);
    
    // First try to use the provided updateOrderStatus function
    if (updateOrderStatus && typeof updateOrderStatus === 'function') {
      await updateOrderStatus(orderId, orderStatus);
      return true;
    } else {
      // If no function is provided, try to update directly via API
      try {
        // Use the correct PATCH endpoint as defined in orderRoutes.js
        const response = await axios.patch(
          `http://localhost:5000/api/orders/${orderId}/status`, 
          { status: orderStatus }
        );
        
        if (response.status === 200) {
          toast.success(`Order #${orderId} status updated to ${orderStatus}`);
          return true;
        }
      } catch (apiError) {
        console.warn(`Direct API order update failed: ${apiError.message}`);
        
        // Show more detailed error for debugging
        if (apiError.response) {
          console.log(`Status: ${apiError.response.status}, Data:`, apiError.response.data);
        }
        
        // Try another API endpoint format as fallback
        try {
          const fallbackResponse = await axios.patch(
            `http://localhost:5000/api/orders/${orderId}`, 
            { orderStatus: orderStatus }
          );
          
          if (fallbackResponse.status === 200) {
            toast.success(`Order #${orderId} status updated to ${orderStatus} (fallback)`);
            return true;
          }
        } catch (fallbackError) {
          console.warn(`Fallback order update failed: ${fallbackError.message}`);
        }
      }
      
      // If we get here, show a UI-only update
      console.log(`UI-only update for order ${orderId} to ${orderStatus}`);
      toast.info(`Shipment updated. Order status change will sync later.`);
      return false;
    }
  } catch (error) {
    console.error(`Order status update failed: ${error.message}`);
    toast.warning(`Shipment updated, but order status update failed`);
    return false;
  }
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
  
  // Replace the fetchCompletedShipments function with this version
  const fetchCompletedShipments = async () => {
    try {
      setLoading(true);
      
      try {
        // Try to get data from the backend
        const response = await axios.get('http://localhost:5000/api/shipping/completed');
        setCompletedShipments(response.data);
      } catch (error) {
        console.log("Server endpoint for completed shipments not available, using client-side filtering");
        
        // Fallback: Filter completed shipments from all shipments on the client side
        const allShipmentsResponse = await axios.get('http://localhost:5000/api/shipping');
        
        if (allShipmentsResponse.data) {
          // Filter shipments with status Delivered only
          const completed = allShipmentsResponse.data.filter(
            shipment => shipment.status === 'Delivered'
          );
          
          setCompletedShipments(completed);
          console.log(`Found ${completed.length} completed shipments via client-side filtering`);
        }
      }
      
      setError(null);
    } catch (error) {
      console.error("Error fetching or filtering completed shipments:", error);
      // Silently handle the error - don't show to user
      setCompletedShipments([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new function to fetch returned shipments
  const fetchReturnedShipments = async () => {
    try {
      setLoading(true);
      
      try {
        // Try to get data from the backend
        const response = await axios.get('http://localhost:5000/api/shipping/returned');
        setReturnedShipments(response.data);
      } catch (error) {
        console.log("Server endpoint for returned shipments not available, using client-side filtering");
        
        // Fallback: Filter returned shipments from all shipments
        const allShipmentsResponse = await axios.get('http://localhost:5000/api/shipping');
        
        if (allShipmentsResponse.data) {
          // Filter shipments with status Failed or Returned
          const returned = allShipmentsResponse.data.filter(
            shipment => ['Failed', 'Returned'].includes(shipment.status)
          );
          
          setReturnedShipments(returned);
          console.log(`Found ${returned.length} returned shipments via client-side filtering`);
        }
      }
      
      setError(null);
    } catch (error) {
      console.error("Error fetching or filtering returned shipments:", error);
      setReturnedShipments([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    fetchActiveShipments();
    fetchCompletedShipments();
    fetchReturnedShipments();
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

  // Add this to your component imports
const validateVehicleNumber = (vehicleNumber) => {
  // Sri Lankan vehicle number patterns
  const traditionalPattern = /^[A-Z]{1,3}-\d{4}$/;             // KA-1234
  const newFormat = /^[A-Z]{2,3}-\d{4}$/;                      // CAB-1234
  const modernFormat = /^[A-Z]{2}-[A-Z]{1,3}-\d{4}$/;          // WP-CAB-1234
  const spaceFormat = /^[A-Z]{2}\s[A-Z]{2,3}-\d{4}$/;          // CP BAC-1234

  if (vehicleNumber.trim() === '') {
    return 'Vehicle number is required';
  } else if (
    !traditionalPattern.test(vehicleNumber) && 
    !newFormat.test(vehicleNumber) && 
    !modernFormat.test(vehicleNumber) && 
    !spaceFormat.test(vehicleNumber)
  ) {
    return 'Invalid Sri Lankan vehicle number format (e.g., KA-1234, CAB-1234, WP-CAB-1234)';
  }
  return '';
};

// Add this to your component imports
const validateSriLankanPhoneNumber = (phone) => {
  // Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX
  // Sri Lankan landline: 0XXXXXXXXX or +94XXXXXXXXX
  const mobilePattern = /^(?:0|(?:\+94))7\d{8}$/;
  const landlinePattern = /^(?:0|(?:\+94))[1-9][0-9]{8}$/;

  if (phone.trim() === '') {
    return 'Phone number is required';
  } else if (!mobilePattern.test(phone) && !landlinePattern.test(phone)) {
    return 'Invalid Sri Lankan phone number format (e.g., 0771234567 or +94771234567)';
  }
  return '';
};

// Update handleInputChange function
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Vehicle number validation
  if (name === 'vehicle') {
    const error = validateVehicleNumber(value);
    setFormData({
      ...formData,
      [name]: value.toUpperCase() // Automatically convert to uppercase
    });
    setFormErrors({...formErrors, [name]: error});
    return;
  }

  // For contact number, validate Sri Lankan format
  if (name === 'contactNumber') {
    const sanitizedValue = value.replace(/\s/g, ''); // Remove spaces
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
    
    const error = validateSriLankanPhoneNumber(sanitizedValue);
    setFormErrors({...formErrors, [name]: error});
    return;
  }

  // Rest of your existing handleInputChange logic...
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
  
  // Update in your handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  const errors = validateForm();
  
  // If no status is provided, default to "Pending"
  if (!formData.status) {
    formData.status = 'Pending';
  }
  
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
  
  // Update the handleStatusUpdate function to move shipments to completed
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
      
      // Include completedAt timestamp when marking as delivered or failed
      const updateData = {
        status: newStatus,
        progress: newProgress
      };
      
      if (newStatus === 'Delivered' || newStatus === 'Failed' || newStatus === 'Returned') {
        updateData.completedAt = new Date().toISOString();
      }
      
      const response = await axios.put(`http://localhost:5000/api/shipping/${id}/status`, updateData);
      
      // Find the shipment to get order ID for order status update
      const updatedShipment = response.data;
      const orderIdForUpdate = updatedShipment.orderId;
      
      toast.success(`Status updated to ${newStatus}`);
      
      // Update order status based on shipment status
      if (updateOrderStatus && orderIdForUpdate) {
        try {
          let orderStatus = 'processing';
          
          if (newStatus === 'In Transit') {
            orderStatus = 'shipped';
          } else if (newStatus === 'Out for Delivery') {
            orderStatus = 'shipped';
          } else if (newStatus === 'Delivered') {
            orderStatus = 'delivered';
          } else if (newStatus === 'Failed') {
            orderStatus = 'processing'; // Need to retry
          } else if (newStatus === 'Returned') {
            orderStatus = 'cancelled';
          }
          
          await updateOrderStatus(orderIdForUpdate, orderStatus);
        } catch (orderError) {
          console.error('Failed to update order status:', orderError);
          toast.warning(`Shipment updated, but couldn't update order status. The order API may need configuration.`);
        }
      }
      
      // Update the terminal status handling in handleStatusUpdate
      const shipment = activeShipments.find(s => s._id === id);
      if (shipment) {
        setActiveShipments(prev => prev.filter(s => s._id !== id));
        
        // Move to the correct section based on status
        if (newStatus === 'Delivered') {
          // Move to completed shipments
          setCompletedShipments(prev => [
            {
              ...shipment, 
              status: newStatus, 
              progress: newProgress, 
              completedAt: new Date().toISOString()
            },
            ...prev
          ]);
        } else if (newStatus === 'Failed' || newStatus === 'Returned') {
          // Move to returned shipments
          setReturnedShipments(prev => [
            {
              ...shipment, 
              status: newStatus, 
              progress: newProgress, 
              completedAt: new Date().toISOString()
            },
            ...prev
          ]);
        }
      }
      
      toast.success(`Shipment marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      
      // Revert the optimistic UI update
      fetchActiveShipments(); 
    } finally {
      setLoading(false);
    }
    
    // Update this section in your handleStatusUpdate function
    // Replace the try/catch block for order status update with this code
    if (shipment.orderId) {
      // Use our safer function that maps statuses correctly
      safeUpdateOrderStatus(shipment.orderId, newStatus)
        .then(success => {
          if (success) {
            console.log(`Order ${shipment.orderId} status updated successfully`);
          } else {
            console.log(`Order ${shipment.orderId} status update handled gracefully`);
          }
        });
    }
  };
  
  // Improved handleDelete function with fallback mechanism
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this shipment?')) {
    return;
  }
  
  try {
    setLoading(true);
    
    // Find the shipment to get order ID before deletion
    const shipment = [...activeShipments, ...completedShipments, ...returnedShipments].find(s => s._id === id);
    const orderIdForUpdate = shipment?.orderId;
    
    // Update UI optimistically
    if (viewMode === 'active') {
      setActiveShipments(prev => prev.filter(s => s._id !== id));
    } else if (viewMode === 'completed') {
      setCompletedShipments(prev => prev.filter(s => s._id !== id));
    } else if (viewMode === 'returned') {
      setReturnedShipments(prev => prev.filter(s => s._id !== id));
    }
    
    try {
      // Try to delete on the server
      await axios.delete(`http://localhost:5000/api/shipping/${id}`);
      toast.success('Shipment deleted successfully');
      
      // Try to update order status if needed
      if (orderIdForUpdate) {
        await safeUpdateOrderStatus(orderIdForUpdate, 'processing');
      }
    } catch (apiError) {
      // Handle server error but keep the UI change
      console.warn('Server deletion failed:', apiError);
      toast.warning('Server couldn\'t delete the shipment, but it was removed from your view');
      
      if (apiError.response?.status === 404) {
        console.log('The shipment may have already been deleted or doesn\'t exist on the server');
      }
    }
  } catch (error) {
    console.error('Error in delete process:', error);
    toast.error('An unexpected error occurred');
    
    // If the entire process fails, refresh to get current state
    fetchActiveShipments();
    fetchCompletedShipments();
    fetchReturnedShipments();
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
    setFormErrors({});
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

  // Add this function to handle tab switching
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    
    // If switching to completed view, refresh completed shipments
    if (mode === 'completed') {
      fetchCompletedShipments();
    } else if (mode === 'active') {
      fetchActiveShipments();
    } else if (mode === 'returned') {
      fetchReturnedShipments();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Shipment Management</h2>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowShipmentForm(!showShipmentForm)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              showShipmentForm 
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300" 
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
            }`}
          >
            {showShipmentForm ? (
              <>Cancel</>
            ) : (
              <>
                <Plus size={18} className="mr-1.5" /> New Shipment
              </>
            )}
          </button>
          <button 
            onClick={fetchActiveShipments}
            className="flex items-center px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all"
            disabled={loading}
          >
            <RefreshCw size={18} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
  <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
    {/* Blurred backdrop */}
    <div className="fixed inset-0 bg-gray-500/30 backdrop-filter backdrop-blur-md" onClick={resetForm}></div>
    
    {/* Modal content */}
    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 my-6 z-10 animate-fade-in-up">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedShipment ? 'Edit Shipment' : (selectedOrderForShipment ? `Create Shipment for Order #${selectedOrderForShipment.id}` : 'Create New Shipment')}
        </h3>
        <button 
          onClick={resetForm} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto max-h-[80vh]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden Status field */}
          <input 
            type="hidden"
            name="status"
            value="Pending" 
          />
          
          {/* Order Details Section */}
          <div className="border-b border-gray-100 pb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Order Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Order ID<span className="text-red-500">*</span>
                  {selectedOrderForShipment && <span className="text-xs text-blue-600 ml-2">(From order)</span>}
                </label>
                <input 
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.orderId.trim()) {
                      setFormErrors({...formErrors, orderId: 'Order ID is required'});
                    }
                  }}
                  maxLength={50}
                  className={`w-full h-10 border ${formErrors.orderId ? 'border-red-500' : (selectedOrderForShipment ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-300')} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  required
                  readOnly={selectedOrderForShipment !== null}
                />
                {formErrors.orderId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.orderId}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Locations Section */}
          <div className="border-b border-gray-100 pb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Shipment Locations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Origin<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Check if origin and destination are the same
                    if (e.target.value.trim() && e.target.value.trim().toLowerCase() === formData.destination.toLowerCase()) {
                      setFormErrors({...formErrors, origin: 'Origin and destination cannot be the same'});
                    }
                  }}
                  onBlur={() => {
                    if (!formData.origin.trim()) {
                      setFormErrors({...formErrors, origin: 'Origin is required'});
                    }
                  }}
                  maxLength={100}
                  className={`w-full h-10 border ${formErrors.origin ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  required
                  placeholder="Warehouse or pickup location"
                />
                {formErrors.origin && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.origin}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Destination<span className="text-red-500">*</span>
                  {selectedOrderForShipment && <span className="text-xs text-blue-600 ml-2">(From order)</span>}
                </label>
                <input 
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Check if origin and destination are the same
                    if (e.target.value.trim() && e.target.value.trim().toLowerCase() === formData.origin.toLowerCase()) {
                      setFormErrors({...formErrors, destination: 'Origin and destination cannot be the same'});
                    }
                  }}
                  onBlur={() => {
                    if (!formData.destination.trim()) {
                      setFormErrors({...formErrors, destination: 'Destination is required'});
                    }
                  }}
                  maxLength={100}
                  className={`w-full h-10 border ${formErrors.destination ? 'border-red-500' : (selectedOrderForShipment ? 'bg-gray-100 border-gray-300' : 'border-gray-300')} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  required
                  readOnly={selectedOrderForShipment !== null}
                  placeholder="Delivery address"
                />
                {formErrors.destination && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.destination}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Driver & Vehicle Section */}
          <div className="border-b border-gray-100 pb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Transport Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Driver Name<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(e);
                    // Only allow letters, spaces and periods for driver names
                    if (value && !/^[A-Za-z\s.]+$/.test(value)) {
                      setFormErrors({...formErrors, driver: 'Driver name should only contain letters'});
                    } else {
                      setFormErrors({...formErrors, driver: ''});
                    }
                  }}
                  onBlur={() => {
                    if (!formData.driver.trim()) {
                      setFormErrors({...formErrors, driver: 'Driver name is required'});
                    }
                  }}
                  maxLength={50}
                  className={`w-full h-10 border ${formErrors.driver ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  required
                  placeholder="Full name of driver"
                />
                {formErrors.driver && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.driver}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Vehicle Number<span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!formData.vehicle.trim()) {
                      setFormErrors({...formErrors, vehicle: 'Vehicle number is required'});
                    }
                  }}
                  maxLength={30}
                  className={`w-full h-10 border ${formErrors.vehicle ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  placeholder="KA-1234 or WP-CAB-1234"
                  required
                />
                {formErrors.vehicle && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.vehicle}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Valid formats: KA-1234, CAB-1234, WP-CAB-1234</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Contact Number<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    onBlur={() => {
                      if (!formData.contactNumber.trim()) {
                        setFormErrors({...formErrors, contactNumber: 'Contact number is required'});
                      }
                    }}
                    maxLength={12}
                    className={`w-full h-10 border ${formErrors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md pl-10 pr-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="0771234567 or +94771234567"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                </div>
                {formErrors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Sri Lankan format (e.g., 0771234567 or +94771234567)</p>
              </div>
            </div>
          </div>
          
          {/* Delivery Timeline Section */}
          <div className="border-b border-gray-100 pb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Delivery Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Progress (%)
                </label>
                <input 
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 0 || value > 100) {
                      setFormErrors({...formErrors, progress: 'Progress must be between 0 and 100'});
                    } else {
                      setFormErrors({...formErrors, progress: ''});
                    }
                  }}
                  min="0"
                  max="100"
                  className={`w-full h-10 border ${formErrors.progress ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                />
                {formErrors.progress && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.progress}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  ETA (hours)
                </label>
                <input 
                  type="number"
                  name="eta"
                  value={formData.eta}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (value !== undefined && value !== null && (isNaN(value) || value <= 0 || value > 240)) {
                      setFormErrors({...formErrors, eta: 'ETA must be between 1 and 240 hours'});
                    } else {
                      setFormErrors({...formErrors, eta: ''});
                    }
                  }}
                  min="1"
                  max="240"
                  className={`w-full h-10 border ${formErrors.eta ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  placeholder="24"
                />
                {formErrors.eta && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.eta}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                  Estimated Delivery Date
                </label>
                <input 
                  type="date"
                  name="estimatedDeliveryDate"
                  value={formData.estimatedDeliveryDate}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (e.target.value && selectedDate < today) {
                      setFormErrors({...formErrors, estimatedDeliveryDate: 'Delivery date cannot be in the past'});
                    } else {
                      setFormErrors({...formErrors, estimatedDeliveryDate: ''});
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]} // Today as minimum date
                  className={`w-full h-10 border ${formErrors.estimatedDeliveryDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                />
                {formErrors.estimatedDeliveryDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.estimatedDeliveryDate}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h4>
            <div>
              <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                Notes
                {selectedOrderForShipment && <span className="text-xs text-blue-600 ml-2">(Pre-filled with order details)</span>}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value.length > 500) {
                    setFormErrors({...formErrors, notes: 'Notes cannot exceed 500 characters'});
                  } else {
                    setFormErrors({...formErrors, notes: ''});
                  }
                }}
                maxLength={500}
                className={`w-full border ${formErrors.notes ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none`}
                rows="3"
                placeholder="Additional delivery instructions or information"
              ></textarea>
              {formErrors.notes && (
                <p className="text-red-500 text-xs mt-1">{formErrors.notes}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                <span className={formData.notes.length > 450 ? 'text-orange-500 font-medium' : ''}>
                  {formData.notes.length}
                </span>/500 characters
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-2">
            <button 
              type="button"
              onClick={resetForm}
              className="h-10 px-5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="h-10 px-5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || Object.keys(formErrors).some(key => formErrors[key])}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (selectedShipment ? 'Update' : 'Create Shipment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
      
      {/* Shipment Tabs */}
      <div className="border-b mb-4 pb-1">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 font-medium ${viewMode === 'active' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleViewModeChange('active')}
          >
            Active Shipments
          </button>
          <button
            className={`px-4 py-2 font-medium ${viewMode === 'completed' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleViewModeChange('completed')}
          >
            Completed Shipments
          </button>
          <button
            className={`px-4 py-2 font-medium ${viewMode === 'returned' 
              ? 'border-b-2 border-red-500 text-red-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleViewModeChange('returned')}
          >
            Returned Shipments
          </button>
        </div>
      </div>

      {loading && !showShipmentForm && (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Active Shipments View */}
      {viewMode === 'active' && !loading && (
        <>
          {activeShipments.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeShipments.map(shipment => (
                <div key={shipment._id} className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Order #{shipment.orderId}</span>
                      <h4 className="font-medium">{shipment.destination}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(shipment.status)}
                      <span className="text-xs text-gray-500 mt-1">
                        Updated: {new Date(shipment.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
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
        </>
      )}

      {/* Completed Shipments View */}
      {viewMode === 'completed' && !loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Completed Deliveries</h3>
            <button 
              onClick={fetchCompletedShipments}
              className="flex items-center text-green-700 hover:text-green-900"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          
          {completedShipments.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-6 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No completed shipments found.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Destination</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Driver</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Delivery Date</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {completedShipments.map((shipment) => (
                    <>
                      <tr key={shipment._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 cursor-pointer" onClick={() => setExpandedShipmentId(expandedShipmentId === shipment._id ? null : shipment._id)}>
                          <div className="flex items-center">
                            <button className="mr-2 focus:outline-none">
                              {expandedShipmentId === shipment._id ? 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg> : 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              }
                            </button>
                            #{shipment.orderId}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{shipment.destination}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{shipment.driver}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {getStatusBadge(shipment.status)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {shipment.completedAt ? new Date(shipment.completedAt).toLocaleDateString() : 
                          new Date(shipment.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(shipment)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(shipment._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded details row */}
                      {expandedShipmentId === shipment._id && (
                        <tr>
                          <td colSpan="6" className="p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Shipment Details</p>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <MapPin size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">From: {shipment.origin}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">To: {shipment.destination}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Truck size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">Vehicle: {shipment.vehicle}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">Contact: {shipment.contactNumber}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Timeline</p>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <Calendar size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">Created: {new Date(shipment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {shipment.completedAt && (
                                    <div className="flex items-center">
                                      <CheckCircle size={14} className="text-gray-500 mr-2" />
                                      <span className="text-gray-600">Completed: {new Date(shipment.completedAt).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                {shipment.notes && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-700">Notes:</p>
                                    <p className="text-gray-600">{shipment.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Returned Shipments View */}
      {viewMode === 'returned' && !loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Failed & Returned Deliveries</h3>
            <button 
              onClick={fetchReturnedShipments}
              className="flex items-center text-red-700 hover:text-red-900"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          
          {returnedShipments.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No returned or failed shipments found.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Destination</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Driver</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Failure Date</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {returnedShipments.map((shipment) => (
                    <>
                      <tr key={shipment._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 cursor-pointer" onClick={() => setExpandedShipmentId(expandedShipmentId === shipment._id ? null : shipment._id)}>
                          <div className="flex items-center">
                            <button className="mr-2 focus:outline-none">
                              {expandedShipmentId === shipment._id ? 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg> : 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              }
                            </button>
                            #{shipment.orderId}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{shipment.destination}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{shipment.driver}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {getStatusBadge(shipment.status)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {shipment.completedAt ? new Date(shipment.completedAt).toLocaleDateString() : 
                          new Date(shipment.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(shipment)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(shipment._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded details row */}
                      {expandedShipmentId === shipment._id && (
                        <tr>
                          <td colSpan="6" className="p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Shipment Details</p>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <MapPin size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">From: {shipment.origin}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">To: {shipment.destination}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Truck size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">Vehicle: {shipment.vehicle}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">Contact: {shipment.contactNumber}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Issue Information</p>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <Calendar size={14} className="text-gray-500 mr-2" />
                                    <span className="text-gray-600">Created: {new Date(shipment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {shipment.completedAt && (
                                    <div className="flex items-center">
                                      <AlertCircle size={14} className="text-red-500 mr-2" />
                                      <span className="text-gray-600">
                                        {shipment.status === 'Failed' ? 'Failed on: ' : 'Returned on: '}
                                        {new Date(shipment.completedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {shipment.notes && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-700">Notes:</p>
                                    <p className="text-gray-600">{shipment.notes}</p>
                                  </div>
                                )}
                                
                                {/* Add retry button for failed shipments */}
                                {shipment.status === 'Failed' && (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => {
                                        // Move back to active shipments with Pending status
                                        handleEdit({
                                          ...shipment,
                                          status: 'Pending',
                                          progress: 0
                                        });
                                        setShowShipmentForm(true);
                                      }}
                                      className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors"
                                    >
                                      Prepare for Redelivery
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShippingManager;