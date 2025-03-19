import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiPlusCircle, 
  FiMinusCircle, 
  FiEdit, 
  FiTrash2, 
  FiBarChart2, 
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiBell
} from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';



const categoryColors = {
  "Building Materials": "bg-blue-100 text-blue-800",
  "Hardware": "bg-green-100 text-green-800",
  "Tools": "bg-purple-100 text-purple-800",
  "Plumbing": "bg-orange-100 text-orange-800",
  "Electrical": "bg-yellow-100 text-yellow-800",
  "Paint & Supplies": "bg-pink-100 text-pink-800",
  "Flooring": "bg-indigo-100 text-indigo-800",
  "Doors & Windows": "bg-teal-100 text-teal-800",
  "Safety Equipment": "bg-red-100 text-red-800",
  "Landscaping": "bg-lime-100 text-lime-800",
  "Roofing": "bg-amber-100 text-amber-800",
  "HVAC": "bg-cyan-100 text-cyan-800",
  "Fasteners": "bg-slate-100 text-slate-800",
  "Adhesives & Sealants": "bg-violet-100 text-violet-800",
  "Cleaning Supplies": "bg-sky-100 text-sky-800",
  "Other": "bg-gray-100 text-gray-800"
};

// Predefined categories for construction materials
const predefinedCategories = [
  "Building Materials",
  "Hardware",
  "Tools", 
  "Plumbing",
  "Electrical",
  "Paint & Supplies",
  "Flooring",
  "Doors & Windows",
  "Safety Equipment",
  "Landscaping",
  "Roofing",
  "HVAC",
  "Fasteners",
  "Adhesives & Sealants",
  "Cleaning Supplies",
  "Other"
];

// Add initialInventory before the component declaration

// Initialize with empty array instead of undefined
const initialInventory = [];

const InventoryDash = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);  // Start with empty array
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stockUpdateItem, setStockUpdateItem] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState(0);
  
  // Extract unique categories for filter dropdown
  const categories = ["All", ...new Set(inventory.map(item => item.category))];
  
  // Summary statistics
  const totalItems = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockItems = inventory.filter(item => item.stock < item.threshold).length;

  // Sort items when config changes
  useEffect(() => {
    let sortedInventory = [...filteredInventory];
    if (sortConfig.key) {
      sortedInventory.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredInventory(sortedInventory);
  }, [sortConfig]);

  // Move API fetch to a separate function that can be called immediately
  const fetchInventoryData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/product/products');
      if (response.data.success && response.data.products) {
        const products = response.data.products;
        setInventory(products);
        setFilteredInventory(products); // Also update filtered inventory
        return products; // Return for any additional processing
      } else {
        // If response is successful but no products
        console.log('No products found in the response');
        return [];
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products. Please try again later.');
      return []; // Return empty array on error
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filter items when search term or category filter changes
  useEffect(() => {
    let results = inventory;
    
    if (searchTerm) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== "All") {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    setFilteredInventory(results);
  }, [searchTerm, categoryFilter, inventory]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle stock update
  const handleStockUpdate = (type) => {
    if (!stockUpdateItem) return;
    
    const updatedInventory = inventory.map(item => {
      if (item.id === stockUpdateItem.id) {
        const newStock = type === 'add' 
          ? item.stock + parseInt(updateQuantity) 
          : Math.max(0, item.stock - parseInt(updateQuantity));
        
        const updatedItem = {
          ...item,
          stock: newStock,
          lastUpdated: new Date().toISOString().split('T')[0]
        };

        // Check if stock is below threshold
        if (newStock < item.threshold) {
          checkLowStock(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInventory(updatedInventory);
    setStockUpdateItem(null);
    setUpdateQuantity(0);
  };

  // Replace the existing handleDeleteItem function with this improved version:

const handleDeleteItem = async (id) => {
  if (!id) {
    toast.error('Cannot delete: Item ID is missing');
    return;
  }
  
  if (window.confirm("Are you sure you want to delete this item?")) {
    try {
      console.log('Deleting item with ID:', id);
      
      // MongoDB items use _id, local items use id
      const itemId = typeof id === 'object' ? id._id : id;
      
      await axios.delete(`http://localhost:5000/product/products/${itemId}`);
      
      // Filter items with improved logic
      setInventory(inventory.filter(item => {
        // For items with _id property
        if (item._id) {
          return item._id !== itemId;
        }
        // For items with id property
        if (item.id) {
          return item.id !== id;
        }
        // Default case (shouldn't happen)
        return true;
      }));
      
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product: ' + (error.response?.data?.message || error.message));
    }
  }
};

  // Update supplier notification endpoint
  const notifySupplier = async (item) => {
    try {
      await axios.post('http://localhost:5000/api/email/supplier-notification', {
        productName: item.name,
        currentStock: item.stock,
        threshold: item.threshold,
        sku: item.sku
      });
      
      toast.success(`Supplier notified about low stock of ${item.name}`, {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error notifying supplier:', error);
      toast.error(`Failed to notify supplier about ${item.name}`, {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  // Add check for low stock items
  const checkLowStock = (item) => {
    if (item.stock < item.threshold) {
      notifySupplier(item);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Handle add product - update endpoint
  const handleAddProduct = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5000/product/products', {
        name: formData.get('name'),
        sku: formData.get('sku'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        threshold: parseInt(formData.get('threshold')),
        description: formData.get('description'),
        image: formData.get('image') || null // Remove cementImg reference as it's undefined
      });
      
      if (response.data.success && response.data.product) {
        setInventory([...inventory, response.data.product]);
        setIsFormOpen(false);
        toast.success('Product added successfully');
      } else {
        toast.error('Error adding product: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle edit product - update endpoint
  const handleEditProduct = async (editedProduct) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/product/products/${editedProduct._id || editedProduct.id}`,
        editedProduct
      );
      
      if (response.data.success && response.data.product) {
        const updatedInventory = inventory.map(item =>
          (item._id && item._id === editedProduct._id) || 
          (item.id && item.id === editedProduct.id) 
            ? response.data.product 
            : item
        );
        setInventory(updatedInventory);
        setEditingItem(null);
        toast.success('Product updated successfully');
      } else {
        toast.error('Error updating product: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FiPlusCircle />
              <span>Add Item</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <FiBarChart2 size={24} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Total Inventory</p>
                <h3 className="text-2xl font-semibold text-gray-900">{totalItems.toLocaleString()} units</h3>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiCheckCircle size={24} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Inventory Value</p>
                <h3 className="text-2xl font-semibold text-gray-900">LKR {totalValue.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiAlertTriangle size={24} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Low Stock Items</p>
                <h3 className="text-2xl font-semibold text-gray-900">{lowStockItems} products</h3>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-96 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setSortConfig({ key: null, direction: null });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
              >
                <FiRefreshCw size={16} />
                <span>Reset</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => requestSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Product Name
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th 
                    onClick={() => requestSort('price')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Price
                    {sortConfig.key === 'price' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    onClick={() => requestSort('stock')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Stock
                    {sortConfig.key === 'stock' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category] || "bg-gray-100 text-gray-800"}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.stock < item.threshold ? "bg-red-500" : "bg-green-500"}`}></span>
                          <span className="text-sm text-gray-900">{item.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setStockUpdateItem(item);
                              setUpdateQuantity(0);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          >
                            <FiPlusCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setStockUpdateItem({...item, type: 'remove'});
                              setUpdateQuantity(0);
                            }}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                          >
                            <FiMinusCircle size={18} />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id || item.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          >
                            <FiTrash2 size={18} />
                          </button>
                          {item.stock < item.threshold && (
                            <button
                              onClick={() => notifySupplier(item)}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                              title="Notify Supplier"
                            >
                              <FiBell size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No inventory items found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Update Modal */}
      {stockUpdateItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {stockUpdateItem.type === 'remove' ? 'Remove from' : 'Add to'} Inventory
            </h3>
            <p className="mb-4">
              {stockUpdateItem.name} (Current stock: {stockUpdateItem.stock})
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStockUpdateItem(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockUpdate(stockUpdateItem.type === 'remove' ? 'remove' : 'add')}
                className={`px-4 py-2 text-white rounded-md ${
                  stockUpdateItem.type === 'remove' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {stockUpdateItem.type === 'remove' ? 'Remove Stock' : 'Add Stock'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={editingItem.sku}
                  onChange={(e) => setEditingItem({...editingItem, sku: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {predefinedCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.stock}
                  onChange={(e) => setEditingItem({...editingItem, stock: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.threshold}
                  onChange={(e) => setEditingItem({...editingItem, threshold: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditProduct(editingItem)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddProduct(formData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select 
                    name="category"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {predefinedCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="threshold"
                    min="1"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default InventoryDash;