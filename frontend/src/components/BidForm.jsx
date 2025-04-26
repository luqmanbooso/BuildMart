import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BidForm = ({ sampleData }) => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [contractorInfo, setContractorInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeUp: false
  });
  
  // Cost Breakdown state
  const [costBreakdown, setCostBreakdown] = useState([]);
  const [newCostItem, setNewCostItem] = useState({ description: '', amount: '' });
  const [costTotal, setCostTotal] = useState(0);
  
  // Timeline Breakdown state - modified to have fixed start date
  const [timelineBreakdown, setTimelineBreakdown] = useState({
    startDate: '',
    endDate: '',
    totalDays: 0
  });
  
  // New state for work item function
  const [newWorkItem, setNewWorkItem] = useState({
    name: '',
    startDate: '',
    endDate: '',
    duration: 0
  });
  const [workItems, setWorkItems] = useState([]);
  const [workItemError, setWorkItemError] = useState(null);
  
  // Special Requests state
  const [specialRequests, setSpecialRequests] = useState('');
  const [specialRequestsError, setSpecialRequestsError] = useState(null);
  
  // Validation error states
  const [costBreakdownError, setCostBreakdownError] = useState(null);
  const [timelineBreakdownError, setTimelineBreakdownError] = useState(null);
  
  // Maximum project duration (1 year)
  const MAX_PROJECT_DURATION = 365;
  
  // Maximum word count for special requests
  const MAX_SPECIAL_REQUESTS_WORDS = 300;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
    unregister,
  } = useForm({
    mode: "onChange", 
    defaultValues: {
      yourBid: "",
      specialRequests: ""
    }
  });
  
  // Watch for changes in the bid amount
  const watchBidAmount = watch("yourBid");

  // Calculate cost total whenever costBreakdown changes with enhanced validation
  useEffect(() => {
    const total = costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    setCostTotal(total);
    
    if (total > 0 && watchBidAmount && parseFloat(watchBidAmount) > 0) {
      const bidAmount = parseFloat(watchBidAmount);
      const difference = Math.abs(total - bidAmount).toFixed(2);
      
      if (total !== bidAmount) {
        if (total < bidAmount) {
          setCostBreakdownError(`Cost breakdown total is ${difference} less than bid amount. Please add items totaling exactly ${bidAmount}.`);
        } else {
          setCostBreakdownError(`Cost breakdown total exceeds bid amount by ${difference}. Total must equal ${bidAmount} exactly.`);
        }
      } else {
        setCostBreakdownError(null);
      }
    }
  }, [costBreakdown, watchBidAmount]);

  // Add utility function to validate and format decimal input
  const formatDecimalInput = (value) => {
    // Remove any non-numeric characters except decimal point
    let formattedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = formattedValue.split('.');
    if (parts.length > 2) {
      formattedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Ensure max 2 decimal places
    if (parts.length > 1) {
      formattedValue = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return formattedValue;
  };
  
  // Check if a value is a valid decimal with up to 2 decimal places
  const isValidDecimal = (value) => {
    if (!value) return false;
    // Allow empty string for intermediate states
    if (value === '') return true;
    // Check for valid decimal format with max 2 decimal places
    return /^[0-9]+(\.[0-9]{1,2})?$/.test(value);
  };

  // Simplified cost breakdown validation
  const validateCostItem = (item) => {
    if (!item.description) {
      return "Description is required";
    }
    if (!item.amount) {
      return "Amount is required";
    }
    const amountValue = parseFloat(item.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Amount must be greater than zero";
    }
    return null;
  };

  // Modified validateCostBreakdown function to enforce bid amount requirement
  const validateCostBreakdown = () => {
    if (!watchBidAmount || parseFloat(watchBidAmount) <= 0) {
      return "Please enter a valid bid amount first";
    }
    
    if (costBreakdown.length === 0) {
      return "Please add at least one cost breakdown item";
    }
    
    const total = costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const bidAmount = parseFloat(watchBidAmount);
    
    // Allow small floating point difference (0.01)
    if (Math.abs(total - bidAmount) > 0.01) {
      return `Cost breakdown total (${total.toFixed(2)}) must match bid amount (${bidAmount.toFixed(2)})`;
    }
    
    return null;
  };

  // Simplified handler for adding cost items with improved bid amount check
  const handleAddCostItem = () => {
    // First check if bid amount is entered
    if (!watchBidAmount || parseFloat(watchBidAmount) <= 0) {
      setCostBreakdownError("Please enter a valid bid amount first before adding cost items");
      return;
    }
    
    if (!newCostItem.description || !newCostItem.amount) {
      setCostBreakdownError("Both description and amount are required");
      return;
    }
    
    // Validate amount is a number
    if (!isValidDecimal(newCostItem.amount)) {
      setCostBreakdownError("Amount must be a valid number with up to 2 decimal places");
      return;
    }
    
    // Enhanced validation for description field
    if (!newCostItem.description.trim()) {
      setCostBreakdownError("Description cannot be empty");
      return;
    }
    
    // Validate no special characters in description and enforce word limit
    const descriptionRegex = /^[a-zA-Z0-9\s,.-]+$/;
    if (!descriptionRegex.test(newCostItem.description)) {
      setCostBreakdownError("Description can only contain letters, numbers, commas, periods, and hyphens");
      return;
    }
    
    // Check word limit (max 10 words)
    const wordCount = newCostItem.description.trim().split(/\s+/).length;
    if (wordCount > 10) {
      setCostBreakdownError("Description cannot exceed 10 words");
      return;
    }
    
    // Enhanced validation for amount
    const amountValue = parseFloat(newCostItem.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setCostBreakdownError("Amount must be greater than zero");
      return;
    }
    
    // Maximum amount validation
    if (amountValue > 10000000) {  // 10 million limit
      setCostBreakdownError("Amount cannot exceed 10,000,000");
      return;
    }
    
    // Calculate new total to validate against bid amount
    const currentTotal = costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const newTotal = currentTotal + amountValue;
    const bidAmount = parseFloat(watchBidAmount);
    
    // Check if adding this item would exceed the bid amount
    if (newTotal > bidAmount) {
      const remaining = bidAmount - currentTotal;
      setCostBreakdownError(`Adding this item would exceed your bid amount. You can add up to ${remaining.toFixed(2)} more.`);
      return;
    }
    
    // Format description to include cost part
    const formattedDescription = newCostItem.description.trim();
    
    setCostBreakdown([...costBreakdown, {
      description: formattedDescription,
      amount: amountValue
    }]);
    
    // Reset form fields after successful addition
    setNewCostItem({ description: '', amount: '' });
    setCostBreakdownError(null);
  };

  // Handler for removing cost items
  const handleRemoveCostItem = (index) => {
    const updatedBreakdown = [...costBreakdown];
    updatedBreakdown.splice(index, 1);
    setCostBreakdown(updatedBreakdown);
  };
  
  // Set auction end date as start date for timeline
  useEffect(() => {
    if (jobDetails?.biddingEndTime) {
      const auctionEndDate = new Date(jobDetails.biddingEndTime);
      // Format date to YYYY-MM-DD for input[type="date"]
      const formattedDate = auctionEndDate.toISOString().split('T')[0];
      setTimelineBreakdown(prev => ({
        ...prev,
        startDate: formattedDate
      }));
    }
  }, [jobDetails]);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setUserInfo({
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          experienceYears: decoded.experienceYears,
          completedProjects: decoded.completedProjects
        });
      } else {
        setSubmissionError("Authentication required. Please log in.");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setSubmissionError("Authentication error. Please log in again.");
    }
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    
    const fetchContractorProfile = async () => {
      try {
        const contractorResponse = await axios.get(`http://localhost:5000/api/contractors//${userInfo.userId}`);
        setContractorInfo(contractorResponse.data);
        console.log("Contractor data:", contractorResponse.data);
        


        setValue("contractorName", contractorResponse.data.companyName || userInfo.username);
        setValue("contractorId", userInfo.userId);
        setValue("experience", contractorResponse.data.experienceYears || "");
        


        setTimeout(() => {
          fetchQualifications(userInfo.userId, contractorResponse.data);
        }, 100);
        
      } catch (contractorError) {
        console.warn("Could not fetch contractor profile:", contractorError);
        setValue("contractorName", userInfo.username);
        setValue("contractorId", userInfo.userId);
      }
    };
    
    fetchContractorProfile();
  }, [userInfo, setValue]);

  useEffect(() => {
    if (!jobId && !sampleData) return;
    
    const fetchJobDetails = async () => {
      setLoading(true);
      
      try {
        if (jobId) {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          // Fix API endpoint - use the working endpoint directly instead of trying multiple ones
          try {
            const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            setJobDetails(jobResponse.data);
            console.log("Job data:", jobResponse.data);
            setValue("projectName", jobResponse.data.title || "Untitled Project");
            
            if (jobResponse.data.biddingEndTime) {
              updateTimer(new Date(jobResponse.data.biddingEndTime));
            } else if (jobResponse.data.biddingStartTime) {
              const endDate = new Date(jobResponse.data.biddingStartTime);
              endDate.setDate(endDate.getDate() + 7);
              updateTimer(endDate);
            }
          } catch (jobError) {
            console.error("Error fetching job details:", jobError);
            setSubmissionError("Could not load job details. Please try again later.");
          }
        } else if (sampleData) {
          setJobDetails(sampleData);
          setValue("projectName", sampleData.title || "Sample Project");
          
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 3); 
          updateTimer(endDate);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setSubmissionError(`Failed to load project details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, sampleData, setValue]);

  const fetchQualifications = async (userId, contractorData) => {
    try {
      console.log("About to fetch qualifications for user:", userId);
      
      const endpoint = `http://localhost:5000/qualify/user/${userId}`;
      
      try {
        const qualificationResponse = await axios.get(endpoint, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const qualificationData = qualificationResponse.data;
        
        if (qualificationData && Array.isArray(qualificationData) && qualificationData.length > 0) {
          console.log(`Qualifications found:`, qualificationData);
          setQualifications(qualificationData);
        } else if (qualificationData && typeof qualificationData === 'object' && !Array.isArray(qualificationData)) {
          console.log("Converting single qualification to array");
          setQualifications([qualificationData]);
        } else {
          createDefaultQualification(contractorData);
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
        createDefaultQualification(contractorData);
      }
    } catch (error) {
      console.warn("Final qualification fetch error:", error);
      createDefaultQualification(contractorData);
    }
  };
  
  // Helper function for creating default qualification
  const createDefaultQualification = (contractorData) => {
    if (contractorData?.experienceYears) {
      const defaultQualifications = [{
        type: "Experience",
        name: `${contractorData.experienceYears} years in construction`,
        issuer: contractorData.companyName || userInfo?.username,
        year: new Date().getFullYear().toString()
      }];
      console.log("Created default qualifications:", defaultQualifications);
      setQualifications(defaultQualifications);
    }
  };

  const updateTimer = (endDate) => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;
      
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0, 
          seconds: 0,
          timeUp: true
        });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        timeUp: false
      });
    };
    
    calculateTime();
    
    const interval = setInterval(calculateTime, 1000);
    
    return () => clearInterval(interval);
  };

const minBudget = jobDetails?.minBudget || "0";
const maxBudget = jobDetails?.maxBudget || "0";
const projectTitle = jobDetails?.title || "";
const projectDescription = jobDetails?.description || "";
  
  const handleBackToProject = () => {
    navigate(jobId ? `/project/${jobId}` : `/project-details`);
  };

  // Enhanced validation for bid amount
  const validateBidAmount = (value) => {
    if (!value) return "Bid amount is required";
    if (!isValidDecimal(value)) return "Please enter a valid number with up to 2 decimal places";
    
    const bidAmount = parseFloat(value);
    if (isNaN(bidAmount) || bidAmount <= 0) return "Bid amount must be greater than zero";
    
    const minValue = parseFloat(minBudget);
    if (minValue && bidAmount < minValue) return `Bid must be at least LKR ${minBudget}`;
    
    const maxValue = parseFloat(maxBudget);
    if (maxValue && bidAmount > maxValue) return `Bid cannot exceed LKR ${maxBudget}`;
    
    return null;
  };

  // Simplified timeline validation
  const validateTimeline = () => {
    if (!timelineBreakdown.startDate) {
      return "Start date is required";
    }
    if (!timelineBreakdown.endDate) {
      return "End date is required";
    }

    const start = new Date(timelineBreakdown.startDate);
    const end = new Date(timelineBreakdown.endDate);
    
    // Calculate days difference
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays > MAX_PROJECT_DURATION) {
      return `Project duration cannot exceed ${MAX_PROJECT_DURATION} days (1 year)`;
    }
    
    return null;
  };

  // Calculate max end date (1 year from start date)
  const getMaxEndDate = () => {
    if (!timelineBreakdown.startDate) return '';
    const startDate = new Date(timelineBreakdown.startDate);
    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + MAX_PROJECT_DURATION);
    return maxDate.toISOString().split('T')[0];
  };

  // Simplified end date handler
  const handleEndDateChange = (value) => {
    if (!value) {
      setTimelineBreakdownError("End date is required");
      return;
    }
    
    if (!timelineBreakdown.startDate) {
      setTimelineBreakdownError("Please select a start date first");
      return;
    }
    
    const start = new Date(timelineBreakdown.startDate);
    const end = new Date(value);
    
    // Calculate days difference
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    setTimelineBreakdown({
      startDate: timelineBreakdown.startDate,
      endDate: value,
      totalDays: diffDays
    });
    
    setTimelineBreakdownError(null);
  };

  // Enhanced validation for work items
  const validateWorkItem = (item) => {
    if (!item.name.trim()) return "Work item name is required";
    if (!item.startDate) return "Start date is required";
    if (!item.endDate) return "End date is required";
    
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    
    if (end < start) return "End date cannot be before start date";
    
    const projectStart = new Date(timelineBreakdown.startDate);
    const projectEnd = new Date(timelineBreakdown.endDate);
    
    if (start < projectStart) return "Work item cannot start before project start date";
    if (end > projectEnd) return "Work item cannot end after project end date";
    
    return null;
  };

  // Add missing handleWorkItemChange function - currently referenced but not fully implemented
  const handleWorkItemChange = (e) => {
    const { name, value } = e.target;
    setNewWorkItem(prev => ({ ...prev, [name]: value }));
    
    // Calculate duration if both dates are set
    if (name === 'startDate' || name === 'endDate') {
      const startDate = name === 'startDate' ? value : newWorkItem.startDate;
      const endDate = name === 'endDate' ? value : newWorkItem.endDate;
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate with project timeline
        if (timelineBreakdown.startDate) {
          const projectStart = new Date(timelineBreakdown.startDate);
          if (start < projectStart) {
            setWorkItemError("Work item cannot start before project start date");
            return;
          }
        }
        
        if (timelineBreakdown.endDate) {
          const projectEnd = new Date(timelineBreakdown.endDate);
          if (end > projectEnd) {
            setWorkItemError("Work item cannot end after project end date");
            return;
          }
        }
        
        if (end < start) {
          setWorkItemError("End date cannot be before start date");
          return;
        }
        
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setNewWorkItem(prev => ({ ...prev, duration: diffDays }));
        setWorkItemError(null);
      }
    }
  };

  // Add missing handleAddWorkItem function
  const handleAddWorkItem = () => {
    // Validate input
    if (!newWorkItem.name.trim()) {
      setWorkItemError("Work item name is required");
      return;
    }
    
    if (!newWorkItem.startDate) {
      setWorkItemError("Start date is required");
      return;
    }
    
    if (!newWorkItem.endDate) {
      setWorkItemError("End date is required");
      return;
    }
    
    // Validate that work item is within project timeline
    const itemStartDate = new Date(newWorkItem.startDate);
    const itemEndDate = new Date(newWorkItem.endDate);
    const projectStartDate = new Date(timelineBreakdown.startDate);
    const projectEndDate = new Date(timelineBreakdown.endDate);
    
    if (itemStartDate < projectStartDate) {
      setWorkItemError("Work item cannot start before project start date");
      return;
    }
    
    if (itemEndDate > projectEndDate) {
      setWorkItemError("Work item cannot end after project end date");
      return;
    }
    
    // Add item to work items
    setWorkItems([...workItems, { ...newWorkItem }]);
    
    // Reset form
    setNewWorkItem({
      name: '',
      startDate: '',
      endDate: '',
      duration: 0
    });
    setWorkItemError(null);
  };

  // Add missing handleRemoveWorkItem function
  const handleRemoveWorkItem = (index) => {
    const updatedItems = [...workItems];
    updatedItems.splice(index, 1);
    setWorkItems(updatedItems);
  };

  // Add function to filter out invalid characters from description
  const sanitizeDescription = (input) => {
    // Only allow letters, numbers, spaces, commas, periods, and hyphens
    return input.replace(/[^a-zA-Z0-9\s,.-]/g, '');
  };

  // Function to validate special requests word count
  const validateSpecialRequests = (text) => {
    if (!text) return null; // Empty is valid
    
    const wordCount = text.trim().split(/\s+/).length;
    
    if (wordCount > MAX_SPECIAL_REQUESTS_WORDS) {
      return `Special requests cannot exceed ${MAX_SPECIAL_REQUESTS_WORDS} words (currently: ${wordCount})`;
    }
    
    return null;
  };

  // Update the onSubmit function to include special requests validation
  const onSubmit = async (data) => {
    if (timeLeft.timeUp) {
      setSubmissionError("Auction has ended. You can no longer submit bids.");
      return;
    }
    
    // Validate bid amount
    const bidAmountError = validateBidAmount(data.yourBid);
    if (bidAmountError) {
      setSubmissionError(bidAmountError);
      return;
    }
    
    // Validate cost breakdown
    const costBreakdownError = validateCostBreakdown();
    if (costBreakdownError) {
      setCostBreakdownError(costBreakdownError);
      return;
    }
    
    // Validate timeline
    const timelineError = validateTimeline();
    if (timelineError) {
      setTimelineBreakdownError(timelineError);
      return;
    }
    
    // Validate work items
    for (const item of workItems) {
      const workItemError = validateWorkItem(item);
      if (workItemError) {
        setWorkItemError(workItemError);
        return;
      }
    }
    
    // Validate special requests
    const specialRequestsError = validateSpecialRequests(data.specialRequests);
    if (specialRequestsError) {
      setSpecialRequestsError(specialRequestsError);
      return;
    }
    
    setLoading(true);
    setSubmissionError(null);

    try {
      if (!userInfo) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const bidData = {
        projectId: jobId,
        contractorId: userInfo.userId,
        contractorname: contractorInfo?.companyName || userInfo?.username || "Anonymous Contractor",
        price: parseFloat(data.yourBid),
        timeline: timelineBreakdown.totalDays,
        qualifications: `Experience: ${contractorInfo?.experienceYears || "0"} years`,
        rating: contractorInfo?.rating || null,
        completedProjects: contractorInfo?.completedProjects || userInfo?.completedProjects || 0,
        costBreakdown: costBreakdown.length > 0 ? costBreakdown : undefined,
        timelineBreakdown: {
          ...timelineBreakdown,
          workItems: workItems.length > 0 ? workItems : undefined
        },
        specialRequests: data.specialRequests || specialRequests.trim() || undefined
      };

      console.log("Sending bid data:", bidData);

      // Fix API endpoint URL - change from /api/bids/submit to /bids/submit
      const response = await axios.post("http://localhost:5000/bids/submit", bidData);

      if (response.status === 201) {
        alert("Bid Submitted Successfully!");
        navigate(`/project/${jobId}`);
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.error === 'Duplicate bid') {
          setSubmissionError("You have already submitted a bid for this project.");
        } 
        else if (errorData.error === 'Duplicate price') {
          setSubmissionError(errorData.message);
          
          if (errorData.suggestedPrice) {
            setValue("yourBid", errorData.suggestedPrice.toString());
          }
        }
        else {
          setSubmissionError(errorData.message || "Failed to submit bid. Please try again.");
        }
      } else {
        setSubmissionError(error.message || "Failed to submit bid. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = (data) => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    handleSubmit(onSubmit)();
  };

  const qualificationCount = useMemo(() => {
    return qualifications && Array.isArray(qualifications) ? qualifications.length : 0;
  }, [qualifications]);

  return (
    <div className="max-w-4xl mx-auto p-3">
      <h1 className="text-2xl font-semibold mb-4">
        Submit Bid
      </h1>
      <div>
        <form onSubmit={handleSubmit(handleConfirmation)} className="space-y-10">
          <div className="hidden">
            <input type="hidden" {...register("projectName")} value={jobDetails?.title || ""} />
            <input type="hidden" {...register("projectId")} value={jobId} />
            <input type="hidden" {...register("contractorName")} value={contractorInfo?.companyName || userInfo?.username || ""} />
            <input type="hidden" {...register("contractorId")} value={userInfo?.userId || ""} />
            <input type="hidden" {...register("experience")} value={contractorInfo?.experienceYears || "0"} />
          </div>

          {/* Form sections with visual separation */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-start">
              <span className="bg-white pr-3 text-lg font-medium text-gray-900">1. Bid Amount & Profile</span>
            </div>
          </div>

          {/* Improved grid layout for Bid Amount & Profile */}
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bid Amount Section - Enhanced */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-opacity-95 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-70 z-0"></div>
              
              <h3 className="text-lg font-semibold mb-5 text-gray-800 pb-3 border-b flex items-center relative z-10">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-lg mr-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                Your Bid Amount <span className="text-red-500 ml-1">*</span>
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 font-medium">RS</span>
                    <input
                      id="yourBid"
                      type="text" 
                      placeholder="Enter your bid amount"
                      {...register("yourBid", {
                        required: "Your bid is required",
                        maxLength: {
                          value: 12,
                          message: "Bid amount cannot exceed 12 digits"
                        },
                        pattern: {
                          value: /^[0-9]+(\.[0-9]{1,2})?$/,
                          message: "Please enter a valid number with up to 2 decimal places"
                        },
                        validate: {
                          positive: v => parseFloat(v) > 0 || "Bid must be greater than 0",
                          minBudgetCheck: v => {
                            const bidValue = parseFloat(v);
                            const minValue = parseFloat(minBudget);
                            return !minValue || bidValue >= minValue || `Bid must be at least LKR ${minBudget}`;
                          },
                          maxBudgetCheck: v => {
                            const bidValue = parseFloat(v);
                            const maxValue = parseFloat(maxBudget);
                            return !maxValue || bidValue <= maxValue || `Bid cannot exceed LKR ${maxBudget}`;
                          },
                          validFormat: v => isValidDecimal(v) || "Please enter a valid number with up to 2 decimal places"
                        }
                      })}
                      className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.yourBid ? "border-red-500 bg-red-50" : 
                        "border-gray-300 focus:border-blue-500"
                      }`}
                      onBlur={() => trigger("yourBid")}
                      onChange={(e) => {
                        // Format the input value before setting it
                        const rawValue = e.target.value;
                        const formattedValue = formatDecimalInput(rawValue);
                        
                        if (rawValue !== formattedValue) {
                          e.target.value = formattedValue;
                        }
                        
                        // Call the regular onChange handler
                        register("yourBid").onChange(e);
                      }}
                    />
                  </div>
                  {errors.yourBid && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.yourBid.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter amount in RS between {minBudget} and {maxBudget}
                  </p>
                </div>
              </div>
            </div>

            {/* Contractor Profile Preview - Enhanced */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-opacity-95 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-bl-full opacity-70 z-0"></div>
              
              <h3 className="text-lg font-semibold mb-5 text-gray-800 pb-3 border-b flex items-center relative z-10">
                <div className="bg-gradient-to-r from-green-500 to-green-700 p-2 rounded-lg mr-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                Your Profile
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{contractorInfo?.companyName || userInfo?.username || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{contractorInfo?.experienceYears || "0"} years experience</p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="text-sm text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {qualificationCount} Qualification{qualificationCount !== 1 ? 's' : ''} Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-start">
              <span className="bg-white pr-3 text-lg font-medium text-gray-900">2. Cost Breakdown</span>
            </div>
          </div>

          {/* Cost Breakdown Section - Enhanced with better visual feedback */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-opacity-95 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-100 to-transparent rounded-bl-full opacity-70 z-0"></div>
            
            <h3 className="text-lg font-semibold mb-5 text-gray-800 pb-3 border-b flex items-center relative z-10">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 rounded-lg mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              Cost Breakdown <span className="text-red-500 ml-1">*</span>
            </h3>
            
            {/* Progress bar showing completion toward bid amount */}
            {parseFloat(watchBidAmount) > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Breakdown Progress</span>
                  <span className={`text-sm font-medium ${parseFloat(watchBidAmount) === costTotal ? 'text-green-600' : 'text-blue-600'}`}>
                    {costTotal.toFixed(2)} / {parseFloat(watchBidAmount).toFixed(2)} RS
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      parseFloat(watchBidAmount) === costTotal ? 'bg-green-600' : 
                      costTotal > parseFloat(watchBidAmount) ? 'bg-red-600' : 'bg-blue-600'
                    }`} 
                    style={{ width: `${Math.min(100, (costTotal / parseFloat(watchBidAmount || 1) * 100))}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs">
                  {parseFloat(watchBidAmount) === costTotal 
                    ? "✓ Cost breakdown matches bid amount perfectly" 
                    : costBreakdownError || "Add cost items until total matches bid amount"}
                </div>
              </div>
            )}
            
            {/* Table of cost items */}
            {costBreakdown.length > 0 && (
              <div className="mb-4">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (RS)</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {costBreakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{parseFloat(item.amount).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCostItem(index)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                        <td colSpan={2} className={`px-4 py-3 text-sm font-bold text-right ${
                          parseFloat(watchBidAmount) === costTotal ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {costTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Add cost item form with improved input filtering */}
            <div className="grid md:grid-cols-12 gap-4 items-end mt-4">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-xs text-gray-500">(max 10 words, no special characters)</span>
                </label>
                <input
                  type="text"
                  value={newCostItem.description}
                  onChange={(e) => {
                    // Apply sanitization to filter out invalid characters in real-time
                    const sanitizedValue = sanitizeDescription(e.target.value);
                    setNewCostItem({...newCostItem, description: sanitizedValue});
                  }}
                  placeholder="e.g., Materials, Labor, Transportation"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (RS)
                </label>
                <input
                  type="text" // Changed from "number" to "text" for better control
                  min="0"
                  value={newCostItem.amount}
                  onChange={(e) => {
                    // Apply decimal formatting constraints in real time
                    const rawValue = e.target.value;
                    const formattedValue = formatDecimalInput(rawValue);
                    
                    // Only update if it's a valid decimal or empty
                    if (formattedValue === '' || isValidDecimal(formattedValue) || formattedValue === '.') {
                      setNewCostItem({...newCostItem, amount: formattedValue});
                    }
                  }}
                  placeholder="0.00"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Format: Maximum 2 decimal places</p>
              </div>
              
              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={handleAddCostItem}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  disabled={!watchBidAmount}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Item
                </button>
              </div>
            </div>
            
            {costBreakdownError && (
              <div className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1H9z" clipRule="evenodd" />
                </svg>
                {costBreakdownError}
              </div>
            )}
            
            <div className="mt-3 text-sm text-gray-500">
              Break down your bid amount into specific categories. The total must exactly equal your bid amount.
            </div>
          </div>

          {/* Section separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-start">
              <span className="bg-white pr-3 text-lg font-medium text-gray-900">3. Project Timeline</span>
            </div>
          </div>

          {/* Timeline Section - Enhanced */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-opacity-95 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-70 z-0"></div>
            
            <h3 className="text-lg font-semibold mb-5 text-gray-800 pb-3 border-b flex items-center relative z-10">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              Project Timeline <span className="text-red-500 ml-1">*</span>
            </h3>
            
            {/* Overall project timeline section */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Auction End)
                </label>
                <input
                  type="date"
                  value={timelineBreakdown.startDate}
                  disabled={true}
                  className="w-full p-2.5 border border-gray-300 bg-gray-100 rounded-lg text-gray-700 cursor-not-allowed"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Project starts when the auction ends
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={timelineBreakdown.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    timelineBreakdownError ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  min={timelineBreakdown.startDate}
                  max={getMaxEndDate()}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Project Duration
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-2.5">
                  <span className="text-gray-700 font-semibold">{timelineBreakdown.totalDays || '0'}</span>
                  <span className="text-gray-500 ml-1">days</span>
                </div>
              </div>
            </div>
            
            {timelineBreakdownError && (
              <div className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1H9z" clipRule="evenodd" />
                </svg>
                {timelineBreakdownError}
              </div>
            )}
            
            {/* Work Breakdown Timeline */}
            {timelineBreakdown.startDate && timelineBreakdown.endDate && (
              <div className="mt-8 border-t pt-6 border-gray-200">
                <h4 className="font-semibold text-md mb-3 text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 002-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M10 14a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  Work Breakdown Schedule
                </h4>
                
                {/* Timeline visualization */}
                {workItems.length > 0 && (
                  <div className="mb-6 mt-4">
                    <div className="relative bg-gray-100 rounded-lg p-4 overflow-x-auto">
                      <div className="min-w-[600px]">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-medium">{new Date(timelineBreakdown.startDate).toLocaleDateString()}</span>
                          <span className="text-xs font-medium">{new Date(timelineBreakdown.endDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="h-6 bg-gray-200 rounded-full mb-6 relative">
                          {/* Timeline markers */}
                          <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-full"></div>
                          <div className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-full"></div>
                        </div>

                        {/* Work items */}
                        <div className="space-y-3">
                          {workItems.map((item, index) => {
                            const projectStart = new Date(timelineBreakdown.startDate).getTime();
                            const projectEnd = new Date(timelineBreakdown.endDate).getTime();
                            const itemStart = new Date(item.startDate).getTime();
                            const itemEnd = new Date(item.endDate).getTime();
                            
                            // Calculate positioning percentages
                            const leftPos = ((itemStart - projectStart) / (projectEnd - projectStart)) * 100;
                            const width = ((itemEnd - itemStart) / (projectEnd - projectStart)) * 100;
                            
                            return (
                              <div key={index} className="relative h-8">
                                <div 
                                  className="absolute h-full bg-blue-500 rounded-md flex items-center px-2 text-white text-xs font-medium"
                                  style={{ left: `${leftPos}%`, width: `${width}%` }}
                                >
                                  {item.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Table of work items */}
                {workItems.length > 0 && (
                  <div className="mb-4">
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Item</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {workItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.startDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.endDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{item.duration} days</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWorkItem(index)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Add work item form */}
                <h5 className="font-medium text-sm mt-6 mb-3 text-gray-600">Add Work Item:</h5>
                <div className="grid md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Item Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newWorkItem.name}
                      onChange={handleWorkItemChange}
                      placeholder="e.g., Foundation, Framing"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newWorkItem.startDate}
                      onChange={handleWorkItemChange}
                      min={timelineBreakdown.startDate}
                      max={timelineBreakdown.endDate}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={newWorkItem.endDate}
                      onChange={handleWorkItemChange}
                      min={newWorkItem.startDate || timelineBreakdown.startDate}
                      max={timelineBreakdown.endDate}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddWorkItem}
                      className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Work Item
                    </button>
                  </div>
                </div>
                
                {workItemError && (
                  <div className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1H9z" clipRule="evenodd" />
                    </svg>
                    {workItemError}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-3 text-sm text-gray-500">
              First set your overall project timeline, then break it down into specific work items with their own start and end dates.
            </div>
          </div>

          {/* Section separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-start">
              <span className="bg-white pr-3 text-lg font-medium text-gray-900">4. Special Requests</span>
            </div>
          </div>

          {/* Special Requests Section - Modified with word limit and error handling */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-opacity-95 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-70 z-0"></div>
            
            <h3 className="text-lg font-semibold mb-5 text-gray-800 pb-3 border-b flex items-center relative z-10">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-lg mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              Special Requests & Additional Details <span className="text-xs text-gray-500 ml-2">(max {MAX_SPECIAL_REQUESTS_WORDS} words)</span>
            </h3>
            
            <div className="space-y-3 relative z-10">
              <p className="text-sm text-gray-600 mb-4 bg-purple-50/70 p-4 rounded-lg border-l-4 border-purple-400 shadow-sm">
                Use this section to include any special considerations, approach details, or requirements that will help your bid stand out from competitors. This is your opportunity to demonstrate your understanding of the project's unique challenges.
              </p>
              
              <textarea
                id="specialRequests"
                {...register("specialRequests")}
                className={`w-full p-4 border ${specialRequestsError ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm`}
                rows="5"
                placeholder="Describe your approach, special requirements, specific materials, or other custom requests for this project..."
                onChange={(e) => {
                  const value = e.target.value;
                  register("specialRequests").onChange(e);
                  setSpecialRequests(value);
                  const charCount = value.trim().length;
                  if (charCount > MAX_SPECIAL_REQUESTS_WORDS) {
                    setSpecialRequestsError(`Character limit exceeded (${charCount}/${MAX_SPECIAL_REQUESTS_WORDS} characters)`);
                  } else {
                    setSpecialRequestsError(null);
                  }
                }}
              ></textarea>
              
              <div className="flex justify-end mt-2">
                <span className={`text-xs font-medium ${
                  specialRequests && specialRequests.trim().length > MAX_SPECIAL_REQUESTS_WORDS
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {specialRequests && specialRequests.trim() 
                    ? specialRequests.trim().length 
                    : 0} / {MAX_SPECIAL_REQUESTS_WORDS} characters
                </span>
              </div>
              
              {specialRequestsError && (
                <div className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1H9z" clipRule="evenodd" />
                  </svg>
                  {specialRequestsError}
                </div>
              )}
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg mt-3 border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Pro Tips for Winning Bids:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1.5 pl-5 list-disc">
                  <li>Highlight specific quality materials you plan to use that exceed standard requirements</li>
                  <li>Describe your unique approach to solving specific challenges in this project</li>
                  <li>Mention any warranties or guarantees beyond what's typically offered</li>
                  <li>Include value-added services that differentiate your bid (e.g., post-completion support)</li>
                  <li>Reference similar projects you've successfully completed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final section with submit button */}
          <div className="pt-6 pb-2">
            <div className="p-4 mb-6 border border-blue-100 rounded-lg bg-blue-50/50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 text-sm text-blue-700">
                  <p>Please review your bid carefully before submitting. Once submitted, you won't be able to edit it.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-12 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                disabled={loading || timeLeft.timeUp || costBreakdownError || timelineBreakdownError || !timelineBreakdown.endDate || specialRequestsError}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 ```jsx
  12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Submit Bid
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

             {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Bid Submission</h3>
              <p className="mb-4">Are you sure you want to submit this bid?</p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidForm;
