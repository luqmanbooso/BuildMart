import React, { useState } from "react";
import { FaTruck, FaCheckCircle, FaCalendarAlt, FaExclamationTriangle, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const ShippingTracking = ({
  shipmentId,
  shipmentStatus,
  deliveryProgress,
  estimatedDelivery,
  handleStatusUpdate,
}) => {
  const [status, setStatus] = useState(shipmentStatus);
  
  // Define all available status options and their corresponding progress percentages
  const statusOptions = [
    { value: "Preparing", label: "Preparing", progress: 10 },
    { value: "Loading", label: "Loading", progress: 25 },
    { value: "In Transit", label: "In Transit", progress: 50 },
    { value: "Out for Delivery", label: "Out for Delivery", progress: 75 },
    { value: "Delivered", label: "Delivered", progress: 100 },
    { value: "Delayed", label: "Delayed", progress: 50 },
    { value: "Failed Delivery", label: "Failed Delivery", progress: 25 },
    { value: "Cancelled", label: "Cancelled", progress: 0 }
  ];
  
  const handleChange = (e) => {
    const newStatus = e.target.value;
    const statusObj = statusOptions.find(option => option.value === newStatus);
    
    if (statusObj) {
      setStatus(newStatus);
      handleStatusUpdate(newStatus, statusObj.progress);
      
      const statusMessage = {
        "Preparing": "Shipment is being prepared",
        "Loading": "Shipment is being loaded",
        "In Transit": "Shipment is now in transit",
        "Out for Delivery": "Shipment is out for delivery",
        "Delivered": "Shipment has been delivered successfully",
        "Delayed": "Shipment is delayed",
        "Failed Delivery": "Shipment delivery failed",
        "Cancelled": "Shipment has been cancelled"
      };
      
      toast.info(`Status updated: ${statusMessage[newStatus]}`);
    }
  };
  
  // Define colors for different statuses
  const getStatusColor = (currentStatus) => {
    switch(currentStatus) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "In Transit":
      case "Out for Delivery":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Preparing":
      case "Loading":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Delayed":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Failed Delivery":
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  // Define progress bar color based on status
  const getProgressBarColor = (currentStatus) => {
    switch(currentStatus) {
      case "Delivered":
        return "from-green-500 to-green-600";
      case "In Transit":
      case "Out for Delivery":  
        return "from-blue-500 to-blue-600";
      case "Delayed":
        return "from-orange-500 to-orange-600";
      case "Failed Delivery":
      case "Cancelled":
        return "from-red-500 to-red-600";
      default:
        return "from-blue-500 to-purple-600";
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <FaTruck className="mr-2 text-blue-600" /> 
            Shipment {shipmentId}
          </h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <FaCalendarAlt className="mr-1 text-gray-400" /> 
            ETA: {estimatedDelivery}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${getStatusColor(status)}`}>
            {status === "Delayed" && <FaExclamationTriangle className="mr-1" />}
            {status}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(status)}`} 
            style={{ width: `${deliveryProgress}%` }}
          ></div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Order Placed</span>
          <span>In Transit</span>
          <span>Delivered</span>
        </div>
      </div>
      
      {/* Status Update Controls */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Update shipment status:
        </div>
        <select
          value={status}
          onChange={handleChange}
          className="form-select px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ShippingTracking;