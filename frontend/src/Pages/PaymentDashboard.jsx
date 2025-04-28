import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronDown, Search, LogOut, Filter, Download, 
  Plus, MoreHorizontal, CreditCard, 
  DollarSign, TrendingUp, Users, Box, Activity,
  LayoutDashboard, ShoppingCart, Wallet, Sliders,
  ArrowDownRight, ArrowUpRight, Loader, RefreshCw, 
  FileText, Check, X, ChevronRight, BarChart2, Percent,
  Clock, ArrowUp, ArrowDown // Add these imports
} from 'lucide-react';
import { useSupplierPayments } from '../context/SupplierPaymentContext';
import { supplierPaymentService } from '../services/supplierPaymentService'; // Add this import
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/images/buildmart_logo1.png';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function PaymentDashboard() {
  // Keep existing state variables
  const [activePage, setActivePage] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('service-providers');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [payments, setPayments] = useState([]);
  const [serviceProviderPayments, setServiceProviderPayments] = useState([]);
  const [itemsPayments, setItemsPayments] = useState([]);
  const [commissionPayments, setCommissionPayments] = useState([]);
  const [agreementFeePayments, setAgreementFeePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Add new state variables for report generation
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('all');
  const [reportDateRange, setReportDateRange] = useState('all');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatus, setReportStatus] = useState('all');
  const [reportPaymentMethod, setReportPaymentMethod] = useState('all');
  const [reportLoading, setReportLoading] = useState(false);

  // Add new state variables for filtering and advanced features
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  
  // Add these state variables
  const [showExpensesSubmenu, setShowExpensesSubmenu] = useState(false);
  const [expensesSubPage, setExpensesSubPage] = useState('');

  // Add these state variables
  const [adminSalaries, setAdminSalaries] = useState([]);
  const [totalSalaryPaid, setTotalSalaryPaid] = useState(0);
  const [totalSalaryPending, setTotalSalaryPending] = useState(0);

  // Add these state variables at the top of your component
  const [admins, setAdmins] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Add these state variables at the top of your component
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [salaryChangeAmount, setSalaryChangeAmount] = useState('');
  const [salaryChangeType, setSalaryChangeType] = useState('increment'); // Add this for increment/decrement

  // Add search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Add these state variables at the top of the component
  const [adminExpenses, setAdminExpenses] = useState([]);

  // Keep existing paymentStats state
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    serviceProviderTotal: 0,  // Ensure this has a default value of 0
    inventorySalesTotal: 0,
    commissionIncome: 0,
    agreementFeeIncome: 0, // Add this new counter
    pendingCount: 0,
    failedCount: 0,
    completedCount: 0,
    activeProviders: new Set(),
    itemsPurchased: 0,
    pendingAmount: 0
  });
  
  const [paymentMethodsData, setPaymentMethodsData] = useState([
    { method: 'Visa', percentage: 0 },
    { method: 'Mastercard', percentage: 0 },
    { method: 'Other', percentage: 0 }
  ]);

  const { supplierPayments, setSupplierPayments } = useSupplierPayments();

  // Enhanced fetch payments with filtering and sorting
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Initialize queryParams (this was missing)
      const queryParams = new URLSearchParams();
      
      // Build query parameters for filtering
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      
      if (filterPaymentMethod !== 'all') {
        queryParams.append('cardType', filterPaymentMethod);
      }
      
      if (filterDateRange === 'custom' && dateFrom && dateTo) {
        queryParams.append('dateFrom', dateFrom);
        queryParams.append('dateTo', dateTo);
      } else if (filterDateRange !== 'all') {
        // Calculate date range based on selection
        const today = new Date();
        let fromDate = new Date();
        
        switch (filterDateRange) {
          case 'today':
            fromDate = new Date(today.setHours(0, 0, 0, 0));
            break;
          case 'week':
            fromDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            fromDate.setMonth(today.getMonth() - 1);
            break;
          case 'year':
            fromDate.setFullYear(today.getFullYear() - 1);
            break;
          default:
            break;
        }
        
        queryParams.append('dateFrom', fromDate.toISOString());
        queryParams.append('dateTo', new Date().toISOString());
      }
      
      // Add sorting parameters
      if (sortBy !== 'date' || sortOrder !== 'desc') {
        queryParams.append('sort', sortBy);
        queryParams.append('order', sortOrder);
      }
      
      // Make API request
      const url = `https://build-mart-backend.vercel.app/api/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setPayments(data);
      
      // Process payment data
      processPaymentData(data);
      
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch payment data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add search function to filter data
  const searchRecords = (query) => {
    setIsSearching(true);
    
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    // Search through all data sources
    const results = [
      ...supplierPayments.filter(payment => 
        (payment.supplierName && payment.supplierName.toLowerCase().includes(lowercaseQuery)) ||
        (payment.product && payment.product.toLowerCase().includes(lowercaseQuery)) || 
        (payment.status && payment.status.toLowerCase().includes(lowercaseQuery)) ||
        (payment.amount && payment.amount.toString().includes(lowercaseQuery))
      ).map(payment => ({ ...payment, type: 'Supplier Payment' })),
      
      ...serviceProviderPayments.filter(payment => 
        (payment.providerName && payment.providerName.toLowerCase().includes(lowercaseQuery)) ||
        (payment.status && payment.status.toLowerCase().includes(lowercaseQuery)) ||
        (payment.amount && payment.amount.toString().includes(lowercaseQuery))
      ).map(payment => ({ ...payment, type: 'Service Provider Payment' })),
      
      ...itemsPayments.filter(payment => 
        (payment.itemName && payment.itemName.toLowerCase().includes(lowercaseQuery)) ||
        (payment.customerName && payment.customerName.toLowerCase().includes(lowercaseQuery)) ||
        (payment.status && payment.status.toLowerCase().includes(lowercaseQuery)) ||
        (payment.amount && payment.amount.toString().includes(lowercaseQuery))
      ).map(payment => ({ ...payment, type: 'Inventory Sale' })),
      
      ...commissionPayments.filter(payment => 
        (payment.commissionAmount && payment.commissionAmount.toString().includes(lowercaseQuery)) ||
        (payment.originalAmount && payment.originalAmount.toString().includes(lowercaseQuery)) ||
        (payment.date && payment.date.toLowerCase().includes(lowercaseQuery))
      ).map(payment => ({ ...payment, type: 'Commission Income' })),
      
      ...agreementFeePayments.filter(payment => 
        (payment.clientName && payment.clientName.toLowerCase().includes(lowercaseQuery)) ||
        (payment.agreementType && payment.agreementType.toLowerCase().includes(lowercaseQuery)) ||
        (payment.status && payment.status.toLowerCase().includes(lowercaseQuery)) ||
        (payment.amount && payment.amount.toString().includes(lowercaseQuery))
      ).map(payment => ({ ...payment, type: 'Agreement Fee' }))
    ];
    
    setSearchResults(results);
    setIsSearching(false);
  };

    useEffect(() => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
    }, [navigate]);


    const handleLogout = () => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login');
    };

  // Handle search query change
  const handleSearchQueryChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      // Only search if at least 3 characters are entered
      searchRecords(query);
    } else {
      setSearchResults([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Navigate to record details when search result is clicked
  const navigateToSearchResult = (result) => {
    // Set the active page based on result type
    switch(result.type) {
      case 'Supplier Payment':
        setActivePage('Expenses');
        setExpensesSubPage('Supplier Payments');
        break;
      case 'Service Provider Payment':
        setActivePage('Service Providers');
        break;
      case 'Inventory Sale':
        setActivePage('Inventory Sales');
        break;
      case 'Commission Income':
        setActivePage('Commission Income');
        break;
      case 'Agreement Fee':
        setActivePage('Agreement Fees');
        break;
      default:
        setActivePage('Dashboard');
    }
    
    // Clear the search after navigating
    clearSearch();
  };

  // Fetch supplier payments when expenses tab is selected
  useEffect(() => {
    if (activePage === 'Expenses' && expensesSubPage === 'Supplier Payments') {
      fetchSupplierPayments();
    }
  }, [activePage, expensesSubPage]);
  
  // Add this function to fetch supplier payments
  const fetchSupplierPayments = async () => {
    try {
      setLoading(true);
      const data = await supplierPaymentService.getAllPayments();
      
      // Process and format the supplier payments
      const formattedPayments = data.map(payment => ({
        ...payment,
        id: payment._id,
        supplierName: payment.supplier,
        invoiceNumber: payment.requestId ? `REQ-${payment.requestId.substring(0, 8)}` : 'N/A',
        paymentDate: new Date(payment.paymentDate || payment.createdAt).toISOString(),
        status: payment.status || 'paid',
        amount: payment.amount || 0,
        productName: payment.product,
        quantity: payment.quantity || 1
      }));
      
      console.log('Fetched supplier payments:', formattedPayments);
      setSupplierPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching supplier payments:', error);
      setError('Failed to load supplier payment data');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle payment status update
  const handleSupplierPaymentStatusUpdate = async (paymentId, newStatus) => {
    try {
      setLoading(true);
      await supplierPaymentService.updatePaymentStatus(paymentId, newStatus);
      
      // Update the local state with the new status
      setSupplierPayments(payments => 
        payments.map(payment => 
          payment.id === paymentId || payment._id === paymentId
            ? { ...payment, status: newStatus }
            : payment
        )
      );
      
      // Show success notification
      alert(`Payment status updated to ${newStatus}`);
      
      // Refresh the dashboard stats if needed
      if (activePage === 'Dashboard') {
        fetchPayments();
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export payments as CSV
  const exportPayments = () => {
    // Create CSV header
    const headers = [
      'ID',
      'Cardholder Name',
      'Amount',
      'Status',
      'Payment Method',
      'Last Four Digits',
      'Date'
    ];
    
    // Convert payment data to CSV rows
    const csvData = payments.map(payment => [
      payment._id,
      payment.cardholderName,
      payment.amount,
      payment.status,
      payment.cardType,
      payment.lastFourDigits,
      new Date(payment.createdAt).toLocaleString()
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_export_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add these export functions inside the component
  const exportSupplierPayments = () => {
    try {
      // Create CSV header
      const headers = ['Supplier Name', 'Product', 'Quantity', 'Amount (Rs.)', 'Invoice Number', 'Payment Date', 'Status'];
      
      // Convert payment data to CSV rows
      const csvData = supplierPayments.map(payment => [
        payment.supplierName || payment.supplier,
        payment.productName || payment.product,
        payment.quantity || 1,
        payment.amount,
        payment.invoiceNumber || (payment.requestId ? payment.requestId.substring(0, 8) : 'N/A'),
        new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(),
        payment.status === 'paid' ? 'Paid' : 
          payment.status === 'pending' ? 'Pending' : 'Failed'
      ]);
      
      // Combine headers and data
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `supplier_payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Supplier payments exported successfully');
      alert('Supplier payments exported successfully');
    } catch (error) {
      console.error('Error exporting supplier payments:', error);
      alert('Failed to export supplier payments: ' + error.message);
    }
  };

  const exportExpensesData = () => {
    try {
      // CSV export for expense data
      const headers = ['Date', 'Type', 'Month', 'Employee Name', 'Email', 'Amount'];
      const csvData = adminExpenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        expense.type,
        expense.month || '-',
        expense.employeeName,
        expense.employeeEmail,
        expense.amount
      ]);
      
      const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Expenses exported successfully');
      alert('Expenses exported successfully');
    } catch (error) {
      console.error('Error exporting expenses:', error);
      alert('Failed to export expenses: ' + error.message);
    }
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  // Update payment status
  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://build-mart-backend.vercel.app/api/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refresh payment data
      fetchPayments();
      
      // Close the details modal
      setShowPaymentDetails(false);
      setSelectedPayment(null);
      
    } catch (err) {
      setError(err.message);
      console.error("Failed to update payment status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process and categorize payment data
  const processPaymentData = (data) => {
    // Initialize categorized data arrays
    const serviceProviderPaymentsArray = [];
    const inventoryPaymentsArray = [];
    const commissionPaymentsArray = [];
    const agreementFeePaymentsArray = []; // Add this new array

    // Initialize stats counters with default values
    const stats = {
      totalAmount: 0,
      serviceProviderTotal: 0,
      inventorySalesTotal: 0,
      commissionIncome: 0,
      agreementFeeIncome: 0, // Add this new counter
      pendingAmount: 0,
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0,
      activeProviders: new Set(),
      itemsPurchased: 0
    };

    // Count card types
    const cardTypes = {
      visa: 0,
      mastercard: 0,
      amex: 0,
      discover: 0
    };

    // Process data only if it exists and is an array
    if (Array.isArray(data) && data.length > 0) {
      console.log("Processing payment data:", data.length, "records");
      
      data.forEach(payment => {
        // Format the payment for display
        const formattedPayment = {
          id: payment._id,
          status: convertStatus(payment.status),
          amount: payment.amount,
          formattedAmount: `Rs. ${payment.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`,
          method: payment.cardType,
          cardNumber: payment.lastFourDigits,
          date: new Date(payment.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          rawDate: new Date(payment.createdAt),
          cardholderName: payment.cardholderName,
          user: payment.user,
          paymentType: payment.paymentType
        };

        // Count by status
        if (payment.status === 'completed') {
          stats.completedCount++;
        } else if (payment.status === 'pending') {
          stats.pendingCount++;
          stats.pendingAmount += payment.amount;
        } else if (payment.status === 'failed') {
          stats.failedCount++;
        }

        // Count card types
        if (payment.cardType in cardTypes) {
          cardTypes[payment.cardType]++;
        }

        // CATEGORIZATION LOGIC:
        
        // Check if this is an agreement fee
        const isAgreementFee = payment.paymentType === 'agreement_fee';
        
        // Check whether the payment has order items (which indicates inventory sale)
        const hasOrderItems = payment.order && 
                            payment.order.items && 
                            Array.isArray(payment.order.items) && 
                            payment.order.items.length > 0;

        // Check if this is explicitly marked as an inventory payment or has order items
        const isInventorySale = payment.paymentType === 'inventory' || hasOrderItems;
        
        // Check if it's a service provider payment
        const isServiceProvider = payment.paymentType === 'milestone' || 
                                payment.workId || 
                                (payment.user?.role === 'contractor' || payment.user?.role === 'supplier');
        
        // 1. Agreement Fee (NEW CATEGORY)
        if (isAgreementFee) {
          stats.agreementFeeIncome += payment.amount;
          
          agreementFeePaymentsArray.push({
            ...formattedPayment,
            clientName: payment.user?.name || payment.cardholderName || 'Client',
            agreementType: 'Service Agreement'
          });
        }
        // 2. Service Provider Payments (milestone payments)
        else if (isServiceProvider) {        
          stats.serviceProviderTotal += payment.amount;
          stats.activeProviders.add(payment.user?.name || payment.cardholderName || 'Unknown Provider');
          
          serviceProviderPaymentsArray.push({
            ...formattedPayment,
            providerName: payment.user?.name || payment.cardholderName || 'Unknown Provider',
            milestoneId: payment.milestoneId,
            workId: payment.workId,
            itemName: 'Milestone Payment'
          });
        }
        // 3. Inventory Sales - exclude service provider payments and agreement fees
        else if (isInventorySale) {
          const itemCount = hasOrderItems ? 
            payment.order.items.reduce((total, item) => total + (item.quantity || 0), 0) : 1;
          
          stats.itemsPurchased += itemCount;
          stats.inventorySalesTotal += payment.amount;
          
          inventoryPaymentsArray.push({
            ...formattedPayment,
            itemName: hasOrderItems ? 
              payment.order.items.map(item => item.name).join(', ') : 'Product Purchase',
            itemCount: itemCount,
            customerName: payment.user?.name || payment.cardholderName || 'Customer',
            // Explicitly set commission values to 0 for regular inventory sales
            commissionAmount: 0,
            commissionRate: 0
          });
        }
        // 4. Fallback for any unclassified payments
        else {
          // Add to inventory by default for now
          stats.inventorySalesTotal += payment.amount;
          
          inventoryPaymentsArray.push({
            ...formattedPayment,
            itemName: 'Other Purchase',
            itemCount: 1,
            customerName: payment.user?.name || payment.cardholderName || 'Customer',
            commissionAmount: 0,
            commissionRate: 0
          });
        }
        
        // 5. Commission Income - SEPARATE logic (can apply to any payment)
        if (payment.commissionAmount > 0) {
          stats.commissionIncome += payment.commissionAmount;
          
          commissionPaymentsArray.push({
            ...formattedPayment,
            originalAmount: payment.originalAmount || payment.amount,
            commissionAmount: payment.commissionAmount,
            commissionRate: payment.commissionRate || 0.1
          });
        }
        
        // Add to total regardless of category
        stats.totalAmount += payment.amount;
      });

      console.log("Categorized payments:", {
        serviceProviders: serviceProviderPaymentsArray.length,
        inventorySales: inventoryPaymentsArray.length,
        agreementFees: agreementFeePaymentsArray.length,
        commissions: commissionPaymentsArray.length
      });

      // Calculate payment method percentages
      const totalPayments = data.length;
      if (totalPayments > 0) {
        setPaymentMethodsData([
          { method: 'Visa', percentage: Math.round((cardTypes.visa / totalPayments) * 100) },
          { method: 'Mastercard', percentage: Math.round((cardTypes.mastercard / totalPayments) * 100) },
          { method: 'Other', percentage: Math.round(((cardTypes.amex + cardTypes.discover) / totalPayments) * 100) }
        ]);
      }

      // Ensure stats has all required fields before setting state
      setPaymentStats(stats);
      
      // Set other state variables with the arrays
      setServiceProviderPayments(serviceProviderPaymentsArray);
      setItemsPayments(inventoryPaymentsArray);
      setCommissionPayments(commissionPaymentsArray);
      // Add this line to set agreement fee payments
      setAgreementFeePayments(agreementFeePaymentsArray);
    } else {
      console.log("No payment data or empty array");
      
      // If data is empty or invalid, ensure we set default values
      setPaymentStats(stats);
      setServiceProviderPayments([]);
      setItemsPayments([]);
      setCommissionPayments([]);
      setAgreementFeePayments([]);
    }

    // When calculating expense totals for dashboard, only count successful payments
    const paidSupplierPayments = supplierPayments.filter(payment => 
      payment.status === 'paid' || payment.status === 'Success' || payment.status === 'Succeeded'
    );
    
    const totalSupplierExpenses = paidSupplierPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Update stats calculation to use this filtered total
    stats.totalExpenses = (totalSalaryPaid || 0) + totalSupplierExpenses;
  };

  // Helper function to convert backend status to UI status
  const convertStatus = (backendStatus) => {
    const statusMap = {
      'completed': 'Succeeded',
      'pending': 'Pending',
      'failed': 'Declined'
    };
    return statusMap[backendStatus] || 'Create';
  };

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
    fetchAdminSalaries();
    fetchAdminExpenses(); // Add this to load expenses on mount
    fetchSupplierPayments(); // Add this line to load supplier payments on initial mount
  }, []);

  // Fetch supplier payments when expenses tab is selected
  useEffect(() => {
    if (expensesSubPage === 'Supplier Payments') {
      // Fetch supplier payments from your API
      const fetchSupplierPayments = async () => {
        try {
          setLoading(true);
          const response = await fetch('https://build-mart-backend.vercel.app/api/supplier-payments');
          if (!response.ok) {
            throw new Error('Failed to fetch supplier payments');
          }
          const data = await response.json();
          setSupplierPayments(data);
        } catch (error) {
          console.error('Error fetching supplier payments:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchSupplierPayments();
    }
  }, [expensesSubPage]);

  // Fetch expenses when Expenses tab is selected
  useEffect(() => {
    if (activePage === 'Expenses' && expensesSubPage === 'Other Expenses') {
      fetchAdminExpenses();
    }
  }, [activePage, expensesSubPage]);

  // Function to fetch admin expenses
  const fetchAdminExpenses = async () => {
    try {
      setLoading(true);
      
      try {
        // Try to get expenses from the API
        const response = await axios.get('https://build-mart-backend.vercel.app/auth/admins/expenses');
        
        if (response.data && Array.isArray(response.data)) {
          const formattedExpenses = response.data.map(expense => ({
            ...expense,
            date: expense.date || expense.paymentDate,
            details: {
              ...expense.details,
              paymentDate: expense.details?.paymentDate || expense.date
            }
          }));
          
          setAdminExpenses(formattedExpenses);
          console.log('Fetched admin expenses:', formattedExpenses.length);
          
          // Also save to local storage as backup
          saveExpensesToLocalStorage(formattedExpenses);
          return;
        }
      } catch (apiError) {
        console.error('API Error fetching admin expenses:', apiError);
        // Continue to fallback below
      }
      
      // Fallback: Check if we have expense data in local storage
      console.log('Falling back to local storage for expenses');
      const localExpenses = loadExpensesFromLocalStorage();
      if (localExpenses && localExpenses.length > 0) {
        setAdminExpenses(localExpenses);
        return;
      }
      
      // Last resort: check if there are any expenses in the state from salary payments
      console.log('No expenses found in storage');
    } catch (error) {
      console.error('Error in expense handling:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch admin salaries
  const fetchAdminSalaries = async () => {
    try {
      setIsLoadingAdmins(true);
      const response = await axios.get('https://build-mart-backend.vercel.app/auth/admins');
      
      // Transform the data to match the format expected by the component
      const processedSalaries = response.data.map(admin => {
        // Get last paid date object if available
        const lastPaidDate = admin.salary?.lastPaid ? new Date(admin.salary.lastPaid) : null;
        
        // Check if paid for current month
        const currentDate = new Date();
        const isCurrentMonthPaid = lastPaidDate ? 
          lastPaidDate.getMonth() === currentDate.getMonth() && 
          lastPaidDate.getFullYear() === currentDate.getFullYear() : 
          false;
          
        // Get month name
        const lastPaidMonth = lastPaidDate ? 
          lastPaidDate.toLocaleString('default', { month: 'long' }) : '';
        
        // Get current month name
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        
        return {
          id: admin.id || admin._id,
          name: admin.username,
          email: admin.email,
          salary: admin.salary?.amount || 30000, // Access salary amount or use default
          status: isCurrentMonthPaid ? 'Paid' : 'Pending',
          statusLabel: isCurrentMonthPaid ? `Paid for ${currentMonth}` : `Pending ${currentMonth} payment`,
          lastPaid: admin.salary?.lastPaid ? new Date(admin.salary.lastPaid).toLocaleDateString() : 'Never',
          lastPaidMonth: lastPaidMonth,
          currentMonth: currentMonth,
          isCurrentMonthPaid: isCurrentMonthPaid
        };
      });
      
      setAdminSalaries(processedSalaries);
      
      // Calculate totals for stats display
      const totalPaid = processedSalaries
        .filter(admin => admin.status === 'Paid')
        .reduce((sum, admin) => sum + admin.salary, 0);
        
      const totalPending = processedSalaries
        .filter(admin => admin.status !== 'Paid')
        .reduce((sum, admin) => sum + admin.salary, 0);
      
      setTotalSalaryPaid(totalPaid);
      setTotalSalaryPending(totalPending);
      setIsLoadingAdmins(false);
    } catch (error) {
      console.error('Error fetching admin salaries:', error);
      setAdminError('Failed to load admin salary data');
      setIsLoadingAdmins(false);
    }
  };

  // Add these utility functions for local storage
  const saveExpensesToLocalStorage = (expenses) => {
    localStorage.setItem('adminExpenses', JSON.stringify(expenses));
  };

  const loadExpensesFromLocalStorage = () => {
    const storedExpenses = localStorage.getItem('adminExpenses');
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  };

  const handleSalaryPayment = async (admin) => {
    const lastPaidDate = admin.lastPaid ? new Date(admin.lastPaid).toLocaleDateString() : 'Not paid yet';
    const currentDate = new Date();
    
    // Check if salary is for current month
    const lastPaidDateObj = admin.lastPaid ? new Date(admin.lastPaid) : null;
    let isCurrentMonthPaid = false;
    
    if (lastPaidDateObj) {
      isCurrentMonthPaid = 
        lastPaidDateObj.getMonth() === currentDate.getMonth() && 
        lastPaidDateObj.getFullYear() === currentDate.getFullYear();
    }
    
    // Create message with month information
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const message = isCurrentMonthPaid ? 
      `It appears that ${admin.name} has already been paid for ${monthName}. Do you still want to process payment?` : 
      `Do you want to pay ${monthName} salary to ${admin.name}?\n\nLast Paid Date: ${lastPaidDate}`;
    
    // Show confirmation dialog with month and last paid date
    const confirmPay = window.confirm(message);
  
    if (confirmPay) {
      try {
        setLoading(true);
        
        // Calculate salary components
        const basicSalary = admin.salary || 30000;
        const epfEmployee = basicSalary * 0.08;
        const epfEmployer = basicSalary * 0.12;
        const etf = basicSalary * 0.03;
        const netSalary = basicSalary - epfEmployee;

        // Create comprehensive expense record with all salary details
        const salaryExpense = {
          id: `SAL-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'Salary Payment',
          month: monthName,
          year: currentDate.getFullYear(),
          employeeId: admin.id,
          employeeName: admin.name,
          employeeEmail: admin.email || 'admin@buildmart.com',
          amount: netSalary, // Store the net amount paid
          details: {
            basicSalary,
            epfEmployee,
            epfEmployer,
            etf,
            netSalary,
            paymentDate: new Date().toISOString(),
            month: monthName,
            year: currentDate.getFullYear(),
            paymentStatus: 'Completed'
          }
        };

        // Add to expenses array immediately to ensure it's visible in the UI
        setAdminExpenses(prev => {
          const newExpenses = [salaryExpense, ...prev];
          // Also update local storage for persistence
          saveExpensesToLocalStorage(newExpenses);
          return newExpenses;
        });

        // Try to send payment data to backend
        try {
          const response = await axios.post('https://build-mart-backend.vercel.app/auth/admins/pay-salary', {
            adminId: admin.id,
            paymentDate: new Date().toISOString(),
            month: monthName,
            year: currentDate.getFullYear(),
            salary: {
              basicSalary,
              epfEmployee,
              epfEmployer,
              etf,
              netSalary
            },
            expense: salaryExpense
          });
          
          console.log("Salary payment API response:", response.data);
        } catch (apiError) {
          console.warn("API error when saving salary payment:", apiError);
          // Continue execution since we've already updated the UI
        }
        
        // Update admin's last paid date and status in local state
        const updatedAdmins = adminSalaries.map(a => 
          a.id === admin.id 
            ? {...a, 
               lastPaid: new Date().toLocaleDateString(), 
               status: 'Paid',
               lastPaidMonth: monthName,
               lastPaidYear: currentDate.getFullYear()
              } 
            : a
        );
        setAdminSalaries(updatedAdmins);

        // Calculate updated total paid salary amount
        const updatedTotalPaid = updatedAdmins
          .filter(a => a.status === 'Paid')
          .reduce((sum, a) => sum + a.salary, 0);
        
        setTotalSalaryPaid(updatedTotalPaid);

        // Show success message
        alert(`${monthName} salary payment processed successfully for ${admin.name}!`);
        
        // Ensure navigation to the Expenses tab with Other Expenses sub-page selected
        setExpensesSubPage('Other Expenses');
        setActivePage('Expenses');
      } catch (error) {
        console.error('Error processing salary payment:', error);
        alert('Failed to process salary payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSalaryUpdate = async () => {
    if (!selectedAdmin || !salaryChangeAmount) {
      showNotificationMessage('error', 'Please select an admin and enter an amount');
      return;
    }

    try {
      // Calculate the new salary based on the change type
      const currentSalary = selectedAdmin.salary || 30000;
      const changeAmount = Number(salaryChangeAmount);
      const newSalary = salaryChangeType === 'increment' 
        ? currentSalary + changeAmount 
        : currentSalary - changeAmount;

      const response = await fetch(`https://build-mart-backend.vercel.app/auth/admins/${selectedAdmin.id}/salary`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salary: newSalary
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update salary');
      }

      const data = await response.json();
      showNotificationMessage('success', `Salary ${salaryChangeType}ed successfully`);
      
      // Update the local state
      setAdminSalaries(prevSalaries => 
        prevSalaries.map(admin => 
          admin.id === selectedAdmin.id 
            ? { ...admin, salary: newSalary }
            : admin
        )
      );

      // Close the modal and reset states
      setShowSalaryModal(false);
      setSelectedAdmin(null);
      setSalaryChangeAmount('');
      setSalaryChangeType('increment');
    } catch (error) {
      console.error('Salary update error:', error);
      showNotificationMessage('error', error.message);
    }
  };

  const toggleSelectAll = () => {
    setIsAllSelected(!isAllSelected);
    setSelectedRows(isAllSelected ? [] : 
      activeTab === 'service-providers' 
        ? serviceProviderPayments.map((_, index) => index) 
        : itemsPayments.map((_, index) => index));
  };

  const toggleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Succeeded': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      'Declined': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
      'Create': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    
    return (
      <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 ${config.dot} rounded-full mr-1.5`}></span>
        {status}
      </span>
    );
  };

  const getCardIcon = (method) => {
    if (method === 'visa') {
      return (
        <div className="flex items-center space-x-1.5">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">VISA</span>
          <span className="text-gray-500 text-xs">**** {serviceProviderPayments[0]?.cardNumber || '4242'}</span>
        </div>
      );
    } else if (method === 'mastercard') {
      return (
        <div className="flex items-center space-x-1.5">
          <div className="bg-red-100 text-red-700 p-1 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
            MC
          </div>
          <span className="text-gray-500 text-xs">**** {serviceProviderPayments[0]?.cardNumber || '2332'}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5">
        <div className="bg-gray-100 text-gray-700 p-1 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
          CD
        </div>
        <span className="text-gray-500 text-xs">**** {serviceProviderPayments[0]?.cardNumber || '0000'}</span>
      </div>
    );
  };

  const renderPaymentTable = (data) => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading payments...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button 
            onClick={fetchPayments} 
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Box className="h-12 w-12 mb-2" />
          <p>No payment records found</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {activeTab === 'service-providers' ? 'Provider Name' : 'Item Name'}
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creation Date
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((payment, index) => (
              <tr key={payment.id || index} className={`${selectedRows.includes(index) ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedRows.includes(index)}
                      onChange={() => toggleSelectRow(index)}
                    />
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {payment.id}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {activeTab === 'service-providers' ? payment.providerName : payment.itemName}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.amount}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  {getCardIcon(payment.method)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{payment.date}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => viewPaymentDetails(payment)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-150"
                      title="View Details"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors duration-150">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Updated stats based on API data
  const stats = [
    {
      title: "Service Provider Payments",
      value: `Rs. ${(paymentStats?.serviceProviderTotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: "up",
      isIncome: false, // Service Provider payments are not considered income
      isExpense: false // Service Provider payments are not considered expenses
    },
    {
      title: "Inventory Sales",
      value: `Rs. ${(paymentStats?.inventorySalesTotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <ShoppingCart className="h-6 w-6 text-green-600" />,
      trend: "up",
      isIncome: true
    },
    {
      title: "Agreement Fees",
      value: `Rs. ${(paymentStats?.agreementFeeIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <FileText className="h-6 w-6 text-orange-600" />,
      trend: "up",
      isIncome: true
    },
    {
      title: "Commission Income",
      value: `Rs. ${(paymentStats?.commissionIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <Percent className="h-6 w-6 text-purple-600" />,
      trend: "up",
      isIncome: true
    },
    {
      title: "Total Income",
      value: `Rs. ${((paymentStats?.inventorySalesTotal || 0) + 
              (paymentStats?.commissionIncome || 0) + 
              (paymentStats?.agreementFeeIncome || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <DollarSign className="h-6 w-6 text-indigo-600" />,
      trend: "up",
      isIncome: true
    }
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Service Providers', icon: <Users size={20} /> },
    { name: 'Inventory Sales', icon: <ShoppingCart size={20} /> },
    { name: 'Agreement Fees', icon: <FileText size={20} /> }, // Add this line
    { name: 'Commission Income', icon: <Percent size={20} /> },
    { name: 'Wages', icon: <Wallet size={20} /> },
    { name: 'Incomes', icon: <ArrowUpRight size={20} /> },
    { 
      name: 'Expenses', 
      icon: <ArrowDownRight size={20} />,
      subItems: ['Supplier Payments', 'Other Expenses']
    }
  ];

  // Add filter component for the dashboard
  const renderFilters = () => (
    <div className={`bg-white rounded-xl shadow-sm p-6 overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0 p-0 opacity-0'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="amex">Amex</option>
            <option value="discover">Discover</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>
      
      {filterDateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => {
            // Reset all filters
            setFilterStatus('all');
            setFilterPaymentMethod('all');
            setFilterDateRange('all');
            setDateFrom('');
            setDateTo('');
            setSortBy('date');
            setSortOrder('desc');
            fetchPayments();
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Reset
        </button>
        
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  // Add Payment Details Modal
  const renderPaymentDetailsModal = () => (
    showPaymentDetails && selectedPayment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
              <button 
                onClick={() => setShowPaymentDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Payment ID</p>
                <p className="text-base font-mono">{selectedPayment.id || selectedPayment._id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-xl font-bold">Rs. {parseFloat(selectedPayment.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">
                  {getStatusBadge(convertStatus(selectedPayment.status))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <p className="text-base">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Card Type</p>
                <div className="mt-1">
                  {getCardIcon(selectedPayment.cardType)}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Cardholder Name</p>
                <p className="text-base">{selectedPayment.cardholderName}</p>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Update Payment Status</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => updatePaymentStatus(selectedPayment.id || selectedPayment._id, 'completed')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
                  disabled={selectedPayment.status === 'completed'}
                >
                  <Check size={16} className="mr-2" />
                  Mark as Completed
                </button>
                
                <button
                  onClick={() => updatePaymentStatus(selectedPayment.id || selectedPayment._id, 'pending')}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 flex items-center"
                  disabled={selectedPayment.status === 'pending'}
                >
                  <Clock size={16} className="mr-2" />
                  Mark as Pending
                </button>
                
                <button
                  onClick={() => updatePaymentStatus(selectedPayment.id || selectedPayment._id, 'failed')}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
                  disabled={selectedPayment.status === 'failed'}
                >
                  <X size={16} className="mr-2" />
                  Mark as Failed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Removed duplicate declaration of renderIncomePanel
  
  const renderIncomePanel = () => {
    // Calculate monthly sales data
    const getMonthlyInventorySales = () => {
      return itemsPayments.reduce((acc, payment) => {
        const date = new Date(payment.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
            totalSales: 0,
            transactionCount: 0
          };
        }
        
        // FIX: Check if amount is a string or number and handle accordingly
        let amount = payment.amount;
        if (typeof amount === 'string') {
          // If it's a string (like "Rs. 1,234.56"), extract the number
          amount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
        }
        // If it's already a number, use it directly
        
        acc[monthYear].totalSales += amount;
        acc[monthYear].transactionCount += 1;
        
        return acc;
      }, {});
    };
  
    const monthlyData = Object.entries(getMonthlyInventorySales())
      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
      .map(([key, data]) => ({
        ...data,
        monthYear: key,
        averageTransaction: data.totalSales / data.transactionCount
      }));
  
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Income Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-xl">
              <p className="text-sm font-medium text-green-600">Inventory Sales Income</p>
              <p className="text-2xl font-bold text-green-700">
                Rs. {(paymentStats?.inventorySalesTotal || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="text-green-500 mr-1" size={16} />
              
              </div>
            </div>
  
            
            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="text-sm font-medium text-purple-600">Commission Income</p>
              <p className="text-2xl font-bold text-purple-700">
                Rs. {(paymentStats?.commissionIncome || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="text-purple-500 mr-1" size={16} />
              
              </div>
            </div>
  
            <div className="bg-orange-50 p-6 rounded-xl">
              <p className="text-sm font-medium text-orange-600">Agreement Fee Income</p>
              <p className="text-2xl font-bold text-orange-700">
                Rs. {(paymentStats?.agreementFeeIncome || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="text-orange-500 mr-1" size={16} />
                
              </div>
            </div>
  
            <div className="bg-indigo-50 p-6 rounded-xl">
              <p className="text-sm font-medium text-indigo-600">Total Income</p>
              <p className="text-2xl font-bold text-indigo-700">
                Rs. {((paymentStats?.inventorySalesTotal || 0) + 
                      (paymentStats?.commissionIncome || 0) + 
                      (paymentStats?.agreementFeeIncome || 0)).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="text-indigo-500 mr-1" size={16} />
              </div>
            </div>
          </div>
  
          {/* Monthly Inventory Sales (your existing code) */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Monthly Inventory Sales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month/Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Transaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyData.map((month, index) => {
                    const prevMonth = monthlyData[index + 1];
                    const growth = prevMonth 
                      ? ((month.totalSales - prevMonth.totalSales) / prevMonth.totalSales) * 100 
                      : 0;
  
                    return (
                      <tr key={month.monthYear} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {month.month} {month.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Rs. {month.totalSales.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {month.transactionCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rs. {month.averageTransaction.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center text-sm font-medium ${
                            growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {growth > 0 ? <ArrowUpRight size={16} className="mr-1" /> : 
                             growth < 0 ? <ArrowDownRight size={16} className="mr-1" /> : null}
                            {growth.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Commission Income */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Monthly Commission Income</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month/Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Commission
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(commissionPayments.reduce((acc, payment) => {
                    const date = new Date(payment.date);
                    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!acc[monthYear]) {
                      acc[monthYear] = {
                        month: date.toLocaleString('default', { month: 'long' }),
                        year: date.getFullYear(),
                        totalCommission: 0,
                        transactionCount: 0,
                        totalCommissionRate: 0
                      };
                    }
                    
                    acc[monthYear].totalCommission += payment.commissionAmount;
                    acc[monthYear].transactionCount += 1;
                    acc[monthYear].totalCommissionRate += payment.commissionRate;
                    
                    return acc;
                  }, {}))
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([key, data], index, array) => {
                    const prevMonth = array[index + 1];
                    const growth = prevMonth 
                      ? ((data.totalCommission - prevMonth[1].totalCommission) / prevMonth[1].totalCommission) * 100 
                      : 0;
                    const averageRate = (data.totalCommissionRate / data.transactionCount) * 100;
      
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {data.month} {data.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-700">
                            Rs. {data.totalCommission.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {data.transactionCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {averageRate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center text-sm font-medium ${
                            growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {growth > 0 ? <ArrowUpRight size={16} className="mr-1" /> : 
                             growth < 0 ? <ArrowDownRight size={16} className="mr-1" /> : null}
                            {growth.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Agreement Fee Income */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Monthly Agreement Fee Income</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month/Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Fees
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agreement Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Fee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(agreementFeePayments.reduce((acc, payment) => {
                    const date = new Date(payment.date);
                    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!acc[monthYear]) {
                      acc[monthYear] = {
                        month: date.toLocaleString('default', { month: 'long' }),
                        year: date.getFullYear(),
                        totalFees: 0,
                        agreementCount: 0
                      };
                    }
                    
                    acc[monthYear].totalFees += parseFloat(payment.amount);
                    acc[monthYear].agreementCount += 1;
                    
                    return acc;
                  }, {}))
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([key, data], index, array) => {
                    const prevMonth = array[index + 1];
                    const growth = prevMonth 
                      ? ((data.totalFees - prevMonth[1].totalFees) / prevMonth[1].totalFees) * 100 
                      : 0;
                    const averageFee = data.totalFees / data.agreementCount;
      
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {data.month} {data.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-orange-700">
                            Rs. {data.totalFees.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {data.agreementCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rs. {averageFee.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center text-sm font-medium ${
                            growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {growth > 0 ? <ArrowUpRight size={16} className="mr-1" /> : 
                             growth < 0 ? <ArrowDownRight size={16} className="mr-1" /> : null}
                            {growth.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Modify your existing renderPageContent function's Dashboard case
  const renderPageContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            {/* Dashboard Controls - keep existing code */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-lg font-semibold">Payment Overview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Sliders size={16} className="mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <FileText size={16} className="mr-2" />
                  Generate Report
                </button>
                
                <button 
                  onClick={fetchPayments}
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 ${
                    loading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-lg transition`}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} className="mr-2" />
                      Refresh Data
                    </>
                  )}
                </button>
                <button
                  onClick={() => generateFinancialStatementPDF('income', paymentStats)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-green-400 text-green-700 rounded-lg hover:bg-green-50"
                >
                  <FileText size={16} className="mr-2" />
                  Income Statement (PDF)
                </button>
                <button
                  onClick={() => generateFinancialStatementPDF('balance', paymentStats)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-400 text-blue-700 rounded-lg hover:bg-blue-50"
                >
                  <FileText size={16} className="mr-2" />
                  Balance Sheet (PDF)
                </button>
              </div>
            </div>
            
            {/* Display Filters - keep existing code */}
            {renderFilters()}
            
            {/* Financial Summary Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="p-3 bg-gray-200 rounded-lg h-10 w-10"></div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                <h3 className="font-medium">Error loading payment data</h3>
                <p>{error}</p>
                <button 
                  onClick={fetchPayments}
                  className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Income Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-green-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Total Income</p>
                      <p className="text-2xl font-bold text-green-800">
                        Rs. {((paymentStats?.inventorySalesTotal || 0) + 
                        (paymentStats?.commissionIncome || 0) + 
                        (paymentStats?.agreementFeeIncome || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-lg">
                      <ArrowUpRight className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp size={16} className="text-green-600 mr-2" />
                    <span className="text-xs font-medium text-green-700">Income from sales, commissions & fees</span>
                  </div>
                </div>
                
                {/* Total Expenses Card */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-800">
                        Rs. {(
                          (totalSalaryPaid || 0) + 
                          ((supplierPayments || [])
                            .filter(p => p.status === 'paid' || p.status === 'Success' || p.status === 'Succeeded')
                            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                          )
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-red-200 rounded-lg">
                      <ArrowDownRight className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Activity size={16} className="text-red-600 mr-2" />
                    <span className="text-xs font-medium text-red-700">Salaries & supplier payments</span>
                  </div>
                </div>
                
                {/* Profit Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-800">
                        Rs. {(
                          (paymentStats?.inventorySalesTotal || 0) + 
                          (paymentStats?.commissionIncome || 0) + 
                          (paymentStats?.agreementFeeIncome || 0) - 
                          (totalSalaryPaid || 0) - 
                          ((supplierPayments || [])
                            .filter(p => p.status === 'paid' || p.status === 'Success' || p.status === 'Succeeded')
                            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                          )
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp size={16} className="text-blue-600 mr-2" />
                    <span className="text-xs font-medium text-blue-700">Total income minus expenses</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Charts Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Income Breakdown Chart - Modern Style */}
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-green-800 bg-clip-text text-transparent mb-6">Income Distribution</h3>
                  <div className="h-64 transition-all duration-300 transform hover:scale-[1.02]">
                    <Bar 
                      data={{
                        labels: ['Inventory Sales', 'Commission Income', 'Agreement Fees'],
                        datasets: [
                          {
                            label: 'Income Amount (Rs.)',
                            data: [
                              paymentStats?.inventorySalesTotal || 0,
                              paymentStats?.commissionIncome || 0,
                              paymentStats?.agreementFeeIncome || 0
                            ],
                            backgroundColor: [
                              'rgba(34, 197, 94, 0.9)',
                              'rgba(124, 58, 237, 0.9)',
                              'rgba(249, 115, 22, 0.9)'
                            ],
                            borderWidth: 0,
                            borderRadius: 8,
                            borderSkipped: false,
                            hoverBorderWidth: 0,
                            hoverBackgroundColor: [
                              'rgba(34, 197, 94, 1)',
                              'rgba(124, 58, 237, 1)',
                              'rgba(249, 115, 22, 1)'
                            ]
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                          padding: 10
                        },
                        animation: {
                          duration: 2000,
                          easing: 'easeOutQuart'
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#1f2937',
                            bodyColor: '#4b5563',
                            titleFont: {
                              size: 14,
                              weight: 'bold'
                            },
                            bodyFont: {
                              size: 13
                            },
                            padding: 16,
                            cornerRadius: 12,
                            boxPadding: 8,
                            usePointStyle: true,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                              label: function(context) {
                                return `Rs. ${context.raw.toLocaleString()}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              display: true,
                              color: 'rgba(0, 0, 0, 0.03)',
                              drawBorder: false
                            },
                            border: {
                              display: false
                            },
                            ticks: {
                              padding: 12,
                              font: {
                                size: 12
                              },
                              color: '#64748b',
                              callback: function(value) {
                                return `Rs. ${value.toLocaleString()}`;
                              }
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            },
                            border: {
                              display: false
                            },
                            ticks: {
                              padding: 12,
                              font: {
                                size: 12
                              },
                              color: '#64748b'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Inventory', color: 'bg-emerald-500', value: paymentStats?.inventorySalesTotal || 0 },
                      { label: 'Commission', color: 'bg-purple-500', value: paymentStats?.commissionIncome || 0 },
                      { label: 'Agreement Fees', color: 'bg-orange-500', value: paymentStats?.agreementFeeIncome || 0 }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all">
                        <div className={`w-3 h-3 rounded-full ${item.color} mb-2`}></div>
                        <p className="text-xs font-medium text-gray-500">{item.label}</p>
                        <p className="text-sm font-bold text-gray-800">Rs. {item.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Breakdown Chart - Modern Style */}
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-red-800 bg-clip-text text-transparent mb-6">Expense Distribution</h3>
                  <div className="h-64 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center">
                    <Doughnut
                      data={{
                        labels: ['Admin Salaries', 'Supplier Payments'],
                        datasets: [
                          {
                            data: [
                              totalSalaryPaid || 0,
                              (supplierPayments || []).filter(p => p.status === 'paid' || p.status === 'Success' || p.status === 'Succeeded')
                                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0
                            ],
                            backgroundColor: [
                              'rgba(234, 179, 8, 0.9)',
                              'rgba(107, 114, 128, 0.9)'
                            ],
                            borderWidth: 0,
                            hoverOffset: 15,
                            offset: 5,
                            hoverBorderColor: '#ffffff',
                            hoverBorderWidth: 2
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        radius: '90%',
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                          duration: 2000,
                          easing: 'easeOutQuart'
                        },
                        plugins: {
                          legend: {
                            display: true,
                            position: 'right',
                            labels: {
                              boxWidth: 12,
                              padding: 20,
                              font: {
                                size: 12
                              },
                              usePointStyle: true,
                              pointStyle: 'circle'
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#1f2937',
                            bodyColor: '#4b5563',
                            titleFont: {
                              size: 14,
                              weight: 'bold'
                            },
                            bodyFont: {
                              size: 13
                            },
                            padding: 16,
                            cornerRadius: 12,
                            boxPadding: 8,
                            usePointStyle: true,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                              label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `Rs. ${value.toLocaleString()} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Admin Salaries', color: 'bg-yellow-500', value: totalSalaryPaid || 0 },
                      { label: 'Supplier Payments', color: 'bg-gray-500', value: (supplierPayments || []).filter(p => p.status === 'paid' || p.status === 'Success' || p.status === 'Succeeded').reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0 }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all">
                        <div className={`w-3 h-3 rounded-full ${item.color} mb-2`}></div>
                        <p className="text-xs font-medium text-gray-500">{item.label}</p>
                        <p className="text-sm font-bold text-gray-800">Rs. {item.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profit/Loss Trend Chart - Modern Style */}
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent mb-6">Profit/Loss Trend</h3>
                  <div className="h-64 transition-all duration-300 transform hover:scale-[1.02]">
                    {(() => {
                      // Generate monthly profit data from payments
                      const getMonthlyProfitData = () => {
                        // Create a map to store monthly data
                        const monthlyData = {};
                        
                        // Process income data (all payments)
                        if (Array.isArray(payments)) {
                          payments.forEach(payment => {
                            const date = new Date(payment.createdAt);
                            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            
                            if (!monthlyData[monthYear]) {
                              monthlyData[monthYear] = {
                                month: date.toLocaleString('default', { month: 'short' }),
                                year: date.getFullYear(),
                                income: 0,
                                expenses: 0
                              };
                            }
                            
                            // Categorize as income or expense
                            if (payment.paymentType === 'inventory' || payment.paymentType === 'agreement_fee' || payment.commissionAmount > 0) {
                              monthlyData[monthYear].income += payment.amount;
                            } else if (payment.workId) {
                              monthlyData[monthYear].expenses += payment.amount;
                            }
                          });
                        }
                        
                        // Convert to array and sort by date
                        return Object.values(monthlyData)
                          .sort((a, b) => {
                            return new Date(`${a.year}-${a.month}-01`) - new Date(`${b.year}-${b.month}-01`);
                          })
                          .slice(-6); // Only take last 6 months
                      };
                      
                      const monthlyProfitData = getMonthlyProfitData();
                      const labels = monthlyProfitData.map(d => `${d.month} ${d.year}`);
                      const incomeData = monthlyProfitData.map(d => d.income);
                      const expenseData = monthlyProfitData.map(d => d.expenses);
                      const profitData = monthlyProfitData.map(d => d.income - d.expenses);
                      
                      return (
                        <Line
                          data={{
                            labels: labels,
                            datasets: [
                              {
                                label: 'Income',
                                data: incomeData,
                                borderColor: 'rgba(16, 185, 129, 1)',
                                backgroundColor: (context) => {
                                  const ctx = context.chart.ctx;
                                  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                                  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
                                  gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                                  return gradient;
                                },
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                                pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                                pointBorderColor: '#fff',
                                pointHoverBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointHoverBorderWidth: 2,
                                borderWidth: 3
                              },
                              {
                                label: 'Expenses',
                                data: expenseData,
                                borderColor: 'rgba(239, 68, 68, 1)',
                                backgroundColor: (context) => {
                                  const ctx = context.chart.ctx;
                                  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                                  gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
                                  gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                                  return gradient;
                                },
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                                pointHoverBackgroundColor: 'rgba(239, 68, 68, 1)',
                                pointBorderColor: '#fff',
                                pointHoverBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointHoverBorderWidth: 2,
                                borderWidth: 3
                              },
                              {
                                label: 'Profit',
                                data: profitData,
                                borderColor: 'rgba(59, 130, 246, 1)',
                                backgroundColor: (context) => {
                                  const ctx = context.chart.ctx;
                                  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                                  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                                  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                                  return gradient;
                                },
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                                pointBorderColor: '#fff',
                                pointHoverBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointHoverBorderWidth: 2,
                                borderWidth: 3
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: 'index',
                              intersect: false,
                            },
                            animation: {
                              duration: 2000,
                              easing: 'easeOutQuart'
                            },
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  usePointStyle: true,
                                  pointStyle: 'circle',
                                  boxWidth: 8,
                                  boxHeight: 8,
                                  padding: 20,
                                  font: {
                                    size: 12
                                  }
                                }
                              },
                              tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#1f2937',
                                bodyColor: '#4b5563',
                                titleFont: {
                                  size: 14,
                                  weight: 'bold'
                                },
                                bodyFont: {
                                  size: 13
                                },
                                padding: 16,
                                cornerRadius: 12,
                                boxPadding: 8,
                                usePointStyle: true,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1,
                                callbacks: {
                                  label: function(context) {
                                    return `${context.dataset.label}: Rs. ${context.raw.toLocaleString()}`;
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.03)',
                                  drawBorder: false
                                },
                                border: {
                                  display: false
                                },
                                ticks: {
                                  padding: 12,
                                  font: {
                                    size: 12
                                  },
                                  color: '#64748b',
                                  callback: function(value) {
                                    return `Rs. ${value.toLocaleString()}`;
                                  }
                                }
                              },
                              x: {
                                grid: {
                                  display: false
                                },
                                border: {
                                  display: false
                                },
                                ticks: {
                                  padding: 12,
                                  font: {
                                    size: 12
                                  },
                                  color: '#64748b'
                                }
                              }
                            }
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment Details Modal */}
            {renderPaymentDetailsModal()}
          </div>
        );
  
      case 'Service Providers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Service Provider Payments</h2>
                <div className="flex space-x-2">
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-700">
                    Rs. {(paymentStats?.serviceProviderTotal || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Active Providers</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {paymentStats.activeProviders.size}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider Name
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceProviderPayments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-3 py-10 text-center text-gray-500">
                          No service provider payments found
                        </td>
                      </tr>
                    ) : (
                      serviceProviderPayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.providerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.user?.email || 'No email provided'}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {payment.id}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.formattedAmount}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{payment.date}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
  
      case 'Inventory Sales':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Inventory Sales Records</h2>
                <div className="flex space-x-2">
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-green-700">
                    Rs. {(paymentStats?.inventorySalesTotal || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Transactions</p>
                  <p className="text-2xl font-bold text-green-700">
                    {itemsPayments.length}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itemsPayments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-3 py-10 text-center text-gray-500">
                          No inventory sales found
                        </td>
                      </tr>
                    ) : (
                      itemsPayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-3 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.itemName}
                            </div>
                            {payment.itemDetails && payment.itemDetails.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500">
                                {payment.itemDetails.map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="ml-2">Rs. {item.subtotal.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              ID: {payment.id}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.customerName}</div>
                            <div className="text-xs text-gray-500">{payment.user?.email || 'No email'}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.formattedAmount}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{payment.date}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
  
      case 'Wages':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Admin Monthly Salaries</h2>
                <div className="flex space-x-2">
                
                </div>
              </div>

              

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Basic Salaries</p>
                  <p className="text-2xl font-bold text-blue-700">
                    Rs. {adminSalaries.reduce((sum, admin) => sum + (admin.salary || 30000), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Total EPF (Employee)</p>
                  <p className="text-2xl font-bold text-red-700">
                    Rs. {(adminSalaries.reduce((sum, admin) => sum + (admin.salary || 30000), 0) * 0.08).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total EPF (Employer)</p>
                  <p className="text-2xl font-bold text-green-700">
                    Rs. {(adminSalaries.reduce((sum, admin) => sum + (admin.salary || 30000), 0) * 0.12).toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total ETF</p>
                  <p className="text-2xl font-bold text-blue-700">
                    Rs. {(adminSalaries.reduce((sum, admin) => sum + (admin.salary || 30000), 0) * 0.03).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Admin Salary Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPF (8%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPF (12%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETF (3%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminSalaries.map((admin) => {
                      // Calculate EPF and ETF
                      const basicSalary = admin.salary || 30000; // Default or actual salary
                      const epfEmployee = basicSalary * 0.08; // 8% EPF from employee
                      const epfEmployer = basicSalary * 0.12; // 12% EPF from employer
                      const etf = basicSalary * 0.03; // 3% ETF
                      const netSalary = basicSalary - epfEmployee; // Net salary after EPF deduction
      
                      return (
                        <tr key={admin.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {admin.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {basicSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            Rs. {epfEmployee.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            Rs. {epfEmployer.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            Rs. {etf.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Rs. {netSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.lastPaid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              {getStatusBadge(admin.status)}
                              <span className="text-xs text-gray-500 mt-1">
                                {admin.isCurrentMonthPaid 
                                  ? `Paid for ${admin.currentMonth}` 
                                  : `${admin.currentMonth} payment pending`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleSalaryPayment(admin)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                  admin.status === 'Paid' 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                                disabled={admin.status === 'Paid'}
                              >
                                {admin.status === 'Paid' ? 'Paid' : 'Pay Now'}
                              </button>
                              
                              {/* Add Salary Increment Button */}
                              <button 
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowSalaryModal(true);
                                }}
                                className="px-3 py-1 rounded-md text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 flex items-center"
                              >
                                <TrendingUp size={14} className="mr-1" /> Update Salary
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
  
      // Other cases remain the same
      case 'Expenses':
        return (
          <div className="space-y-6">
            {/* Expenses Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setExpensesSubPage('Supplier Payments')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    expensesSubPage === 'Supplier Payments'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Supplier Payments
                </button>
                <button
                  onClick={() => setExpensesSubPage('Other Expenses')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    expensesSubPage === 'Other Expenses'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Other Expenses
                </button>
              </div>
            </div>
      
            {/* Supplier Payments Content */}
            {expensesSubPage === 'Supplier Payments' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Supplier Payment Records</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={fetchSupplierPayments}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Refresh
                    </button>
                    <button 
                      onClick={exportSupplierPayments}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Download size={16} className="mr-2" />
                      Export CSV
                    </button>
                  </div>
                </div>
      
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Total Paid</p>
                    <p className="text-2xl font-bold text-red-700">
                      Rs. {supplierPayments
                        .filter(p => p.status === 'paid' || p.status === 'Success' || p.status === 'Succeeded')
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">Pending Payments</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      Rs. {supplierPayments
                        .filter(p => p.status === 'pending' || p.status === 'Pending')
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Active Suppliers</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {new Set(supplierPayments.map(p => p.supplierName || p.supplier)).size}
                    </p>
                  </div>
                </div>
      
                {/* Supplier Payments Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Supplier Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Invoice Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Payment Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-10 text-center">
                            <Loader className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-gray-500">Loading supplier payments...</p>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-10 text-center text-red-500">
                            <p>{error}</p>
                            <button 
                              onClick={fetchSupplierPayments} 
                              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              Try Again
                            </button>
                          </td>
                        </tr>
                      ) : supplierPayments.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                            No supplier payments found
                          </td>
                        </tr>
                      ) : (
                        supplierPayments.map((payment, index) => (
                          <tr key={payment.id || payment._id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.supplierName || payment.supplier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.productName || payment.product}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.quantity?.toLocaleString() || '1'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                              Rs. {payment.amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.invoiceNumber || payment.requestId?.substring(0, 8) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(
                                payment.status === 'paid' ? 'Succeeded' : 
                                payment.status === 'pending' ? 'Pending' : 'Declined'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {/* Show Pay Now button only for pending payments */}
                              {(payment.status === 'pending' || payment.status === 'Pending') && (
                                <button
                                  onClick={() => handleSupplierPaymentStatusUpdate(payment.id || payment._id, 'paid')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <div className="flex items-center">
                                      <Loader size={14} className="animate-spin mr-1" /> Processing...
                                    </div>
                                  ) : (
                                    'Pay Now'
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
      
            {/* Other Expenses Content */}
            {expensesSubPage === 'Other Expenses' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Other Expenses</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportExpensesData()}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <FileText size={16} className="mr-2" />
                      Export Records
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                            No expenses recorded
                          </td>
                        </tr>
                      ) : (
                        adminExpenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.month || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{expense.employeeName}</div>
                              <div className="text-xs text-gray-500">{expense.employeeEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                              Rs. {expense.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => {
                                  alert(
                                    `Payment Details:\n\n` +
                                    `Month: ${expense.details.month || 'N/A'} ${expense.details.year || ''}\n` +
                                    `Basic Salary: Rs. ${expense.details.basicSalary.toLocaleString()}\n` +
                                    `EPF (Employee): Rs. ${expense.details.epfEmployee.toLocaleString()}\n` +
                                    `EPF (Employer): Rs. ${expense.details.epfEmployer.toLocaleString()}\n` +
                                    `ETF: Rs. ${expense.details.etf.toLocaleString()}\n` +
                                    `Net Salary: Rs. ${expense.details.netSalary.toLocaleString()}\n` +
                                    `Payment Date: ${new Date(expense.details.paymentDate).toLocaleString()}`
                                  );
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case 'Incomes':
        return renderIncomePanel();
      case 'Commission Income':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Commission Income</h2>
                <div className="flex space-x-2">
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Total Commission Income</p>
                  <p className="text-2xl font-bold text-purple-700">
                    Rs. {(paymentStats?.commissionIncome || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Average Commission Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {commissionPayments.length > 0
                      ? (commissionPayments.reduce((sum, p) => sum + (p.commissionRate || 0), 0) / commissionPayments.length * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Total Agreements</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {commissionPayments.length}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction Type
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission Rate
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissionPayments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-3 py-10 text-center text-gray-500">
                          No commission records found
                        </td>
                      </tr>
                    ) : (
                      commissionPayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.date}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.paymentType || 'Transaction'}
                            </div>
                            <div className="text-xs text-gray-500">ID: {payment.id}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rs. {payment.originalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {(payment.commissionRate * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-purple-700">
                              Rs. {payment.commissionAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                          </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'Agreement Fees':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Agreement Fee Income</h2>
                <div className="flex space-x-2">
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Total Agreement Fee Income</p>
                  <p className="text-2xl font-bold text-orange-700">
                    Rs. {(paymentStats?.agreementFeeIncome || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Average Agreement Fee</p>
                  <p className="text-2xl font-bold text-orange-700">
                    Rs. {agreementFeePayments.length > 0
                      ? (paymentStats?.agreementFeeIncome / agreementFeePayments.length).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })
                      : 0}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Total Agreements</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {agreementFeePayments.length}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agreement Type
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agreementFeePayments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-3 py-10 text-center text-gray-500">
                          No agreement fee records found
                        </td>
                      </tr>
                    ) : (
                      agreementFeePayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.date}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.clientName}
                            </div>
                            <div className="text-xs text-gray-500">ID: {payment.id}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.agreementType}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-orange-700">
                            Rs. {parseFloat(payment.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Add the generateReport function inside the component
  const generateReport = async () => {
    try {
      setReportLoading(true);
      
      // Filter data based on selected criteria
      let filteredData = [];
      
      // Helper function to check if a date is within the selected range
      const isDateInRange = (date) => {
        if (reportDateRange === 'all') return true;
        const paymentDate = new Date(date);
        const startDate = new Date(reportStartDate);
        const endDate = new Date(reportEndDate);
        return paymentDate >= startDate && paymentDate <= endDate;
      };
      
      // Helper function to check if status matches
      const isStatusMatch = (status) => {
        if (reportStatus === 'all') return true;
        return status === reportStatus;
      };
      
      // Helper function to check if payment method matches
      const isPaymentMethodMatch = (method) => {
        if (reportPaymentMethod === 'all') return true;
        return method === reportPaymentMethod;
      };
      
      // Process data based on report type
      switch (reportType) {
        case 'all':
          // Combine all payment types
          filteredData = [
            ...payments.filter(p => isDateInRange(p.createdAt) && isStatusMatch(p.status) && isPaymentMethodMatch(p.cardType)),
            ...serviceProviderPayments.filter(p => isDateInRange(p.date) && isStatusMatch(p.status)),
            ...itemsPayments.filter(p => isDateInRange(p.date) && isStatusMatch(p.status)),
            ...commissionPayments.filter(p => isDateInRange(p.date)),
            ...agreementFeePayments.filter(p => isDateInRange(p.date) && isStatusMatch(p.status))
          ];
          break;
        case 'wages':
          // Filter admin salaries based on date range and status
          filteredData = adminSalaries
            .filter(admin => {
              // Filter by status
              if (reportStatus !== 'all' && admin.status !== reportStatus) {
                return false;
              }

              // Filter by date range
              if (reportDateRange === 'custom' && reportStartDate && reportEndDate) {
                const lastPaidDate = admin.lastPaid ? new Date(admin.lastPaid) : null;
                const startDate = new Date(reportStartDate);
                const endDate = new Date(reportEndDate);
                
                // If there's no last paid date and we're filtering by date range, exclude it
                if (!lastPaidDate) {
                  return false;
                }
                
                // Check if the last paid date falls within the selected range
                return lastPaidDate >= startDate && lastPaidDate <= endDate;
              }
              
              return true;
            })
            .map(admin => {
              const basicSalary = admin.salary || 30000;
              const epfEmployee = basicSalary * 0.08;
              const epfEmployer = basicSalary * 0.12;
              const etf = basicSalary * 0.03;
              const netSalary = basicSalary - epfEmployee;
              
              return {
                type: 'Salary Payment',
                id: admin.id,
                name: admin.name,
                email: admin.email,
                basicSalary,
                epfEmployee,
                epfEmployer,
                etf,
                netSalary,
                status: admin.status,
                lastPaid: admin.lastPaid,
                currentMonth: admin.currentMonth,
                isCurrentMonthPaid: admin.isCurrentMonthPaid
              };
            });
          break;
        case 'payments':
          filteredData = payments.filter(p => isDateInRange(p.createdAt) && isStatusMatch(p.status) && isPaymentMethodMatch(p.cardType));
          break;
        case 'service-providers':
          filteredData = serviceProviderPayments.filter(p => isDateInRange(p.date) && isStatusMatch(p.status));
          break;
        case 'inventory':
          filteredData = itemsPayments.filter(p => isDateInRange(p.date) && isStatusMatch(p.status));
          break;
        case 'commission':
          filteredData = commissionPayments.filter(p => isDateInRange(p.date));
          break;
        case 'agreement-fees':
          filteredData = agreementFeePayments.filter(p => isDateInRange(p.date) && isStatusMatch(p.status));
          break;
        default:
          filteredData = [];
      }
      
      // Generate CSV content
      const headers = reportType === 'wages' ? [
        'Type',
        'Employee ID',
        'Employee Name',
        'Email',
        'Basic Salary',
        'EPF (Employee)',
        'EPF (Employer)',
        'ETF',
        'Net Salary',
        'Status',
        'Last Paid Date',
        'Current Month',
        'Payment Status'
      ] : [
        'Type',
        'ID',
        'Name/Description',
        'Amount',
        'Status',
        'Payment Method',
        'Date',
        'Additional Info'
      ];
      
      const csvData = filteredData.map(record => {
        if (reportType === 'wages') {
          return [
            record.type,
            record.id,
            record.name,
            record.email,
            record.basicSalary,
            record.epfEmployee,
            record.epfEmployer,
            record.etf,
            record.netSalary,
            record.status,
            record.lastPaid,
            record.currentMonth,
            record.isCurrentMonthPaid ? 'Paid' : 'Pending'
          ];
        } else {
          const baseRecord = {
            type: record.paymentType || 'Payment',
            id: record._id || record.id,
            name: record.cardholderName || record.providerName || record.itemName || record.clientName || 'N/A',
            amount: record.amount || record.commissionAmount || 0,
            status: record.status || 'N/A',
            paymentMethod: record.cardType || 'N/A',
            date: new Date(record.createdAt || record.date).toLocaleString(),
            additionalInfo: ''
          };
          
          if (record.commissionRate) {
            baseRecord.additionalInfo = `Commission Rate: ${(record.commissionRate * 100).toFixed(1)}%`;
          } else if (record.quantity) {
            baseRecord.additionalInfo = `Quantity: ${record.quantity}`;
          }
          
          return [
            baseRecord.type,
            baseRecord.id,
            baseRecord.name,
            baseRecord.amount,
            baseRecord.status,
            baseRecord.paymentMethod,
            baseRecord.date,
            baseRecord.additionalInfo
          ];
        }
      });
      
      // Create and trigger download
      const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setReportLoading(false);
      setShowReportModal(false);
      showNotificationMessage('success', 'Report generated successfully');
    } catch (error) {
      setReportLoading(false);
      showNotificationMessage('error', 'Failed to generate report: ' + error.message);
    }
  };

  // Add the report modal component inside the component
  const renderReportModal = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
          <button
            onClick={() => setShowReportModal(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">All Payments</option>
                <option value="wages">Wages & Salaries</option>
                <option value="payments">Customer Payments</option>
                <option value="service-providers">Service Provider Payments</option>
                <option value="inventory">Inventory Sales</option>
                <option value="commission">Commission Income</option>
                <option value="agreement-fees">Agreement Fees</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Date Range</label>
              <select
                value={reportDateRange}
                onChange={(e) => setReportDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          
          {reportDateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">End Date</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select
                value={reportStatus}
                onChange={(e) => setReportStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            {reportType !== 'wages' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Payment Method</label>
                <select
                  value={reportPaymentMethod}
                  onChange={(e) => setReportPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="all">All Methods</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => setShowReportModal(false)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {reportLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Rest of the component remains the same
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Modern Sidebar */}
      <div className="w-64 bg-white shadow-xl">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              BuildMart
            </h1>
          </div>
        </div>

        {/* Updated Navigation */}
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
                {item.name === activePage && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Active
                  </span>
                )}
              </a>
            ))}
          </div>
        </nav>

        {/* Updated Logout Section */}
        <div className="absolute bottom-0 w-64 border-t border-gray-100">
          <div className="px-6 py-4">
            <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
            onClick={() => {
              handleLogout();
            }}
          >
              <LogOut size={18} className="mr-2 text-gray-500" />
              <span>Log out</span>

            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Enhanced Search */}
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 z-50">
                    <ul className="divide-y divide-gray-200">
                      {searchResults.map((result, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigateToSearchResult(result)}
                        >
                          <div className="text-sm font-medium text-gray-900">{result.type}</div>
                          <div className="text-xs text-gray-500">{result.supplierName || result.providerName || result.itemName || result.clientName}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* User Profile Section */}
              <div className="flex items-center space-x-6">
                
                
                {/* Enhanced Profile Button */}
                <div className="relative">
                  <button className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium ring-2 ring-gray-100">
                      AT
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-700">Miss Amanda Thenuwra</span>
                      <span className="text-xs text-gray-500">Financial Administrator</span>
                    </div>
                    
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Page Header with animation */}
            <div className="mb-8 animate-fade-in-down">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                {activePage}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-2xl">
                Manage your {activePage.toLowerCase()} and related activities with our 
                comprehensive dashboard tools and analytics
              </p>
              <div className="mt-4 flex space-x-4">
                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
                <div className="h-1 w-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            
            {/* Dynamic Page Content with container styling */}
            <div className="transform transition-all duration-300 ease-in-out">
              <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-gray-100/50">
                <div className="p-6">
                  {renderPageContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Salary Update Modal */}
      {showSalaryModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Update Salary
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAdmin.name}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowSalaryModal(false);
                    setSelectedAdmin(null);
                    setSalaryChangeAmount('');
                    setSalaryChangeType('increment');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Current Salary</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rs. {(selectedAdmin.salary || 30000).toLocaleString()}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSalaryChangeType('increment')}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      salaryChangeType === 'increment'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowUp size={20} className={salaryChangeType === 'increment' ? 'text-green-500' : 'text-gray-400'} />
                      <span className="font-medium">Increase</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setSalaryChangeType('decrement')}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      salaryChangeType === 'decrement'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowDown size={20} className={salaryChangeType === 'decrement' ? 'text-red-500' : 'text-gray-400'} />
                      <span className="font-medium">Decrease</span>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={salaryChangeAmount}
                      onChange={(e) => setSalaryChangeAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {salaryChangeAmount && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-blue-800 mb-1">New Salary</p>
                    <p className="text-xl font-bold text-blue-900">
                      Rs. {(
                        (selectedAdmin.salary || 30000) + 
                        (salaryChangeType === 'increment' ? Number(salaryChangeAmount) : -Number(salaryChangeAmount))
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowSalaryModal(false);
                    setSelectedAdmin(null);
                    setSalaryChangeAmount('');
                    setSalaryChangeType('increment');
                  }}
                  className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSalaryUpdate}
                  disabled={!salaryChangeAmount}
                  className={`px-4 py-2.5 text-white rounded-xl transition-all duration-200 font-medium ${
                    salaryChangeType === 'increment'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } ${!salaryChangeAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {salaryChangeType === 'increment' ? 'Increase' : 'Decrease'} Salary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showReportModal && renderReportModal()}
    </div>
  );
}

// Define missing functions
const exportServiceProviderData = () => {
  // Create CSV header
  const headers = [
    'Provider Name',
    'Payment ID',
    'Amount',
    'Date',
    'Status'
  ];
  
  // Convert payment data to CSV rows
  const csvData = serviceProviderPayments.map(payment => [
    payment.providerName,
    payment.id,
    payment.amount,
    payment.date,
    payment.status
  ]);
  
  // Create and trigger download
  const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `service_provider_payments_${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportInventoryData = () => {
  // Similar CSV export for inventory data
  const headers = ['Item Name', 'Customer', 'Amount', 'Date', 'Status'];
  const csvData = itemsPayments.map(payment => [
    payment.itemName,
    payment.customerName,
    payment.formattedAmount,
    payment.date,
    payment.status
  ]);
  
  const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory_sales_${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportCommissionData = () => {
  // CSV export for commission data
  const headers = ['Date', 'Transaction Type', 'Original Amount', 'Commission Rate', 'Commission Amount'];
  const csvData = commissionPayments.map(payment => [
    payment.date,
    payment.paymentType || 'Transaction',
    payment.originalAmount,
    (payment.commissionRate * 100).toFixed(1) + '%',
    payment.commissionAmount
  ]);
  
  const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `commission_income_${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportAgreementFeeData = () => {
  // CSV export for agreement fee data
  const headers = ['Client Name', 'Payment ID', 'Amount', 'Date', 'Status'];
  const csvData = agreementFeePayments.map(payment => [
    payment.clientName,
    payment.id,
    payment.amount,
    payment.date,
    payment.status
  ]);
  
  const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `agreement_fee_payments_${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Add this helper function inside the component too
const showNotificationMessage = (type, message) => {
  // Simple alert implementation (you could replace with toast notifications)
  alert(`${type.toUpperCase()}: ${message}`);
};

const generateFinancialStatementPDF = (type, paymentStats) => {
  try {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${type === 'income' ? 'Income Statement' : 'Balance Sheet'}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 14, 22);
    
    // Add company information
    doc.setFontSize(12);
    doc.text('BuildMart', 14, 30);
    doc.setFontSize(10);
    doc.text('Financial Report', 14, 37);
    
    // Add a line separator
    doc.setDrawColor(0);
    doc.line(14, 42, 196, 42);
    
    // Add table data
    const tableData = [];
    const headers = [];
    
    if (type === 'income') {
      headers.push(['Category', 'Amount (Rs.)']);
      
      // Add actual income data from paymentStats
      const inventorySales = paymentStats?.inventorySalesTotal || 0;
      const commissionIncome = paymentStats?.commissionIncome || 0;
      const agreementFeeIncome = paymentStats?.agreementFeeIncome || 0;
      const totalIncome = inventorySales + commissionIncome + agreementFeeIncome;
      
      tableData.push(['Inventory Sales', inventorySales.toLocaleString()]);
      tableData.push(['Commission Income', commissionIncome.toLocaleString()]);
      tableData.push(['Agreement Fee Income', agreementFeeIncome.toLocaleString()]);
      tableData.push(['Total Income', totalIncome.toLocaleString()]);
      
      // Add expenses if available
      if (paymentStats?.expenses) {
        tableData.push(['', '']); // Empty row for separation
        tableData.push(['Expenses', '']);
        Object.entries(paymentStats.expenses).forEach(([category, amount]) => {
          tableData.push([category, amount.toLocaleString()]);
        });
      }
      
      // Add net income
      const totalExpenses = paymentStats?.expenses ? 
        Object.values(paymentStats.expenses).reduce((sum, amount) => sum + amount, 0) : 0;
      const netIncome = totalIncome - totalExpenses;
      tableData.push(['', '']); // Empty row for separation
      tableData.push(['Net Income', netIncome.toLocaleString()]);
    } else {
      headers.push(['Account', 'Amount (Rs.)']);
      
      // Add actual balance sheet data
      const totalAssets = paymentStats?.inventorySalesTotal || 0;
      const totalLiabilities = paymentStats?.expenses ? 
        Object.values(paymentStats.expenses).reduce((sum, amount) => sum + amount, 0) : 0;
      const equity = totalAssets - totalLiabilities;
      
      tableData.push(['Assets', '']);
      tableData.push(['  Total Assets', totalAssets.toLocaleString()]);
      tableData.push(['', '']);
      tableData.push(['Liabilities', '']);
      tableData.push(['  Total Liabilities', totalLiabilities.toLocaleString()]);
      tableData.push(['', '']);
      tableData.push(['Equity', equity.toLocaleString()]);
    }
    
    // Add the table using autoTable
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' } // Right-align the amount column
      }
    });
    
    // Save the PDF
    doc.save(`${type === 'income' ? 'income_statement' : 'balance_sheet'}_${currentDate.replace(/\//g, '-')}.pdf`);
    
    showNotificationMessage('success', `${type === 'income' ? 'Income Statement' : 'Balance Sheet'} generated successfully`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    showNotificationMessage('error', 'Failed to generate PDF: ' + error.message);
  }
};

export default PaymentDashboard;

