import React, { useState, useEffect } from "react";
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
  Eye,
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
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
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [shipmentsError, setShipmentsError] = useState(null);
  const [statusOptions, setStatusOptions] = useState({});
  const [statusTypesLoading, setStatusTypesLoading] = useState(true);
  const [restockRequests, setRestockRequests] = useState([]);
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Add state variable for supplier price
  const [supplierPrice, setSupplierPrice] = useState("");
  const [supplierValue, setSupplierValue] = useState("");

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

  // Fetch inventory data from the API
  useEffect(() => {
    const fetchInventory = async () => {
      setInventoryLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/product/products"
        );
        if (response.data.success) {
          // Map the product data to match our frontend structure
          const mappedInventory = response.data.products.map((product) => ({
            name: product.name,
            stock: product.stock,
            threshold: product.threshold,
            status: getStockStatus(product.stock, product.threshold),
            supplier: getSupplierForProduct(product.category),
            restockRequested: false, // This would need to come from a restock request API
            paymentStatus: "Pending", // This would need to come from a payment API
            deliveryStatus: "Pending", // This would need to come from a delivery API
            _id: product._id, // Keep the MongoDB ID for reference
            sku: product.sku,
            category: product.category,
            price: product.price,
            image: product.image,
          }));

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

    // Update getSupplierForProduct function inside the fetchInventory useEffect
    const getSupplierForProduct = (category) => {
      const supplierMap = {
        // More specific mappings based on category
        "Cement": "Lanka Cement Ltd",
        "Steel": "Melwa Steel",
        "Bricks": "Clay Masters",
        "Sand": "Ceylon Aggregates",
        "Concrete": "Ready Mix Ltd",
        "Wood": "Timber Lanka",
        "PVC": "PVC Solutions",
        "Roofing": "Roof Masters",
        "Building Materials": "Jayasekara Suppliers",
        "Hardware": "Tool Masters",
        "Plumbing": "Water Systems Ltd",
        "Electrical": "Power Solutions",
        "Safety Gear": "Safety Plus",
        "Tools": "Premium Tools Ltd",
        "Paint": "Color World",
        "Glass": "Crystal Glass"
      };

      // Find supplier from available suppliers list if possible
      const matchingSupplier = suppliers.find(supplier => 
        supplier.category && category && 
        (supplier.category.toLowerCase().includes(category.toLowerCase()) || 
         category.toLowerCase().includes(supplier.category.toLowerCase()))
      );

      if (matchingSupplier) {
        return matchingSupplier.name;
      }

      return supplierMap[category] || "General Supplier";
    };

    fetchInventory();
  }, []);

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
        const response = await axios.get('http://localhost:5000/api/orders?all=true');
        
        if (response.data && response.data.success) {
          const apiOrders = response.data.orders;
          console.log('Successfully loaded orders from API:', apiOrders.length);
          
          // Map API orders to the format expected by the UI
          const formattedOrders = apiOrders.map(order => ({
            id: order._id,
            orderNumber: order._id.toString().substring(0, 6), // Generate a short ID if needed
            customer: order.customer?.name || 'Unknown Customer',
            items: Array.isArray(order.items) ? order.items.length : 0,
            value: order.totalAmount || 0,
            status: mapOrderStatus(order.orderStatus), // Use your existing mapping function
            date: new Date(order.orderDate || order.createdAt).toISOString().split('T')[0],
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
        // Try to fetch from real API first
        try {
          const response = await axios.get('http://localhost:5000/api/shipping/active');
          if (response.data && Array.isArray(response.data)) {
            setActiveShipments(response.data);
            setShipmentsError(null);
            return; // If successful, exit early
          }
        } catch (apiError) {
          console.log('API fetch failed, using order-based shipments:', apiError);
          // Continue to fallback approach if API fails
        }

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
        setShipmentsError(null);
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
          const response = await axios.get('http://localhost:5000/api/restock/status-types');
          
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
      `http://localhost:5000/api/orders/${orderId}/status`, 
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
      // await axios.patch(`http://localhost:5000/api/shipments/${shipmentId}`, {
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
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.supplier &&
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (inventoryFilter !== "all") {
      filtered = filtered.filter((item) => item.status === inventoryFilter);
    }

    return filtered;
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

      // Find the specific supplier for this product based on productId
      const productSupplier = suppliers.find(sup => sup.productId === product._id);
      
      if (!productSupplier) {
        toast.error(`No supplier found for ${itemName}. Please add a supplier first.`);
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

      const newRequest = await restockService.createRequest(restockData);
      
      // Add to restock requests list
      setRestockRequests(prevRequests => [...prevRequests, newRequest]);
      
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

  // Helper: Disallow starting with special character or space
  const startsWithSpecialOrSpace = (str) => /^[^a-zA-Z0-9]/.test(str);

  const validateSupplierForm = () => {
    const errors = {};
    // Supplier Name
    if (!supplierName.trim()) {
      errors.supplierName = "Supplier name is required";
    } else if (supplierName.trim().length < 2) {
      errors.supplierName = "Supplier name must be at least 2 characters";
    } else if (supplierName.trim().length > 100) {
      errors.supplierName = "Supplier name cannot exceed 100 characters";
    } else if (startsWithSpecialOrSpace(supplierName.trim())) {
      errors.supplierName = "Supplier name cannot start with a special character or space";
    } else if (forbiddenNameChars.test(supplierName)) {
      errors.supplierName = "Supplier name cannot contain special characters like #, $, @, %, etc.";
    } else if (hasSqlKeyword(supplierName)) {
      errors.supplierName = "Supplier name contains prohibited terms";
    }
    
    // Product
    if (!selectedProduct) {
      errors.selectedProduct = "Please select a product";
    }
    
    // Category
    if (supplierCategory && supplierCategory.length > 50) {
      errors.supplierCategory = "Category cannot exceed 50 characters";
    } else if (startsWithSpecialOrSpace(supplierCategory.trim())) {
      errors.supplierCategory = "Category cannot start with a special character or space";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(supplierCategory)) {
      errors.supplierCategory = "Category should contain only letters, numbers, and spaces";
    }
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
    } else if (startsWithSpecialOrSpace(supplierContact.trim())) {
      errors.supplierContact = "Contact name cannot start with a special character or space";
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

  // Rendering the orders table component
  const renderOrdersTable = () => {
    if (ordersLoading) {
      return <div className="loading-spinner">Loading orders...</div>;
    }
    
    if (ordersError) {
      return <div className="error-message">{ordersError}</div>;
    }
    
    return (
      <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{order.id.substring(0, 8)}...</td>
                <td className="px-4 py-3 whitespace-nowrap">{order.customer}</td>
                <td className="px-4 py-3 whitespace-nowrap">{order.items}</td>
                <td className="px-4 py-3 whitespace-nowrap">Rs. {order.value.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'Pending' ? 'bg-gray-100 text-gray-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{order.date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedOrderForShipment(order);
                      setActiveTab("shipments");
                    }}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <Truck className="mr-1 h-4 w-4" /> 
                    Arrange Shipment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Add a function to render the shipments table/list
  const renderShipments = () => {
    if (shipmentsLoading) {
      return (
        <div className="flex justify-center p-6">
          <Loader className="animate-spin" size={24} />
        </div>
      );
    }

    if (shipmentsError) {
      return (
        <div className="text-center p-6 text-red-500">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
          <p>{shipmentsError}</p>
        </div>
      );
    }

    if (activeShipments.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          <Package className="h-10 w-10 mx-auto mb-2" />
          <p>No active shipments found</p>
        </div>
      );
    }

    // Define the possible status transitions for each status
    const statusTransitions = {
      Pending: ["Processing", "Cancelled"],
      Preparing: ["Loading", "In Transit", "Cancelled"],
      Loading: ["In Transit", "Delayed", "Cancelled"],
      "In Transit": ["Out for Delivery", "Delayed", "Failed Delivery"],
      "Out for Delivery": ["Delivered", "Failed Delivery", "Delayed"],
      Delayed: ["In Transit", "Out for Delivery", "Cancelled"],
      "Failed Delivery": ["Preparing", "In Transit", "Cancelled"],
      Delivered: [], // No more transitions possible
      Cancelled: ["Preparing"], // Can restart the process
    };

    // Define the progress value for each status
    const statusProgress = {
      Preparing: 10,
      Loading: 25,
      "In Transit": 50,
      Delayed: 50,
      "Out for Delivery": 75,
      "Failed Delivery": 10,
      Delivered: 100,
      Cancelled: 0,
    };

    // Define status colors
    const statusColors = {
      Preparing: "bg-amber-100 text-amber-600",
      Loading: "bg-amber-100 text-amber-600",
      "In Transit": "bg-blue-100 text-blue-600",
      "Out for Delivery": "bg-purple-100 text-purple-600",
      Delayed: "bg-orange-100 text-orange-600",
      "Failed Delivery": "bg-red-100 text-red-600",
      Delivered: "bg-green-100 text-green-600",
      Cancelled: "bg-gray-100 text-gray-600",
    };

    return (
      <div className="space-y-4">
        {activeShipments.map((shipment) => (
          <div
            key={shipment.id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-800">
                  {shipment.id}
                </h4>
                <p className="text-sm text-gray-600">
                  Order: {shipment.orderId}
                </p>
                <p className="text-sm text-gray-600">From: {shipment.origin}</p>
                <p className="text-sm text-gray-600">
                  To: {shipment.destination}
                </p>
                <p className="text-sm text-gray-600">ETA: {shipment.eta}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    statusColors[shipment.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {shipment.status}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    shipment.status === "Delivered"
                      ? "bg-green-600"
                      : shipment.status === "Failed Delivery"
                      ? "bg-red-600"
                      : shipment.status === "Delayed"
                      ? "bg-orange-600"
                      : shipment.status === "Cancelled"
                      ? "bg-gray-600"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${shipment.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-right mt-1 text-gray-500">
                {shipment.progress}% complete
              </div>
            </div>

            {/* Status update dropdown */}
            <div className="mt-4 flex justify-end">
              {!statusTypesLoading && statusOptions[shipment.status]?.length > 0 && (
                <div className="relative inline-block text-left">
                  <select
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        updateShipmentStatus(
                          shipment.id,
                          e.target.value,
                          statusProgress[e.target.value] || 50 // Fallback progress if not defined
                        );
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {statusTypesLoading ? "Loading..." : "Update status..."}
                    </option>
                    {statusOptions[shipment.status]?.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Move renderOrdersCards INSIDE the component function - place this before the return statement
  const renderOrdersCards = () => {
    if (ordersLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      );
    }
    
    if (ordersError) {
      return (
        <div className="bg-red-50 p-6 rounded-lg text-red-700 border border-red-200 flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Unable to load orders</h3>
            <p className="text-sm">{ordersError}</p>
            <button className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors">
              Retry
            </button>
          </div>
        </div>
      );
    }
    
    // Divide orders into pending and others
    const pendingOrders = orders.filter(order => order.status === 'Pending');
    const otherOrders = orders.filter(order => order.status !== 'Pending');
    
    return (
      <div className="space-y-10">
        {/* Pending Orders Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ClockIcon className="mr-2 h-5 w-5 text-amber-500" />
            Pending Orders ({pendingOrders.length})
          </h4>
          
          {pendingOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No pending orders</h3>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">All orders have been processed or are in transit. New orders will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md border border-amber-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute top-0 right-0 mt-4 mr-4">
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="font-medium text-gray-900">{order.id.substring(0, 8)}...</p>
                      </div>
                      <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    
                    <div className="mb-5 pb-5 border-b border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Customer</p>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Items</p>
                        <p className="font-medium text-lg">{order.items}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Value</p>
                        <p className="font-medium text-lg text-indigo-700">Rs. {order.value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Order Date</p>
                        <p className="font-medium">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                        <p className="font-medium">7-10 days</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <button
                        onClick={() => {
                          setSelectedOrderForShipment(order);
                          setActiveTab("shipments");
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-2.5 px-4 rounded-lg flex items-center justify-center font-medium shadow-sm transition-colors group-hover:shadow-md"
                      >
                        <Truck className="mr-2 h-5 w-5" />
                        Arrange Shipment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Orders In Progress Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-500" />
            In Progress ({otherOrders.length})
          </h4>
          
          {otherOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No orders in progress</h3>
              <p className="text-gray-500 mt-1">When orders are being processed, they will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-500">#{order.id.substring(0, 8)}...</span>
                        <h3 className="font-semibold text-gray-900 mt-1">{order.customer}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm">
                      <div>
                        <p className="text-gray-500">Value</p>
                        <p className="font-medium text-gray-900">Rs. {order.value.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Items</p>
                        <p className="font-medium text-gray-900">{order.items}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Order Progress</span>
                        <span>
                          {order.status === 'Processing' ? '25%' : 
                          order.status === 'In Transit' ? '75%' : 
                          order.status === 'Delivered' ? '100%' : '10%'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            order.status === 'Processing' ? 'bg-yellow-500' : 
                            order.status === 'In Transit' ? 'bg-blue-500' : 
                            order.status === 'Delivered' ? 'bg-green-500' : 
                            'bg-gray-500'
                          }`}
                          style={{ 
                            width: order.status === 'Processing' ? '25%' : 
                                   order.status === 'In Transit' ? '75%' : 
                                   order.status === 'Delivered' ? '100%' : '10%'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <Calendar className="inline h-3 w-3 mr-1" /> {order.date}
                      </div>
                      
                      {order.status !== 'Delivered' && (
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Track Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Show success message
              toast.success('Logged out successfully');
              
              // Redirect to login page
              window.location.href = '/login';
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
                {activeTab === "orders" && null}
                {activeTab === "suppliers" && null}
                {activeTab === "reports" && "Reports & Analytics"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>

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
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
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
          {/* Supplier Management Gradient Header */}
          {activeTab === "suppliers" && (
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-3xl font-bold text-white">Supplier Management</h2>
              <p className="text-blue-100 mt-1">Manage your suppliers, add new ones, and keep your supply chain strong</p>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Add gradient header for Order Management - similar to Supplier Management */}
              <div className="bg-gradient-to-r from-indigo-700 to-purple-900 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-white">Order Management</h2>
                <p className="text-indigo-100 mt-1">Track orders, arrange shipments, and manage your fulfillment workflow</p>
              </div>
              
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

              {/* Orders stats with enhanced design */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Orders
                      </p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {orders.length}
                      </h3>
                      <p className="text-xs text-indigo-600 mt-2">
                        {Math.floor(Math.random() * 20)}% increase from last month
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center">
                      <ShoppingCart className="h-7 w-7 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Delivered Orders
                      </p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter((order) => order.status === "Delivered")
                            .length
                        }
                      </h3>
                      <p className="text-xs text-green-600 mt-2">
                        {Math.floor(Math.random() * 20)}% increase from last month
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        In Transit Orders
                      </p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter(
                            (order) => order.status === "In Transit"
                          ).length
                        }
                      </h3>
                      <p className="text-xs text-blue-600 mt-2">
                        {Math.floor(Math.random() * 20)}% increase from last month
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pending Orders
                      </p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter(
                            (order) => order.status === "Pending"
                          ).length
                        }
                      </h3>
                      <p className="text-xs text-amber-600 mt-2">
                        {Math.floor(Math.random() * 20)}% increase from last week
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
                      <ClockIcon className="h-7 w-7 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Content Section - Redesigned */}
              <div className="bg-white p-0 rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <Package className="mr-2 h-5 w-5 text-indigo-600" />
                        Order List
                      </h3>
                      <span className="px-2.5 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        {orders.length} total
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search orders..."
                          className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                      </div>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setOrdersLoading(true);
                          axios
                            .get("http://localhost:5000/api/orders?all=true")
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
                        <RefreshCw className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => {
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
                        <Download className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Order Tabs */}
                  <div className="px-6 flex space-x-4 border-b border-gray-200">
                    <button className="px-1 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                      All Orders
                    </button>
                    <button className="px-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                      Pending
                    </button>
                    <button className="px-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                      In Transit
                    </button>
                    <button className="px-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                      Delivered
                    </button>
                  </div>
                </div>
                {/* Leave the renderOrdersCards function call as is, but update the function definition elsewhere */}
                <div className="p-6">
                  {renderOrdersCards()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Inventory Filter Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <select
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      value={inventoryFilter}
                      onChange={(e) => setInventoryFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <Filter className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      const csvContent =
                        "data:text/csv;charset=utf-8," +
                        "Item,Stock,Threshold,Status,Supplier,Payment Status,Delivery Status\n" +
                        getFilteredInventory()
                          .map(
                            (item) =>
                              `"${item.name}",${item.stock},${item.threshold},"${item.status}","${item.supplier}","${item.paymentStatus}","${item.deliveryStatus}"`
                          )
                          .join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "inventory_report.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

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
                                      <AlertCircle className="h-5 w-5 text-green-500" />
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
                                    className="mt-2 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded inline-flex items-center"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Request Restock
                                  </button>
                                )}
                                {item.restockRequested && (
                                  <div className="mt-2 text-xs text-green-600 inline-flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Restock Requested
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-700 font-medium">
                                    {item.supplier?.charAt(0) || 'S'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{item.supplier}</div>
                                    <div className="text-xs text-gray-500">
                                      {item.leadTime ? `${item.leadTime} days lead time` : 'Standard delivery'}
                                    </div>
                                  </div>
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

          {activeTab === "suppliers" && (
            <div className="space-y-6">
              {/* Show error messages if any */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p>{error}</p>
                </div>
              )}

              {/* Add Supplier Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Supplier Management
                </h2>
                <button
                  onClick={() => setShowSupplierForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Add New Supplier"}
                </button>
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
                                    
                                    // Real-time validation for special characters
                                    if (/^[^a-zA-Z0-9]/.test(value)) {
                                      setValidationErrors(prev => ({ ...prev, supplierName: 'Supplier name cannot start with a special character or space' }));
                                    } else if (/[#$@%\^*!_~`\[\]{}:;"'<>?/\\|]/.test(value)) {
                                      setValidationErrors(prev => ({ ...prev, supplierName: 'Supplier name cannot contain special characters like #, $, @, %, etc.' }));
                                    } else if (validationErrors.supplierName && 
                                      (validationErrors.supplierName === 'Supplier name cannot start with a special character or space' ||
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
                                {supplierName.trim() && !validationErrors.supplierName && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
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
                                {selectedProduct && !validationErrors.selectedProduct && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
                              </div>
                              {validationErrors.selectedProduct && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.selectedProduct}</p>
                              )}
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
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierPrice 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="Enter purchase price"
                                  required
                                />
                                {supplierPrice && parseFloat(supplierPrice) > 0 && !validationErrors.supplierPrice && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
                              </div>
                              {validationErrors.supplierPrice && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierPrice}</p>
                              )}
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
                            
                            {/* Add Notes field here to ensure important information can still be captured */}
                            <div className="md:col-span-2">
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
                                {supplierContact.trim() && !validationErrors.supplierContact && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
                              </div>
                              {validationErrors.supplierContact && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierContact}</p>
                              )}
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
                                {supplierEmail.trim() && !validationErrors.supplierEmail && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
                              </div>
                              {validationErrors.supplierEmail && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierEmail}</p>
                              )}
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
                                    setSupplierPhone(e.target.value);
                                    if (validationErrors.supplierPhone) {
                                      setValidationErrors({
                                        ...validationErrors,
                                        supplierPhone: null
                                      });
                                    }
                                  }}
                                  className={`w-full px-3 py-2 bg-gray-50 border ${
                                    validationErrors.supplierPhone 
                                      ? "border-red-500 focus:ring-red-500" 
                                      : "border-gray-300 focus:ring-blue-500"
                                  } rounded-md focus:outline-none focus:ring-2 focus:bg-white`}
                                  placeholder="+94XXXXXXXXX or 07XXXXXXXX"
                                />
                                {supplierPhone.trim() && !validationErrors.supplierPhone && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
                              </div>
                              {validationErrors.supplierPhone && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.supplierPhone}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={supplierCity}
                                onChange={(e) => setSupplierCity(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="City"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              value={supplierAddress}
                              onChange={(e) => setSupplierAddress(e.target.value)}
                              rows="2"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                              placeholder="Street address"
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
                            supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (supplier.category && supplier.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
                        ).length > 0 ? (
                          suppliers
                            .filter(
                              (supplier) =>
                                supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (supplier.category && supplier.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
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
                )}
                
                {!isLoading && !error && suppliers.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                    Showing {suppliers.filter(
                      (supplier) =>
                        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (supplier.category && supplier.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).length} of {suppliers.length} suppliers
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Reports Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Reports & Analytics
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Filter className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <MoreHorizontal className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">{/* Add report content here */}</div>
              </div>
            </div>
          )}

          {activeTab === "restock" && (
            <RestockRequests 
              useSupplierPayments={useSupplierPayments}
              addSupplierPayment={addSupplierPayment}
              inventory={inventory}
              setInventory={setInventory}
            />
          )}
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Supply_LogisticDashboard;
