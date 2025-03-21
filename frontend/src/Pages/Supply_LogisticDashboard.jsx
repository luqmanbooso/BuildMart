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

// Mock data for the dashboard
const inventoryData = [
  {
    name: "Cement",
    stock: 452,
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
  const [supplierValue, setSupplierValue] = useState("");
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
  const [restockRequests, setRestockRequests] = useState([]);
  const [restockLoading, setRestockLoading] = useState(true);
  const [restockError, setRestockError] = useState(null);
  const [showRestockPaymentModal, setShowRestockPaymentModal] = useState(false);
  const [selectedRestockRequest, setSelectedRestockRequest] = useState(null);

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

    // Helper function to assign supplier based on category (in a real app, this would be from database relation)
    const getSupplierForProduct = (category) => {
      const supplierMap = {
        Cement: "Lanka Cement Ltd",
        Steel: "Melwa Steel",
        Bricks: "Clay Masters",
        Sand: "Ceylon Aggregates",
        Concrete: "Ready Mix Ltd",
        Wood: "Timber Lanka",
        PVC: "PVC Solutions",
        Roofing: "Roof Masters",
        "Building Materials": "Jayasekara Suppliers",
        Hardware: "Tool Masters",
        Plumbing: "Water Systems Ltd",
        Electrical: "Power Solutions",
      };

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
      setOrdersLoading(true);
      try {
        console.log(
          "Fetching orders from:",
          "http://localhost:5000/api/orders"
        );

        const response = await axios.get("http://localhost:5000/api/orders");
        console.log("API Response:", response.data);

        if (response.data && response.data.success) {
          // Transform the backend data to match our frontend structure
          const transformedOrders = response.data.orders.map((order) => ({
            id: order._id,
            customer: order.customer?.name || "Unknown Customer",
            items: order.items?.length || 0,
            value: order.totalAmount || 0,
            status: mapOrderStatus(order.orderStatus || "placed"),
            paymentStatus: order.paymentDetails?.transactionId
              ? "Completed"
              : "Pending",
            date: new Date(order.orderDate || Date.now())
              .toISOString()
              .split("T")[0],
            shippingAddress: order.shippingAddress || {},
            rawOrder: order, // Keep the raw data for reference
          }));

          console.log("Transformed Orders:", transformedOrders);
          setOrders(transformedOrders);
          setOrdersError(null);
        } else {
          console.error("API returned unsuccessful response:", response.data);
          setOrdersError("Failed to fetch orders data");
          toast.error("Could not load orders. Using sample data instead.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError(
          `Failed to connect to the orders server: ${error.message}`
        );
        toast.error("Could not load orders. Using sample data instead.");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch shipments from the backend (add this useEffect)
  useEffect(() => {
    const fetchShipments = async () => {
      setShipmentsLoading(true);
      try {
        // In a real implementation, you'd fetch from a shipments API
        // const response = await axios.get('http://localhost:5000/api/shipments');
        // setActiveShipments(response.data.shipments);

        // For now, use demo data or extract shipment info from orders
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

  // Fetch restock requests
  useEffect(() => {
    const fetchRestockRequests = async () => {
      setRestockLoading(true);
      try {
        const data = await restockService.getAllRequests();
        setRestockRequests(data);
        setRestockError(null);
      } catch (error) {
        console.error("Error fetching restock requests:", error);
        setRestockError("Failed to load restock requests");
      } finally {
        setRestockLoading(false);
      }
    };

    fetchRestockRequests();
  }, []);

  // Map backend order status to frontend display status
  const mapOrderStatus = (status) => {
    const statusMap = {
      placed: "Pending",
      processing: "Processing",
      shipped: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  // Create shipment from order
  const createShipmentFromOrder = async (order) => {
    try {
      const newShipment = {
        id: `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
        origin: "Colombo Warehouse",
        destination: `${order.shippingAddress?.city || "Customer"} Site`,
        driver: "Assigned Driver",
        vehicle: "Pending Assignment",
        status: "Preparing",
        progress: 10,
        eta: "24 hours",
        orderId: order.id,
        createdAt: new Date().toISOString(),
      };

      // Add to active shipments
      setActiveShipments((prev) => [...prev, newShipment]);

      // Update order status
      const updatedOrders = orders.map((o) => {
        if (o.id === order.id) {
          return { ...o, status: "Processing" };
        }
        return o;
      });
      setOrders(updatedOrders);

      // Make API call to update the order status
      await updateOrderStatus(order.id, "processing");

      // In a real app, you would create a shipment record in the backend
      // await axios.post('http://localhost:5000/api/shipments', newShipment);

      toast.success(`Shipment ${newShipment.id} created for order ${order.id}`);
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Failed to create shipment");
    }
  };

  // Update order status via API call
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
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

  // Handle restock request
  const handleRestockRequest = async (itemName) => {
    try {
      const product = inventory.find((item) => item.name === itemName);
      if (!product) return;

      // Find matching supplier for this product category
      const matchingSuppliers = suppliers.filter(
        s => s.category === product.category || 
             (s.productCategories && s.productCategories.includes(product.category))
      );
      
      const supplierToUse = matchingSuppliers.length > 0 ? matchingSuppliers[0] : null;

      // Update UI optimistically
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.name === itemName ? { ...item, restockRequested: true } : item
        )
      );

      // Send request to backend
      const restockData = {
        productId: product._id,
        productName: product.name,
        quantity: product.threshold - product.stock + 10, // Order enough to be above threshold plus buffer
        priority:
          product.stock === 0
            ? "urgent"
            : product.stock < product.threshold / 2
            ? "high"
            : "medium",
        supplierId: supplierToUse?._id,
        supplierName: supplierToUse?.name || "Not assigned",
        notes: `Automatic restock request for ${product.name}`,
      };

      const newRequest = await restockService.createRequest(restockData);
      
      // Add to restock requests list
      setRestockRequests(prev => [newRequest, ...prev]);

      toast.success(`Restock request for ${itemName} sent successfully`);
    } catch (error) {
      console.error("Error submitting restock request:", error);

      // Revert optimistic update
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.name === itemName ? { ...item, restockRequested: false } : item
        )
      );

      toast.error(`Failed to send restock request for ${itemName}`);
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

  // Supplier management functions
  const handleAddSupplier = async () => {
    try {
      setIsLoading(true);
      const newSupplier = {
        name: supplierName,
        value: parseInt(supplierValue) || 0,
        contact: supplierContact,
        email: supplierEmail,
        address: supplierAddress,
        category: supplierCategory,
        phone: supplierPhone,
        city: supplierCity,
        country: supplierCountry,
        website: supplierWebsite,
        paymentTerms: paymentTerms,
        leadTime: leadTime,
        notes: supplierNotes,
      };

      const createdSupplier = await supplierService.createSupplier(newSupplier);
      setSuppliers([...suppliers, createdSupplier]);
      resetForm();
      setError(null);
    } catch (error) {
      setError("Failed to add supplier. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSupplier = async () => {
    if (!currentSupplier || !currentSupplier.id) {
      setError("Cannot update: Missing supplier ID");
      return;
    }

    try {
      setIsLoading(true);
      const updatedSupplierData = {
        name: supplierName,
        value: parseInt(supplierValue) || 0,
        contact: supplierContact,
        email: supplierEmail,
        address: supplierAddress,
        category: supplierCategory,
        phone: supplierPhone,
        city: supplierCity,
        country: supplierCountry,
        website: supplierWebsite,
        paymentTerms: paymentTerms,
        leadTime: parseInt(leadTime) || 0,
        notes: supplierNotes,
      };

      const updatedSupplier = await supplierService.updateSupplier(
        currentSupplier.id,
        updatedSupplierData
      );

      setSuppliers(
        suppliers.map((supplier) =>
          supplier._id === currentSupplier.id
            ? { ...supplier, ...updatedSupplierData }
            : supplier
        )
      );

      toast.success("Supplier updated successfully");
      resetForm();
      setError(null);
    } catch (error) {
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
        setSuppliers(suppliers.filter((supplier) => supplier._id !== supplierId));
        toast.success("Supplier deleted successfully");
        setError(null);
      } catch (error) {
        console.error("Delete supplier error:", error);
        setError(`Failed to delete supplier: ${error.message || 'Server error'}`);
        toast.error(`Failed to delete supplier: ${error.message || 'Server error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const editSupplier = (supplier) => {
    setCurrentSupplier({
      id: supplier._id, // Make sure we're using the MongoDB _id
      ...supplier
    });
    setSupplierName(supplier.name || "");
    setSupplierContact(supplier.contact || "");
    setSupplierEmail(supplier.email || "");
    setSupplierAddress(supplier.address || "");
    setSupplierPhone(supplier.phone || "");
    setSupplierCity(supplier.city || "");
    setSupplierCountry(supplier.country || "");
    setSupplierCategory(supplier.category || "");
    setSupplierValue(supplier.value?.toString() || "");
    setSupplierWebsite(supplier.website || "");
    setPaymentTerms(supplier.paymentTerms || "");
    setLeadTime(supplier.leadTime?.toString() || "");
    setSupplierNotes(supplier.notes || "");
    setShowSupplierForm(true);
  };

  const resetForm = () => {
    setCurrentSupplier(null);
    setSupplierName("");
    setSupplierContact("");
    setSupplierEmail("");
    setSupplierAddress("");
    setSupplierPhone("");
    setSupplierCity("");
    setSupplierCountry("");
    setSupplierCategory("");
    setSupplierValue("");
    setSupplierWebsite("");
    setPaymentTerms("");
    setLeadTime("");
    setSupplierNotes("");
    setShowSupplierForm(false);
  };

  // Add function to update restock status
  const updateRestockStatus = async (requestId, newStatus) => {
    try {
      setRestockLoading(true);
      
      // Call API to update status
      const updatedRequest = await restockService.updateStatus(requestId, newStatus);
      
      // Find the existing request to get product info
      const request = restockRequests.find(req => req._id === requestId);
      
      // Update the restock requests state
      setRestockRequests(prev => 
        prev.map(req => req._id === requestId ? {
          ...req,
          status: newStatus,
          updatedAt: new Date().toISOString()
        } : req)
      );
      
      // Special handling for delivered status - update inventory
      if (newStatus === 'delivered' && request) {
        setInventory(prev => 
          prev.map(item => 
            item._id === request.productId ? 
            {
              ...item,
              stock: item.stock + request.quantity,
              status: getStockStatus(item.stock + request.quantity, item.threshold),
              deliveryStatus: "Delivered"
            } : item
          )
        );
      }
      
      toast.success(`Request status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating restock status:", error);
      toast.error("Failed to update restock status");
    } finally {
      setRestockLoading(false);
    }
  };

  // Add function to process payment to supplier
  const processRestockPayment = async (requestId, paymentDetails) => {
    try {
      setRestockLoading(true);
      const updatedRequest = await restockService.processPayment(requestId, paymentDetails);
      
      setRestockRequests(prev => 
        prev.map(req => req._id === requestId ? {
          ...req,
          paymentStatus: 'paid',
          paymentDetails
        } : req)
      );
      
      // Update inventory payment status
      const request = restockRequests.find(req => req._id === requestId);
      if (request) {
        setInventory(prev => 
          prev.map(item => 
            item._id === request.productId ? 
            {
              ...item,
              paymentStatus: "Paid"
            } : item
          )
        );
        
        // Add payment to supplier payment records if we're using context
        if (typeof addSupplierPayment === 'function') {
          addSupplierPayment({
            id: paymentDetails.transactionId,
            amount: paymentDetails.amount,
            supplier: request.supplierName,
            supplierId: request.supplierId,
            date: paymentDetails.paymentDate || new Date().toISOString(),
            product: request.productName,
            requestId: request._id
          });
        }
        
        // Update the payment status in the frontend immediately
        // This gives the user immediate feedback that their payment was processed
        const updatedRequests = restockRequests.map(req => 
          req._id === requestId ? {
            ...req,
            paymentStatus: 'paid',
            paymentDetails: {
              ...paymentDetails,
              processedDate: new Date().toISOString()
            }
          } : req
        );
        
        setRestockRequests(updatedRequests);
      }
      
      toast.success(`Payment of Rs. ${paymentDetails.amount.toLocaleString()} to ${request?.supplierName} processed successfully`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment: " + (error.message || "Server error"));
    } finally {
      setRestockLoading(false);
      setShowRestockPaymentModal(false);
    }
  };

  // Helper function to determine stock status
  const getStockStatus = (stock, threshold) => {
    if (stock <= 0) return "Critical";
    if (stock < threshold) return "Low Stock";
    return "In Stock";
  };

  // Add function to get status update options for restock requests
  const getStatusUpdateOptions = (currentStatus) => {
    switch(currentStatus) {
      case 'requested':
        return (
          <>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </>
        );
      case 'approved':
        return (
          <>
            <option value="ordered">Ordered</option>
            <option value="cancelled">Cancelled</option>
          </>
        );
      case 'ordered':
        return (
          <>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </>
        );
      case 'shipped':
        return (
          <>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </>
        );
      default:
        return null;
    }
  };

  // Add function to handle successful payment
  const handleRestockPaymentSuccess = (paymentDetails) => {
    if (selectedRestockRequest) {
      const processedPayment = {
        paymentMethod: paymentDetails.method || 'Credit Card',
        amount: paymentDetails.amount,
        transactionId: paymentDetails.transactionId || `PAY-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        supplierName: selectedRestockRequest.supplierName,
        supplierId: selectedRestockRequest.supplierId,
        productName: selectedRestockRequest.productName,
        requestId: selectedRestockRequest._id
      };
      
      // Process the payment
      processRestockPayment(selectedRestockRequest._id, processedPayment);
      
      // Add to supplier payments context if available
      if (typeof addSupplierPayment === 'function') {
        addSupplierPayment({
          ...processedPayment,
          id: processedPayment.transactionId
        });
      }
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

  // Rendering the orders table component
  const renderOrdersTable = () => {
    if (ordersLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="ml-2 text-gray-600">Loading orders data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-800">
                  {order.id}
                </h4>
                <p className="text-sm text-gray-600">
                  Customer: {order.customer}
                </p>
                <p className="text-sm text-gray-600">Items: {order.items}</p>
                <p className="text-sm text-gray-600">
                  Value: Rs. {order.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Date: {order.date}</p>
                {order.shippingAddress && (
                  <p className="text-sm text-gray-600 mt-1">
                    Ship to: {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-600"
                        : order.status === "In Transit"
                        ? "bg-blue-100 text-blue-600"
                        : order.status === "Processing"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.status === "Delivered" &&
                    (order.paymentStatus === "Completed" ? (
                      <span className="flex items-center text-sm font-medium text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Payment Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentModal(true);
                        }}
                        className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        <span>Process Payment</span>
                      </button>
                    ))}
                </div>
                {order.paymentStatus === "Completed" && (
                  <p className="text-xs text-gray-500">
                    Paid on {new Date().toLocaleDateString()}
                  </p>
                )}
                {order.status === "Pending" && (
                  <button
                    onClick={() => createShipmentFromOrder(order)}
                    className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Shipment
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
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
              {statusTransitions[shipment.status]?.length > 0 && (
                <div className="relative inline-block text-left">
                  <select
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        updateShipmentStatus(
                          shipment.id,
                          e.target.value,
                          statusProgress[e.target.value]
                        );
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Update status...
                    </option>
                    {statusTransitions[shipment.status].map((status) => (
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

            <div className="border-t border-blue-800 my-4"></div>

            <button
              onClick={() => {
                /* Add settings functionality */
              }}
              className="flex items-center px-4 py-2.5 w-full text-left text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-blue-800">
          <button
            className="flex items-center px-4 py-2 w-full text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            onClick={() => {
              /* Add logout functionality */
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
                {activeTab === "suppliers" && "Supplier Directory"}
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
                  <span className="text-sm font-medium text-gray-700">
                    Sakith A.
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <div className="border-t border-gray-200 my-1"></div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Inventory
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {inventoryLoading ? (
                          <Loader className="h-6 w-6 text-blue-600 animate-spin" />
                        ) : (
                          `${inventory.length} Items`
                        )}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Box className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 font-medium">↑ 12% </span>
                      <span className="ml-1 text-gray-600">
                        from last month
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Low Stock Alerts
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {inventoryLoading ? (
                          <Loader className="h-6 w-6 text-amber-600 animate-spin" />
                        ) : (
                          `${
                            inventory.filter(
                              (item) =>
                                item.status === "Low Stock" ||
                                item.status === "Critical"
                            ).length
                          } Items`
                        )}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <span className="text-red-600 font-medium">↑ 3 </span>
                      <span className="ml-1 text-gray-600">
                        items since yesterday
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Inventory Value
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        Rs.{" "}
                        {inventory
                          .reduce(
                            (total, item) =>
                              total +
                              item.stock *
                                (item.name === "Sand (cubic m)" ? 7500 : 2500),
                            0
                          )
                          .toLocaleString()}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 font-medium">
                        ↑ 8.5%{" "}
                      </span>
                      <span className="ml-1 text-gray-600">
                        from previous quarter
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pending Orders
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter(
                            (order) =>
                              order.status === "Pending" ||
                              order.status === "Processing"
                          ).length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 font-medium">↓ 2 </span>
                      <span className="ml-1 text-gray-600">
                        orders since yesterday
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Shipments */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Active Shipments
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
                <div className="space-y-4">
                  {activeShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-800">
                            {shipment.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {shipment.origin} to {shipment.destination}
                          </p>
                          <p className="text-sm text-gray-600">
                            Driver: {shipment.driver}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vehicle: {shipment.vehicle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-medium ${
                              shipment.status === "In Transit"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          >
                            {shipment.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {shipment.eta}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              shipment.status === "In Transit"
                                ? "bg-blue-600"
                                : "bg-gray-600"
                            }`}
                            style={{ width: `${shipment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
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

              {/* Inventory Table */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                {inventoryLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="ml-2 text-gray-600">
                      Loading inventory data...
                    </p>
                  </div>
                ) : inventoryError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <p>{inventoryError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Item
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Stock
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Threshold
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Status
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Supplier
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Restock Request
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Payment Status
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Delivery Status
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredInventory().length > 0 ? (
                        getFilteredInventory().map((item) => (
                          <tr key={item._id || item.name}>
                            <td className="px-4 py-2 border-b border-gray-200">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                SKU: {item.sku}
                              </div>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              {item.stock}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              {item.threshold}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === "In Stock"
                                    ? "bg-green-100 text-green-600"
                                    : item.status === "Low Stock"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              {item.supplier}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              {item.restockRequested ? (
                                <span className="text-sm text-green-600">
                                  Requested
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleRestockRequest(item.name)
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  disabled={item.status === "In Stock"}
                                >
                                  Request Restock
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              <span
                                className={`text-sm font-medium ${
                                  item.paymentStatus === "Paid"
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {item.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              <span
                                className={`text-sm font-medium ${
                                  item.deliveryStatus === "Delivered"
                                    ? "text-green-600"
                                    : item.deliveryStatus === "In Transit"
                                    ? "text-blue-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {item.deliveryStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handlePaymentStatusUpdate(item.name, "Paid")
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  disabled={item.paymentStatus === "Paid"}
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeliveryStatusUpdate(
                                      item.name,
                                      "Delivered"
                                    )
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  disabled={item.deliveryStatus === "Delivered"}
                                >
                                  Mark Delivered
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="px-4 py-10 text-center text-gray-500"
                          >
                            No inventory items found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "shipments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Shipments
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {activeShipments.length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        In Transit
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          activeShipments.filter(
                            (s) =>
                              s.status === "In Transit" ||
                              s.status === "Out for Delivery"
                          ).length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Delivered
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          activeShipments.filter(
                            (s) => s.status === "Delivered"
                          ).length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Delayed/Failed
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          activeShipments.filter(
                            (s) =>
                              s.status === "Delayed" ||
                              s.status === "Failed Delivery"
                          ).length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <ShipmentArrangementForm
                orders={orders.filter((order) => order.status === "Pending")}
                onArrangeShipment={createShipmentFromOrder}
              />

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800">
                    Active Shipments
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Search shipments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Filter className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {shipmentsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="ml-2 text-gray-600">
                      Loading shipment data...
                    </p>
                  </div>
                ) : shipmentsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <p>{shipmentsError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeShipments.length > 0 ? (
                      activeShipments
                        .filter(
                          (shipment) =>
                            shipment.id
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            shipment.status
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((shipment) => (
                          <ShippingTracking
                            key={shipment.id}
                            shipmentId={shipment.id}
                            shipmentStatus={shipment.status}
                            deliveryProgress={shipment.progress}
                            estimatedDelivery={shipment.eta}
                            handleStatusUpdate={(newStatus, newProgress) =>
                              updateShipmentStatus(
                                shipment.id,
                                newStatus,
                                newProgress
                              )
                            }
                          />
                        ))
                    ) : (
                      <div className="col-span-2 text-center py-10 text-gray-500">
                        No active shipments found. Arrange a shipment to get
                        started.
                      </div>
                    )}
                  </div>
                )}
              </div>
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

              {/* Orders stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Orders
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {orders.length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Delivered Orders
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter((order) => order.status === "Delivered")
                            .length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        In Transit Orders
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter(
                            (order) => order.status === "In Transit"
                          ).length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pending Orders
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {
                          orders.filter(
                            (order) =>
                              order.status === "Pending" ||
                              order.status === "Processing"
                          ).length
                        }
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Recent Orders
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        // Refresh orders data
                        setOrdersLoading(true);
                        axios
                          .get("http://localhost:5000/api/orders")
                          .then((response) => {
                            if (response.data.success) {
                              const transformedOrders =
                                response.data.orders.map((order) => ({
                                  id: order._id,
                                  customer:
                                    order.customer.name || "Unknown Customer",
                                  items: order.items.length,
                                  value: order.totalAmount,
                                  status: mapOrderStatus(order.orderStatus),
                                  paymentStatus: order.paymentDetails
                                    ? "Completed"
                                    : "Pending",
                                  date: new Date(order.orderDate)
                                    .toISOString()
                                    .split("T")[0],
                                  shippingAddress: order.shippingAddress,
                                  rawOrder: order,
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
                        // Export orders data as CSV
                        const csvContent =
                          "data:text/csv;charset=utf-8," +
                          "Order ID,Customer,Items,Value,Status,Payment Status,Date\n" +
                          orders
                            .map(
                              (order) =>
                                `"${order.id}","${order.customer}",${
                                  order.items
                                },${order.value},"${order.status}","${
                                  order.paymentStatus || "Pending"
                                }","${order.date}"`
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
                {renderOrdersTable()}
              </div>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
                  <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-6">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {currentSupplier
                            ? "Update Supplier"
                            : "Add New Supplier"}
                        </h3>
                        <button
                          onClick={resetForm}
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
                                Supplier Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={supplierName}
                                onChange={(e) =>
                                  setSupplierName(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="Enter company name"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                              </label>
                              <select
                                value={supplierCategory}
                                onChange={(e) =>
                                  setSupplierCategory(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                              >
                                <option value="">Select a category</option>
                                <option
                                  value="Safety Gear & Accessories
"
                                >
                                  Safety Gear & Accessories
                                </option>
                                <option
                                  value="Tools & Equipment
"
                                >
                                  Tools & Equipment
                                </option>
                                <option
                                  value="Construction Materials
"
                                >
                                  Construction Materials
                                </option>
                                <option
                                  value="Safety Gear & Accessories
"
                                >
                                  Safety Gear & Accessories
                                </option>
                                <option
                                  value="Plumbing & Electrical Supplies
"
                                >
                                  Plumbing & Electrical Supplies
                                </option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  value={supplierWebsite.replace(
                                    /^https?:\/\//,
                                    ""
                                  )}
                                  onChange={(e) =>
                                    setSupplierWebsite(
                                      `https://${e.target.value}`
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                  placeholder="example.com"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Value (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={supplierValue}
                                onChange={(e) =>
                                  setSupplierValue(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="Percentage of business"
                              />
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
                                Contact Person
                              </label>
                              <input
                                type="text"
                                value={supplierContact}
                                onChange={(e) =>
                                  setSupplierContact(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="Full name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={supplierPhone}
                                onChange={(e) =>
                                  setSupplierPhone(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="+94 XX XXX XXXX"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={supplierEmail}
                              onChange={(e) => setSupplierEmail(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                            Location
                          </h4>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              value={supplierAddress}
                              onChange={(e) =>
                                setSupplierAddress(e.target.value)
                              }
                              rows="2"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                              placeholder="Street address"
                            ></textarea>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                value={supplierCountry}
                                onChange={(e) =>
                                  setSupplierCountry(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="Country"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Business Terms */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                            Business Terms
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Terms
                              </label>
                              <select
                                value={paymentTerms}
                                onChange={(e) =>
                                  setPaymentTerms(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                              >
                                <option value="">Select payment terms</option>
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 45">Net 45</option>
                                <option value="Net 60">Net 60</option>
                                <option value="Due on Receipt">
                                  Due on Receipt
                                </option>
                                <option value="Advance Payment">
                                  Advance Payment
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lead Time (days)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={leadTime}
                                onChange={(e) => setLeadTime(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                placeholder="Estimated lead time"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                            Additional Information
                          </h4>

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
                          onClick={resetForm}
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

              {/* Supplier List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Supplier Directory{" "}
                    {isLoading && (
                      <Loader className="inline-block animate-spin h-4 w-4 ml-2" />
                    )}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Filter className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value %
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {suppliers
                        .filter(
                          (supplier) =>
                            supplier.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (supplier.category &&
                              supplier.category
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())) ||
                            (supplier.contact &&
                              supplier.contact
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        )
                        .map((supplier) => (
                          <tr
                            key={supplier._id || supplier.id || supplier.name}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {supplier.name}
                              </div>
                              {supplier.email && (
                                <div className="text-sm text-gray-500">
                                  {supplier.email}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {supplier.category || "General"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {supplier.contact || "Not specified"}
                              {supplier.address && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                  {supplier.address}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {supplier.value}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => editSupplier(supplier)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSupplier(supplier._id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {suppliers.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No suppliers found. Add a new supplier to get started.
                    </div>
                  )}
                </div>
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
            <div className="space-y-6">
              {/* Restock Payment Modal */}
              {showRestockPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-semibold">
                        Process Payment to Supplier
                      </h3>
                      <button
                        onClick={() => setShowRestockPaymentModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800">Payment Details</h4>
                        <p className="text-sm text-gray-600">
                          Product: {selectedRestockRequest?.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {selectedRestockRequest?.quantity} units
                        </p>
                        <p className="text-sm text-gray-600">
                          Supplier: {selectedRestockRequest?.supplierName}
                        </p>
                      </div>
                      <EnhancedPaymentGateway
                        amount={selectedRestockRequest?.quantity * 500} // Example price calculation
                        onSuccess={handleRestockPaymentSuccess}
                        onCancel={() => setShowRestockPaymentModal(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
            
              {/* Restock Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Requests
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {restockRequests.length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
          
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        In Process
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {restockRequests.filter(req => 
                          ['requested', 'approved', 'ordered', 'shipped'].includes(req.status)
                        ).length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>
          
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Delivered
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {restockRequests.filter(req => req.status === 'delivered').length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
          
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pending Payment
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {restockRequests.filter(req => 
                          req.status === 'delivered' && req.paymentStatus === 'pending'
                        ).length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
          
              {/* Restock Requests List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Restock Requests
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        // Refresh restock data
                        setRestockLoading(true);
                        restockService.getAllRequests()
                          .then(data => {
                            setRestockRequests(data);
                            toast.success("Restock data refreshed");
                          })
                          .catch(error => {
                            console.error("Error refreshing restock data:", error);
                            toast.error("Failed to refresh restock data");
                          })
                          .finally(() => {
                            setRestockLoading(false);
                          });
                      }}
                    >
                      <RefreshCw className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {restockLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="ml-2 text-gray-600">Loading restock requests...</p>
                  </div>
                ) : restockError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <p>{restockError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {restockRequests
                      .filter(req => 
                        req.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        req.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        req.status.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(request => (
                        <div
                          key={request._id}
                          className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <h4 className="text-lg font-medium text-gray-800">
                                  {request.productName}
                                </h4>
                                <span
                                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                    request.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                    request.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                                    'bg-blue-100 text-blue-600'
                                  }`}
                                >
                                  {request.priority.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Quantity: {request.quantity} units
                              </p>
                              <p className="text-sm text-gray-600">
                                Supplier: {request.supplierName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Requested: {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                              {request.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Notes: {request.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex flex-col items-end space-y-1">
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                                    request.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                    request.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                    request.status === 'ordered' || request.status === 'approved' ? 'bg-amber-100 text-amber-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {request.status.toUpperCase()}
                                </span>
                                {request.status === 'delivered' && (
                                  <span
                                    className={`text-sm font-medium ${
                                      request.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                                    }`}
                                  >
                                    {request.paymentStatus.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              
                              {request.status === 'delivered' && request.paymentStatus === 'pending' && (
                                <button
                                  onClick={() => {
                                    setSelectedRestockRequest(request);
                                    setShowRestockPaymentModal(true);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Pay Supplier
                                </button>
                              )}
                              
                              {request.status !== 'delivered' && request.status !== 'cancelled' && (
                                <div className="relative inline-block text-left">
                                  <select
                                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        updateRestockStatus(request._id, e.target.value);
                                      }
                                    }}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Update status...</option>
                                    {(() => {
                                      switch(request.status) {
                                        case 'requested':
                                          return (
                                            <>
                                              <option value="approved">Approved</option>
                                              <option value="cancelled">Cancelled</option>
                                            </>
                                          );
                                        case 'approved':
                                          return (
                                            <>
                                              <option value="ordered">Ordered</option>
                                              <option value="cancelled">Cancelled</option>
                                            </>
                                          );
                                        case 'ordered':
                                          return (
                                            <>
                                              <option value="shipped">Shipped</option>
                                              <option value="cancelled">Cancelled</option>
                                            </>
                                          );
                                        case 'shipped':
                                          return (
                                            <>
                                              <option value="delivered">Delivered</option>
                                              <option value="cancelled">Cancelled</option>
                                            </>
                                          );
                                        default:
                                          return null;
                                      }
                                    })()}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                    {restockRequests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No restock requests found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

// Add this function to handle status updates for restock requests
const getStatusUpdateOptions = (currentStatus) => {
  switch(currentStatus) {
    case 'requested':
      return (
        <>
          <option value="approved">Approved</option>
          <option value="cancelled">Cancelled</option>
        </>
      );
    case 'approved':
      return (
        <>
          <option value="ordered">Ordered</option>
          <option value="cancelled">Cancelled</option>
        </>
      );
    case 'ordered':
      return (
        <>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
        </>
      );
    case 'shipped':
      return (
        <>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </>
      );
    default:
      return null;
  }
};

export default Supply_LogisticDashboard;
