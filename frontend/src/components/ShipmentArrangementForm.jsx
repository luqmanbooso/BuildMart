import React, { useState } from "react";
import { FaTruck, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";

const ShipmentArrangementForm = ({ orders, onArrangeShipment }) => {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("Pending");
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder || !driverName || !vehicleNumber || !estimatedDelivery) {
      alert("Please fill all fields.");
      return;
    }

    const shipmentData = {
      orderId: selectedOrder,
      status: shipmentStatus,
      driver: driverName,
      vehicle: vehicleNumber,
      eta: estimatedDelivery,
    };

    onArrangeShipment(shipmentData);
    alert("Shipment arranged successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl rounded-2xl border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Arrange Shipment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600 flex items-center">
            <FaTruck className="mr-2 text-blue-500" /> Select Order:
          </label>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            required
          >
            <option value="" disabled>
              Select an order
            </option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.id} - {order.customer} (Rs. {order.value.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Shipment Status */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" /> Shipment Status:
          </label>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={shipmentStatus}
            onChange={(e) => setShipmentStatus(e.target.value)}
            required
          >
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* Driver Name */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600 flex items-center">
            <FaTruck className="mr-2 text-purple-500" /> Driver Name:
          </label>
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter driver name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            required
          />
        </div>

        {/* Vehicle Number */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600 flex items-center">
            <FaTruck className="mr-2 text-purple-500" /> Vehicle Number:
          </label>
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter vehicle number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
          />
        </div>

        {/* Estimated Delivery */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600 flex items-center">
            <FaCalendarAlt className="mr-2 text-orange-500" /> Estimated Delivery:
          </label>
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter estimated delivery time"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Arrange Shipment
        </button>
      </form>
    </div>
  );
};

export default ShipmentArrangementForm;