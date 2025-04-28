import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiImage,
  FiUpload,
  FiX,
  FiLogOut,
  FiArrowUp,
  FiArrowDown,
  FiPackage,
  FiDollarSign,
  FiDownload,
  FiPieChart,
  FiTrendingUp,
  FiFileText
} from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Updated category colors with more modern shades
const categoryColors = {
  "Safety Gear & Accessories": "bg-blue-100 text-blue-800 border border-blue-200",
  "Tools & Equipment": "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "Construction Materials": "bg-violet-100 text-violet-800 border border-violet-200",
  "Plumbing & Electrical Supplies": "bg-amber-100 text-amber-800 border border-amber-200",
};

// Predefined categories for construction materials
const predefinedCategories = [
  "Safety Gear & Accessories",
  "Tools & Equipment",
  "Construction Materials", 
  "Plumbing & Electrical Supplies",
];

// Initialize with empty array instead of undefined
const initialInventory = [];

// Helper to get correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000${imagePath}`;
};

const InventoryDash = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);  // Start with empty array
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stockUpdateItem, setStockUpdateItem] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [pendingOrderItems, setPendingOrderItems] = useState([]);
  const [orderRequestItem, setOrderRequestItem] = useState(null);
  const [orderRequestDetails, setOrderRequestDetails] = useState({
    quantity: 0,
    priority: "medium",
    notes: ""
  });
  const [showCharts, setShowCharts] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [reportCriteria, setReportCriteria] = useState({
    categories: [],
    stockLevel: 'all', // 'all', 'low', 'normal', 'out'
    dateRange: {
      start: '',
      end: ''
    },
    includeImages: false,
    includeDescription: true,
    includePrice: true,
    includeStock: true,
    includeThreshold: true,
    includeLastUpdated: true
  });
  
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

  // Add this to your existing useEffect that runs on component mount
  useEffect(() => {
    const fetchInventoryAndPendingOrders = async () => {
      try {
        // Fetch inventory data first
        const products = await fetchInventoryData();
        
        // Then fetch pending order product IDs
        const pendingResponse = await axios.get('http://localhost:5000/api/orders/pending-product-ids');
        if (pendingResponse.data.success) {
          setPendingOrderItems(pendingResponse.data.productIds);
        }
      } catch (error) {
        console.error('Error fetching pending order items:', error);
      }
    };
    
    fetchInventoryAndPendingOrders();
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
  const handleStockUpdate = async (type) => {
    if (!stockUpdateItem) return;
    
    const newStock = type === 'remove' 
      ? Math.max(0, stockUpdateItem.stock - updateQuantity)
      : stockUpdateItem.stock + updateQuantity;
    
    try {
      // Show loading toast
      const toastId = toast.loading("Updating stock...");
      
      // Make API request to update stock
      const response = await axios.put(
        `http://localhost:5000/product/products/${stockUpdateItem._id || stockUpdateItem.id}`,
        {
          name: stockUpdateItem.name,
          sku: stockUpdateItem.sku,
          category: stockUpdateItem.category,
          price: stockUpdateItem.price,
          stock: newStock,
          threshold: stockUpdateItem.threshold,
          description: stockUpdateItem.description || '',
          image: stockUpdateItem.image || ''
        }
      );
      
      if (response.data.success) {
        // Update local state
        const updatedInventory = inventory.map(item => {
          if ((item._id && item._id === stockUpdateItem._id) || 
              (item.id && item.id === stockUpdateItem.id)) {
            return {...item, stock: newStock};
          }
          return item;
        });
        
        setInventory(updatedInventory);
        
        // Update toast to success
        toast.update(toastId, {
          render: `Stock ${type === 'remove' ? 'decreased' : 'increased'} successfully`,
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else {
        toast.update(toastId, {
          render: "Failed to update stock",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(`Failed to update stock: ${error.response?.data?.message || error.message}`);
    }
    
    // Reset states
    setStockUpdateItem(null);
    setUpdateQuantity(0);
  };

  const updatedInventory = inventory.map(item => {
    return item; // This just returns the same item without changes
  });

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

  const handleAddProduct = async (formData) => {
    try {
      // Make API request
      const response = await axios.post('http://localhost:5000/product/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.product) {
        // Update state with the new product from the response
        setInventory([...inventory, response.data.product]);
        setFilteredInventory([...filteredInventory, response.data.product]);
        setIsFormOpen(false);
        setPreviewImage(null);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast.success('Product added successfully');
      } else {
        toast.error('Error adding product: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle edit product - update endpoint
  const handleEditProduct = async (editedProduct) => {
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add all product data to FormData
      formData.append('name', editedProduct.name);
      formData.append('sku', editedProduct.sku);
      formData.append('category', editedProduct.category);
      formData.append('price', parseFloat(editedProduct.price));
      formData.append('stock', parseInt(editedProduct.stock));
      formData.append('threshold', parseInt(editedProduct.threshold));
      formData.append('description', editedProduct.description || '');
      
      // Handle image - could be a file, data URL, or existing path
      if (editedProduct.image) {
        // If image is a string that starts with data:, it's a new image as data URL
        if (typeof editedProduct.image === 'string') {
          if (editedProduct.image.startsWith('data:')) {
            formData.append('image', editedProduct.image);
          } else {
            // It's an existing image path, do nothing special
            formData.append('image', editedProduct.image);
          }
        } else if (editedProduct.image instanceof File) {
          // If it's a File object, append as productImage
          formData.append('productImage', editedProduct.image);
        }
      }
      
      // Make API request
      const response = await axios.put(
        `http://localhost:5000/product/products/${editedProduct._id || editedProduct.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success && response.data.product) {
        // Update the inventory state with the updated product
        const updatedInventory = inventory.map(item =>
          (item._id && item._id === (editedProduct._id || editedProduct.id)) || 
          (item.id && item.id === (editedProduct._id || editedProduct.id)) 
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
      toast.error('Error updating product: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add this function to handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrderRequest = async () => {
    if (!orderRequestItem) return;
    
    try {
      // Show loading toast
      const toastId = toast.loading("Sending restock request...");
      
      // Use the correct endpoint from restockService
      await axios.post('http://localhost:5000/api/restock', {
        productId: orderRequestItem._id || orderRequestItem.id,
        productName: orderRequestItem.name,
        sku: orderRequestItem.sku,
        currentStock: orderRequestItem.stock,
        threshold: orderRequestItem.threshold,
        quantity: orderRequestDetails.quantity,
        priority: orderRequestDetails.priority,
        notes: orderRequestDetails.notes
      });
      
      // Add item ID to pendingOrderItems
      setPendingOrderItems([...pendingOrderItems, orderRequestItem._id || orderRequestItem.id]);
      
      // Update toast to success
      toast.update(toastId, {
        render: `Restock request for ${orderRequestItem.name} sent to Supplier Manager`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      
      // Reset states
      setOrderRequestItem(null);
      setOrderRequestDetails({
        quantity: 0,
        priority: "medium",
        notes: ""
      });
    } catch (error) {
      console.error('Error sending restock request:', error);
      
      // Add more specific error handling
      let errorMessage = "Failed to send restock request";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage += ": API endpoint not found";
        } else if (error.response.data && error.response.data.message) {
          errorMessage += `: ${error.response.data.message}`;
        }
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Add function to convert inventory data to CSV
  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    // Define CSV headers
    const headers = ['Product Name', 'SKU', 'Category', 'Price', 'Current Stock', 
                     'Stock Threshold', 'Description', 'Last Updated'];
    
    // Create CSV rows from data
    const rows = data.map(item => [
      item.name?.replace(/,/g, ';'),  // Replace commas with semicolons to avoid CSV format issues
      item.sku?.replace(/,/g, ';'),
      item.category?.replace(/,/g, ';'),
      item.price,
      item.stock,
      item.threshold,
      item.description?.replace(/,/g, ';').replace(/\n/g, ' '), // Replace newlines with spaces
      item.lastUpdated || new Date().toLocaleDateString()
    ]);
    
    // Combine headers and rows
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  // Add function to download CSV
  const downloadInventoryCSV = () => {
    try {
      // Convert inventory data to CSV
      const csvData = convertToCSV(inventory);
      
      // Create Blob and download link
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Setup download link properties
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory-export-${new Date().toISOString().slice(0,10)}.csv`);
      
      // Append, trigger download and remove link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Inventory data exported successfully");
    } catch (error) {
      console.error("Error exporting inventory data:", error);
      toast.error("Failed to export inventory data");
    }
  };

  // Function to prepare data for category distribution chart
  const prepareCategoryData = () => {
    const categoryMap = {};
    inventory.forEach(item => {
      if (categoryMap[item.category]) {
        categoryMap[item.category] += 1;
      } else {
        categoryMap[item.category] = 1;
      }
    });

    return Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category]
    }));
  };

  // Function to prepare data for stock levels chart
  const prepareStockData = () => {
    // Get top 10 items by stock quantity
    return [...inventory]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        stock: item.stock,
        threshold: item.threshold
      }));
  };

  // Function to prepare data for inventory value by category
  const prepareCategoryValueData = () => {
    const categoryValueMap = {};
    inventory.forEach(item => {
      const value = item.price * item.stock;
      if (categoryValueMap[item.category]) {
        categoryValueMap[item.category] += value;
      } else {
        categoryValueMap[item.category] = value;
      }
    });

    return Object.keys(categoryValueMap).map(category => ({
      name: category,
      value: Math.round(categoryValueMap[category])
    }));
  };

  // Custom colors for charts
  const CHART_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  // Animation variants for smoother interactions
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
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  // Add token validation effect
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Add logout handler function
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  // Function to generate report data based on criteria
  const generateReportData = () => {
    let reportData = [...inventory];

    // Filter by categories if selected
    if (reportCriteria.categories.length > 0) {
      reportData = reportData.filter(item => reportCriteria.categories.includes(item.category));
    }

    // Filter by stock level
    switch (reportCriteria.stockLevel) {
      case 'low':
        reportData = reportData.filter(item => item.stock < item.threshold);
        break;
      case 'normal':
        reportData = reportData.filter(item => item.stock >= item.threshold);
        break;
      case 'out':
        reportData = reportData.filter(item => item.stock === 0);
        break;
    }

    // Filter by date range if specified
    if (reportCriteria.dateRange.start && reportCriteria.dateRange.end) {
      const startDate = new Date(reportCriteria.dateRange.start);
      const endDate = new Date(reportCriteria.dateRange.end);
      reportData = reportData.filter(item => {
        const itemDate = new Date(item.lastUpdated);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Map to include only selected fields
    return reportData.map(item => {
      const reportItem = {
        name: item.name,
        sku: item.sku,
        category: item.category
      };

      if (reportCriteria.includeDescription) reportItem.description = item.description;
      if (reportCriteria.includePrice) reportItem.price = item.price;
      if (reportCriteria.includeStock) reportItem.stock = item.stock;
      if (reportCriteria.includeThreshold) reportItem.threshold = item.threshold;
      if (reportCriteria.includeLastUpdated) reportItem.lastUpdated = item.lastUpdated;
      if (reportCriteria.includeImages && item.image) reportItem.image = item.image;

      return reportItem;
    });
  };

  // Function to export report as CSV
  const exportReportAsCSV = () => {
    const reportData = generateReportData();
    if (reportData.length === 0) {
      toast.error('No data available for the selected criteria');
      return;
    }

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(item => 
        headers.map(header => {
          const value = item[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  // Add this section before the return statement
  const renderReportGenerator = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Generate Inventory Report</h3>
            <p className="text-gray-500 mt-1">Customize and export your inventory data</p>
          </div>
          <button
            onClick={() => setShowReportGenerator(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Categories Selection */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Categories</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedCategories.map(category => (
                <label key={category} className="relative flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportCriteria.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...reportCriteria.categories, category]
                        : reportCriteria.categories.filter(c => c !== category);
                      setReportCriteria({ ...reportCriteria, categories: newCategories });
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                    reportCriteria.categories.includes(category)
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300'
                  }`}>
                    {reportCriteria.categories.includes(category) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Level Filter */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock Level</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'all', label: 'All Stock', color: 'gray' },
                { value: 'low', label: 'Low Stock', color: 'amber' },
                { value: 'normal', label: 'Normal', color: 'emerald' },
                { value: 'out', label: 'Out of Stock', color: 'red' }
              ].map(option => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    value={option.value}
                    checked={reportCriteria.stockLevel === option.value}
                    onChange={(e) => setReportCriteria({ ...reportCriteria, stockLevel: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    reportCriteria.stockLevel === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-2 ${
                      reportCriteria.stockLevel === option.value
                        ? `border-${option.color}-500 bg-${option.color}-500`
                        : 'border-gray-300'
                    }`}>
                      {reportCriteria.stockLevel === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportCriteria.dateRange.start}
                  onChange={(e) => setReportCriteria({
                    ...reportCriteria,
                    dateRange: { ...reportCriteria.dateRange, start: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={reportCriteria.dateRange.end}
                  onChange={(e) => setReportCriteria({
                    ...reportCriteria,
                    dateRange: { ...reportCriteria.dateRange, end: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Report Fields Selection */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Report Fields</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'includeDescription', label: 'Description', icon: <FiFileText className="w-5 h-5" /> },
                { key: 'includePrice', label: 'Price', icon: <FiDollarSign className="w-5 h-5" /> },
                { key: 'includeStock', label: 'Stock', icon: <FiPackage className="w-5 h-5" /> },
                { key: 'includeThreshold', label: 'Threshold', icon: <FiAlertTriangle className="w-5 h-5" /> },
                { key: 'includeLastUpdated', label: 'Last Updated', icon: <FiRefreshCw className="w-5 h-5" /> },
                { key: 'includeImages', label: 'Images', icon: <FiImage className="w-5 h-5" /> }
              ].map(field => (
                <label key={field.key} className="relative flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportCriteria[field.key]}
                    onChange={(e) => setReportCriteria({
                      ...reportCriteria,
                      [field.key]: e.target.checked
                    })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                    reportCriteria[field.key]
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300'
                  }`}>
                    {reportCriteria[field.key] && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{field.icon}</span>
                    <span className="text-gray-700 font-medium">{field.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowReportGenerator(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={exportReportAsCSV}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors flex items-center space-x-2 font-medium"
            >
              <FiFileText className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Update the Generate Report button in the header
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Dashboard Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm relative border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-gray-500 mt-1">Manage your construction materials and equipment</p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReportGenerator(true)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all duration-200"
              >
                <FiFileText className="w-5 h-5" />
                <span>Generate Report</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all duration-200"
              >
                <FiPlusCircle className="w-5 h-5" />
                <span>Add Item</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Dashboard Stats - Modern cards with gradients */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div 
            variants={itemVariants} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 group-hover:from-indigo-200 group-hover:to-blue-200 transition-colors">
                <FiPackage size={24} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Total Inventory</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()} units</h3>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Inventory Value</p>
                <h3 className="text-2xl font-bold text-gray-900">LKR {totalValue.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                <FiAlertTriangle size={24} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-gray-900">{lowStockItems} products</h3>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Toggle Charts Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCharts(!showCharts)}
          className="mb-4 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200"
        >
          {showCharts ? <FiBarChart2 className="text-indigo-600" /> : <FiPieChart className="text-indigo-600" />}
          <span className="text-gray-700 font-medium">{showCharts ? "Hide Analytics Charts" : "Show Analytics Charts"}</span>
        </motion.button>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
                  <FiPieChart className="mr-2 text-indigo-500" /> 
                  Product Category Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Value by Category */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
                  <FiDollarSign className="mr-2 text-emerald-500" /> 
                  Inventory Value by Category (LKR)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareCategoryValueData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Value']} />
                      <Bar dataKey="value" fill="#10b981">
                        {prepareCategoryValueData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stock Levels Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
                <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 text-blue-500" /> 
                  Top 10 Products by Stock Level
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareStockData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar name="Current Stock" dataKey="stock" fill="#6366f1" />
                      <Bar name="Threshold" dataKey="threshold" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modern Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-96 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              />
            </div>
            <div className="flex space-x-4">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadInventoryCSV}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all duration-200"
              >
                <FiDownload className="w-5 h-5" />
                <span>Export CSV</span>
              </motion.button>
              <div className="relative">
              
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setSortConfig({ key: null, direction: null });
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
              >
                <FiRefreshCw size={16} />
                <span>Reset</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Inventory Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => requestSort('name')}
                    className="group px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Product Name</span>
                      {sortConfig.key === 'name' ? (
                        sortConfig.direction === 'ascending' ? <FiArrowUp className="text-indigo-500" /> : <FiArrowDown className="text-indigo-500" />
                      ) : (
                        <FiArrowUp className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th 
                    onClick={() => requestSort('price')}
                    className="group px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Price</span>
                      {sortConfig.key === 'price' ? (
                        sortConfig.direction === 'ascending' ? <FiArrowUp className="text-indigo-500" /> : <FiArrowDown className="text-indigo-500" />
                      ) : (
                        <FiArrowUp className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => requestSort('stock')}
                    className="group px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Stock</span>
                      {sortConfig.key === 'stock' ? (
                        sortConfig.direction === 'ascending' ? <FiArrowUp className="text-indigo-500" /> : <FiArrowDown className="text-indigo-500" />
                      ) : (
                        <FiArrowUp className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <motion.tr 
                      key={item._id || item.id}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category] || "bg-gray-100 text-gray-800 border border-gray-200"}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.stock < item.threshold ? "bg-red-500" : "bg-emerald-500"}`}></span>
                          <span className={`text-sm ${item.stock < item.threshold ? "text-red-600 font-medium" : "text-gray-900"}`}>
                            {item.stock}
                          </span>
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
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            title="Add Stock"
                          >
                            <FiPlusCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setStockUpdateItem({...item, type: 'remove'});
                              setUpdateQuantity(0);
                            }}
                            className="text-orange-600 hover:text-orange-900 p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                            title="Remove Stock"
                          >
                            <FiMinusCircle size={18} />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id || item.id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <FiTrash2 size={18} />
                          </button>
                          {item.stock < item.threshold && !pendingOrderItems.includes(item._id || item.id) && (
                            <button
                              onClick={() => {
                                setOrderRequestItem(item);
                                setOrderRequestDetails({
                                  ...orderRequestDetails,
                                  quantity: Math.max(item.threshold - item.stock, 10)
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Request Restock"
                            >
                              <FiRefreshCw size={18} />
                            </button>
                          )}
                          {item.stock < item.threshold && pendingOrderItems.includes(item._id || item.id) && (
                            <button
                              disabled
                              className="text-gray-400 p-1.5 rounded-lg"
                              title="Order Already Requested"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiPackage className="w-12 h-12 text-gray-300" />
                        <h3 className="mt-2 text-base font-medium text-gray-900">No items found</h3>
                        <p className="mt-1 text-sm text-gray-500">No inventory items match your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Stock Update Modal - Modernized */}
      {stockUpdateItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              {stockUpdateItem.type === 'remove' ? 'Remove from' : 'Add to'} Inventory
            </h3>
            <p className="mb-4 text-gray-500 text-sm">
              Update the stock quantity for this product
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="font-medium">{stockUpdateItem.name}</div>
              <div className="text-sm text-gray-500 mt-1">Current stock: {stockUpdateItem.stock}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStockUpdateItem(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockUpdate(stockUpdateItem.type === 'remove' ? 'remove' : 'add')}
                className={`px-4 py-2.5 text-white rounded-lg transition-colors ${
                  stockUpdateItem.type === 'remove' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {stockUpdateItem.type === 'remove' ? 'Remove Stock' : 'Add Stock'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Item Modal - Modernized */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Edit Product</h3>
            <p className="mb-4 text-gray-500 text-sm">Update the product details</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" }}
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="mt-1 flex items-center">
                  {editingItem.image ? (
                    <div className="relative">
                      <img 
                        src={
                          editingItem.image.startsWith('data:') 
                            ? editingItem.image 
                            : `http://localhost:5000${editingItem.image}`
                        } 
                        alt={editingItem.name}
                        className="h-28 w-auto object-contain rounded-lg border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={() => setEditingItem({...editingItem, image: ''})}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="text-red-600" size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('edit-product-image').click()}
                      className="flex justify-center items-center h-28 w-full border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors"
                    >
                      <div className="text-center">
                        <FiImage className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-1 text-sm text-gray-500">Upload image</span>
                      </div>
                    </button>
                  )}
                  <input
                    id="edit-product-image"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingItem({...editingItem, image: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditProduct(editingItem)}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add New Item Modal - Modernized */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Add New Product</h3>
            <p className="mb-4 text-gray-500 text-sm">Enter the details for the new product</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddProduct(formData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Enter product name"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select 
                    name="category"
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" }}
                  >
                    <option value="" disabled selected>Select a category</option>
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="0.00"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="0"
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
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="10"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Enter product description..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="mt-1">
                    <div 
                      className={`flex justify-center items-center w-full h-36 border-2 border-dashed rounded-lg ${
                        previewImage ? 'border-indigo-300' : 'border-gray-300'
                      } hover:border-indigo-400 cursor-pointer transition-colors`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="max-h-32 max-w-full object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                          >
                            <FiX className="text-red-600" size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <FiImage className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Click to upload product image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                      name="productImage"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Order Request Modal - Modernized */}
      {orderRequestItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Request Restock Order</h3>
            <p className="mb-4 text-gray-500 text-sm">Submit a request to restock this product</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-5">
              <div className="font-medium">{orderRequestItem.name}</div>
              <div className="flex justify-between mt-1">
                <div className="text-sm text-gray-500">Current Stock: {orderRequestItem.stock}</div>
                <div className="text-sm text-gray-500">Threshold: {orderRequestItem.threshold}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderRequestDetails.quantity}
                  onChange={(e) => setOrderRequestDetails({
                    ...orderRequestDetails,
                    quantity: Math.max(1, parseInt(e.target.value) || 0)
                  })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={orderRequestDetails.priority}
                  onChange={(e) => setOrderRequestDetails({
                    ...orderRequestDetails,
                    priority: e.target.value
                  })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={orderRequestDetails.notes}
                  onChange={(e) => setOrderRequestDetails({
                    ...orderRequestDetails,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Any specific requirements or details..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setOrderRequestItem(null);
                  setOrderRequestDetails({
                    quantity: 0,
                    priority: "medium",
                    notes: ""
                  });
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderRequest}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                Submit Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add the report generator modal */}
      {showReportGenerator && renderReportGenerator()}

      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default InventoryDash;