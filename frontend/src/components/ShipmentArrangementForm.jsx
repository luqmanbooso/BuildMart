import React, { useState, useEffect } from "react";
import { FaTruck, FaCalendarAlt, FaRoute, FaIdCard, FaUserAlt, FaExclamationTriangle } from "react-icons/fa";
import { MdLocalShipping, MdDirectionsCar } from "react-icons/md";

// Update the component to accept the selectedOrder prop
const ShipmentArrangementForm = ({ orders, onArrangeShipment, selectedOrder: preSelectedOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Add a useEffect to handle the pre-selected order
  useEffect(() => {
    if (preSelectedOrder && preSelectedOrder.id) {
      setSelectedOrder(preSelectedOrder.id);
      
      // Optionally pre-fill other fields if you have the data
      if (preSelectedOrder.driver) {
        setDriverName(preSelectedOrder.driver);
      }
      
      if (preSelectedOrder.vehicle) {
        setVehicleNumber(preSelectedOrder.vehicle);
      }
    }
  }, [preSelectedOrder]);

  // Update selected order details when order selection changes
  useEffect(() => {
    if (selectedOrder) {
      const orderDetails = orders.find(order => 
        order.id === selectedOrder || 
        order._id === selectedOrder ||
        (order.rawOrder && order.rawOrder._id === selectedOrder)
      );
      
      if (orderDetails) {
        setSelectedOrderDetails(orderDetails);
      } else {
        console.error(`Order with ID ${selectedOrder} not found in orders array:`, orders);
        setSelectedOrderDetails(null);
      }
    } else {
      setSelectedOrderDetails(null);
    }
  }, [selectedOrder, orders]);

  const validate = () => {
    const newErrors = {};
    
    // Order validation
    if (!selectedOrder) {
      newErrors.selectedOrder = "Please select an order";
    }
    
    // Driver name validation
    if (!driverName) {
      newErrors.driverName = "Driver name is required";
    } else if (driverName.length < 3) {
      newErrors.driverName = "Driver name should be at least 3 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(driverName)) {
      newErrors.driverName = "Driver name should only contain letters";
    }
    
    // Vehicle number validation
    if (!vehicleNumber) {
      newErrors.vehicleNumber = "Vehicle number is required";
    } else if (!/^[A-Z]{1,2}-\d{4}$/.test(vehicleNumber)) {
      newErrors.vehicleNumber = "Format should be XX-1234";
    }
    
    // Estimated delivery validation
    if (!estimatedDelivery) {
      newErrors.estimatedDelivery = "Estimated delivery is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSubmitted(true);
    
    // Validate form
    const formErrors = validate();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Find the full order object based on selected ID
      const orderObj = orders.find(order => order.id === selectedOrder);
      
      if (!orderObj) {
        setErrors({ selectedOrder: "Selected order not found" });
        setIsSubmitting(false);
        return;
      }

      // Pass the full order object to the parent handler
      await onArrangeShipment({
        order: orderObj,
        driver: driverName,
        vehicle: vehicleNumber,
        eta: estimatedDelivery,
      });
      
      // Success animation or message could be added here
      setTimeout(() => {
        // Clear form
        setSelectedOrder("");
        setDriverName("");
        setVehicleNumber("");
        setEstimatedDelivery("");
        setFormSubmitted(false);
        setErrors({});
      }, 500);
    } catch (error) {
      setErrors({ form: `Error creating shipment: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Vehicle number auto-formatting
  const handleVehicleNumberChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Auto-insert the hyphen after 2 letters
    if (/^[A-Z]{2}$/.test(value) && !value.includes('-')) {
      value = `${value}-`;
    }
    
    // Limit to proper format XX-1234
    if (!/^[A-Z]{0,2}(-\d{0,4})?$/.test(value)) {
      return;
    }
    
    setVehicleNumber(value);
  };

  return (
    // You may want to highlight the form when a pre-selected order is provided
    <div className="max-w-4xl mx-auto">
      <div className={`bg-white p-6 rounded-xl shadow-lg border ${preSelectedOrder ? 'border-blue-400' : 'border-gray-200'}`}>
        {/* If there's a pre-selected order, you can add an indicator */}
        {preSelectedOrder && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
            <p className="font-medium">Order {preSelectedOrder.id} selected for shipment</p>
            <p className="text-sm">Complete the form below to arrange delivery</p>
          </div>
        )}

        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
            <FaExclamationTriangle className="mr-3 mt-1 flex-shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Selection */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Select Order
            </label>
            <div className={`relative ${errors.selectedOrder ? 'mb-1' : ''}`}>
              <select
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.selectedOrder 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 bg-white appearance-none pl-10 pr-12`}
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
              >
                <option value="" disabled>
                  -- Select an order to ship --
                </option>
                {orders
                  .filter(order => order.status === "Pending")
                  .map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} - {order.customer} ({formatCurrency(order.value)})
                    </option>
                  ))}
              </select>
              <FaTruck className="absolute left-3 top-3.5 text-gray-400" />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.selectedOrder && (
              <p className="text-red-600 text-sm mt-1">{errors.selectedOrder}</p>
            )}

            {selectedOrderDetails && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-800 mb-1">Order Details:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span> {selectedOrderDetails.customer}
                  </div>
                  <div>
                    <span className="text-gray-600">Value:</span> {formatCurrency(selectedOrderDetails.value)}
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span> {selectedOrderDetails.items}
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span> {selectedOrderDetails.date}
                  </div>
                </div>
                <p className="text-sm mt-2">
                  <span className="text-gray-600">Delivery Address:</span>{" "}
                  {selectedOrderDetails.shippingAddress?.address}, {selectedOrderDetails.shippingAddress?.city}
                </p>
              </div>
            )}
          </div>

          {/* Driver Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Driver Name
              </label>
              <div className={`relative ${errors.driverName ? 'mb-1' : ''}`}>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.driverName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 pl-10`}
                  placeholder="Enter driver name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
                <FaUserAlt className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              {errors.driverName && (
                <p className="text-red-600 text-sm mt-1">{errors.driverName}</p>
              )}
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Vehicle Number
              </label>
              <div className={`relative ${errors.vehicleNumber ? 'mb-1' : ''}`}>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.vehicleNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 pl-10`}
                  placeholder="Format: XX-1234"
                  value={vehicleNumber}
                  onChange={handleVehicleNumberChange}
                  maxLength={7}
                />
                <MdDirectionsCar className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              {errors.vehicleNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.vehicleNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Example format: AB-1234</p>
            </div>
          </div>

          {/* Delivery Details */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Estimated Delivery Time
            </label>
            <div className={`relative ${errors.estimatedDelivery ? 'mb-1' : ''}`}>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.estimatedDelivery 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 pl-10`}
                placeholder="e.g., 24 hours / 3 days / March 25, 2025"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
              <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            {errors.estimatedDelivery && (
              <p className="text-red-600 text-sm mt-1">{errors.estimatedDelivery}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Shipment...
                </>
              ) : (
                <>
                  <FaRoute className="mr-2" />
                  Arrange Shipment
                </>
              )}
            </button>
          </div>
        </form>

        {orders.filter(order => order.status === "Pending").length === 0 && (
          <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 flex items-center">
            <FaExclamationTriangle className="mr-3 flex-shrink-0" />
            <p>There are no pending orders available for shipment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentArrangementForm;