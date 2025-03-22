import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronDown, Search, LogOut, Filter, Download, 
  Plus, MoreHorizontal, CreditCard, 
  DollarSign, TrendingUp, Users, Box, Activity,
  LayoutDashboard, ShoppingCart, Wallet, Sliders,
  ArrowDownRight, ArrowUpRight, Loader, RefreshCw, 
  FileText, Check, X, ChevronRight, BarChart2, Percent,
  Clock // Add this import
} from 'lucide-react';
import { useSupplierPayments } from '../context/SupplierPaymentContext';

function PaymentDashboard() {
  // Keep existing state variables
  const [activePage, setActivePage] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('service-providers');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [payments, setPayments] = useState([]);
  const [serviceProviderPayments, setServiceProviderPayments] = useState([]);
  const [itemsPayments, setItemsPayments] = useState([]);
  const [commissionPayments, setCommissionPayments] = useState([]); // Add this line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  const [incrementAmount, setIncrementAmount] = useState(0);
  const [incrementType, setIncrementType] = useState('fixed'); // 'fixed' or 'percentage'
  const [salaryChangeType, setSalaryChangeType] = useState('increment'); // Add this for increment/decrement

  // Add these state variables at the top of the component
  const [adminExpenses, setAdminExpenses] = useState([]);

  // Keep existing paymentStats state
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    serviceProviderTotal: 0,  // Ensure this has a default value of 0
    inventorySalesTotal: 0,
    commissionIncome: 0,
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
      const url = `http://localhost:5000/api/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
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

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  // Update payment status
  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/status`, {
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

  // Initialize stats counters with default values
  const stats = {
    totalAmount: 0,
    serviceProviderTotal: 0,
    inventorySalesTotal: 0,
    commissionIncome: 0,
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

      // CATEGORIZATION LOGIC - FIXED & IMPROVED:
      
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
      
      // 1. Service Provider Payments (milestone payments)
      if (isServiceProvider) {        
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
      // 2. Inventory Sales - exclude service provider payments
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
      // 3. Fallback for any unclassified payments (not service provider or inventory)
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
      
      // 4. Commission Income - SEPARATE logic (can apply to any payment)
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
  } else {
    console.log("No payment data or empty array");
    
    // If data is empty or invalid, ensure we set default values
    setPaymentStats(stats);
    setServiceProviderPayments([]);
    setItemsPayments([]);
    setCommissionPayments([]);
  }
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
  }, []);

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    if (expensesSubPage === 'Supplier Payments') {
      // Fetch supplier payments from your API
      const fetchSupplierPayments = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://localhost:5000/api/supplier-payments');
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

  // Add this to useEffect
  useEffect(() => {
    fetchAdminSalaries();
  }, []);

  // Add this function to fetch admin salaries
  const fetchAdminSalaries = async () => {
    try {
      setIsLoadingAdmins(true);
      const response = await axios.get('http://localhost:5000/auth/admins');
      
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
  
        // Create expense record with month information
        const salaryExpense = {
          id: `SAL-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'Salary Payment',
          month: monthName,
          employeeId: admin.id,
          employeeName: admin.name,
          employeeEmail: admin.email,
          amount: netSalary,
          details: {
            basicSalary,
            epfEmployee,
            epfEmployer,
            etf,
            netSalary,
            paymentDate: new Date().toISOString(),
            month: monthName,
            year: currentDate.getFullYear()
          }
        };
  
        // Add to expenses array
        setAdminExpenses(prev => [...prev, salaryExpense]);
  
        // Send payment data to backend
        const response = await axios.post('http://localhost:5000/auth/admins/pay-salary', {
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
          }
        });
        
        if (response.status === 200) {
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
  
          // Show success message
          alert(`${monthName} salary payment processed successfully for ${admin.name}!`);
          
          // Set expensesSubPage to 'Other Expenses' to show the newly added expense
          setExpensesSubPage('Other Expenses');
          // Navigate to Expenses page to show the newly added expense
          setActivePage('Expenses');
        } else {
          throw new Error('Failed to process payment on server');
        }
      } catch (error) {
        console.error('Error processing salary payment:', error);
        alert('Failed to process salary payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSalaryUpdate = async () => {
    try {
      if (!selectedAdmin) return;
      
      const currentSalary = selectedAdmin.salary || 30000;
      let newSalary = currentSalary;
      let actualChange = 0;
      
      // Calculate change based on increment or decrement
      if (incrementType === 'fixed') {
        actualChange = Number(incrementAmount);
        newSalary = salaryChangeType === 'increment' ? 
          currentSalary + actualChange : 
          currentSalary - actualChange;
      } else {
        // Percentage change
        actualChange = (currentSalary * Number(incrementAmount) / 100);
        newSalary = salaryChangeType === 'increment' ? 
          currentSalary + actualChange : 
          currentSalary - actualChange;
      }
      
      // Prevent negative salary
      if (newSalary < 0) {
        alert('Salary cannot be negative. Operation cancelled.');
        return;
      }
      
      // Round to 2 decimal places
      newSalary = Math.round(newSalary * 100) / 100;
      
      // Log the data being sent
      console.log('Updating salary:', {
        adminId: selectedAdmin.id,
        currentSalary,
        newSalary,
        incrementType,
        incrementAmount,
        salaryChangeType,
        actualChange: salaryChangeType === 'increment' ? actualChange : -actualChange
      });
      
      const response = await axios.patch(`http://localhost:5000/auth/admins/${selectedAdmin.id}/salary`, {
        salary: newSalary
      });
      
      console.log('Response:', response.data);
      
      if (response.data) {
        // Show success notification with increment/decrement info
        const changeText = salaryChangeType === 'increment' ? 'increased' : 'decreased';
        alert(`Salary ${changeText} successfully! New salary: Rs. ${newSalary.toLocaleString()}`);
        
        // Refresh admin salaries data
        fetchAdminSalaries();
        
        // Close modal
        setShowSalaryModal(false);
        setSelectedAdmin(null);
        setIncrementAmount(0);
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      const errorMessage = error.response ? 
        `Failed to update salary: ${error.response.status} - ${error.response.data?.message || error.message}` :
        `Failed to update salary: ${error.message}`;
      alert(errorMessage);
    }
  };

  // Removed duplicate declaration of handleSalaryPayment

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
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
      change: "+12.5%",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: "up",
      isIncome: false // Mark this as not income
    },
    {
      title: "Inventory Sales",
      value: `Rs. ${(paymentStats?.inventorySalesTotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      change: "+8.2%",
      icon: <ShoppingCart className="h-6 w-6 text-green-600" />,
      trend: "up",
      isIncome: true
    },
    {
      title: "Commission Income",
      value: `Rs. ${(paymentStats?.commissionIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      change: "+5.7%",
      icon: <Percent className="h-6 w-6 text-purple-600" />,
      trend: "up",
      isIncome: true
    },
    {
      title: "Total Income",
      value: `Rs. ${((paymentStats?.inventorySalesTotal || 0) + 
              (paymentStats?.commissionIncome || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      change: "+10.4%",
      icon: <DollarSign className="h-6 w-6 text-indigo-600" />,
      trend: "up",
      isIncome: true
    }
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Service Providers', icon: <Users size={20} /> },
    { name: 'Inventory Sales', icon: <ShoppingCart size={20} /> },
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
                <span className="text-green-600">+12.5% from last month</span>
              </div>
            </div>
  
            
            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="text-sm font-medium text-purple-600">Commission Income</p>
              <p className="text-2xl font-bold text-purple-700">
                Rs. {(paymentStats?.commissionIncome || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="text-purple-500 mr-1" size={16} />
                <span className="text-purple-600">+5.7% from last month</span>
              </div>
            </div>
  
            <div className="bg-indigo-50 p-6 rounded-xl">
              <p className="text-sm font-medium text-indigo-600">Total Income</p>
              <p className="text-2xl font-bold text-indigo-700">
                Rs. {((paymentStats?.inventorySalesTotal || 0) + 
                      (paymentStats?.commissionIncome || 0)).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="text-indigo-500 mr-1" size={16} />
                <span className="text-indigo-600">+10.4% from last month</span>
              </div>
            </div>
          </div>
          
          {/* Commission Income Section */}
          <div className="mt-8 mb-8">
            <h3 className="text-lg font-semibold mb-4">Commission Income</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionPayments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        No commission income records found
                      </td>
                    </tr>
                  ) : (
                    commissionPayments.slice(0, 5).map((payment, index) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.paymentType || 'Transaction'} #{payment.id.substring(payment.id.length - 6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rs. {payment.originalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(payment.commissionRate * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                  {commissionPayments.length > 5 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-3 text-center">
                        <button 
                          onClick={() => setActivePage('Commission Income')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View All Commission Income Records
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
            {/* Dashboard Controls */}
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
                  onClick={exportPayments}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <FileText size={16} className="mr-2" />
                  Export Data
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
              </div>
            </div>
            
            {/* Display Filters */}
            {renderFilters()}
            
            {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((_, index) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className={`text-xs font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <TrendingUp 
                        size={16} 
                        className={`ml-2 ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        } ${stat.trend === 'down' ? 'transform rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Payment Methods Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-gray-300 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {paymentMethodsData.map((method, index) => (
                    <div key={index} className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">{method.method}</span>
                        <span className="text-sm font-semibold text-gray-900">{method.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
                  <button
                    onClick={() => exportServiceProviderData()}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FileText size={16} className="mr-2" />
                    Export Records
                  </button>
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
                  <button
                    onClick={() => exportInventoryData()}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FileText size={16} className="mr-2" />
                    Export Records
                  </button>
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
  
      // ... rest of your cases remain the same
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
                    <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                      <Download size={16} className="mr-2" />
                      Export
                    </button>
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
                          Invoice Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
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
                      {supplierPayments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                            No supplier payments found
                          </td>
                        </tr>
                      ) : (
                        supplierPayments.map((payment, index) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.supplierName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.invoiceNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rs. {payment.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => viewPaymentDetails(payment)}
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
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
                  <button
                    onClick={() => exportCommissionData()}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FileText size={16} className="mr-2" />
                    Export Records
                  </button>
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
                  <p className="text-sm text-purple-600 font-medium">Commission Transactions</p>
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
                              {payment.paymentType === 'milestone' 
                                ? 'Milestone Payment' 
                                : payment.paymentType === 'inventory' 
                                  ? 'Inventory Sale'
                                  : 'Transaction'}
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
      default:
        return null;
    }
  };

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
            <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
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
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments, providers, items..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* User Profile Section */}
              <div className="flex items-center space-x-6">
                
                
                {/* Enhanced Profile Button */}
                <div className="relative">
                  <button className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <img
                      className="h-10 w-10 rounded-lg object-cover ring-2 ring-gray-100"
                      src="https://via.placeholder.com/40"
                      alt="User"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-700">Miss Amanda Thenuwra</span>
                      <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
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

      {/* Salary Increment Modal */}
      {showSalaryModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Salary Increment - {selectedAdmin.name}
              </h3>
              <button 
                onClick={() => {
                  setShowSalaryModal(false);
                  setSelectedAdmin(null);
                  setIncrementAmount(0);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current Salary</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs. {(selectedAdmin.salary || 30000).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Increment Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      className="form-radio" 
                      name="incrementType" 
                      value="fixed" 
                      checked={incrementType === 'fixed'}
                      onChange={() => setIncrementType('fixed')}
                    />
                    <span className="ml-2">Fixed Amount</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      className="form-radio" 
                      name="incrementType" 
                      value="percentage" 
                      checked={incrementType === 'percentage'}
                      onChange={() => setIncrementType('percentage')}
                    />
                    <span className="ml-2">Percentage</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {incrementType === 'fixed' ? 'Increment Amount (Rs.)' : 'Increment Percentage (%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step={incrementType === 'fixed' ? '1000' : '0.5'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={incrementAmount}
                  onChange={(e) => setIncrementAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      className="form-radio" 
                      name="salaryChangeType" 
                      value="increment" 
                      checked={salaryChangeType === 'increment'}
                      onChange={() => setSalaryChangeType('increment')}
                    />
                    <span className="ml-2">Increment</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      className="form-radio" 
                      name="salaryChangeType" 
                      value="decrement" 
                      checked={salaryChangeType === 'decrement'}
                      onChange={() => setSalaryChangeType('decrement')}
                    />
                    <span className="ml-2">Decrement</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">New Salary</p>
                <p className="text-xl font-bold text-blue-900">
                  Rs. {(incrementType === 'fixed' 
                    ? (selectedAdmin.salary || 30000) + (salaryChangeType === 'increment' ? Number(incrementAmount || 0) : -Number(incrementAmount || 0))
                    : (selectedAdmin.salary || 30000) * (1 + (salaryChangeType === 'increment' ? Number(incrementAmount || 0) / 100 : -Number(incrementAmount || 0) / 100))
                  ).toLocaleString()}
                </p>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  Current Salary: <span className="font-medium">Rs. {(selectedAdmin?.salary || 30000).toLocaleString()}</span>
                </p>
                {incrementAmount > 0 && (
                  <p className="text-sm text-gray-700 mt-1">
                    {salaryChangeType === 'increment' ? 'New' : 'New'} Salary: 
                    <span className={`font-medium ${salaryChangeType === 'increment' ? 'text-green-600' : 'text-red-600'}`}>
                      {' '}Rs. {salaryChangeType === 'increment' 
                        ? (selectedAdmin?.salary + (incrementType === 'fixed' ? Number(incrementAmount) : (selectedAdmin?.salary * Number(incrementAmount) / 100))).toLocaleString()
                        : (selectedAdmin?.salary - (incrementType === 'fixed' ? Number(incrementAmount) : (selectedAdmin?.salary * Number(incrementAmount) / 100))).toLocaleString()
                      }
                    </span>
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowSalaryModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSalaryUpdate}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {salaryChangeType === 'increment' ? 'Increase' : 'Decrease'} Salary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Define missing functions
const showNotificationMessage = (type, message) => {
  // Simple alert implementation (you could replace with toast notifications)
  alert(`${type.toUpperCase()}: ${message}`);
};

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

const exportExpensesData = () => {
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
  link.setAttribute('download', `expenses_${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default PaymentDashboard;

