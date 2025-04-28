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
  Phone,
  Activity,
  X,
  AlertOctagon,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Search
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
  const [searchTerm, setSearchTerm] = useState(''); // Add state for search term
  const [statusFilter, setStatusFilter] = useState('all'); // Add state for status filtering
  
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
      // Client-side filter to make sure no failed/returned shipments appear in active view
      const filteredShipments = response.data.filter(
        shipment => !['Failed', 'Returned', 'Delivered'].includes(shipment.status)
      );
      setActiveShipments(filteredShipments);
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
        
        // Ensure all completed shipments have a completedAt field for frontend use
        const processedShipments = response.data.map(shipment => {
          if (shipment.actualDeliveryDate && !shipment.completedAt) {
            return {
              ...shipment,
              completedAt: shipment.actualDeliveryDate
            };
          }
          return shipment;
        });
        
        setCompletedShipments(processedShipments);
      } catch (error) {
        console.log("Server endpoint for completed shipments not available, using client-side filtering");
        
        // Fallback: Filter completed shipments from all shipments on the client side
        const allShipmentsResponse = await axios.get('http://localhost:5000/api/shipping');
        
        if (allShipmentsResponse.data) {
          // Filter shipments with status Delivered only
          const completed = allShipmentsResponse.data
            .filter(shipment => shipment.status === 'Delivered')
            .map(shipment => {
              // Add completedAt if not present but actualDeliveryDate is
              if (shipment.actualDeliveryDate && !shipment.completedAt) {
                return {
                  ...shipment,
                  completedAt: shipment.actualDeliveryDate
                };
              }
              return shipment;
            });
          
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
  
  // Add new function to handle rearranging a shipment
  const handleRearrangeShipment = async (shipment) => {
    try {
      setLoading(true);
      
      // Create update data with Pending status and reset progress
      const updateData = {
        status: 'Pending',
        progress: 10,
        completedAt: null // Clear the completed timestamp
      };
      
      // Update on the server first
      const response = await axios.put(
        `http://localhost:5000/api/shipping/${shipment._id}/status`, 
        updateData
      );
      
      const rearrangedShipment = response.data;
      
      // Remove from returned shipments
      setReturnedShipments(prev => prev.filter(s => s._id !== shipment._id));
      
      // Add to active shipments
      setActiveShipments(prev => [
        {
          ...rearrangedShipment,
          status: 'Pending',
          progress: 10
        },
        ...prev
      ]);
      
      toast.success(`Shipment #${shipment._id} rearranged for delivery`);
      
      // Update order status if applicable
      if (shipment.orderId) {
        try {
          await safeUpdateOrderStatus(shipment.orderId, 'Pending');
        } catch (orderError) {
          console.error('Failed to update order status:', orderError);
          toast.warning(`Shipment rearranged, but order status update failed`);
        }
      }
    } catch (error) {
      console.error('Error rearranging shipment:', error);
      toast.error('Failed to rearrange shipment');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActiveShipments();
    fetchCompletedShipments();
    fetchReturnedShipments();
    
    // Check if there's a saved filter in sessionStorage
    const savedFilter = sessionStorage.getItem('shipmentFilter');
    if (savedFilter) {
      setStatusFilter(savedFilter);
      // Clear it after reading to avoid persisting between different page visits
      sessionStorage.removeItem('shipmentFilter');
    }
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

// Add these validation functions after the validateSriLankanPhoneNumber function
const validateLocation = (location, fieldName) => {
  // Check if empty
  if (!location.trim()) {
    return `${fieldName} is required`;
  }
  
  // Check minimum length
  if (location.trim().length < 3) {
    return `${fieldName} must be at least 3 characters`;
  }
  
  // Check maximum length
  if (location.trim().length > 100) {
    return `${fieldName} must not exceed 100 characters`;
  }
  
  // Check if first character is a letter or number
  const firstCharPattern = /^[a-zA-Z0-9]/;
  if (!firstCharPattern.test(location)) {
    return `${fieldName}'s first character must be a letter or number`;
  }
  
  return '';
};

const validateDriverName = (name) => {
  // Check if empty
  if (!name.trim()) {
    return 'Driver name is required';
  }
  
  // Check minimum length
  if (name.trim().length < 3) {
    return 'Driver name must be at least 3 characters';
  }
  
  // Check maximum length
  if (name.trim().length > 50) {
    return 'Driver name must not exceed 50 characters';
  }
  
  // Check for invalid characters - only allow letters and spaces
  const validNamePattern = /^[a-zA-Z\s]+$/;
  if (!validNamePattern.test(name)) {
    return 'Driver name can only contain letters and spaces';
  }
  
  return '';
};

// Update handleInputChange function
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // For contact number, validate Sri Lankan format and limit input
  if (name === 'contactNumber') {
    // Allow only digits and plus sign at beginning
    let sanitizedValue = '';
    if (value.startsWith('+')) {
      sanitizedValue = '+' + value.substring(1).replace(/[^\d]/g, '');
    } else {
      sanitizedValue = value.replace(/[^\d]/g, '');
    }
    
    // Limit length based on format (+94 format can be 12 chars, local format 10)
    if (sanitizedValue.startsWith('+94')) {
      sanitizedValue = sanitizedValue.slice(0, 12); // +94 + 9 digits
    } else {
      sanitizedValue = sanitizedValue.slice(0, 10); // 10 digits for local format
    }
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
    
    // Validate immediately
    const error = validateSriLankanPhoneNumber(sanitizedValue);
    setFormErrors({...formErrors, [name]: error});
    return;
  }

  // Driver name validation
  if (name === 'driver') {
    setFormData({
      ...formData,
      [name]: value
    });
    
    const error = validateDriverName(value);
    setFormErrors({...formErrors, [name]: error});
    return;
  }
  
  // Origin/destination validation
  if (name === 'origin' || name === 'destination') {
    setFormData({
      ...formData,
      [name]: value
    });
    
    const error = validateLocation(value, name === 'origin' ? 'Origin' : 'Destination');
    setFormErrors({...formErrors, [name]: error});
    return;
  }
  
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
    
    // Origin validation
    const originError = validateLocation(formData.origin, 'Origin');
    if (originError) {
      errors.origin = originError;
    }
    
    // Destination validation
    const destinationError = validateLocation(formData.destination, 'Destination');
    if (destinationError) {
      errors.destination = destinationError;
    }
    
    // Driver name validation
    const driverError = validateDriverName(formData.driver);
    if (driverError) {
      errors.driver = driverError;
    }
    
    // Required fields validation
    const requiredFields = ['orderId', 'vehicle', 'contactNumber'];
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
  
  // Update the handleStatusUpdate function to properly handle status changes
  const handleStatusUpdate = async (id, newStatus, newProgress) => {
    try {
      setLoading(true);
      
      // Store a reference to the shipment before any updates
      const shipment = activeShipments.find(s => s._id === id);
      if (!shipment) {
        toast.error("Shipment not found");
        return;
      }
      
      // Include completedAt timestamp when marking as delivered or failed
      const updateData = {
        status: newStatus,
        progress: newProgress
      };
      
      // Add completedAt field for local state tracking
      const now = new Date().toISOString();
      if (newStatus === 'Delivered' || newStatus === 'Failed' || newStatus === 'Returned') {
        updateData.completedAt = now;
      }
      
      // Update on the server first
      const response = await axios.put(`http://localhost:5000/api/shipping/${id}/status`, updateData);
      const updatedShipment = response.data;
      
      // Then update order status if applicable
      if (shipment.orderId) {
        try {
          await safeUpdateOrderStatus(shipment.orderId, newStatus);
        } catch (orderError) {
          console.error('Failed to update order status:', orderError);
          toast.warning(`Shipment updated, but couldn't update order status`);
        }
      }
      
      toast.success(`Shipment marked as ${newStatus}`);
      
      // Remove from active shipments if terminal status
      if (newStatus === 'Delivered' || newStatus === 'Failed' || newStatus === 'Returned') {
        setActiveShipments(prev => prev.filter(s => s._id !== id));
        
        // Add to appropriate list based on status
        if (newStatus === 'Delivered') {
          setCompletedShipments(prev => [
            {
              ...updatedShipment,
              completedAt: updateData.completedAt,
              // In case actualDeliveryDate isn't set in the response
              actualDeliveryDate: updatedShipment.actualDeliveryDate || now
            },
            ...prev
          ]);
        } else {
          setReturnedShipments(prev => [
            {
              ...updatedShipment,
              completedAt: updateData.completedAt
            },
            ...prev
          ]);
        }
      } else {
        // Just update in the active shipments list
        setActiveShipments(prev => 
          prev.map(s => s._id === id ? {
            ...s,
            status: newStatus,
            progress: newProgress,
            updatedAt: new Date().toISOString()
          } : s)
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
      // Refresh to ensure UI is in sync with server state
      fetchActiveShipments();
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
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Processing</span>;
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

  // Filter shipments based on search term and status filter
  const filterShipmentsBySearch = (shipments) => {
    if (!shipments) return [];
    
    // First filter by status if needed
    let filtered = shipments;
    if (statusFilter !== 'all') {
      filtered = shipments.filter(shipment => shipment.status === statusFilter);
    }
    
    // Then filter by search term if provided
    if (!searchTerm) return filtered;
    
    return filtered.filter(shipment => 
      (shipment.orderId && shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.destination && shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.driver && shipment.driver.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.vehicle && shipment.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.status && shipment.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Header Section - Updated with download option */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Shipment Dashboard
            </h2>
            <p className="text-blue-100 mt-1">
              Track, process and arrange deliveries for customer orders
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipments..."
                className="py-2 pl-10 pr-4 bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={fetchActiveShipments} 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
            <button 
              onClick={() => {
                // Download shipments data as CSV
                const headers = ["Order ID", "Origin", "Destination", "Driver", "Vehicle", "Status", "Progress", "ETA", "Updated"];
                const data = activeShipments.map(s => [
                  s.orderId, s.origin, s.destination, s.driver, s.vehicle, s.status, 
                  s.progress + '%', s.eta, new Date(s.updatedAt || s.createdAt).toLocaleString()
                ]);
                
                // Create CSV content
                const csvContent = [
                  headers.join(','),
                  ...data.map(row => row.join(','))
                ].join('\n');
                
                // Create download link
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `shipments_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Download data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white shadow-sm rounded-lg p-6 overflow-hidden">
        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg p-1 flex mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
              viewMode === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleViewModeChange('active')}
          >
            <Activity size={16} className="mr-1.5" />
            Active Shipments
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
              viewMode === 'completed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleViewModeChange('completed')}
          >
            <CheckCircle size={16} className="mr-1.5" />
            Completed
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
              viewMode === 'returned'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleViewModeChange('returned')}
          >
            <AlertCircle size={16} className="mr-1.5" />
            Failed & Returned
          </button>
        </div>
        
        {/* Remove existing button div and replace with combined filter and button row */}
        <div className="flex justify-end items-center mb-4 space-x-3">
          {viewMode === 'active' && (
            <div className="w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Loading">Processing</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
              </select>
            </div>
          )}
          <button
            onClick={() => {
              resetForm();
              setSelectedOrderForShipment(null);
              setShowShipmentForm(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus size={18} className="mr-1" /> New Shipment
          </button>
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
        
        {loading && !showShipmentForm && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Active Shipments View - More compact cards with last update time */}
        {viewMode === 'active' && !loading && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                {statusFilter === 'all' 
                  ? 'Active Shipments' 
                  : `${statusFilter === 'Loading' ? 'Processing' : statusFilter} Shipments`}
              </h3>
            </div>
            
            {filterShipmentsBySearch(activeShipments).length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {statusFilter !== 'all' 
                    ? `No ${statusFilter === 'Loading' ? 'Processing' : statusFilter} shipments found` 
                    : "No active shipments"
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {statusFilter !== 'all' 
                    ? `There are no shipments with status "${statusFilter === 'Loading' ? 'Processing' : statusFilter}".` 
                    : "There are no active shipments at the moment."
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
                <button
                  onClick={() => {
                    resetForm();
                    setSelectedOrderForShipment(null);
                    setShowShipmentForm(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus size={16} className="mr-1" /> Create New Shipment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filterShipmentsBySearch(activeShipments).map((shipment) => {
                  // Dynamic styles based on status
                  const styles = {
                    inTransit: shipment.status === 'In Transit',
                    loading: shipment.status === 'Loading',
                    pending: shipment.status === 'Pending',
                    outForDelivery: shipment.status === 'Out for Delivery'
                  };
                  
                  return (
                    <div 
                      key={shipment._id} 
                      className={`bg-gradient-to-r rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group relative
                        ${styles.inTransit ? 'from-blue-100 to-white border border-blue-200' : ''}
                        ${styles.loading ? 'from-amber-100 to-white border border-amber-200' : ''}
                        ${styles.pending ? 'from-gray-100 to-white border border-gray-200' : ''}
                        ${styles.outForDelivery ? 'from-purple-100 to-white border border-purple-200' : ''}
                      `}
                      style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)",
                        transform: "translateZ(0)"
                      }}
                    >
                      {/* Status indicator line at top */}
                      <div 
                        className={`h-2 w-full absolute top-0 left-0 right-0 shadow-sm
                          ${styles.inTransit ? 'bg-blue-500' : ''}
                          ${styles.loading ? 'bg-amber-500' : ''}
                          ${styles.pending ? 'bg-gray-500' : ''}
                          ${styles.outForDelivery ? 'bg-purple-500' : ''}
                        `}
                      ></div>
                      
                      <div className="p-3">
                      {/* Header with order ID and status badge */}
                        <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ORDER ID</span>
                            <h4 className="text-base font-semibold text-gray-700 mt-0.5">#{shipment.orderId}</h4>
                        </div>
                          <div 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center
                              ${styles.inTransit ? 'bg-blue-200 text-blue-800' : ''}
                              ${styles.loading ? 'bg-amber-200 text-amber-800' : ''}
                              ${styles.pending ? 'bg-gray-200 text-gray-800' : ''}
                              ${styles.outForDelivery ? 'bg-purple-200 text-purple-800' : ''}
                            `}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full mr-1.5
                              ${styles.inTransit ? 'bg-blue-600' : ''}
                              ${styles.loading ? 'bg-amber-600' : ''}
                              ${styles.pending ? 'bg-gray-600' : ''}
                              ${styles.outForDelivery ? 'bg-purple-600' : ''}
                            `}></span>
                            {shipment.status === 'Loading' ? 'Processing' : shipment.status}
                          </div>
                      </div>
                      
                        {/* Origin and destination - with improved icons */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="flex items-start">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0
                              ${styles.inTransit ? 'bg-blue-100' : ''}
                              ${styles.loading ? 'bg-amber-100' : ''}
                              ${styles.pending ? 'bg-gray-100' : ''}
                              ${styles.outForDelivery ? 'bg-purple-100' : ''}
                            `}>
                              <MapPin className={`h-3 w-3
                                ${styles.inTransit ? 'text-blue-500' : ''}
                                ${styles.loading ? 'text-amber-500' : ''}
                                ${styles.pending ? 'text-gray-500' : ''}
                                ${styles.outForDelivery ? 'text-purple-500' : ''}
                              `} />
                            </div>
                          <div className="overflow-hidden">
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">FROM</p>
                              <p className="text-sm font-medium text-gray-700 truncate">{shipment.origin}</p>
                          </div>
                        </div>
                        
                          <div className="flex items-start">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0
                              ${styles.inTransit ? 'bg-blue-100' : ''}
                              ${styles.loading ? 'bg-amber-100' : ''}
                              ${styles.pending ? 'bg-gray-100' : ''}
                              ${styles.outForDelivery ? 'bg-purple-100' : ''}
                            `}>
                              <MapPin className={`h-3 w-3
                                ${styles.inTransit ? 'text-blue-600' : ''}
                                ${styles.loading ? 'text-amber-600' : ''}
                                ${styles.pending ? 'text-gray-600' : ''}
                                ${styles.outForDelivery ? 'text-purple-600' : ''}
                              `} />
                            </div>
                          <div className="overflow-hidden">
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">TO</p>
                              <p className="text-sm font-medium text-gray-700 truncate">{shipment.destination}</p>
                          </div>
                        </div>
                      </div>
                      
                        {/* Driver, vehicle and ETA - with improved styling */}
                        <div className="grid grid-cols-3 gap-2 mb-2 bg-gray-50 p-2 rounded-lg">
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">DRIVER</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{shipment.driver}</p>
                        </div>
                        
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">VEHICLE</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{shipment.vehicle}</p>
                        </div>
                        
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">ETA</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{shipment.eta || "Unknown"}</p>
                        </div>
                      </div>
                      
                        {/* Progress bar with enhanced styling */}
                        <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-1.5
                                ${styles.inTransit ? 'bg-blue-500' : ''}
                                ${styles.loading ? 'bg-amber-500' : ''}
                                ${styles.pending ? 'bg-gray-500' : ''}
                                ${styles.outForDelivery ? 'bg-purple-500' : ''}
                              `}></span>
                              <span className="text-xs font-medium text-gray-500">PROGRESS</span>
                        </div>
                            <span className={`text-xs font-semibold
                              ${styles.inTransit ? 'text-blue-600' : ''}
                              ${styles.loading ? 'text-amber-600' : ''}
                              ${styles.pending ? 'text-gray-600' : ''}
                              ${styles.outForDelivery ? 'text-purple-600' : ''}
                            `}>{shipment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                              className={`h-1.5 rounded-full bg-gradient-to-r 
                                ${styles.inTransit ? 'from-blue-400 to-blue-500' : ''}
                                ${styles.loading ? 'from-amber-400 to-amber-500' : ''}
                                ${styles.pending ? 'from-gray-400 to-gray-500' : ''}
                                ${styles.outForDelivery ? 'from-purple-400 to-purple-500' : ''}
                              `}
                              style={{ width: `${shipment.progress}%`, transition: "width 1s ease-in-out" }}
                          ></div>
                        </div>
                      </div>
                      
                        {/* Delivery date and last updated - with enhanced styling */}
                        <div className="flex justify-between items-center text-xs mb-2">
                          <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          <span>Delivery: {shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString() : "Not set"}</span>
                        </div>
                          <div className="text-gray-400 italic text-[10px]">
                          Updated: {shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleTimeString() : new Date(shipment.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      
                        {/* Status update dropdown with enhanced styling */}
                      <div>
                        <select
                            className={`w-full text-xs py-1 px-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:border-transparent bg-white hover:bg-gray-50 transition-colors
                              ${styles.inTransit ? 'border-blue-200 focus:ring-blue-500' : ''}
                              ${styles.loading ? 'border-amber-200 focus:ring-amber-500' : ''}
                              ${styles.pending ? 'border-gray-200 focus:ring-gray-500' : ''}
                              ${styles.outForDelivery ? 'border-purple-200 focus:ring-purple-500' : ''}
                            `}
                          value="" // Always reset to placeholder after selection
                          onChange={(e) => {
                            if (e.target.value) {
                              const statusProgress = {
                                'Pending': 10,
                                'Loading': 25,
                                'In Transit': 50,
                                'Out for Delivery': 75,
                                'Delivered': 100,
                                'Failed': 0
                              };
                              const newStatus = e.target.value;
                              const newProgress = statusProgress[newStatus] ?? shipment.progress;
                              
                              handleStatusUpdate(shipment._id, newStatus, newProgress);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="" disabled>Update status...</option>
                          {shipment.status !== 'Pending' && shipment.status !== 'Loading' && <option value="Loading">Mark as Processing</option>}
                          {shipment.status !== 'In Transit' && <option value="In Transit">Mark as In Transit</option>}
                          {shipment.status !== 'Out for Delivery' && shipment.status !== 'Pending' && <option value="Out for Delivery">Mark as Out for Delivery</option>}
                          {shipment.status !== 'Delivered' && shipment.status !== 'Pending' && <option value="Delivered">Mark as Delivered</option>}
                          {/* Only show Failed option for shipments already in transit */}
                          {(shipment.status === 'In Transit' || shipment.status === 'Out for Delivery') && 
                            <option value="Failed">Mark as Failed</option>}
                        </select>
                      </div>
                    </div>
                    
                      <div className={`px-3 py-2 flex justify-end space-x-2 border-t bg-gradient-to-r 
                        ${styles.inTransit ? 'border-blue-200 from-blue-50 to-blue-100' : ''}
                        ${styles.loading ? 'border-amber-200 from-amber-50 to-amber-100' : ''}
                        ${styles.pending ? 'border-gray-200 from-gray-50 to-gray-100' : ''}
                        ${styles.outForDelivery ? 'border-purple-200 from-purple-50 to-purple-100' : ''}
                      `}>
                      <button
                        onClick={() => handleEdit(shipment)}
                          className={`inline-flex items-center py-1 px-2 border rounded-md bg-white text-xs font-medium text-gray-700 transition-colors
                            ${styles.inTransit ? 'border-blue-200 hover:bg-blue-50' : ''}
                            ${styles.loading ? 'border-amber-200 hover:bg-amber-50' : ''}
                            ${styles.pending ? 'border-gray-200 hover:bg-gray-50' : ''}
                            ${styles.outForDelivery ? 'border-purple-200 hover:bg-purple-50' : ''}
                          `}
                      >
                          <Edit size={11} className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shipment._id)}
                          className="inline-flex items-center py-1 px-2 border border-gray-200 rounded-md bg-white text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                          <Trash size={11} className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Completed Shipments View */}
        {viewMode === 'completed' && !loading && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Completed Shipments</h3>
            </div>
            
            {completedShipments.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No completed shipments</h3>
                <p className="text-gray-500">There are no completed shipments at the moment.</p>
              </div>
            ) : (
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destination
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filterShipmentsBySearch(completedShipments).map((shipment) => (
                        <React.Fragment key={shipment._id}>
                          <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedShipmentId(expandedShipmentId === shipment._id ? null : shipment._id)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <button className="mr-2 focus:outline-none">
                                  {expandedShipmentId === shipment._id ? 
                                    <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  }
                                </button>
                                #{shipment.orderId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {shipment.destination}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {shipment.driver}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(shipment.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {shipment.actualDeliveryDate || shipment.completedAt ? 
                                new Date(shipment.actualDeliveryDate || shipment.completedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) 
                                : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(shipment);
                                }}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(shipment._id);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash size={16} />
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded details row */}
                          {expandedShipmentId === shipment._id && (
                            <tr>
                              <td colSpan="6" className="bg-gray-50 px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Shipment Details</h4>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500">FROM</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.origin}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">TO</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.destination}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500">VEHICLE</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.vehicle}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">CONTACT</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.contactNumber}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Timeline</h4>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-200 flex items-center justify-center">
                                          <Calendar size={10} className="text-blue-600" />
                                        </div>
                                        <div className="ml-2">
                                          <p className="text-xs text-gray-500">CREATED</p>
                                          <p className="text-sm font-medium text-gray-700">
                                            {new Date(shipment.createdAt).toLocaleString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {(shipment.actualDeliveryDate || shipment.completedAt) && (
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-200 flex items-center justify-center">
                                            <CheckCircle size={10} className="text-green-600" />
                                          </div>
                                          <div className="ml-2">
                                            <p className="text-xs text-gray-500">COMPLETED</p>
                                            <p className="text-sm font-medium text-gray-700">
                                              {new Date(shipment.actualDeliveryDate || shipment.completedAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {shipment.notes && (
                                      <div className="mt-3">
                                        <p className="text-xs text-gray-500">NOTES</p>
                                        <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-100 rounded border border-gray-200">
                                          {shipment.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Returned Shipments View */}
        {viewMode === 'returned' && !loading && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Failed & Returned Deliveries</h3>
            </div>
            
            {returnedShipments.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No failed shipments</h3>
                <p className="text-gray-500">There are no failed or returned shipments at the moment.</p>
              </div>
            ) : (
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destination
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failure Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filterShipmentsBySearch(returnedShipments).map((shipment) => (
                        <React.Fragment key={shipment._id}>
                          <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedShipmentId(expandedShipmentId === shipment._id ? null : shipment._id)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <button className="mr-2 focus:outline-none">
                                  {expandedShipmentId === shipment._id ? 
                                    <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  }
                                </button>
                                #{shipment.orderId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {shipment.destination}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {shipment.driver}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(shipment.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {shipment.completedAt ? 
                                new Date(shipment.completedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                new Date(shipment.updatedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRearrangeShipment(shipment);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 mr-1"
                                  title="Rearrange for delivery"
                                >
                                  <RefreshCw size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(shipment);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 mr-1"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(shipment._id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded details row */}
                          {expandedShipmentId === shipment._id && (
                            <tr>
                              <td colSpan="6" className="bg-gray-50 px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Shipment Details</h4>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500">FROM</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.origin}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">TO</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.destination}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500">VEHICLE</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.vehicle}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">CONTACT</p>
                                        <p className="text-sm font-medium text-gray-800">{shipment.contactNumber}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Issue Information</h4>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-200 flex items-center justify-center">
                                          <Calendar size={10} className="text-blue-600" />
                                        </div>
                                        <div className="ml-2">
                                          <p className="text-xs text-gray-500">CREATED</p>
                                          <p className="text-sm font-medium text-gray-700">
                                            {new Date(shipment.createdAt).toLocaleString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {shipment.completedAt && (
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-red-200 flex items-center justify-center">
                                            <AlertCircle size={10} className="text-red-600" />
                                          </div>
                                          <div className="ml-2">
                                            <p className="text-xs text-gray-500">
                                              {shipment.status === 'Failed' ? 'FAILED ON' : 'RETURNED ON'}
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                              {new Date(shipment.completedAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {shipment.notes && (
                                      <div className="mt-3">
                                        <p className="text-xs text-gray-500">NOTES</p>
                                        <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-100 rounded border border-gray-200">
                                          {shipment.notes}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Add retry button for failed shipments */}
                                    {shipment.status === 'Failed' && (
                                      <div className="mt-4">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Move back to active shipments with Pending status
                                            handleEdit({
                                              ...shipment,
                                              status: 'Pending',
                                              progress: 0
                                            });
                                            setShowShipmentForm(true);
                                          }}
                                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                          <RefreshCw size={14} className="mr-1.5" /> Prepare for Redelivery
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Shipment Form - Updated with backdrop blur and enhanced UI */}
      {showShipmentForm && (
        <div className="fixed inset-0 backdrop-blur-lg bg-gray-800/30 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-3xl w-full mx-4 my-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedShipment ? 'Edit Shipment' : 'Create New Shipment'}
                </h3>
                <button
                  onClick={() => {
                    setShowShipmentForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <p className="mt-1 text-sm text-gray-500">
                {selectedShipment 
                  ? "Update shipment information in the system." 
                  : "Create a new shipment for delivery tracking."}
              </p>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                    Shipment Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="orderId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Order ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="orderId"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.orderId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        placeholder="Enter order ID"
                        required
                        readOnly={!!selectedOrderForShipment}
                      />
                      {formErrors.orderId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.orderId}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Loading">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Failed">Failed</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="origin"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Origin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="origin"
                        name="origin"
                        value={formData.origin}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.origin ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        placeholder="Shipment origin location"
                        required
                      />
                      {formErrors.origin && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.origin}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Destination <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.destination ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        placeholder="Delivery destination"
                        required
                      />
                      {formErrors.destination && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.destination}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                    Transport Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="driver"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Driver Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="driver"
                        name="driver"
                        value={formData.driver}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.driver ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        placeholder="Driver's full name"
                        required
                      />
                      {formErrors.driver && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.driver}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vehicle"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vehicle Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="vehicle"
                        name="vehicle"
                        value={formData.vehicle}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.vehicle ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        placeholder="e.g., ABC-1234 or WP-ABC-1234"
                        required
                      />
                      {formErrors.vehicle && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.vehicle}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contactNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter
                          if ([8, 46, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                              (e.keyCode >= 65 && e.keyCode <= 90 && e.ctrlKey === true) ||
                              // Allow: home, end, left, right
                              (e.keyCode >= 35 && e.keyCode <= 39)) {
                            return;
                          }
                          
                          // Allow + only at the beginning of empty input
                          if (e.key === '+' && e.target.value === '') {
                            return;
                          }
                          
                          // Prevent input if not a number
                          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                              (e.keyCode < 96 || e.keyCode > 105)) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.contactNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        placeholder="+94XXXXXXXXX or 07XXXXXXXX"
                        required
                      />
                      {formErrors.contactNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.contactNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="estimatedDeliveryDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Estimated Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="estimatedDeliveryDate"
                        name="estimatedDeliveryDate"
                        value={formData.estimatedDeliveryDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.estimatedDeliveryDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                        required
                      />
                      {formErrors.estimatedDeliveryDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.estimatedDeliveryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="eta"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        ETA
                      </label>
                      <input
                        type="text"
                        id="eta"
                        name="eta"
                        value={formData.eta}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white`}
                        placeholder="e.g., 2 hours, 30 minutes"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="Additional notes or instructions about this shipment..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-red-500 mr-1">*</span> Required fields
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShipmentForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-4 py-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center">
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {selectedShipment ? 'Update Shipment' : 'Create Shipment'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManager;