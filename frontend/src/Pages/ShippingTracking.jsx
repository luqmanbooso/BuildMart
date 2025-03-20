import React, { useState } from "react";
import { FaTruck, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";

const ShippingTracking = ({
  shipmentId,
  shipmentStatus,
  deliveryProgress,
  estimatedDelivery,
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState(shipmentStatus);

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    onUpdateStatus(newStatus);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl rounded-2xl border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Shipment Tracking
      </h2>
      <div className="space-y-6">
        {/* Shipment ID */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <span className="text-gray-600 flex items-center">
            <FaTruck className="mr-2 text-blue-500" /> Shipment ID:
          </span>
          <span className="font-semibold text-gray-800">{shipmentId}</span>
        </div>

        {/* Shipment Status */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <span className="text-gray-600 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" /> Status:
          </span>
          <select
            className="px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* Delivery Progress */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaTruck className="mr-2 text-purple-500" /> Delivery Progress
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              style={{ width: `${deliveryProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>Order Placed</span>
            <span>Out for Delivery</span>
            <span>Delivered</span>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-orange-500" /> Estimated Delivery
          </h3>
          <p className="text-gray-600 text-lg font-medium">{estimatedDelivery}</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingTracking;