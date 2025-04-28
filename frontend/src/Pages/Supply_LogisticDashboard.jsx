import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Box,
  ShoppingCart,
  Users,
  RefreshCw,
  Clock,
  Settings,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Calendar,
  Activity,
  Loader,
  AlertTriangle,
  Map,
  Navigation,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  X,
  DollarSign,
  ArrowRight,
  Package,
  MoreVertical,
  AlertCircle,
  Wrench,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Plus,
  RotateCw,
  Eye,
  BarChart,
  PieChart,
  LineChart,
  TrendingUp
} from "lucide-react";
import axios from "axios"; // Add axios import
import { toast, ToastContainer } from "react-toastify"; // Add toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { Link } from "react-router-dom";
import EnhancedPaymentGateway from "../components/Payment";
import { useSupplierPayments } from "../context/SupplierPaymentContext";
import ShipmentArrangementForm from "../components/ShipmentArrangementForm";
import ShippingTracking from "./ShippingTracking";
import { supplierService } from "../services/supplierService";
import { restockService } from "../services/restockService";
import RestockRequests from '../components/RestockRequests';
import ShippingManager from '../components/ShippingManager';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';


// Mock data for the dashboard
const inventoryData = [
  {
    name: "Cement",
    threshold: 200,
    status: "In Stock",
    supplier: "Lanka Cement Ltd",
    restockRequested: false,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    name: "Steel Bars",
    stock: 120,
    threshold: 100,
    status: "Low Stock",
    supplier: "Melwa Steel",
    restockRequested: true,
    paymentStatus: "Pending",
    deliveryStatus: "In Transit",
  },
  {
    name: "Bricks",
    stock: 8500,
    threshold: 5000,
    status: "In Stock",
    supplier: "Clay Masters",
    restockRequested: false,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    name: "Sand (cubic m)",
    stock: 75,
    threshold: 100,
    status: "Low Stock",
    supplier: "Ceylon Aggregates",
    restockRequested: true,
    paymentStatus: "Pending",
    deliveryStatus: "Pending",
  },
  {
    name: "Concrete Blocks",
    stock: 1240,
    threshold: 1000,
    status: "In Stock",
    supplier: "Block World",
    restockRequested: false,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    name: "Wood Panels",
    stock: 68,
    threshold: 80,
    status: "Critical",
    supplier: "Timber Lanka",
    restockRequested: true,
    paymentStatus: "Pending",
    deliveryStatus: "Pending",
  },
  {
    name: "PVC Pipes",
    stock: 320,
    threshold: 250,
    status: "In Stock",
    supplier: "PVC Solutions",
    restockRequested: false,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    name: "Roof Tiles",
    stock: 580,
    threshold: 500,
    status: "In Stock",
    supplier: "Roof Masters",
    restockRequested: false,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
];

const recentOrders = [
  {
    id: "ORD-7892",
    customer: "Colombo Builders",
    items: 8,
    value: 145000,
    status: "Delivered",
    paymentStatus: "Pending",
    date: "2025-03-15",
  },
  {
    id: "ORD-7891",
    customer: "Highland Construction",
    items: 12,
    value: 230000,
    status: "In Transit",
    paymentStatus: null,
    date: "2025-03-17",
  },
  {
    id: "ORD-7890",
    customer: "Kandy Developers",
    items: 5,
    value: 87000,
    status: "Processing",
    date: "2025-03-18",
  },
  {
    id: "ORD-7889",
    customer: "Galle Projects",
    items: 15,
    value: 315000,
    status: "Pending",
    date: "2025-03-18",
  },
  {
    id: "ORD-7888",
    customer: "Mountain Builders",
    items: 3,
    value: 45000,
    status: "Delivered",
    date: "2025-03-14",
  },
];

const deliveryPerformance = [
  { month: "Jan", onTime: 92, late: 8 },
  { month: "Feb", onTime: 88, late: 12 },
  { month: "Mar", onTime: 95, late: 5 },
  { month: "Apr", onTime: 90, late: 10 },
  { month: "May", onTime: 93, late: 7 },
  { month: "Jun", onTime: 97, late: 3 },
];

const topSuppliers = [
  { name: "Lanka Cement Ltd", value: 35 },
  { name: "Melwa Steel", value: 25 },
  { name: "Clay Masters", value: 15 },
  { name: "Ceylon Aggregates", value: 10 },
  { name: "Others", value: 15 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const activeShipments = [
  {
    id: "SHP-4231",
    origin: "Colombo Warehouse",
    destination: "Kandy Site",
    driver: "Kumara Perera",
    vehicle: "LP-5689",
    status: "In Transit",
    progress: 65,
    eta: "2 hours",
  },
  {
    id: "SHP-4230",
    origin: "Galle Port",
    destination: "Colombo Warehouse",
    driver: "Nishal Fernando",
    vehicle: "GH-7823",
    status: "Loading",
    progress: 25,
    eta: "5 hours",
  },
  {
    id: "SHP-4229",
    origin: "Colombo Warehouse",
    destination: "Negombo Site",
    driver: "Sunil Jayawardena",
    vehicle: "KL-9078",
    status: "In Transit",
    progress: 80,
    eta: "45 mins",
  },
];

const notifications = [
  {
    id: 1,
    message: "Low inventory alert: Wood Panels below threshold",
    type: "warning",
    time: "10 minutes ago",
  },
  {
    id: 2,
    message: "Order ORD-7891 has been shipped",
    type: "info",
    time: "1 hour ago",
  },
  {
    id: 3,
    message: "New supplier request from Eastern Cement",
    type: "info",
    time: "3 hours ago",
  },
  {
    id: 4,
    message: "Delivery SHP-4228 completed successfully",
    type: "success",
    time: "5 hours ago",
  },
  {
    id: 5,
    message: "System maintenance scheduled for tonight 11 PM",
    type: "warning",
    time: "8 hours ago",
  },
];

function Supply_LogisticDashboard() {

  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showShipmentDetails, setShowShipmentDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { addSupplierPayment } = useSupplierPayments();
  const [orders, setOrders] = useState(recentOrders);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierCategory, setSupplierCategory] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierCity, setSupplierCity] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("");
  const [supplierWebsite, setSupplierWebsite] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [supplierNotes, setSupplierNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realOrders, setRealOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [activeShipments, setActiveShipments] = useState([]);
  const [completedShipments, setCompletedShipments] = useState([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [shipmentsError, setShipmentsError] = useState(null);
  const [statusOptions, setStatusOptions] = useState({});
  const [statusTypesLoading, setStatusTypesLoading] = useState(true);
  const [restockRequests, setRestockRequests] = useState([]);
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [supplierPrice, setSupplierPrice] = useState("");
  const [supplierValue, setSupplierValue] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState("all");
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState("all");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [restockSearchTerm, setRestockSearchTerm] = useState("");

  // Add the mapOrderStatus function here
const mapOrderStatus = (status) => {
  // Normalize the status string
  const normalizedStatus = (status || '').toLowerCase();
  
  switch (normalizedStatus) {
    case 'placed':
      return 'Pending';
      
    case 'processing':
      return 'Processing';
      
    case 'shipped':
      return 'In Transit';
      
    case 'delivered':
      return 'Delivered';
      
    case 'cancelled':
      return 'Cancelled';
      
    default:
      return status || 'Pending'; // In case of unknown status, return original or default
  }
};

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

  // Fetch inventory data from the API
  useEffect(() => {
    const fetchInventory = async () => {
      setInventoryLoading(true);
      try {
        // Fetch restock requests first to check which items already have requests
        let existingRestockRequests = [];
        try {
          const restockResponse = await restockService.getAllRequests();
          existingRestockRequests = restockResponse;
          console.log("Fetched existing restock requests:", existingRestockRequests.length);
        } catch (error) {
          console.error("Error fetching restock requests:", error);
        }

        const response = await axios.get(
          "https://build-mart-backend.vercel.app/product/products"
        );
        if (response.data.success) {
          // First get suppliers if we don't have them yet
          let currentSuppliers = suppliers;
          if (currentSuppliers.length === 0) {
            try {
              const suppliersResponse = await supplierService.getAllSuppliers();
              currentSuppliers = suppliersResponse;
            } catch (error) {
              console.error("Error fetching suppliers during inventory load:", error);
            }
          }

          // Map the product data to match our frontend structure
          const mappedInventory = response.data.products.map((product) => {
            // Find if this product has an assigned supplier
            const assignedSupplier = currentSuppliers.find(s => s.productId === product._id);
            
            // Check if this product has a pending restock request
            const hasRestockRequest = existingRestockRequests.some(
              request => request.productId === product._id && 
              ['requested', 'approved', 'ordered'].includes(request.status?.toLowerCase())
            );
            
            return {
            name: product.name,
            stock: product.stock,
            threshold: product.threshold,
            status: getStockStatus(product.stock, product.threshold),
              supplier: assignedSupplier ? assignedSupplier.name : "No Supplier Assigned",
              supplierId: assignedSupplier ? assignedSupplier._id : null,
              restockRequested: hasRestockRequest, // Set based on existing restock requests
            paymentStatus: "Pending", // This would need to come from a payment API
            deliveryStatus: "Pending", // This would need to come from a delivery API
            _id: product._id, // Keep the MongoDB ID for reference
            sku: product.sku,
            category: product.category,
            price: product.price,
            image: product.image,
            };
          });

          setInventory(mappedInventory);
          setInventoryError(null);
        } else {
          console.error("Error from API:", response.data);
          setInventoryError("Failed to load inventory data from server");
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setInventoryError("Failed to connect to the inventory server");
      } finally {
        setInventoryLoading(false);
        setLoading(false);
      }
    };

    // Helper function to determine stock status based on stock level and threshold
    const getStockStatus = (stock, threshold) => {
      if (stock <= 0) return "Critical";
      if (stock < threshold) return "Low Stock";
      return "In Stock";
    };

    fetchInventory();
  }, [suppliers]); // Add suppliers as a dependency to refresh inventory when suppliers change

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        const data = await supplierService.getAllSuppliers();
        console.log("Fetched suppliers:", data);
        
        // Check the structure of the returned data
        if (Array.isArray(data)) {
          setSuppliers(data);
          // Log the first item to see its structure
          if (data.length > 0) {
            console.log("Sample supplier object:", data[0]);
            console.log("ID field used:", data[0]._id ? "_id" : (data[0].id ? "id" : "unknown"));
            
            // Normalize supplier data to ensure consistent ID field
            setSuppliers(data.map(supplier => ({
              ...supplier,
              // Ensure we have a consistent id field for operations
              id: supplier._id || supplier.id
            })));
          }
        } else {
          console.error("API didn't return an array:", data);
          setSuppliers([]);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setError("Failed to fetch suppliers. Using sample data instead.");
        // You might want to set some fallback supplier data here
        setSuppliers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch real orders from the backend API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        
        // Make API request to get ALL orders by using the all=true parameter
        const response = await axios.get('https://build-mart-backend.vercel.app/api/orders?all=true');
        
        if (response.data && response.data.success) {
          const apiOrders = response.data.orders;
          console.log('Successfully loaded orders from API:', apiOrders.length);
          console.log('Sample order data:', apiOrders.length > 0 ? apiOrders[0] : 'No orders available');
          
          // Map API orders to the format expected by the UI
          const formattedOrders = apiOrders.map(order => ({
            id: order._id,
            orderNumber: order._id.toString().substring(0, 6), // Generate a short ID if needed
            customer: order.customer?.name || 'Unknown Customer',
            items: Array.isArray(order.items) ? order.items.length : 0,
            value: order.totalAmount || 0,
            status: mapOrderStatus(order.orderStatus), // Use your existing mapping function
            // Store the raw date string from the database for accurate time calculations
            rawDate: order.orderDate || order.createdAt,
            // Also store as a formatted date string for display purposes
            date: new Date(order.orderDate || order.createdAt).toISOString(),
            shippingAddress: order.shippingAddress || null,
            paymentStatus: order.paymentDetails?.method ? 'Paid' : 'Pending'
          }));
          
          // IMPORTANT: This is what actually updates your UI
          setOrders(formattedOrders);
          
          // Also save the raw data if needed elsewhere
          setRealOrders(apiOrders);
        } else {
          console.warn('API returned no orders or unexpected format');
          // Only fallback to mock data if needed
          setOrders(recentOrders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError(`Failed to connect to the orders server: ${error.message}`);
        
        // Fallback to mock data
        setOrders(recentOrders);
        toast.error("Could not load orders. Using sample data instead.");
      } finally {
        setOrdersLoading(false);
      }
    };
  
    fetchOrders();
  }, []); // Empty dependency array to fetch only once on component mount

  // Fetch shipments from the backend (add this useEffect)
  useEffect(() => {
    const fetchShipments = async () => {
      setShipmentsLoading(true);
      try {
        // Try to fetch active shipments from real API first
        try {
          const response = await axios.get('https://build-mart-backend.vercel.app/api/shipping/active');
          if (response.data && Array.isArray(response.data)) {
            setActiveShipments(response.data);
            setShipmentsError(null);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (apiError) {
          console.log('API fetch failed, using order-based shipments:', apiError);
        // Fallback: extract shipment info from orders
        const shipmentData = orders
          .filter(
            (order) =>
              order.status === "In Transit" || order.status === "Processing"
          )
          .map((order) => ({
            id: `SHP-${order.id.substring(order.id.length - 5)}`,
            origin: "Colombo Warehouse",
            destination: `${order.shippingAddress?.city || "Customer"} Site`,
            driver: "Assigned Driver",
            vehicle: "Pending Assignment",
            status: order.status === "In Transit" ? "In Transit" : "Preparing",
            progress: order.status === "In Transit" ? 50 : 10,
            eta: "24 hours",
            orderId: order.id,
            createdAt: new Date().toISOString(),
          }));

        setActiveShipments(shipmentData);
        }
        
        // Try to fetch completed shipments
        try {
          const completedResponse = await axios.get('https://build-mart-backend.vercel.app/api/shipping/completed');
          if (completedResponse.data && Array.isArray(completedResponse.data)) {
            setCompletedShipments(completedResponse.data);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (completedError) {
          console.log('Completed shipments API fetch failed:', completedError);
          // Fallback: get from orders
          const completedShipmentData = orders
            .filter(order => order.status === "Delivered")
            .map((order) => ({
              id: `SHP-${order.id.substring(order.id.length - 5)}`,
              orderId: order.id,
              status: "Delivered",
              progress: 100,
              completedAt: order.date,
            }));
          setCompletedShipments(completedShipmentData);
        }
      } catch (error) {
        console.error("Error fetching shipments:", error);
        setShipmentsError("Failed to load shipment data");
      } finally {
        setShipmentsLoading(false);
      }
    };

    fetchShipments();
  }, [orders]); // Depend on orders so shipments update when orders change

  // Fetch status types when component mounts
  useEffect(() => {
    const fetchStatusTypes = async () => {
      try {
        setStatusTypesLoading(true);
        
        // Define default status options
        const defaultOptions = {
          'Pending': ["Processing", "Cancelled"],
          'Preparing': ["Loading", "In Transit", "Cancelled"],
          'Loading': ["In Transit", "Delayed", "Cancelled"],
          'In Transit': ["Out for Delivery", "Delayed", "Failed Delivery"],
          'Out for Delivery': ["Delivered", "Failed Delivery", "Delayed"],
          'Processing': ["Shipped", "Cancelled"],
          'Shipped': ["Delivered", "Delayed"],
          'Delayed': ["In Transit", "Out for Delivery", "Cancelled"],
          'Failed Delivery': ["Preparing", "In Transit", "Cancelled"],
          'Delivered': [], // No more transitions possible
          'Cancelled': ["Preparing"], // Can restart the process
        };
        
        try {
          // Try to fetch from API
          const response = await axios.get('https://build-mart-backend.vercel.app/api/restock/status-types');
          
          if (response.data && response.data.statusTypes) {
            const statusTypes = response.data.statusTypes;
            
            // Create normalized transitions with lowercase keys
            const dynamicStatusTransitions = {};
            
            // Process each status type and create transitions
            statusTypes.forEach((status, index) => {
              // Convert to lowercase for consistency
              const normalizedStatus = status.toLowerCase();
              
              if (normalizedStatus === 'delivered' || normalizedStatus === 'cancelled') {
                // Terminal statuses have no transitions
                dynamicStatusTransitions[normalizedStatus] = [];
              } else if (index < statusTypes.length - 1) {
                // Can move to next status or be cancelled
                dynamicStatusTransitions[normalizedStatus] = ['cancelled', statusTypes[index + 1].toLowerCase()];
              } else {
                // Last non-terminal status can only be cancelled
                dynamicStatusTransitions[normalizedStatus] = ['cancelled'];
              }
              
              // Also add with original capitalization
              dynamicStatusTransitions[status] = dynamicStatusTransitions[normalizedStatus];
            });
            
            // Merge with default options
            setStatusOptions({...defaultOptions, ...dynamicStatusTransitions});
          } else {
            setStatusOptions(defaultOptions);
          }
        } catch (error) {
          console.error("Error fetching status types:", error);
          setStatusOptions(defaultOptions);
        }
      } catch (error) {
        console.error("Error in status types setup:", error);
        
        // Fallback options
        setStatusOptions({
          'Pending': ["Processing", "Cancelled"],
          'Processing': ["Shipped", "Cancelled"],
          'Shipped': ["Delivered", "Delayed"],
          'Delivered': [],
          'Cancelled': [],
          'Delayed': ["Shipped", "Cancelled"],
        });
      } finally {
        setStatusTypesLoading(false);
      }
    };

    fetchStatusTypes();
  }, []);
  
  // Create shipment from order function
  const createShipmentFromOrder = (order) => {
    try {
      // Set the selected order for pre-populating the form
      setSelectedOrderForShipment(order);
      
      // Switch to the shipment tab
      setActiveTab("shipments");
      
      // Optional: Scroll to the shipping arrangement form
      setTimeout(() => {
        const formElement = document.getElementById("shipment-arrangement-form");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      
    } catch (error) {
      console.error("Error selecting order for shipment:", error);
      toast.error("Failed to navigate to shipment form");
    }
  };
  
  // Your existing handleArrangeShipment function that actually creates the shipment
  const handleArrangeShipment = async (shipmentData) => {
    try {
      // Create a new shipment object
      const newShipment = {
        id: `SHP-${shipmentData.order.id.substring(shipmentData.order.id.length - 5)}`,
        orderId: shipmentData.order.id,
        origin: "Colombo Warehouse",
        destination: `${shipmentData.order.shippingAddress?.city || "Customer"} Site`,
        driver: shipmentData.driver,
        vehicle: shipmentData.vehicle,
        status: "Preparing",
        progress: 10,
        eta: shipmentData.eta,
        createdAt: new Date().toISOString(),
      };
      
      // Add to active shipments
      setActiveShipments([...activeShipments, newShipment]);
      
      // Update order status to "processing"
      await updateOrderStatus(shipmentData.order.id, "processing");
      
      // Clear the selected order
      setSelectedOrderForShipment(null);
      
      toast.success(`Shipment ${newShipment.id} created for order ${shipmentData.order.id}`);
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Failed to create shipment");
    }
  };

  // Enhanced updateOrderStatus function with better debugging
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    console.log(`Attempting to update order ${orderId} to status '${newStatus}'`);
    
    // First, update the UI optimistically
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus } 
        : order
    );
    setOrders(updatedOrders);
    
    // Try to match to valid status values if necessary
    // This depends on what valid statuses your Order model accepts
    let statusToSend = newStatus.toLowerCase();
    
    // For debugging: log what we're actually sending
    console.log(`Sending status update: ${statusToSend}`);
    
    // Then, send the update to the server
    const response = await axios.patch(
      `https://build-mart-backend.vercel.app/api/orders/${orderId}/status`, 
      { status: statusToSend }
    );
    
    console.log('Order update response:', response.data);
    toast.success(`Order #${orderId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating order status:', error);

    
    // Show more detailed error info for debugging
    if (error.response) {
      console.log('Error response:', error.response.status, error.response.data);
      
      // If we get a 400 error with "Invalid order status", show what valid statuses might be
      if (error.response.status === 400 && 
          error.response.data?.message?.includes('Invalid order status')) {
        console.log('Hint: Check your Order.js model for valid status values!');
        console.log('Common status values are: pending, processing, shipped, delivered, cancelled');
      }
    }
  }
};

  // Add function to update shipment status with comprehensive options
  const updateShipmentStatus = async (shipmentId, newStatus, newProgress) => {
    try {
      // Update shipment locally
      const updatedShipments = activeShipments.map((shipment) => {
        if (shipment.id === shipmentId) {
          return {
            ...shipment,
            status: newStatus,
            progress: newProgress,
          };
        }
        return shipment;
      });
      setActiveShipments(updatedShipments);

      // Find the order associated with this shipment
      const shipment = activeShipments.find((s) => s.id === shipmentId);
      if (shipment) {
        // Map shipment status to order status
        let orderStatus;

        switch (newStatus) {
          case "Preparing":
            orderStatus = "processing";
            break;
          case "Loading":
            orderStatus = "processing";
            break;
          case "In Transit":
            orderStatus = "shipped";
            break;
          case "Out for Delivery":
            orderStatus = "shipped";
            break;
          case "Delivered":
            orderStatus = "delivered";
            break;
          case "Delayed":
            orderStatus = "shipped"; // Still in shipment process
            break;
          case "Failed Delivery":
            orderStatus = "processing"; // Need to attempt delivery again
            break;
          case "Cancelled":
            orderStatus = "cancelled";
            break;
          default:
            orderStatus = "processing";
        }

        // Update backend order status
        await updateOrderStatus(shipment.orderId, orderStatus);

        // Update order status in local state
        const updatedOrders = orders.map((order) => {
          if (order.id === shipment.orderId) {
            return { ...order, status: mapOrderStatus(orderStatus) };
          }
          return order;
        });
        setOrders(updatedOrders);

        toast.success(`Shipment ${shipmentId} updated to ${newStatus}`);
      }

      // In a real implementation, you'd update the backend
      // await axios.patch(`https://build-mart-backend.vercel.app/api/shipments/${shipmentId}`, {
      //   status: newStatus,
      //   progress: newProgress
      // });
    } catch (error) {
      console.error("Error updating shipment status:", error);
      toast.error("Failed to update shipment status");
    }
  };

  // Function to filter inventory data
  const getFilteredInventory = () => {
    if (!inventory) return [];
    
    return inventory.filter(item => {
      // Filter by search term
      const matchesSearch = searchTerm.trim() === "" || 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
        
      // Filter by status
      const matchesStatus = inventoryFilter === "all" || item.status === inventoryFilter;
      
      // Filter by category
      const matchesCategory = inventoryCategoryFilter === "all" || 
        (item.category && item.category === inventoryCategoryFilter);
        
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  // Update handleRestockRequest function to use supplier price
const handleRestockRequest = async (itemName) => {
  try {
    // Find the product in inventory
    const product = inventory.find(item => item.name === itemName);
    
    if (!product) {
      toast.error(`Product ${itemName} not found in inventory`);
      return;
    }

    // Check if there's already a restock request for this product
    if (product.restockRequested) {
      toast.info(`A restock request for ${itemName} already exists`);
      setActiveTab("restock"); // Take user to the restock page to see existing request
      return;
    }

    // Check if product has a supplier assigned
    if (product.supplier === "No Supplier Assigned") {
      setActiveTab("suppliers");
      toast.error(`${itemName} has no supplier assigned. Please add a supplier first before requesting restock.`);
      return;
    }

      // Find the specific supplier for this product based on productId
      const productSupplier = suppliers.find(sup => sup.productId === product._id);
      
      if (!productSupplier) {
      // Change behavior: Switch to suppliers tab and show notification
      setActiveTab("suppliers");
      toast.warning(`No supplier found for ${itemName}. Please add a supplier first by clicking "Add New Supplier" and selecting ${itemName} from the product dropdown.`);
        return;
      }

      // Calculate quantity needed based on threshold
      const quantityToOrder = product.threshold - product.stock + 10; // Order enough to be above threshold plus buffer
      
      // Always use the supplier's price for calculation
      if (!productSupplier.price || productSupplier.price <= 0) {
        toast.error(`Supplier for ${itemName} has no valid price set. Please update the supplier information.`);
        return;
      }
      
      // Calculate total amount to pay using supplier price
      const totalAmount = quantityToOrder * productSupplier.price;

    // Optimistically update UI
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.name === itemName ? { ...item, restockRequested: true } : item
      )
    );

    // Send request to backend
    const restockData = {
      productId: product._id,
      productName: product.name,
        quantity: quantityToOrder,
        unitPrice: productSupplier.price,
        totalAmount: totalAmount,
      priority:
        product.stock === 0
          ? "urgent"
          : product.stock < product.threshold / 2
          ? "high"
          : "medium",
        supplierId: productSupplier._id,
        supplierName: productSupplier.name,
        notes: `Automatic restock request for ${product.name}. Total amount: Rs. ${totalAmount.toLocaleString()}`,
    };

    // Create the restock request
    const newRequest = await restockService.createRequest(restockData);
    
      // Add to restock requests list
    setRestockRequests(prevRequests => {
      // First filter out any existing requests for this product to avoid duplicates
      const filteredRequests = prevRequests.filter(req => req.productId !== product._id);
      return [...filteredRequests, newRequest];
    });
      
    // Switch to the restock tab after creating the request
    setActiveTab("restock");
      toast.success(`Restock request created for ${product.name}. Amount: Rs. ${totalAmount.toLocaleString()}`);
  } catch (error) {
      console.error("Error creating restock request:", error);
      toast.error(`Failed to create restock request: ${error.message || 'Server error'}`);
  }
};

  // Handle payment status update
  const handlePaymentStatusUpdate = async (itemName, status) => {
    try {
      // Update UI optimistically
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.name === itemName ? { ...item, paymentStatus: status } : item
        )
      );

      // In a real app, you'd make an API call here to update payment status
      // await axios.put(`/api/inventory/${itemId}/payment`, { status });

      toast.success(`Payment status updated for ${itemName}`);
    } catch (error) {
      console.error("Error updating payment status:", error);

      // Revert optimistic update
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.name === itemName ? { ...item, paymentStatus: "Pending" } : item
        )
      );

      toast.error(`Failed to update payment status for ${itemName}`);
    }
  };

  // Handle delivery status update
  const handleDeliveryStatusUpdate = async (itemName, status) => {
    try {
      // Update UI optimistically
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.name === itemName ? { ...item, deliveryStatus: status } : item
        )
      );

      // In a real app, you'd make an API call here to update delivery status
      // await axios.put(`/api/inventory/${itemId}/delivery`, { status });

      toast.success(`Delivery status updated for ${itemName}`);
    } catch (error) {
      console.error("Error updating delivery status:", error);

      // Revert optimistic update
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.name === itemName ? { ...item, deliveryStatus: "Pending" } : item
        )
      );

      toast.error(`Failed to update delivery status for ${itemName}`);
    }
  };

  // Helper for SQL keyword check
  const hasSqlKeyword = (str) => {
    const sqlKeywords = ['select', 'insert', 'delete', 'update', 'drop', 'alter', 'create'];
    const lower = str.toLowerCase();
    return sqlKeywords.some(keyword => lower.includes(keyword));
  };

  // Helper: Disallow forbidden special characters in names
  const forbiddenNameChars = /[#$@%\^*!_~`\[\]{}:;"'<>?/\\|]/;

  // Helper: Check if string starts with special char, number or space
  const startsWithSpecialOrSpace = (str) => /^[^a-zA-Z]/.test(str);
  
  // Update this helper to check specifically for letters-only first character
  const startsWithSpecialNumberOrSpace = (str) => /^[^a-zA-Z]/.test(str);

  const validateSupplierForm = () => {
    const errors = {};
    // Supplier Name
    if (!supplierName.trim()) {
      errors.supplierName = "Supplier name is required";
    } else if (supplierName.trim().length < 2) {
      errors.supplierName = "Supplier name must be at least 2 characters";
    } else if (supplierName.trim().length > 100) {
      errors.supplierName = "Supplier name cannot exceed 100 characters";
    } else if (startsWithSpecialNumberOrSpace(supplierName.trim())) {
      errors.supplierName = "Supplier name cannot start with a special character, number, or space";
    } else if (forbiddenNameChars.test(supplierName)) {
      errors.supplierName = "Supplier name cannot contain special characters like #, $, @, %, etc.";
    } else if (hasSqlKeyword(supplierName)) {
      errors.supplierName = "Supplier name contains prohibited terms";
    }
    
    // Product
    if (!selectedProduct) {
      errors.selectedProduct = "Please select a product";
    }
    
    // Category - removed validation since category is read-only
    
    // Price
    if (!supplierPrice) {
      errors.supplierPrice = "Price is required";
    } else {
      const price = parseFloat(supplierPrice);
      if (isNaN(price) || price <= 0) {
        errors.supplierPrice = "Price must be a positive number";
      } else if (price > 1000000) {
        errors.supplierPrice = "Price cannot exceed 1,000,000 LKR";
      } else if (!/^\d+(\.\d{1,2})?$/.test(supplierPrice)) {
        errors.supplierPrice = "Price can have maximum two decimal places";
      }
    }
    // Website
    if (supplierWebsite && supplierWebsite.trim()) {
      if (supplierWebsite.length > 200) {
        errors.supplierWebsite = "Website URL cannot exceed 200 characters";
      } else if (!/^https?:\/\/[\w\-]+(\.[\w\-]+)+[\/#?]?.*$/.test(supplierWebsite)) {
        errors.supplierWebsite = "Please enter a valid website URL";
      }
    }
    // Contact Person
    if (!supplierContact.trim()) {
      errors.supplierContact = "Contact person is required";
    } else if (supplierContact.trim().length < 2) {
      errors.supplierContact = "Contact name must be at least 2 characters";
    } else if (supplierContact.trim().length > 100) {
      errors.supplierContact = "Contact name cannot exceed 100 characters";
    } else if (startsWithSpecialNumberOrSpace(supplierContact.trim())) {
      errors.supplierContact = "Contact name cannot start with a special character, number, or space";
    } else if (forbiddenNameChars.test(supplierContact)) {
      errors.supplierContact = "Contact name cannot contain special characters";
    } else if (!/^[a-zA-Z][a-zA-Z\s.-]*$/.test(supplierContact.trim())) {
      errors.supplierContact = "Contact name should contain only letters, spaces, dots, and hyphens";
    }
    // Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!supplierEmail.trim()) {
      errors.supplierEmail = "Email is required";
    } else if (!emailRegex.test(supplierEmail)) {
      errors.supplierEmail = "Please enter a valid email address";
    } else if (supplierEmail.length > 100) {
      errors.supplierEmail = "Email cannot exceed 100 characters";
    }
    // Phone
    if (!supplierPhone.trim()) {
      errors.supplierPhone = "Phone number is required";
    } else if (!/^(?:\+94|0)[0-9]{9,10}$/.test(supplierPhone.replace(/\s+/g, ''))) {
      errors.supplierPhone = "Please enter a valid Sri Lankan phone number";
    } else if (supplierPhone.replace(/\s+/g, '').length > 12) {
      errors.supplierPhone = "Phone number cannot exceed 12 digits";
    }
    // City
    if (supplierCity) {
      if (supplierCity.length > 50) {
        errors.supplierCity = "City name cannot exceed 50 characters";
      } else if (startsWithSpecialOrSpace(supplierCity.trim())) {
        errors.supplierCity = "City name cannot start with a special character or space";
      } else if (!/^[a-zA-Z\s]+$/.test(supplierCity)) {
        errors.supplierCity = "City name should contain only letters and spaces";
      }
    }
    // Address
    if (supplierAddress && supplierAddress.length > 250) {
      errors.supplierAddress = "Address cannot exceed 250 characters";
    } else if (supplierAddress && /^[\s~`!@#$%^&*()_\-+=\[\]{}|\\;:"'<>,.?/]/.test(supplierAddress.trim())) {
      errors.supplierAddress = "Address cannot start with a special character or space";
    }
    // Payment terms
    if (paymentTerms && paymentTerms.length > 100) {
      errors.paymentTerms = "Payment terms cannot exceed 100 characters";
    }
    // Lead time
    if (leadTime) {
      const leadTimeDays = parseInt(leadTime);
      if (isNaN(leadTimeDays) || leadTimeDays < 0) {
        errors.leadTime = "Lead time must be a positive number";
      } else if (leadTimeDays > 365) {
        errors.leadTime = "Lead time cannot exceed 365 days";
      }
    }
    // Notes
    if (supplierNotes && supplierNotes.length > 500) {
      errors.supplierNotes = "Notes cannot exceed 500 characters";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update handleAddSupplier function
const handleAddSupplier = async () => {
  // Validate form first
  if (!validateSupplierForm()) {
    toast.error("Please correct the errors in the form");
    return;
  }

    // Check if a product is selected
    if (!selectedProduct) {
      setValidationErrors({
        ...validationErrors,
        selectedProduct: "Please select a product"
      });
      toast.error("Please select a product");
      return;
    }

  try {
    setIsLoading(true);
    const newSupplier = {
        name: supplierName || "",
        value: supplierValue ? parseFloat(supplierValue) : 0,
        contact: supplierContact || "",
        email: supplierEmail || "",
        address: supplierAddress || "",
        category: supplierCategory || "",
        phone: supplierPhone || "",
        city: supplierCity || "",
        country: supplierCountry || "",
        website: supplierWebsite || "",
        paymentTerms: paymentTerms || "",
        leadTime: leadTime ? parseInt(leadTime) : 0,
        notes: supplierNotes || "",
        productId: selectedProduct._id,
        active: true,
        price: supplierPrice ? parseFloat(supplierPrice) : 0 // Add price field
      };

      console.log("Adding new supplier with data:", newSupplier);

    const createdSupplier = await supplierService.createSupplier(newSupplier);
      
      // Update local suppliers list
      setSuppliers(prevSuppliers => [...prevSuppliers, createdSupplier]);
      
      // Close the form
    resetForm();
      setShowSupplierForm(false);
      
    setError(null);
    toast.success("Supplier added successfully");
      
      // Refresh the suppliers list
      await fetchSuppliers();
  } catch (error) {
      console.error("Add supplier error:", error);
      setError(`Failed to add supplier: ${error.message || 'Server error'}`);
      toast.error(`Failed to add supplier: ${error.message || 'Server error'}`);
  } finally {
    setIsLoading(false);
  }
};

  // Update handleUpdateSupplier function
const handleUpdateSupplier = async () => {
  if (!currentSupplier || !currentSupplier.id) {
    setError("Cannot update: Missing supplier ID");
    return;
  }

  // Validate form first
  if (!validateSupplierForm()) {
    toast.error("Please correct the errors in the form");
    return;
  }

    // Check if a product is selected
    if (!selectedProduct) {
      setValidationErrors({
        ...validationErrors,
        selectedProduct: "Please select a product"
      });
      toast.error("Please select a product");
      return;
    }

  try {
    setIsLoading(true);
    const updatedSupplierData = {
        name: supplierName || "",
        value: supplierValue ? parseFloat(supplierValue) : 0,
        contact: supplierContact || "",
        email: supplierEmail || "",
        address: supplierAddress || "",
        category: supplierCategory || "",
        phone: supplierPhone || "",
        city: supplierCity || "",
        country: supplierCountry || "",
        website: supplierWebsite || "",
        paymentTerms: paymentTerms || "",
        leadTime: leadTime ? parseInt(leadTime) : 0,
        notes: supplierNotes || "",
        productId: selectedProduct._id,
        active: true,
        price: supplierPrice ? parseFloat(supplierPrice) : 0 // Add price field
      };

      console.log("Updating supplier with data:", updatedSupplierData);

    const updatedSupplier = await supplierService.updateSupplier(
      currentSupplier.id,
      updatedSupplierData
    );

      // Update local suppliers list
      setSuppliers(prevSuppliers =>
        prevSuppliers.map(supplier =>
          supplier.id === currentSupplier.id
          ? { ...supplier, ...updatedSupplierData }
          : supplier
      )
    );

      // Close the form
    resetForm();
      setShowSupplierForm(false);
      
    setError(null);
      toast.success("Supplier updated successfully");
      
      // Refresh the suppliers list
      await fetchSuppliers();
  } catch (error) {
      console.error("Update supplier error:", error);
    setError(`Failed to update supplier: ${error.message || 'Server error'}`);
    toast.error(`Failed to update supplier: ${error.message || 'Server error'}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteSupplier = async (supplierId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        
        // Check if we have a valid MongoDB ObjectId
        if (!supplierId || supplierId === 'undefined' || typeof supplierId !== 'string') {
          toast.error("Cannot delete: Invalid supplier ID");
          return;
        }
        
        await supplierService.deleteSupplier(supplierId);
        
        // Update local suppliers list
        setSuppliers(suppliers.filter((supplier) => supplier._id !== supplierId));
        setError(null);
        toast.success("Supplier deleted successfully");
        
        // Refresh the suppliers list after deletion
        try {
          const data = await supplierService.getAllSuppliers();
          if (Array.isArray(data)) {
            setSuppliers(data.map(supplier => ({
              ...supplier,
              id: supplier._id || supplier.id
            })));
          }
        } catch (refreshError) {
          console.error("Error refreshing suppliers:", refreshError);
        }
      } catch (error) {
        console.error("Delete supplier error:", error);
        setError(`Failed to delete supplier: ${error.message || 'Server error'}`);
        toast.error(`Failed to delete supplier: ${error.message || 'Server error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update editSupplier function
  const editSupplier = (supplier) => {
    setCurrentSupplier({
      id: supplier._id,
      ...supplier
    });
    setSupplierName(supplier.name || "");
    setSupplierContact(supplier.contact || "");
    setSupplierEmail(supplier.email || "");
    setSupplierAddress(supplier.address || "");
    setSupplierPhone(supplier.phone || "");
    setSupplierCity(supplier.city || "");
    setSupplierWebsite(supplier.website || "");
    setPaymentTerms(supplier.paymentTerms || "");
    setLeadTime(supplier.leadTime?.toString() || "");
    setSupplierNotes(supplier.notes || "");
    setSupplierPrice(supplier.price?.toString() || "");
    
    // Set the selected product
    const product = inventory.find(p => p._id === supplier.productId);
    setSelectedProduct(product);
    setSupplierCategory(product ? product.category : "");
    
    setShowSupplierForm(true);
  };

  // Update resetForm function
  const resetForm = () => {
    setCurrentSupplier(null);
    setSupplierName("");
    setSupplierContact("");
    setSupplierEmail("");
    setSupplierAddress("");
    setSupplierPhone("");
    setSupplierCity("");
    setSupplierCategory("");
    setSupplierWebsite("");
    setPaymentTerms("");
    setLeadTime("");
    setSupplierNotes("");
    setSupplierPrice("");
    setSelectedProduct(null);
    setValidationErrors({});
  };

  // Helper function to determine stock status
  const getStockStatus = (stock, threshold) => {
    if (stock <= 0) return "Critical";
    if (stock < threshold) return "Low Stock";
    return "In Stock";
  };

  // Add a new function to handle modal closing and refresh suppliers
  const handleCloseSupplierForm = () => {
    resetForm();
    setShowSupplierForm(false);
    // Refresh suppliers list when form is closed
    fetchSuppliers();
  };

  // Update the product selection change handler to check if product already has a supplier
  const handleProductChange = (e) => {
    const product = inventory.find(p => p._id === e.target.value);
    
    if (product) {
      // Check if this product already has a supplier
      const existingSupplier = suppliers.find(s => s.productId === product._id);
      
      if (existingSupplier && (!currentSupplier || currentSupplier.id !== existingSupplier._id)) {
        // If we're adding a new supplier or editing a different supplier
        setValidationErrors({
          ...validationErrors,
          selectedProduct: `This product already has a supplier: ${existingSupplier.name}`
        });
      } else {
        // Clear validation error if no conflict
        const newErrors = {...validationErrors};
        delete newErrors.selectedProduct;
        setValidationErrors(newErrors);
      }
      
      // Do NOT set default price from product - leave it blank
      // This allows user to enter their own price
      setSupplierPrice("");
    }
    
    setSelectedProduct(product);
    setSupplierCategory(product ? product.category : "");
  };

  // Function to format date properly for display and calculations
  const formatOrderDate = (dateString) => {
    // Handle missing date values
    if (!dateString) {
      console.warn("Missing date value");
      return new Date();
    }
    
    try {
      // If it's already a Date object
      if (dateString instanceof Date) return dateString;
      
      // If it's a string, parse it
      let date;
      
      // Check if the string might be in a format that needs special handling
      if (typeof dateString === 'string') {
        // For ISO format with timezone (likely from database)
        if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
          // Create date in browser's local timezone (which correctly interprets ISO dates)
          // Don't explicitly set timezone here - let the browser handle it
          date = new Date(dateString);
          
          // For debugging
          console.log('ISO Date Debug:');
          console.log('Original:', dateString);
          console.log('Parsed Date:', date);
          console.log('Local ISO:', date.toISOString());
          console.log('Timezone offset:', date.getTimezoneOffset());
        }
        // For YYYY-MM-DD format without time
        else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          // Use noon in Sri Lanka time to avoid timezone issues
          date = new Date(`${dateString}T12:00:00+05:30`);
        }
        // For any other format
        else {
          date = new Date(dateString);
        }
      } else {
        // For numeric timestamps
        date = new Date(dateString);
      }
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return new Date();
      }
      
      return date;
    } catch (error) {
      console.error("Error parsing date:", error, dateString);
      return new Date(); // Fallback to current date
    }
  };

  // Function to log the order and date debugging info
  const logOrderDateInfo = (order) => {
    if (process.env.NODE_ENV !== 'production') {
      console.group(`Order Date Debug: ${order.id}`);
      console.log("Original date string:", order.date);
      console.log("Parsed date:", formatOrderDate(order.date));
      console.log("Current date:", new Date());
      console.log("Difference in ms:", new Date().getTime() - formatOrderDate(order.date).getTime());
      console.groupEnd();
    }
    return null; // Return null so it doesn't affect the UI
  };
  
  // Function to get the current time in Sri Lanka (UTC+5:30)
  const getSriLankaTime = () => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const sriLankaTime = new Date(utcTime + (5.5 * 3600000)); // UTC+5:30
    return sriLankaTime;
  };

  // Function to parse database date to Sri Lanka time (UTC+5:30)
  const parseDatabaseDate = (dateString) => {
    try {
      if (!dateString) return null;
      
      // Create a date object from the string (this will be in UTC if the string has timezone info)
      const date = new Date(dateString);
      
      // Check if it's a valid date
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return null;
      }
      
      // If the date string is a raw ISO string from MongoDB (which is in UTC),
      // convert it to Sri Lanka time by adding the offset
      const utcTime = date.getTime();
      const sriLankaTime = new Date(utcTime + (5.5 * 3600000)); // UTC+5:30
      
      return sriLankaTime;
    } catch (error) {
      console.error("Error parsing date:", error, dateString);
      return null;
    }
  };
  
  // Completely rewritten time elapsed function
  const getTimeElapsed = (orderDate) => {
    try {
      // Use the raw date from the database if available
      const rawDate = typeof orderDate === 'object' && orderDate.rawDate 
        ? orderDate.rawDate 
        : orderDate;
      
      // Parse the order date to Sri Lanka time
      const orderDateTime = parseDatabaseDate(rawDate);
      
      // Debug
      console.log("Date calculation:", {
        original: rawDate,
        parsed: orderDateTime,
        now: getSriLankaTime(),
        diff_ms: getSriLankaTime() - orderDateTime
      });
      
      // If we couldn't parse the date or it's invalid
      if (!orderDateTime) {
        return 'New';
      }
      
      // Get current time in Sri Lanka
      const currentTime = getSriLankaTime();
      
      // Calculate difference in milliseconds
      const diffInMs = currentTime - orderDateTime;
      
      // Handle future dates (server/client time mismatch)
      if (diffInMs < 0) {
        return 'Just now';
      }
      
      // If it's less than a minute
      if (diffInMs < 60 * 1000) {
        return 'Just now';
      }
      
      // Calculate time units
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      // Format the output based on elapsed time
      if (diffInDays > 0) {
        const remainingHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${diffInDays}d ${remainingHours}h ago`;
      } else if (diffInHours > 0) {
        const remainingMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffInHours}h ${remainingMinutes}m ago`;
      } else {
        return `${diffInMinutes}m ago`;
      }
    } catch (error) {
      console.error("Error calculating time elapsed:", error);
      return 'New';
    }
  };
  
  // Updated priority class function to match the new date handling
  const getPriorityClass = (orderDate) => {
    try {
      // Use the raw date from the database if available
      const rawDate = typeof orderDate === 'object' && orderDate.rawDate 
        ? orderDate.rawDate 
        : orderDate;
      
      // Parse the order date to Sri Lanka time
      const orderDateTime = parseDatabaseDate(rawDate);
      
      // If we couldn't parse the date or it's invalid
      if (!orderDateTime) {
        return "bg-green-100 text-green-800 border-green-300";
      }
      
      // Get current time in Sri Lanka
      const currentTime = getSriLankaTime();
      
      // Calculate difference in milliseconds
      const diffInMs = currentTime - orderDateTime;
      
      // Handle future dates (server/client time mismatch)
      if (diffInMs < 0) {
        return "bg-green-100 text-green-800 border-green-300";
      }
      
      // Calculate hours
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      if (diffInHours >= 24) {
        return "bg-red-100 text-red-800 border-red-300"; // Critical priority
      } else if (diffInHours >= 12) {
        return "bg-orange-100 text-orange-800 border-orange-300"; // High priority
      } else if (diffInHours >= 6) {
        return "bg-amber-100 text-amber-800 border-amber-300"; // Medium priority
      } else {
        return "bg-green-100 text-green-800 border-green-300"; // Normal priority
      }
    } catch (error) {
      console.error("Error determining priority class:", error);
      return "bg-gray-100 text-gray-800 border-gray-300"; // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin mx-auto text-blue-600 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  // Completely rewrite the renderPendingOrdersTable function
  const renderPendingOrdersTable = () => {
    if (ordersLoading) {
    return (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-3" />
          <span className="text-lg text-gray-700 font-medium">Loading orders...</span>
        </div>
      );
    }

    if (ordersError) {
      return (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <div className="text-red-600 mb-2 text-xl">Error Loading Orders</div>
          <p className="text-gray-700">{ordersError}</p>
        </div>
      );
    }

    // Filter to only show pending orders
    const pendingOrders = orders.filter(order => order.status === 'Pending');
    
    // Filter orders based on search term only
    const filteredPendingOrders = pendingOrders.filter(order => {
      if (orderSearchTerm) {
        const matchesSearch = 
          (order.id && order.id.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
          (order.customer && order.customer.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
          (order.orderNumber && order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()));
        
        if (!matchesSearch) return false;
      }
      return true;
    });
    
    // Sort by date (oldest first) to emphasize first-come-first-serve
    const sortedPendingOrders = [...filteredPendingOrders].sort((a, b) => {
      const dateA = parseDatabaseDate(a.rawDate)?.getTime() || 0;
      const dateB = parseDatabaseDate(b.rawDate)?.getTime() || 0;
      return dateA - dateB;
    });
    
    if (sortedPendingOrders.length === 0) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No New Orders</h3>
          <p className="text-gray-500 mb-4">
            {orderSearchTerm ? "No orders match your search criteria." : "All orders have been processed or are in transit."}
          </p>
          <button 
            onClick={() => setActiveTab("inventory")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Inventory
          </button>
        </div>
      );
    }
    
    // Handle row click to toggle expanded state
    const handleRowClick = (orderId) => {
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null); // Collapse
      } else {
        setExpandedOrderId(orderId); // Expand
      }
    };
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
              <h2 className="text-2xl font-bold text-gray-800">New Orders</h2>
              <p className="text-gray-500 mt-1">First come, first serve processing queue</p>
              </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden border border-gray-300 bg-white">
                <button
                  onClick={() => setWaitTimeFilter('all')}
                  className="px-3 py-2 text-sm font-medium bg-blue-600 text-white"
                >
                  All Orders
                </button>
              </div>
            </div>
          </div>
        </div>
                    
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPendingOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  {/* Main Order Row */}
                  <tr 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      index === 0 ? 'bg-amber-50' : ''
                    } ${
                      expandedOrderId === order.id ? 'border-b-0 bg-blue-50' : ''
                    }`}
                    onClick={() => handleRowClick(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`px-3 py-1 rounded-md border ${getPriorityClass(order)} text-xs font-medium flex items-center`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {index === 0 ? 'NEXT' : `#${index + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md text-sm font-medium">
                          #{order.orderNumber || order.id.substring(0, 6)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress ? `${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || order.shippingAddress.zip || ''}` : 'No address'}
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{order.items}</div>
                      <div className="text-xs text-gray-500">items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">Rs. {order.value ? order.value.toLocaleString() : '0'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600">
                          {order.rawDate ? getLocalTimeFromDatabase(order.rawDate) : 'No date'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center">
                    <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row toggle
                        setSelectedOrderForShipment(order);
                        setActiveTab("shipments");
                      }}
                          className="flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                          <Truck className="mr-1.5 h-4 w-4" /> 
                          Ship
                    </button>
                        
                        <ChevronDown 
                          className={`ml-3 h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                            expandedOrderId === order.id ? 'rotate-180' : ''
                          }`}
                        />
              </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row - Only render when expanded */}
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan="7" className="px-4 py-4 border-t-0 bg-blue-50">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Order Info */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                  <ShoppingCart className="h-4 w-4 mr-2 text-blue-600" />
                                  Order Information
                                </h4>
                                <div className="space-y-2">
                                  <p className="flex justify-between">
                                    <span className="text-sm text-gray-500">Order ID:</span>
                                    <span className="text-sm font-medium text-gray-900">{order.id}</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-sm text-gray-500">Order Date:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {order.rawDate ? getLocalTimeFromDatabase(order.rawDate) + ' (Local)' : 'Not available'}
                    </span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                      {order.status === 'Pending' ? 'Awaiting Shipment' : order.status}
                                    </span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-sm text-gray-500">Total Amount:</span>
                                    <span className="text-sm font-medium text-gray-900">Rs. {order.value ? order.value.toLocaleString() : '0'}</span>
                                  </p>
                    </div>
                  </div>
                  
                              {/* Customer Info */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                  <User className="h-4 w-4 mr-2 text-blue-600" />
                                  Customer Information
                                </h4>
                                <div className="space-y-2">
                                  <p className="flex justify-between">
                                    <span className="text-sm text-gray-500">Name:</span>
                                    <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                                  </p>
                                  {order.shippingAddress && (
                                    <>
                                      <p className="flex justify-between">
                                        <span className="text-sm text-gray-500">Address:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {order.shippingAddress.street || order.shippingAddress.address || 'Address not provided'}
                                        </span>
                                      </p>
                                      <p className="flex justify-between">
                                        <span className="text-sm text-gray-500">City:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {order.shippingAddress.city || 'City not provided'}
                                        </span>
                                      </p>
                                      <p className="flex justify-between">
                                        <span className="text-sm text-gray-500">Postal Code:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {order.shippingAddress.postalCode || order.shippingAddress.zip || 'Not provided'}
                                        </span>
                                      </p>
                                    </>
                                  )}
                      </div>
                      </div>
                    </div>
                    
                            {/* Order Items - Only show if we have detailed item info */}
                            {Array.isArray(order.items) && order.items.length > 0 && typeof order.items[0] === 'object' ? (
                              <div className="mt-4">
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                  <Box className="h-4 w-4 mr-2 text-blue-600" />
                                  Order Items
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Product
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Quantity
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Price
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {item.product?.name || item.name || 'Unknown Product'}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {item.quantity || 1}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                            Rs. {(item.price || 0).toLocaleString()}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                            Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                      </div>
                          </div>
                        ) : (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Box className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          </div>
            </div>
          )}
        
                            {/* Actions */}
                            <div className="mt-4 flex justify-end">
                    <button
                                onClick={(e) => {
                                  e.stopPropagation();
                        setSelectedOrderForShipment(order);
                        setActiveTab("shipments");
                      }}
                                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Arrange Shipment
                    </button>
                </div>
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
            
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{sortedPendingOrders.length}</span> new orders in queue
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Also fix the handlePaymentSuccess function by moving it inside the component
  const handlePaymentSuccess = (paymentDetails) => {
    if (!selectedOrder) {
      toast.error("No order selected for payment");
      return;
    }

    // Update order payment status in UI
    const updatedOrders = orders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, paymentStatus: "Completed" } 
        : order
    );
    
    setOrders(updatedOrders);
    
    // Record the payment in the supplier payment system
    addSupplierPayment({
      supplierId: selectedOrder.supplierId || "general",
      supplierName: selectedOrder.supplier || selectedOrder.customer,
      amount: selectedOrder.value,
      date: new Date().toISOString(),
      orderId: selectedOrder.id,
      paymentDetails
    });
    
    toast.success("Payment processed successfully");
    setShowPaymentModal(false);
  };

  // Add fetchSuppliers function after the useEffect hooks
  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      if (Array.isArray(data)) {
        setSuppliers(data.map(supplier => ({
          ...supplier,
          id: supplier._id || supplier.id
        })));
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to fetch suppliers");
    }
  };

  // Get inventory categories for filtering
  const getInventoryCategories = () => {
    const categories = ["all"];
    
    // Add categories from our inventory items 
    inventory.forEach(item => {
      if (item.category && !categories.includes(item.category)) {
        categories.push(item.category);
      }
    });
    
    // Add predefined categories if they're not already included
    const predefinedCategories = [
      "Safety Gear & Accessories",
      "Tools & Equipment",
      "Construction Materials", 
      "Plumbing & Electrical Supplies",
    ];
    
    predefinedCategories.forEach(category => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
    
    return categories;
  };

  // Get supplier categories for filtering
  const getSupplierCategories = () => {
    const categories = ["all"];
    
    // Add categories from our suppliers
    suppliers.forEach(supplier => {
      if (supplier.category && !categories.includes(supplier.category)) {
        categories.push(supplier.category);
      }
    });
    
    // Add predefined categories if they're not already included
    const predefinedCategories = [
      "Safety Gear & Accessories",
      "Tools & Equipment",
      "Construction Materials", 
      "Plumbing & Electrical Supplies",
      "General Supplier",
      "Specialized Supplier",
      "Local Vendor",
      "International Vendor"
    ];
    
    predefinedCategories.forEach(category => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
    
    return categories;
  };

  // Function to get the local formatted time from a database date
  const getLocalTimeFromDatabase = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      // Create a date object directly from the string - browsers handle this correctly
      const date = new Date(dateString);
      
      // Check if it's a valid date
      if (isNaN(date.getTime())) {
        console.warn("Invalid date for local display:", dateString);
        return 'Invalid date';
      }
      
      // Format using the browser's locale settings
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting local time:", error, dateString);
      return 'Error';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-blue-900 text-white w-64 flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-blue-800">
          <h2 className="text-2xl font-bold">BuildMart</h2>
          <p className="text-blue-300 text-sm">Supply & Logistics</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "inventory"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <Box className="mr-3 h-5 w-5" />
              Inventory
            </button>

            <button
              onClick={() => setActiveTab("shipments")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "shipments"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <Truck className="mr-3 h-5 w-5" />
              Shipments
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "orders"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              Orders
            </button>

            <button
              onClick={() => setActiveTab("suppliers")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "suppliers"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Suppliers
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "reports"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <Activity className="mr-3 h-5 w-5" />
              Reports
            </button>

            <button
              onClick={() => setActiveTab("restock")}
              className={`flex items-center px-4 py-2.5 w-full text-left rounded-lg transition-colors ${
                activeTab === "restock"
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <RefreshCw className="mr-3 h-5 w-5" />
              Restock
            </button>

            
          </nav>
        </div>

        <div className="p-4 border-t border-blue-800">
          <button
            className="flex items-center px-4 py-2 w-full text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            onClick={() => {
              // Clear authentication data from localStorage
             
              // Show success message
              toast.success('Logged out successfully');
              handleLogout();
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "inventory" && "Inventory Management"}
                {activeTab === "shipments" && "Shipment Tracking"}
                {activeTab === "orders" && "Order Management"}
                {activeTab === "suppliers" && null}
                {activeTab === "reports" && "Reports & Analytics"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* <button
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button> */}

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-30">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="font-medium text-gray-700">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="flex items-start">
                            {notification.type === "warning" && (
                              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                            )}
                            {notification.type === "success" && (
                              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            )}
                            {notification.type === "info" && (
                              <Bell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-sm text-gray-800">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="relative">
                <button
                  className="flex items-center space-x-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <span className="text-sm font-medium">SA</span>
                  </div>
                  <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">
                  Supply Admin
                  </span>

                  <span className="text-xs font-medium text-gray-400">
                  supplyadmin@buildmart.com
                  </span>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Remove the old Supplier Management Gradient Header */}
          {activeTab === "dashboard" && (
  <div className="space-y-8">
    {/* Dashboard Header */}
    <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 text-white">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="mt-1 text-blue-100 text-sm">Track, analyze, and manage your supply chain operations</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 border border-white/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-xs font-medium">TOTAL INVENTORY</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {inventoryLoading ? (
                    <Loader className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    `${inventory.length}`
                  )}
                </h3>
                <p className="mt-1 text-blue-100 text-xs">unique items</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Box className="h-5 w-5 text-white" />
              </div>
            </div>
            {inventoryLoading ? null : (
              <div className="mt-3 flex items-center text-xs">
                <span className="text-green-300 font-medium">↑ 12% </span>
                <span className="ml-1 text-blue-100">from last month</span>
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 border border-white/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-xs font-medium">LOW STOCK ALERTS</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {inventoryLoading ? (
                    <Loader className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    `${inventory.filter(item => item.status === "Low Stock" || item.status === "Critical").length}`
                  )}
                </h3>
                <p className="mt-1 text-blue-100 text-xs">items need attention</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              </div>
            </div>
            {inventoryLoading ? null : (
              <div className="mt-3 flex items-center text-xs">
                <span className="text-red-300 font-medium">↑ 3 </span>
                <span className="ml-1 text-blue-100">items since yesterday</span>
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 border border-white/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-xs font-medium">INVENTORY VALUE</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {inventoryLoading ? (
                    <Loader className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    `Rs. ${inventory
                      .reduce((total, item) => 
                        total + item.stock * (item.name === "Sand (cubic m)" ? 7500 : 2500), 0)
                      .toLocaleString()}`
                  )}
                </h3>
                <p className="mt-1 text-blue-100 text-xs">total investment</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-300" />
              </div>
            </div>
            {inventoryLoading ? null : (
              <div className="mt-3 flex items-center text-xs">
                <span className="text-green-300 font-medium">↑ 8.5% </span>
                <span className="ml-1 text-blue-100">from previous quarter</span>
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 border border-white/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-xs font-medium">NEW ORDERS</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {orders.filter(order => order.status === "Pending" || order.status === "Processing").length}
                </h3>
                <p className="mt-1 text-blue-100 text-xs">awaiting processing</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-purple-300" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-green-300 font-medium">↓ 2 </span>
              <span className="ml-1 text-blue-100">orders since yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Supply Chain Health Overview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Critical Inventory Items */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden lg:col-span-2">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Critical Inventory Status</h3>
            <p className="text-sm text-gray-500">Items requiring immediate attention</p>
          </div>
          <button 
            onClick={() => setActiveTab("inventory")}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            View Inventory
          </button>
        </div>
        <div className="p-6">
          {inventoryLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h4 className="text-amber-700 text-sm font-medium">Low Stock</h4>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {inventory.filter(item => item.status === "Low Stock").length}
                  </p>
                  <div className="mt-2 text-xs text-amber-600">
                    Below threshold, order soon
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="text-red-700 text-sm font-medium">Critical</h4>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {inventory.filter(item => item.status === "Critical").length}
                  </p>
                  <div className="mt-2 text-xs text-red-600">
                    Immediate action required
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="text-green-700 text-sm font-medium">Healthy</h4>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {inventory.filter(item => item.status === "In Stock").length}
                  </p>
                  <div className="mt-2 text-xs text-green-600">
                    Stock levels sufficient
                  </div>
                </div>
              </div>
              
              {/* Critical Items List */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  Critical & Low Stock Items
                </div>
                <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                  {inventory
                    .filter(item => item.status === "Critical" || item.status === "Low Stock")
                    .slice(0, 5)
                    .map(item => (
                      <div key={item._id} className={`px-4 py-3 ${item.status === "Critical" ? "bg-red-50" : ""}`}>
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.supplier} • {item.category || "General"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-1">
                              <span className="font-bold text-gray-700">{item.stock}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-500">{item.threshold}</span>
                            </div>
                            <div className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center
                              ${item.status === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full mr-1 
                                ${item.status === "Critical" ? "bg-red-500" : "bg-amber-500"}`}>
                              </span>
                              {item.status}
                            </div>
                          </div>
                        </div>
                        
                        {!item.restockRequested && (
                          <button
                            onClick={() => handleRestockRequest(item.name)}
                            className="mt-2 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2 group"
                          >
                            <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
                            <span>Request Restock</span>
                          </button>
                        )}
                        {item.restockRequested && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
                            <CheckCircle className="h-3.5 w-3.5 animate-pulse" />
                            <span className="font-medium">Restock Requested</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                {inventory.filter(item => item.status === "Critical" || item.status === "Low Stock").length > 5 && (
                  <div className="bg-gray-50 px-4 py-2 text-xs text-center border-t border-gray-200">
                    <button 
                      onClick={() => setActiveTab("inventory")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View all {inventory.filter(item => item.status === "Critical" || item.status === "Low Stock").length} items
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Active Supply Chain Stats */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-800">Supply Chain Overview</h3>
          <p className="text-sm text-gray-500">Current status & performance</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Restock Stats */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">RESTOCK REQUESTS</h4>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {restockRequests.length}
                  </p>
                  <p className="text-sm text-gray-500">active requests</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-gray-800">
                    {restockRequests.filter(req => 
                      ['requested', 'approved', 'ordered', 'shipped'].includes(req.status)
                    ).length}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-amber-500"
                    style={{ 
                      width: `${restockRequests.length ? 
                        (restockRequests.filter(req => 
                          ['requested', 'approved', 'ordered', 'shipped'].includes(req.status)
                        ).length / restockRequests.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab("restock")}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Manage Restock Requests
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-sm font-medium text-gray-500 mb-3">SHIPMENT STATUS</h4>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {shipmentStatusFilter === "all" ? 
                      activeShipments.length : 
                      activeShipments.filter(s => s.status === shipmentStatusFilter).length}
                  </p>
                  <p className="text-sm text-gray-500">
                    {shipmentStatusFilter === "all" ? "active shipments" : `${shipmentStatusFilter} shipments`}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-gray-600 flex-1">In Transit</span>
                  <span className="font-medium text-gray-800">
                    {activeShipments.filter(s => s.status === "In Transit").length}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                  <span className="text-gray-600 flex-1">Loading/Preparing</span>
                  <span className="font-medium text-gray-800">
                    {activeShipments.filter(s => s.status === "Loading" || s.status === "Preparing").length}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                  <span className="text-gray-600 flex-1">Out for Delivery</span>
                  <span className="font-medium text-gray-800">
                    {activeShipments.filter(s => s.status === "Out for Delivery").length}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    sessionStorage.setItem('shipmentFilter', shipmentStatusFilter);
                    setActiveTab("shipments");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Manage Shipments
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Active Shipments Section */}
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Active Shipments</h3>
          <p className="text-sm text-gray-500">
            {shipmentStatusFilter === "all" 
              ? "Track ongoing deliveries & shipments" 
              : `Showing only ${shipmentStatusFilter} shipments`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={shipmentStatusFilter}
              onChange={(e) => setShipmentStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="In Transit">In Transit</option>
              <option value="Loading">Loading</option>
              <option value="Pending">Pending</option>
              <option value="Out for Delivery">Out for Delivery</option>
            </select>
          </div>
          <button 
            onClick={() => {
              const fetchShipmentData = async () => {
                try {
                  setShipmentsLoading(true);
                  const response = await axios.get('https://build-mart-backend.vercel.app/api/shipping/active');
                  setActiveShipments(response.data);
                  setShipmentsError(null);
                  toast.success("Shipment data refreshed");
                } catch (error) {
                  console.error('Error fetching shipments:', error);
                  toast.error("Failed to refresh shipments");
                } finally {
                  setShipmentsLoading(false);
                }
              };
              fetchShipmentData();
            }} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={() => {
              sessionStorage.setItem('shipmentFilter', shipmentStatusFilter);
              setActiveTab("shipments");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            All Shipments
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {shipmentsLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="h-10 w-10 text-blue-600 animate-spin mr-3" />
            <p className="text-gray-600">Loading shipment data...</p>
          </div>
        ) : shipmentsError ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Error loading shipment data</span>
            </div>
            <p className="mt-2 text-sm">{shipmentsError}</p>
          </div>
        ) : activeShipments.length === 0 ? (
          <div className="text-center py-10">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No active shipments</h3>
            <p className="text-gray-500 mt-1">There are no ongoing shipments at the moment</p>
          </div>
        ) : activeShipments.filter(shipment => shipmentStatusFilter === "all" || shipment.status === shipmentStatusFilter).length === 0 ? (
          <div className="text-center py-10">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No {shipmentStatusFilter} shipments</h3>
            <p className="text-gray-500 mt-1">
              There are no shipments with status "{shipmentStatusFilter}"
              <button 
                onClick={() => setShipmentStatusFilter("all")}
                className="text-blue-600 ml-1 hover:underline"
              >
                Show all instead
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeShipments
              .filter(shipment => shipmentStatusFilter === "all" || shipment.status === shipmentStatusFilter)
              .slice(0, 3)
              .map((shipment) => (
              <div key={shipment.id || shipment._id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-3 md:mb-0">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-800">{shipment.id}</h4>
                          <p className="text-sm text-gray-600">
                            Order #{shipment.orderId?.substring(0, 8) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shipment.status === "In Transit" ? "bg-blue-100 text-blue-800" :
                        shipment.status === "Loading" ? "bg-amber-100 text-amber-800" :
                        shipment.status === "Out for Delivery" ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          shipment.status === "In Transit" ? "bg-blue-500" :
                          shipment.status === "Loading" ? "bg-amber-500" :
                          shipment.status === "Out for Delivery" ? "bg-purple-500" :
                          "bg-gray-500"
                        }`}></span>
                        {shipment.status}
                      </span>
                      
                      <span className="text-sm text-gray-500 mt-1">
                        ETA: {shipment.eta || "Unknown"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">FROM</p>
                      <p className="text-sm font-medium text-gray-800">{shipment.origin || "Warehouse"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">TO</p>
                      <p className="text-sm font-medium text-gray-800">{shipment.destination || "Customer Site"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">DRIVER</p>
                      <p className="text-sm font-medium text-gray-800">{shipment.driver || "Not Assigned"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{shipment.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          shipment.status === "In Transit" ? "bg-blue-500" :
                          shipment.status === "Loading" ? "bg-amber-500" :
                          shipment.status === "Out for Delivery" ? "bg-purple-500" :
                          "bg-gray-500"
                        }`}
                        style={{ width: `${shipment.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {activeShipments.length > 3 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    sessionStorage.setItem('shipmentFilter', shipmentStatusFilter);
                    setActiveTab("shipments");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium inline-flex items-center"
                >
                  View All {shipmentStatusFilter === "all" ? 
                    activeShipments.length : 
                    activeShipments.filter(s => s.status === shipmentStatusFilter).length} Shipments
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    
    {/* Recent Orders Overview */}
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <p className="text-sm text-gray-500">Latest customer orders requiring fulfillment</p>
        </div>
        <button 
          onClick={() => setActiveTab("orders")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View All Orders
        </button>
      </div>
      
      <div className="p-6">
        {ordersLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="h-10 w-10 text-blue-600 animate-spin mr-3" />
            <p className="text-gray-600">Loading order data...</p>
          </div>
        ) : ordersError ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Error loading order data</span>
            </div>
            <p className="mt-2 text-sm">{ordersError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders
                  .filter(order => order.status === "Pending")
                  .slice(0, 5)
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {order.value.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedOrderForShipment(order);
                            setActiveTab("shipments");
                          }}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Truck className="mr-1 h-4 w-4" /> 
                          Ship
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {orders.filter(order => order.status === "Pending").length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No new orders</h3>
                <p className="text-gray-500 mt-1">All orders have been processed</p>
              </div>
            )}
            
            {orders.filter(order => order.status === "Pending").length > 5 && (
              <div className="text-right mt-4">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  View all {orders.filter(order => order.status === "Pending").length} new orders
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Inventory Management Header - styled like shipment dashboard */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Inventory Management
                    </h2>
                    <p className="text-blue-100 mt-1">
                      Track, manage and optimize your inventory levels
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search inventory..."
                        className="py-2 pl-10 pr-4 bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                      <div className="absolute left-3 top-2.5">
                        <Search className="h-5 w-5 text-blue-100" />
                  </div>
                    </div>
                    <button 
                      onClick={() => {
                        setInventoryLoading(true);
                        fetchInventory().finally(() => setInventoryLoading(false));
                      }} 
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Refresh data"
                    >
                      <RefreshCw size={20} className="text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        // Download inventory data as CSV
                        const headers = ["Product", "Stock", "Threshold", "Status", "Supplier", "Category"];
                        const data = inventory.map(item => [
                          item.name, item.stock, item.threshold, item.status, 
                          item.supplier, item.category || 'General'
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
                        link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Download inventory data"
                    >
                      <Download className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-center gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                    <select
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={inventoryFilter}
                      onChange={(e) => setInventoryFilter(e.target.value)}
                    >
                    <option value="all">All Items</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {getInventoryCategories().filter(cat => cat !== "all").map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setInventoryFilter("all");
                      setInventoryCategoryFilter("all");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Inventory Content */}
              {/* Enhanced Inventory Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {inventoryLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="ml-2 text-gray-600">Loading inventory data...</p>
                  </div>
                ) : inventoryError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-4">
                    <p>{inventoryError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inventory Level
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supplier
                          </th>
                          {/* Removed Supply Chain column */}
                          {/* Removed Actions column */}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getFilteredInventory().length > 0 ? (
                          getFilteredInventory().map((item) => (
                            <tr 
                              key={item._id || item.name}
                              className={`hover:bg-gray-50 transition-colors ${
                                item.status === "Critical" ? "bg-red-50" : 
                                item.status === "Low Stock" ? "bg-amber-50" : 
                                ""
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                                    {item.name?.toLowerCase().includes("safety") || item.category?.toLowerCase().includes("safety") ? (
                                      <AlertCircle className="h-5 w-5 text-blue-500" />
                                    ) : item.name?.toLowerCase().includes("tool") || item.category?.toLowerCase().includes("tool") ? (
                                      <Wrench className="h-5 w-5 text-blue-500" />
                                    ) : item.name?.toLowerCase().includes("cement") || item.name?.toLowerCase().includes("brick") ? (
                                      <Package className="h-5 w-5 text-amber-500" />
                                    ) : item.name?.toLowerCase().includes("pvc") || item.category?.toLowerCase().includes("pipe") ? (
                                      <ArrowRight className="h-5 w-5 text-blue-500" />
                                    ) : (
                                      <Box className="h-5 w-5 text-gray-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {item.sku ? `SKU: ${item.sku}` : ''} {item.category ? `• ${item.category}` : ''}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className="text-gray-900 font-medium">{item.stock}</span>
                                  <span className="mx-2 text-gray-400">/</span>
                                  <span className="text-gray-500">{item.threshold}</span>
                                </div>
                                
                                {/* Stock level progress bar */}
                                <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      item.status === "Critical" ? "bg-red-500" : 
                                      item.status === "Low Stock" ? "bg-amber-500" : 
                                      "bg-green-500"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(5, (item.stock / item.threshold) * 100))}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  item.status === "In Stock" ? "bg-green-100 text-green-700" : 
                                  item.status === "Low Stock" ? "bg-amber-100 text-amber-700" : 
                                  "bg-red-100 text-red-700"
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${
                                    item.status === "In Stock" ? "bg-green-500" : 
                                    item.status === "Low Stock" ? "bg-amber-500" : 
                                    "bg-red-500"
                                  }`}></span>
                                  <span>{item.status}</span>
                                </div>
                                
                                {/* Add Restock button for items that need it */}
                                {(item.status === "Critical" || item.status === "Low Stock") && !item.restockRequested && (
                                  <button
                                    onClick={() => handleRestockRequest(item.name)}
                                    className="mt-2 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2 group"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
                                    <span>Request Restock</span>
                                  </button>
                                )}
                                {item.restockRequested && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
                                    <CheckCircle className="h-3.5 w-3.5 animate-pulse" />
                                    <span className="font-medium">Restock Requested</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {item.supplier !== "No Supplier Assigned" ? (
                                    <>
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-700 font-medium">
                                    {item.supplier?.charAt(0) || 'S'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{item.supplier}</div>
                                    <div className="text-xs text-gray-500">
                                      {item.leadTime ? `${item.leadTime} days lead time` : 'Standard delivery'}
                                    </div>
                                  </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-700 font-medium">
                                        <AlertTriangle className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-red-600">No Supplier Assigned</div>
                                        <button
                                          onClick={() => {
                                            setActiveTab("suppliers");
                                            setShowSupplierForm(true);
                                            setSelectedProduct(item);
                                          }}
                                          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded inline-flex items-center mt-1"
                                        >
                                          <Users className="h-3 w-3 mr-1" />
                                          Add Supplier
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                              {/* Removed Supply Chain column */}
                              {/* Removed Actions column */}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                              <Box className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-lg font-medium">No inventory items found</p>
                              <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {!inventoryLoading && !inventoryError && getFilteredInventory().length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                    Showing {getFilteredInventory().length} of {inventory.length} items
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "shipments" && (
            <div className="space-y-6" id="shipping-manager-container">
              <ShippingManager 
                selectedOrderForShipment={selectedOrderForShipment} 
                setSelectedOrderForShipment={setSelectedOrderForShipment}
                onArrangeShipment={handleArrangeShipment}
                updateOrderStatus={updateOrderStatus}
                activeShipments={activeShipments}
                setActiveShipments={setActiveShipments}
                shipmentsLoading={shipmentsLoading}
                setShipmentsLoading={setShipmentsLoading}
                shipmentsError={shipmentsError}
                setShipmentsError={setShipmentsError}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Payment Modal */}
              {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-semibold">
                        Process Supplier Payment
                      </h3>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="p-4">
                      <EnhancedPaymentGateway
                        amount={selectedOrder?.value}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setShowPaymentModal(false)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Management Gradient Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-5">
                <div className="flex justify-between items-center">
                    <div>
                    <h2 className="text-3xl font-bold text-white">Order Dashboard</h2>
                    <p className="text-blue-100 mt-1">Track, process and arrange shipments for customer orders</p>
                    </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-64 py-2 pl-10 pr-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="Search orders..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-100" />
                    </div>
                    <button
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      onClick={() => {
                        // Refresh orders data
                        setOrdersLoading(true);
                        axios
                          .get("https://build-mart-backend.vercel.app/api/orders?all=true")
                          .then((response) => {
                            if (response.data.success) {
                              const transformedOrders =
                                response.data.orders.map((order) => ({
                                  id: order._id,
                                  customer:
                                    order.customer?.name || "Unknown Customer",
                                  items: Array.isArray(order.items) ? order.items.length : 0,
                                  value: order.totalAmount || 0,
                                  status: mapOrderStatus(order.orderStatus),
                                  date: new Date(order.orderDate || order.createdAt)
                                    .toISOString()
                                    .split("T")[0],
                                  shippingAddress: order.shippingAddress,
                                }));
                              setOrders(transformedOrders);
                              toast.success("Orders data refreshed");
                            }
                          })
                          .catch((error) => {
                            console.error("Error refreshing orders:", error);
                            toast.error("Failed to refresh orders data");
                          })
                          .finally(() => {
                            setOrdersLoading(false);
                          });
                      }}
                    >
                      <RefreshCw className="h-5 w-5 text-white" />
                    </button>
                    <button
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      onClick={() => {
                        // Export orders data as CSV
                        const csvContent =
                          "data:text/csv;charset=utf-8," +
                          "Order ID,Customer,Items,Value,Status,Date\n" +
                          orders
                            .map(
                              (order) =>
                                `"${order.id}","${order.customer}",${
                                  order.items
                                },${order.value},"${order.status}","${order.date}"`
                            )
                            .join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "orders_report.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl shadow-sm border-2 border-amber-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">New Orders</p>
                      <h3 className="text-2xl font-bold text-amber-900 mt-1">
                        {orders.filter(order => order.status === "Pending").length}
                      </h3>
                      <p className="text-xs text-amber-700 mt-1">Awaiting processing</p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-amber-200 flex items-center justify-center">
                      <Clock className="h-7 w-7 text-amber-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">In Progress</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {activeShipments.length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Delivered</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {completedShipments.length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              {renderPendingOrdersTable()}
            </div>
          )}

          {activeTab === "suppliers" && (
            <div className="space-y-6">
              {/* Supplier Management Header - styled like inventory dashboard */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Supplier Management
                    </h2>
                    <p className="text-blue-100 mt-1">
                      Manage your suppliers, add new ones, and keep your supply chain strong
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search suppliers..."
                        className="py-2 pl-10 pr-4 bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                        value={supplierSearchTerm}
                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                      />
                      <div className="absolute left-3 top-2.5">
                        <Search className="h-5 w-5 text-blue-100" />
                      </div>
                    </div>
                    <button 
                      onClick={fetchSuppliers}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Refresh data"
                    >
                      <RefreshCw size={20} className="text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        // Create CSV content
                        const headers = ["Supplier Name", "Category", "Contact", "Email", "Phone", "Address", "City", "Country"];
                        const data = suppliers.map(s => [
                          s.name || "",
                          s.category || "",
                          s.contact || "",
                          s.email || "",
                          s.phone || "",
                          s.address || "",
                          s.city || "",
                          s.country || ""
                        ]);
                        
                        // Generate CSV
                        const csvContent = [
                          headers.join(','),
                          ...data.map(row => row.join(','))
                        ].join('\n');
                        
                        // Download CSV
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.setAttribute('href', url);
                        link.setAttribute('download', `suppliers_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Download supplier data"
                    >
                      <Download size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Show error messages if any */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p>{error}</p>
                </div>
              )}

              {/* Add Supplier Button and Category Filter */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Suppliers
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-auto">
                    <select
                      value={supplierCategoryFilter}
                      onChange={(e) => setSupplierCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {getSupplierCategories().filter(cat => cat !== "all").map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                <button
                  onClick={() => setShowSupplierForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Add New Supplier"}
                </button>
                </div>
              </div>

              {/* Supplier Form Modal */}
              {showSupplierForm && (
                <div className="fixed inset-0 backdrop-blur-lg bg-gray-800/30 z-50 flex items-center justify-center overflow-y-auto">
                  <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-3xl w-full mx-4 my-6">
                    {/* Rest of the modal content remains the same */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {currentSupplier
                            ? "Update Supplier"
                            : "Add New Supplier"}
                        </h3>
                        <button
                          onClick={handleCloseSupplierForm}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {currentSupplier
                          ? "Update supplier information in the system."
                          : "Add a new supplier to the BuildMart supply chain."}
                      </p>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Information */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                            Company Information
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Supplier Name <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={supplierName}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSupplierName(value);
                                    
                                    // Real-time validation for special characters, numbers, and spaces
                                    if (/^[^a-zA-Z]/.test(value)) {
                                      setValidationErrors(prev => ({ ...prev, supplierName: 'Supplier name cannot start with a special character, number, or space' }));
                                    } else if (/[#$@%\^*!_~`\[\]{}:;"'<>?/\\|]/.test(value)) {
                                      setValidationErrors(prev => ({ ...prev, supplierName: 'Supplier name cannot contain special characters like #, $, @, %, etc.' }));
                                    } else if (validationErrors.supplierName && 
                                      (validationErrors.supplierName === 'Supplier name cannot start with a special character, number, or space' ||
                                       validationErrors.supplierName === 'Supplier name cannot contain special characters like #, $, @, %, etc.')) {
                                      // Only clear special character errors
                                      setValidationErrors(prev => { const n = { ...prev }; delete n.supplierName; return n; });
                                    }
                                  }}
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierName 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="Enter company name"
                                  required
                                />
                              </div>
                              {validationErrors.supplierName && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierName}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedProduct ? selectedProduct._id : ""}
                                  onChange={handleProductChange}
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.selectedProduct 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                >
                                  <option value="">Select a product</option>
                                  {inventory.map(product => (
                                    <option key={product._id} value={product._id}>
                                      {product.name} ({product.category})
                                    </option>
                                  ))}
                                </select>
                                {validationErrors.selectedProduct && (
                                  <p className="mt-1 text-sm text-red-600">{validationErrors.selectedProduct}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                              </label>
                                <input
                                  type="text"
                                value={supplierCategory}
                                readOnly
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price per Item (LKR) <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={supplierPrice}
                                  onChange={(e) => {
                                    setSupplierPrice(e.target.value);
                                    if (validationErrors.supplierPrice) {
                                      const newErrors = {...validationErrors};
                                      delete newErrors.supplierPrice;
                                      setValidationErrors(newErrors);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    // Allow only numbers, backspace, delete, arrow keys, decimal point
                                    if (!/^[0-9.]$/.test(e.key) && 
                                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierPrice 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="Enter purchase price"
                                  required
                                />
                                {validationErrors.supplierPrice && (
                                  <p className="mt-1 text-sm text-red-600">{validationErrors.supplierPrice}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                              </label>
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                  https://
                                </span>
                                <input
                                  type="text"
                                  value={supplierWebsite.replace(/^https?:\/\//, "")}
                                  onChange={(e) => setSupplierWebsite(`https://${e.target.value}`)}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                  placeholder="example.com"
                                />
                              </div>
                              {validationErrors.supplierWebsite && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors.supplierWebsite}
                                </p>
                              )}
                            </div>

                            {/* Notes field moved after address */}
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                            Contact Information
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={supplierContact}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSupplierContact(value);
                                    
                                    // Real-time validation for special characters
                                    if (/^[^a-zA-Z]/.test(value)) {
                                      setValidationErrors(prev => ({ ...prev, supplierContact: 'Contact name cannot start with a special character, number, or space' }));
                                    } else if (/[#$@%\^*!_~`\[\]{}:;"'<>?/\\|0-9]/.test(value)) {
                                      setValidationErrors(prev => ({ ...prev, supplierContact: 'Contact name cannot contain special characters or numbers' }));
                                    } else if (validationErrors.supplierContact && 
                                      (validationErrors.supplierContact === 'Contact name cannot start with a special character, number, or space' ||
                                       validationErrors.supplierContact === 'Contact name cannot contain special characters or numbers')) {
                                      // Only clear special character errors
                                      setValidationErrors(prev => { const n = { ...prev }; delete n.supplierContact; return n; });
                                    }
                                  }}
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierContact 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="Full name"
                                />
                              {validationErrors.supplierContact && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierContact}</p>
                              )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  value={supplierEmail}
                                  onChange={(e) => {
                                    setSupplierEmail(e.target.value);
                                    if (validationErrors.supplierEmail) {
                                        setValidationErrors({
                                          ...validationErrors,
                                        supplierEmail: null
                                      });
                                    }
                                  }}
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierEmail 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="email@example.com"
                                />
                                {validationErrors.supplierEmail && (
                                  <p className="mt-1 text-sm text-red-600">{validationErrors.supplierEmail}</p>
                                )}
                              </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                  type="tel"
                                  value={supplierPhone}
                                onChange={(e) => {
                                    // Allow only numbers, +, and spaces
                                    const value = e.target.value.replace(/[^\d+\s]/g, '');
                                    setSupplierPhone(value);
                                    if (validationErrors.supplierPhone) {
                                    setValidationErrors({
                                      ...validationErrors,
                                        supplierPhone: null
                                    });
                                  }
                                }}
                                  maxLength={15}
                                className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierPhone 
                                    ? "border-red-500 focus:ring-red-500" 
                                    : "border-gray-300 focus:ring-blue-500"
                                } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="+94XXXXXXXXX or 07XXXXXXXX"
                                />
                                {validationErrors.supplierPhone && (
                                  <p className="mt-1 text-sm text-red-600">{validationErrors.supplierPhone}</p>
                            )}
                          </div>
                        </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={supplierCity}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSupplierCity(value);
                                  
                                  // Real-time validation 
                                  if (/^[^a-zA-Z]/.test(value)) {
                                    setValidationErrors(prev => ({ ...prev, supplierCity: 'City name cannot start with a special character or space' }));
                                  } else if (!/^[a-zA-Z\s]*$/.test(value)) {
                                    setValidationErrors(prev => ({ ...prev, supplierCity: 'City name should contain only letters and spaces' }));
                                  } else if (validationErrors.supplierCity) {
                                    setValidationErrors(prev => { const n = { ...prev }; delete n.supplierCity; return n; });
                                  }
                                }}
                                className={`w-full px-3 py-2 bg-gray-50 border ${
                                  validationErrors.supplierCity 
                                    ? "border-red-500 focus:ring-red-500" 
                                    : "border-gray-300 focus:ring-blue-500"
                                } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                placeholder="City"
                              />
                              {validationErrors.supplierCity && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierCity}</p>
                              )}
                          </div>
                        </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                              </label>
                            <textarea
                              value={supplierAddress}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSupplierAddress(value);
                                
                                // Real-time validation for starting with special character or space
                                if (value && /^[\s~`!@#$%^&*()_\-+=\[\]{}|\\:;"'<>,.?/]/.test(value)) {
                                  setValidationErrors(prev => ({ ...prev, supplierAddress: 'Address cannot start with a special character or space' }));
                                } else if (validationErrors.supplierAddress && 
                                  validationErrors.supplierAddress === 'Address cannot start with a special character or space') {
                                  setValidationErrors(prev => { const n = { ...prev }; delete n.supplierAddress; return n; });
                                }
                              }}
                              rows="2"
                              className={`w-full px-3 py-2 bg-gray-50 border ${
                                validationErrors.supplierAddress 
                                  ? "border-red-500 focus:ring-red-500" 
                                  : "border-gray-300 focus:ring-blue-500"
                              } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                              placeholder="Street address"
                            ></textarea>
                            {validationErrors.supplierAddress && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.supplierAddress}</p>
                            )}
                        </div>

                          {/* Add Notes field here after address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={supplierNotes}
                              onChange={(e) => setSupplierNotes(e.target.value)}
                              rows="3"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                              placeholder="Any additional information about this supplier..."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="text-red-500 mr-1">*</span> Required
                        fields
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleCloseSupplierForm}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={
                            currentSupplier
                              ? handleUpdateSupplier
                              : handleAddSupplier
                          }
                          className={`px-4 py-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isLoading || !supplierName
                              ? "bg-blue-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          disabled={isLoading || !supplierName}
                        >
                          <div className="flex items-center">
                            {isLoading && (
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                            )}
                            {currentSupplier
                              ? "Update Supplier"
                              : "Add Supplier"}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier List - Enhanced Styling */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="ml-2 text-gray-600">Loading supplier data...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-4">
                    <p>{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supplier
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Details
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {suppliers.filter(
                          (supplier) =>
                            (supplierSearchTerm === "" || 
                            supplier.name?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                            (supplier.category && supplier.category.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                            (supplier.contact && supplier.contact.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                            (supplier.email && supplier.email.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                            (supplier.phone && supplier.phone.toLowerCase().includes(supplierSearchTerm.toLowerCase()))) &&
                            (supplierCategoryFilter === "all" || supplier.category === supplierCategoryFilter)
                        ).length > 0 ? (
                          suppliers
                            .filter(
                              (supplier) =>
                                (supplierSearchTerm === "" || 
                                supplier.name?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                                (supplier.category && supplier.category.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                                (supplier.contact && supplier.contact.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                                (supplier.email && supplier.email.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                                (supplier.phone && supplier.phone.toLowerCase().includes(supplierSearchTerm.toLowerCase()))) &&
                                (supplierCategoryFilter === "all" || supplier.category === supplierCategoryFilter)
                            )
                            .map((supplier) => (
                              <tr
                                key={supplier._id || supplier.id || supplier.name}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                      <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">{supplier.name}</div>
                                      <div className="text-sm text-gray-500">{supplier.website}</div>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {inventory.find(p => p._id === supplier.productId)?.name || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                    supplier.category?.toLowerCase().includes("safety") 
                                      ? "bg-green-100 text-green-800" 
                                      : supplier.category?.toLowerCase().includes("tools") 
                                      ? "bg-blue-100 text-blue-800"
                                      : supplier.category?.toLowerCase().includes("construction") 
                                      ? "bg-amber-100 text-amber-800"
                                      : supplier.category?.toLowerCase().includes("plumbing") 
                                      ? "bg-indigo-100 text-indigo-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {supplier.category || "General"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">{supplier.contact}</div>
                                  <div className="text-sm text-gray-500">{supplier.email}</div>
                                  <div className="text-sm text-gray-500">{supplier.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => editSupplier(supplier)}
                                      className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                      title="Edit Supplier"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSupplier(supplier._id)}
                                      className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                      title="Delete Supplier"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-lg font-medium">No suppliers found</p>
                              <p className="text-sm">Try adjusting your search criteria or add a new supplier</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                
                    {suppliers.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                    Showing {suppliers.filter(
                      (supplier) =>
                        (supplierSearchTerm === "" || 
                        supplier.name?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                        (supplier.category && supplier.category.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                        (supplier.contact && supplier.contact.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                        (supplier.email && supplier.email.toLowerCase().includes(supplierSearchTerm.toLowerCase())) ||
                        (supplier.phone && supplier.phone.toLowerCase().includes(supplierSearchTerm.toLowerCase()))) &&
                        (supplierCategoryFilter === "all" || supplier.category === supplierCategoryFilter)
                    ).length} of {suppliers.length} suppliers
                  </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Reports Section */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Reports & Analytics
                    </h2>
                    <p className="text-blue-100 mt-1">
                      Track key metrics, generate business insights, and make data-driven decisions
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="py-2 pl-10 pr-4 bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                      />
                      <div className="absolute left-3 top-2.5">
                        <Search className="h-5 w-5 text-blue-100" />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        toast.info("Refreshing analytics data...");
                        fetchInventory();
                        fetchSuppliers();
                        fetchOrders();
                        fetchShipments();
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Refresh data"
                    >
                      <RefreshCw size={20} className="text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        const reportSummary = {
                          inventoryHealth: `${inventory.filter(item => (item.stock > item.threshold)).length}/${inventory.length}`,
                          deliveryPerformance: `${Math.round(deliveryPerformance.reduce((acc, curr) => acc + curr.onTime, 0) / deliveryPerformance.length)}%`,
                          supplierReliability: `${suppliers.length > 0 ? Math.round(suppliers.length * 0.85) : 0}/${suppliers.length}`,
                          orderFulfillment: `${orders.filter(order => order.status === "Delivered").length}/${orders.length}`,
                          generatedDate: new Date().toISOString().split('T')[0]
                        };
                        
                        const csvContent = [
                          "Report Type,Value,Date Generated",
                          `Inventory Health,${reportSummary.inventoryHealth},${reportSummary.generatedDate}`,
                          `Delivery Performance,${reportSummary.deliveryPerformance},${reportSummary.generatedDate}`,
                          `Supplier Reliability,${reportSummary.supplierReliability},${reportSummary.generatedDate}`,
                          `Order Fulfillment,${reportSummary.orderFulfillment},${reportSummary.generatedDate}`
                        ].join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.setAttribute('href', url);
                        link.setAttribute('download', `supply_logistics_report_${reportSummary.generatedDate}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        toast.success("Supply & Logistics Report downloaded successfully!");
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Download reports"
                    >
                      <Download size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Analytics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Inventory Health</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {inventory.filter(item => (item.stock > item.threshold)).length}/{inventory.length}
                      </h3>
                      <p className="text-sm text-green-600 mt-1 flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {Math.round((inventory.filter(item => (item.stock > item.threshold)).length / inventory.length) * 100)}% healthy
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <BarChart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Delivery Performance</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {Math.round(deliveryPerformance.reduce((acc, curr) => acc + curr.onTime, 0) / deliveryPerformance.length)}%
                      </h3>
                      <p className="text-sm text-green-600 mt-1">On-time deliveries</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Supplier Reliability</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {suppliers.length > 0 ? Math.round(suppliers.length * 0.85) : 0}/{suppliers.length}
                      </h3>
                      <p className="text-sm text-amber-600 mt-1">Active reliable suppliers</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Fulfillment</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {orders.filter(order => order.status === "Delivered").length}/{orders.length}
                      </h3>
                      <p className="text-sm text-blue-600 mt-1">Orders completed</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Status Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800">
                      Inventory Status
                  </h3>
                  <div className="flex items-center space-x-2">
                      <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                        <option>Last 3 Months</option>
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={inventory.slice(0, 6)}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" name="Current Stock" fill="#3B82F6" />
                        <Bar dataKey="threshold" name="Threshold" fill="#EF4444" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Comparing current stock levels with minimum thresholds for top products.</p>
                </div>

                {/* Supplier Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800">
                      Supplier Distribution
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                        <option>By Value</option>
                        <option>By Quantity</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-80 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={suppliers.length > 0 
                            ? getSupplierCategories()
                                .filter(cat => cat !== "all")
                                .map(category => ({
                                  name: category || "Uncategorized",
                                  value: suppliers.filter(s => s.category === category).length
                                }))
                                .filter(item => item.value > 0)
                            : [{ name: "No Data", value: 1 }]
                          }
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(suppliers.length > 0 
                            ? getSupplierCategories()
                                .filter(cat => cat !== "all")
                                .map(category => ({
                                  name: category || "Uncategorized",
                                  value: suppliers.filter(s => s.category === category).length
                                }))
                                .filter(item => item.value > 0)
                            : [{ name: "No Data", value: 1 }]
                          ).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} suppliers`, name]} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Distribution of suppliers by category.</p>
                </div>

                {/* Product Category Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800">
                      Product Category Distribution
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                        <option>By Stock</option>
                        <option>By Value</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-80 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={inventory.length > 0 
                            ? getInventoryCategories()
                                .filter(cat => cat !== "all")
                                .map(category => ({
                                  name: category || "Uncategorized",
                                  value: inventory.filter(item => item.category === category).length
                                }))
                                .filter(item => item.value > 0)
                            : [{ name: "No Data", value: 1 }]
                          }
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(inventory.length > 0 
                            ? getInventoryCategories()
                                .filter(cat => cat !== "all")
                                .map(category => ({
                                  name: category || "Uncategorized",
                                  value: inventory.filter(item => item.category === category).length
                                }))
                                .filter(item => item.value > 0)
                            : [{ name: "No Data", value: 1 }]
                          ).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} products`, name]} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Distribution of products by category.</p>
                </div>

                {/* Delivery Performance Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800">
                      Delivery Performance
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={orders.length > 0 
                          ? [
                              // Group orders by month and calculate on-time percentage
                              ...Array.from(
                                new Set(
                                  orders.map(order => 
                                    order.date ? new Date(order.date).toLocaleString('default', { month: 'short' }) : null
                                  ).filter(Boolean)
                                )
                              ).map(month => ({
                                month,
                                onTime: orders.filter(
                                  order => 
                                    order.date && 
                                    new Date(order.date).toLocaleString('default', { month: 'short' }) === month && 
                                    order.status === "Delivered"
                                ).length,
                                late: orders.filter(
                                  order => 
                                    order.date && 
                                    new Date(order.date).toLocaleString('default', { month: 'short' }) === month && 
                                    order.status !== "Delivered"
                                ).length
                              })),
                              // If no orders exist or can't be grouped, use the sample data
                              ...(orders.filter(order => order.date).length === 0 ? deliveryPerformance : [])
                            ] 
                          : deliveryPerformance
                        }
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="onTime" name="On-Time Deliveries" stroke="#10B981" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="late" name="Late/Pending Deliveries" stroke="#EF4444" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Tracking on-time vs. late deliveries based on order status.</p>
                </div>

                {/* Order Trends Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800">
                      Order Trends
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={(() => {
                          // Process real order and shipment data
                          if (orders.length > 0 && activeShipments.length > 0) {
                            // Get unique dates from orders, sort them
                            const orderDates = [...new Set(orders.map(order => order.date))]
                              .filter(Boolean)
                              .sort((a, b) => new Date(a) - new Date(b));
                            
                            // If we have dates, create data points
                            if (orderDates.length > 0) {
                              return orderDates.map(date => {
                                const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                return {
                                  name: formattedDate,
                                  orders: orders.filter(order => order.date === date).length,
                                  shipments: activeShipments.filter(
                                    // Simulate matching shipments to orders by random assignment for demo
                                    shipment => Math.random() > 0.3
                                  ).length
                                };
                              });
                            }
                          }
                          
                          // Fallback to sample data if real data is insufficient
                          return [
                            { name: 'Week 1', orders: 24, shipments: 20 },
                            { name: 'Week 2', orders: 18, shipments: 17 },
                            { name: 'Week 3', orders: 28, shipments: 23 },
                            { name: 'Week 4', orders: 32, shipments: 29 },
                            { name: 'Week 5', orders: 26, shipments: 25 },
                            { name: 'Week 6', orders: 30, shipments: 27 },
                          ];
                        })()}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="orders" name="Orders Received" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="shipments" name="Shipments Dispatched" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Comparing order volume with shipment volume over time using actual order data.</p>
                </div>
              </div>

              {/* Detailed Reports Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800">
                    Detailed Reports
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Filter className="h-5 w-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => {
                        const reportsList = [
                          { title: 'Inventory Turnover Report', data: inventory },
                          { title: 'Supplier Performance Report', data: suppliers },
                          { title: 'Logistics Efficiency Report', data: activeShipments },
                          { title: 'Order Analysis', data: orders },
                          { title: 'Stock Status', data: inventory.map(item => ({ name: item.name, status: getStockStatus(item.stock, item.threshold) })) },
                          { title: 'Delivery Metrics', data: deliveryPerformance }
                        ];
                        
                        // Prepare zip of all reports
                        const csvContents = reportsList.map(report => {
                          const headers = Object.keys(report.data[0] || {}).join(',');
                          const rows = report.data.map(item => Object.values(item).join(',')).join('\n');
                          return `${headers}\n${rows}`;
                        });
                        
                        // Download each report separately for simplicity
                        reportsList.forEach((report, index) => {
                          const blob = new Blob([csvContents[index]], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          setTimeout(() => {
                            link.click();
                            document.body.removeChild(link);
                          }, index * 100);
                        });
                        
                        toast.success("All reports downloaded successfully!");
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Report List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { 
                        title: 'Inventory Turnover Report', 
                        desc: 'Analysis of stock rotation and movement', 
                        date: new Date().toISOString().split('T')[0],
                        icon: <BarChart className="h-6 w-6 text-blue-600" />,
                        data: inventory,
                        onClick: () => {
                          const headers = Object.keys(inventory[0] || {}).join(',');
                          const rows = inventory.map(item => Object.values(item).join(',')).join('\n');
                          const csvContent = `${headers}\n${rows}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `inventory_turnover_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast.success("Inventory Turnover Report downloaded!");
                        }
                      },
                      { 
                        title: 'Supplier Performance Report', 
                        desc: 'Evaluation of supplier reliability and quality', 
                        date: new Date().toISOString().split('T')[0],
                        icon: <Users className="h-6 w-6 text-green-600" />,
                        data: suppliers,
                        onClick: () => {
                          const headers = Object.keys(suppliers[0] || {}).join(',');
                          const rows = suppliers.map(item => Object.values(item).join(',')).join('\n');
                          const csvContent = `${headers}\n${rows}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `supplier_performance_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast.success("Supplier Performance Report downloaded!");
                        }
                      },
                      { 
                        title: 'Logistics Efficiency Report', 
                        desc: 'Shipping costs and delivery time analysis', 
                        date: new Date().toISOString().split('T')[0],
                        icon: <Truck className="h-6 w-6 text-amber-600" />,
                        data: activeShipments,
                        onClick: () => {
                          const headers = Object.keys(activeShipments[0] || {}).join(',');
                          const rows = activeShipments.map(item => Object.values(item).join(',')).join('\n');
                          const csvContent = `${headers}\n${rows}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `logistics_efficiency_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast.success("Logistics Efficiency Report downloaded!");
                        }
                      },
                      { 
                        title: 'Inventory Forecasting', 
                        desc: 'Predictions for optimal stock levels', 
                        date: new Date().toISOString().split('T')[0],
                        icon: <LineChart className="h-6 w-6 text-purple-600" />,
                        data: inventory.map(item => ({
                          name: item.name,
                          currentStock: item.stock,
                          threshold: item.threshold,
                          recommendedOrder: item.stock < item.threshold ? Math.round(item.threshold * 1.5 - item.stock) : 0,
                          estimatedDepleteDate: new Date(Date.now() + (item.stock * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                        })),
                        onClick: () => {
                          const forecasting = inventory.map(item => ({
                            name: item.name,
                            currentStock: item.stock,
                            threshold: item.threshold,
                            recommendedOrder: item.stock < item.threshold ? Math.round(item.threshold * 1.5 - item.stock) : 0,
                            estimatedDepleteDate: new Date(Date.now() + (item.stock * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                          }));
                          
                          const headers = Object.keys(forecasting[0] || {}).join(',');
                          const rows = forecasting.map(item => Object.values(item).join(',')).join('\n');
                          const csvContent = `${headers}\n${rows}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `inventory_forecasting_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast.success("Inventory Forecasting Report downloaded!");
                        }
                      },
                      { 
                        title: 'Cost Analysis', 
                        desc: 'Breakdown of supply chain expenses', 
                        date: new Date().toISOString().split('T')[0],
                        icon: <PieChart className="h-6 w-6 text-red-600" />,
                        data: [
                          { category: 'Procurement', value: 45 },
                          { category: 'Transportation', value: 30 },
                          { category: 'Storage', value: 15 },
                          { category: 'Administrative', value: 10 }
                        ],
                        onClick: () => {
                          const costAnalysis = [
                            { category: 'Procurement', value: 45 },
                            { category: 'Transportation', value: 30 },
                            { category: 'Storage', value: 15 },
                            { category: 'Administrative', value: 10 }
                          ];
                          
                          const headers = Object.keys(costAnalysis[0] || {}).join(',');
                          const rows = costAnalysis.map(item => Object.values(item).join(',')).join('\n');
                          const csvContent = `${headers}\n${rows}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `cost_analysis_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast.success("Cost Analysis Report downloaded!");
                        }
                      },
                      { 
                        title: 'Procurement Cycle Report', 
                        desc: 'Order-to-delivery time performance', 
                        date: new Date().toISOString().split('T')[0],
                        icon: <Activity className="h-6 w-6 text-indigo-600" />,
                        data: orders.map(order => ({
                          id: order.id,
                          customer: order.customer,
                          orderDate: order.date,
                          status: order.status,
                          cycleTime: order.status === "Delivered" ? Math.floor(Math.random() * 10) + 2 : "N/A" // Simulated cycle time
                        })),
                        onClick: () => {
                          const cycleReport = orders.map(order => ({
                            id: order.id,
                            customer: order.customer,
                            orderDate: order.date,
                            status: order.status,
                            cycleTime: order.status === "Delivered" ? Math.floor(Math.random() * 10) + 2 : "N/A" // Simulated cycle time
                          }));
                          
                          const headers = Object.keys(cycleReport[0] || {}).join(',');
                          const rows = cycleReport.map(item => Object.values(item).join(',')).join('\n');
                          const csvContent = `${headers}\n${rows}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.setAttribute('href', url);
                          link.setAttribute('download', `procurement_cycle_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast.success("Procurement Cycle Report downloaded!");
                        }
                      }
                    ].map((report, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                        onClick={report.onClick}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            {report.icon}
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                              {report.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
                            <p className="text-xs text-gray-400 mt-2">Generated: {report.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "restock" && (
            <RestockRequests 
              useSupplierPayments={useSupplierPayments}
              addSupplierPayment={addSupplierPayment}
              inventory={inventory}
              setInventory={setInventory}
              searchTerm={restockSearchTerm}
              setSearchTerm={setRestockSearchTerm}
            />
          )}
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Supply_LogisticDashboard;
