import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Box, Truck, RefreshCw, BarChart2, Check, Users, ShoppingCart, Plus, Filter, Download, MoreHorizontal, ChevronDown, Search, LogOut
} from 'lucide-react';

function SupplyLogisticsDashboard() {
  // State variables
  const [activePage, setActivePage] = useState('Dashboard');
  const [inventory, setInventory] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCarrier, setFilterCarrier] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Mock data for inventory, deliveries, and supplier orders
  const mockInventory = [
    { id: 1, name: 'Widget A', quantity: 100, location: 'Warehouse 1' },
    { id: 2, name: 'Widget B', quantity: 50, location: 'Warehouse 2' },
    { id: 3, name: 'Widget C', quantity: 200, location: 'Warehouse 1' },
  ];

  const mockDeliveries = [
    { id: 'DL12345', orderId: 'ORD67890', status: 'In Transit', deliveryDate: '2023-10-25', carrier: 'FedEx', trackingNumber: '1234567890' },
    { id: 'DL12346', orderId: 'ORD67891', status: 'Delivered', deliveryDate: '2023-10-20', carrier: 'UPS', trackingNumber: '0987654321' },
  ];

  const mockSupplierOrders = [
    { id: 'SO12345', supplier: 'Supplier A', items: ['Widget A', 'Widget B'], status: 'Pending', orderDate: '2023-10-15' },
    { id: 'SO12346', supplier: 'Supplier B', items: ['Widget C'], status: 'Completed', orderDate: '2023-10-10' },
  ];

  // Fetch data (mock implementation)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setInventory(mockInventory);
      setDeliveries(mockDeliveries);
      setSupplierOrders(mockSupplierOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', icon: <Box size={20} /> },
    { name: 'Deliveries', icon: <Truck size={20} /> },
    { name: 'Supplier Orders', icon: <ShoppingCart size={20} /> },
    { name: 'Logistics Performance', icon: <BarChart2 size={20} /> },
  ];

  // Stats cards
  const stats = [
    {
      title: "Total Inventory Items",
      value: inventory.length,
      change: "+5.6%",
      icon: <Box className="h-6 w-6 text-blue-600" />,
      trend: "up"
    },
    {
      title: "Pending Deliveries",
      value: deliveries.filter(d => d.status === 'In Transit').length,
      change: "-2.3%",
      icon: <Truck className="h-6 w-6 text-yellow-600" />,
      trend: "down"
    },
    {
      title: "Completed Orders",
      value: supplierOrders.filter(o => o.status === 'Completed').length,
      change: "+12.5%",
      icon: <Check className="h-6 w-6 text-green-600" />,
      trend: "up"
    },
    {
      title: "Active Suppliers",
      value: new Set(supplierOrders.map(o => o.supplier)).size,
      change: "+8.2%",
      icon: <Users className="h-6 w-6 text-purple-600" />,
      trend: "up"
    }
  ];

  // Render inventory table
  const renderInventoryTable = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {inventory.map((item) => (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Render deliveries table
  const renderDeliveriesTable = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Number</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {deliveries.map((delivery) => (
          <tr key={delivery.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.orderId}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                delivery.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {delivery.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.deliveryDate}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.carrier}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.trackingNumber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Render supplier orders table
  const renderSupplierOrdersTable = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {supplierOrders.map((order) => (
          <tr key={order.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.supplier}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.join(', ')}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Render page content
  const renderPageContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Inventory':
        return renderInventoryTable();
      case 'Deliveries':
        return renderDeliveriesTable();
      case 'Supplier Orders':
        return renderSupplierOrdersTable();
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              SupplyLogistics
            </h1>
          </div>
        </div>
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.name);
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.name === activePage
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex items-center justify-center mr-3 text-gray-500">
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="relative w-96">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory, deliveries, orders..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-6">
                <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Calendar size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Activity size={20} />
                </button>
                <div className="relative">
                  <button className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <img
                      className="h-10 w-10 rounded-lg object-cover ring-2 ring-gray-100"
                      src="https://via.placeholder.com/40"
                      alt="User"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-700">Admin</span>
                      <span className="text-xs text-gray-500">Supply Manager</span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                {activePage}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-2xl">
                Manage your {activePage.toLowerCase()} and related activities with our comprehensive dashboard tools and analytics.
              </p>
            </div>
            {renderPageContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SupplyLogisticsDashboard;