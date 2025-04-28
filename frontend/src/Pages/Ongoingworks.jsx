import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/buildmart_logo1.png';
import axios from 'axios'; // Make sure axios is installed
import ClientNavBar from '../components/ClientNavBar';
import { jwtDecode } from 'jwt-decode';
import EnhancedPaymentGateway from '../components/Payment';
import { X } from 'react-feather'; // or from '@heroicons/react/outline'
import IssueReportModal from '../components/IssueReportModal'; // Add this import
import ReviewModal from '../components/ReviewModal'; // Import the review modal component

const COMMISSION_RATE = 0.10; // 10% commission

function Ongoingworks() {
  const [ongoingWorks, setOngoingWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeWorkId, setActiveWorkId] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add these state variables for issue reporting
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedWorkForReport, setSelectedWorkForReport] = useState(null);
  
  // Add these state variables at the top with other states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  // Add this function after other state declarations
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotificationMessage = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({
        show: false,
        type: '',
        message
      });
    }, 3000);
  };

  // Add these state variables for reviews
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedWorkForReview, setSelectedWorkForReview] = useState(null);
  const [reviewedProjects, setReviewedProjects] = useState([]);
  
  // Add function to check if project is complete (100%)
  const isProjectComplete = (work) => {
    return work && work.progress === 100 && 
           work.milestones && 
           work.milestones.every(m => m.status === 'Completed' || m.status.includes('completed'));
  };
  
  // Add function to check if project has been reviewed already
  const hasBeenReviewed = (workId) => {
    return reviewedProjects.includes(workId);
  };
  
  // Fetch user's review history
  const fetchReviewHistory = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('https://build-mart-backend.vercel.app/api/reviews/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Extract project IDs that have been reviewed
      const reviewedIds = response.data.map(review => review.projectId);
      setReviewedProjects(reviewedIds);
    } catch (err) {
      console.error('Error fetching review history:', err);
    }
  };

  // Calculate progress for each work based on completed milestones
  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    
    const completedMilestones = milestones.filter(m => 
      m.status === 'Completed' || m.status === 'Paid'
    ).length;
    
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  // Fetch ongoing works from the backend
  const fetchOngoingWorks = async () => {
    try {
      console.log("[DEBUG] Starting to fetch ongoing works...");
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // If no token is found, redirect to login
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      // Extract userId and client details from token
      let userId;
      
      try {
        const tokenPayload = jwtDecode(token);
        console.log("[DEBUG] Token payload:", tokenPayload); 
        
        userId = tokenPayload._id || tokenPayload.userId || tokenPayload.id;
        
        if (!userId) {
          throw new Error('User ID not found in token');
        }
        
        console.log("[DEBUG] Extracted user ID:", userId);
        
        // Set client details from token
        setClientDetails({
          id: userId,
          name: tokenPayload.name || tokenPayload.username || 'Client',
          email: tokenPayload.email || tokenPayload.username,
          role: tokenPayload.role || 'Client'
        });
        
      } catch (tokenError) {
        console.error('[DEBUG] Invalid token:', tokenError);
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      // Make API call with proper error handling
      console.log(`[DEBUG] Making API call to: https://build-mart-backend.vercel.app/api/ongoingworks/client/${userId}`);
      
      const response = await axios.get(`https://build-mart-backend.vercel.app/api/ongoingworks/client/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("[DEBUG] API response status:", response.status);
      console.log("[DEBUG] API response data:", response.data);
      
      // Check if response data is valid
      if (!response.data || !Array.isArray(response.data)) {
        console.error("[DEBUG] Invalid response data format:", response.data);
        throw new Error('Invalid response format from server');
      }
      
      // Check if the response is empty
      if (response.data.length === 0) {
        console.log("[DEBUG] No ongoing works found for user:", userId);
        setOngoingWorks([]);
        setIsLoading(false);
        return;
      }
      
      // Process the data - with additional error checking
      const formattedWorks = response.data.map(work => {
        if (!work) {
          console.error("[DEBUG] Null work item in response");
          return null;
        }
        
        console.log("[DEBUG] Processing work item:", work._id, "Timeline value:", work.timeline);
        
        try {
          // Calculate the end date using timeline with safety checks
          const startDate = work.createdAt ? new Date(work.createdAt) : new Date();
          const timelineDays = work.timeline || 30;
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + parseInt(timelineDays));
          
          console.log("[DEBUG] Timeline calculation:", {
            workId: work._id,
            startDate: startDate.toISOString(),
            timelineDays,
            calculatedEndDate: endDate.toISOString()
          });
          
          return {
            id: work._id || `temp-id-${Math.random()}`,
            title: work.jobId?.title || 'Untitled Project',
            jobId: work.jobId?._id || work.jobId,
            bidId: work.bidId || work._id,
            category: work.jobId?.category || 'General',
            contractor: work.contractorId || 'Unknown Contractor',
            contractorId: work.contractorId,
            contractorPhone: work.jobId?.contractorPhone || '',
            contractorEmail: work.jobId?.contractorEmail || '',
            contractorImage: work.jobId?.contractorImage || 'https://randomuser.me/api/portraits/lego/1.jpg',
            location: work.jobId?.location || '',
            timeline: timelineDays,
            startDate: startDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            dueDate: endDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            description: work.jobId?.description || '',
            progress: Math.round(work.workProgress) || calculateProgress(work.milestones || []),
            milestones: (work.milestones || []).map(milestone => {
              if (!milestone) return null;
              
              console.log("[DEBUG] Processing milestone:", milestone._id, "Status:", milestone.status);
              
              return {
                id: milestone._id || `temp-milestone-${Math.random()}`,
                title: milestone.name || 'Unnamed Milestone',
                description: milestone.description || '',
                amount: milestone.amount || '0',
                status: (milestone.status || "").toLowerCase().replace(/_/g, ''),
                completedDate: milestone.completedAt 
                  ? new Date(milestone.completedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) 
                  : null
              };
            }).filter(Boolean) // Remove any null milestones
          };
        } catch (processingError) {
          console.error("[DEBUG] Error processing work item:", work._id, processingError);
          return null;
        }
      }).filter(Boolean); // Remove any null works
      
      console.log("[DEBUG] Formatted works:", formattedWorks);
      
      // Fetch contractor details for each ongoing work
      const updatedWorks = await fetchContractorDetails(formattedWorks, token);
      
      console.log("[DEBUG] Final works with contractor details:", updatedWorks);
      
      setOngoingWorks(updatedWorks);
      
      // Set the first work as active if any exist
      if (updatedWorks.length > 0) {
        setActiveWorkId(updatedWorks[0].id);
      }
      
    } catch (err) {
      console.error("[DEBUG] Error in fetchOngoingWorks:", err);
      const errorDetails = err.response ? 
        `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}` : 
        err.message;
      console.error("[DEBUG] Error details:", errorDetails);
      
      setError(`Failed to fetch ongoing works: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format image URLs correctly
  const formatImageUrl = (path) => {
    if (!path) return 'https://randomuser.me/api/portraits/lego/1.jpg';
    
    // If path already includes http/https, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Otherwise prepend the backend URL
    return `https://build-mart-backend.vercel.app/${path}`;
  };

  // Fetch contractor details for each ongoing work
  const fetchContractorDetails = async (formattedWorks, token) => {
    const updatedWorks = [...formattedWorks];
    
    // Fetch contractor details for each work
    for (let i = 0; i < updatedWorks.length; i++) {
      try {
        const work = updatedWorks[i];
        // Skip if no contractor ID
        if (!work.contractorId) {
          console.log(`[DEBUG] No contractorId for work ${work.id}, skipping contractor fetch`);
          continue;
        }
        
        console.log(`[DEBUG] Fetching contractor details for work ${work.id}, contractorId: ${work.contractorId}`);
        
        // Fetch contractor details from API
        const response = await axios.get(
          `https://build-mart-backend.vercel.app/api/contractors/user/${work.contractorId}`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log(`[DEBUG] Contractor API response for work ${work.id}:`, response.data);
        
        // Get contractor data
        const contractorData = response.data;
        const userData = contractorData.userId || {};
        
        // Get profile pic from userId object
        let profilePic = null;
        if (userData && userData.profilePic) {
          profilePic = userData.profilePic;
          console.log(`[DEBUG] Found profile pic in userData: ${profilePic}`);
        }
        
        // Format the image URL correctly
        const formattedProfilePic = formatImageUrl(profilePic);
        console.log(`[DEBUG] Formatted profile pic URL: ${formattedProfilePic}`);
        
        // Update work with contractor details
        updatedWorks[i] = {
          ...work,
          contractor: userData.username || contractorData.companyName || 'Contractor',
          contractorPhone: contractorData.phone || 'N/A',
          contractorEmail: userData.email || 'N/A',
          contractorImage: formattedProfilePic
        };
      } catch (err) {
        console.error(`[DEBUG] Error fetching contractor details for work ${updatedWorks[i].id}:`, err);
        console.error('[DEBUG] Error details:', err.response ? err.response.data : err.message);
      }
    }
    
    return updatedWorks;
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchOngoingWorks();
    fetchReviewHistory();
  }, []);

  // Handle payment for milestone
  const handlePayment = async (workId, milestoneId) => {
    const work = ongoingWorks.find(w => w.id === workId);
    const milestone = work.milestones.find(m => m.id === milestoneId);
    
    // Calculate the amount with commission
    const milestoneAmount = parseFloat(milestone.amount);
    const commissionAmount = milestoneAmount * COMMISSION_RATE;
    const totalAmount = milestoneAmount + commissionAmount;
    
    // Create a milestone object with all the details
    const milestoneWithCommission = {
      ...milestone,
      originalAmount: milestoneAmount,
      commissionAmount: commissionAmount,
      totalAmount: totalAmount
    };
    
    setSelectedMilestone(milestoneWithCommission);
    setShowPaymentModal(true);
  };

  // Update the handlePaymentSuccess function
// Removed duplicate declaration of handlePaymentSuccess

  // Handle verification of milestone completion
  const handleVerifyCompletion = async (workId, milestoneId) => {
    try {
      if (window.confirm('Verify this milestone as completed? This will mark it ready for payment.')) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Find the work and milestone
        const work = ongoingWorks.find(w => w.id === workId);
        if (!work) {
          showNotificationMessage('error', 'Work not found');
          return;
        }
        
        const milestoneIndex = work.milestones.findIndex(m => m.id === milestoneId);
        if (milestoneIndex === -1) {
          showNotificationMessage('error', 'Milestone not found');
          return;
        }
        
        console.log("Verifying milestone:", {
          workId,
          milestoneId,
          milestoneIndex,
          newStatus: 'Ready For Payment'
        });
        
        // Make the API request with the correct status
        await axios.patch(`https://build-mart-backend.vercel.app/api/ongoingworks/${workId}/milestone/${milestoneIndex}`, {
          status: 'Ready For Payment'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Update local state
        const updatedWorks = ongoingWorks.map(w => {
          if (w.id === workId) {
            const updatedMilestones = [...w.milestones];
            updatedMilestones[milestoneIndex] = {
              ...updatedMilestones[milestoneIndex],
              status: 'Ready For Payment'
            };
            
            return {
              ...w,
              milestones: updatedMilestones
            };
          }
          return w;
        });
        
        setOngoingWorks(updatedWorks);
        showNotificationMessage('success', 'Milestone verified. You can now proceed with payment.');
      }
    } catch (err) {
      console.error('Error verifying milestone completion:', err);
      // Show more detailed error for debugging
      if (err.response && err.response.data) {
        console.error('Server error details:', err.response.data);
        showNotificationMessage('error', `Verification failed: ${err.response.data.message || 'Unknown error'}`);
      } else {
        showNotificationMessage('error', 'Failed to verify milestone. Please try again.');
      }
    }
  };

  // Get active work details
  const activeWork = ongoingWorks.find(work => work.id === activeWorkId);

  // Function to handle opening the review modal
  const handleOpenReviewModal = (work) => {
    setSelectedWorkForReview(work);
    setIsReviewModalOpen(true);
  };

  // Function to handle successful review submission
  const handleReviewSubmitted = () => {
    // Add the project ID to the reviewed projects list
    if (selectedWorkForReview && selectedWorkForReview.id) {
      setReviewedProjects([...reviewedProjects, selectedWorkForReview.id]);
    }
    
    // Show success notification
    showNotificationMessage('success', 'Thank you for your review!');
    
    // Close the modal
    setIsReviewModalOpen(false);
    setSelectedWorkForReview(null);
  };

  // Manual refresh function (adding the missing function referenced in the return statement)
  const manualRefresh = () => {
    fetchOngoingWorks();
    fetchReviewHistory();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading ongoing works...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-800">Something went wrong</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (ongoingWorks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
       <ClientNavBar />

        <div className="flex flex-col items-center justify-center p-10 h-[80vh]">
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Ongoing Projects</h2>
            <p className="text-gray-500 mb-6">You don't have any ongoing projects at the moment.</p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Link 
                to="/userprofile" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Job
              </Link>
              <button 
                onClick={manualRefresh}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add function to get user data
const getUserDataFromToken = () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return {
        id: decoded.userId || decoded.id || decoded._id,
        email: decoded.email,
        name: decoded.name || decoded.fullName,
        role: decoded.role,
        userType: decoded.userType,
        ...decoded
      };
    }
  } catch (error) {
    console.error('Error extracting user data from token:', error);
  }
  return null;
};

// Update the PaymentModal component
const PaymentModal = ({ milestone, onClose, onSuccess }) => {
  // Calculate these values if they don't exist
  const milestoneAmount = parseFloat(milestone.amount || 0);
  const commissionAmount = milestone.commissionAmount || (milestoneAmount * COMMISSION_RATE);
  const totalAmount = milestone.totalAmount || (milestoneAmount + commissionAmount);
  
  // Get the user data
  const userData = getUserDataFromToken();
  
  // Set milestone and user data in window for Payment component
  window.workId = activeWorkId;
  window.milestoneId = milestone.id;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg w-full max-w-4xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
          <EnhancedPaymentGateway
            amount={totalAmount.toString()}
            originalAmount={milestoneAmount}
            commissionAmount={commissionAmount}
            onSuccess={(paymentData) => {
              // Add all user data to payment result
              const enhancedPaymentData = {
                ...paymentData,
                workId: activeWorkId,
                milestoneId: milestone.id,
                userData: userData
              };
              
              onSuccess(enhancedPaymentData);
              onClose();
            }}
            onCancel={onClose}
            context="milestone"
          />
        </div>
      </div>
    </div>
  );
};

// Update the handlePaymentSuccess function 
const handlePaymentSuccess = async (paymentData) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Validate that we have all required data
    if (!activeWorkId) {
      throw new Error('Missing work ID');
    }
    
    if (!selectedMilestone || !selectedMilestone.id) {
      throw new Error('Missing milestone details');
    }
    
    const work = ongoingWorks.find(w => w.id === activeWorkId);
    if (!work) {
      throw new Error('Work not found: ' + activeWorkId);
    }
    
    const milestoneIndex = work.milestones.findIndex(m => m.id === selectedMilestone.id);
    if (milestoneIndex === -1) {
      throw new Error('Milestone not found in work');
    }
    
    // Ensure we have valid amounts
    const originalAmount = paymentData.originalAmount || parseFloat(selectedMilestone.amount);
    const commissionAmount = paymentData.commissionAmount || (originalAmount * COMMISSION_RATE);
    const totalAmount = paymentData.amount || (originalAmount + commissionAmount);
    
    // Get user data either from payment or from token
    const userData = paymentData.userData || getUserDataFromToken();
    
    console.log('Payment success data:', {
      workId: activeWorkId,
      milestoneId: selectedMilestone.id,
      milestoneIndex,
      originalAmount,
      commissionAmount,
      totalAmount,
      userData
    });

    // Send all payment details to the backend
    await axios.patch(
      `https://build-mart-backend.vercel.app/api/ongoingworks/${activeWorkId}/milestone/${milestoneIndex}`,
      {
        status: 'Completed',
        actualAmountPaid: totalAmount, // Total amount paid
        originalAmount: originalAmount, // Original milestone amount
        commissionAmount: commissionAmount, // Commission amount
        commissionRate: COMMISSION_RATE,
        completedAt: new Date(),
        paymentId: paymentData.id, // Payment reference
        userId: userData?.id, // User ID who made the payment
        userData: userData // All user data from token
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Refresh data
    fetchOngoingWorks();
    setShowPaymentModal(false);
    setSelectedMilestone(null);
    showNotificationMessage('success', 'Payment completed successfully!');
  } catch (err) {
    console.error('Error updating milestone status:', err);
    showNotificationMessage('error', 'Failed to update milestone status: ' + err.message);
  }
};

  // Add function to handle opening the issue report modal
  const handleReportIssue = () => {
    // Create a properly formatted object with all required props
    const enhancedWorkData = {
      ...activeWork,
      // Ensure we pass all required properties
      projectName: activeWork.title || 'Untitled Project'
    };
    
    setSelectedWorkForReport(enhancedWorkData);
    setIsReportModalOpen(true);
  };

  // Rest of your component remains unchanged...
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <ClientNavBar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6">
        <br /><br /><br />
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Project List */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                <h2 className="text-white font-medium">My Projects</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {ongoingWorks.map(work => (
                  <button
                    key={work.id}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      activeWorkId === work.id
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                    onClick={() => setActiveWorkId(work.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className={`font-medium ${
                        activeWorkId === work.id ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {work.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        work.progress < 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : work.progress < 70
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {work.progress}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{work.category}</p>
                      <p className="text-xs text-gray-500">Due: {work.dueDate}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          work.progress < 30
                            ? 'bg-yellow-500'
                            : work.progress < 70
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${work.progress}%` }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Project Details */}
          {activeWork && (
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Project header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{activeWork.title}</h2>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                          {activeWork.category}
                        </span>
                        <span className="text-sm text-blue-100">{activeWork.location}</span>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                      <div className="text-2xl font-bold text-white">{activeWork.progress}%</div>
                      <div className="text-xs text-blue-100">Complete</div>
                    </div>
                  </div>
                </div>
                
                {/* Project body */}
                <div className="p-6">
                  {/* Project details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Project Description</h3>
                      <p className="text-gray-800">{activeWork.description}</p>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-gray-500">Start Date</div>
                            <div className="font-medium">{activeWork.startDate}</div>
                          </div>
                          <div className="border-t-2 border-dashed border-gray-300 flex-1 mx-4 relative">
                            <div 
                              className="absolute top-0 h-2 bg-blue-500" 
                              style={{ 
                                width: `${activeWork.progress}%`, 
                                transform: 'translateY(-50%)'
                              }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Due Date</div>
                            <div className="font-medium text-blue-600">{activeWork.dueDate}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Contractor Information</h3>
                      <div className="flex items-center">
                        <img 
                          src={activeWork.contractorImage}
                          alt={activeWork.contractor}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="font-medium">{activeWork.contractor}</div>
                          <div className="text-sm text-gray-500 mt-1">{activeWork.contractorPhone}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button 
                          onClick={() => window.open(`tel:${activeWork.contractorPhone}`, '_self')}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </button>
                        <button 
                          onClick={() => {
                            // Create a detailed subject line
                            const subject = `Regarding Project: ${activeWork.title}`;
                            
                            // Create a structured email body with project details
                            const body = `Dear ${activeWork.contractor},

I'm writing regarding our ongoing project "${activeWork.title}" (ID: ${activeWork.id}).

Project Details:
- Current Progress: ${activeWork.progress}%
- Timeline: ${activeWork.startDate} to ${activeWork.dueDate}
- Location: ${activeWork.location || 'N/A'}

I would like to discuss the following:
[Please add your message here]

Thank you for your attention to this matter.

Best regards,
${clientDetails?.name || 'Client'}`;
                            
                            // Open email client with formatted message
                            window.open(`mailto:${activeWork.contractorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                          }}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </button>
                        
                        <button 
                          onClick={() => {
                            console.log("[TIMELINE DEBUG] Client view: View Agreement clicked");
                            console.log("[TIMELINE DEBUG] Client view: Active work data:", activeWork);
                            
                            // Use the timeline that was properly fetched from the backend
                            const timelineDays = activeWork.timeline;
                            
                            console.log("[TIMELINE DEBUG] Client view: Using timeline:", timelineDays, "days",
                              "Original timeline value:", activeWork.timeline);
                            
                            // Parse start date consistently
                            const startDate = new Date(activeWork.startDate.split(' ').join(' '));
                            console.log("[TIMELINE DEBUG] Client view: Parsed start date:", startDate);
                            
                            // Calculate end date by adding the actual timeline days
                            const endDate = new Date(startDate);
                            endDate.setDate(startDate.getDate() + timelineDays);
                            
                            // Format end date consistently
                            const endDateString = endDate.toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            });
                            
                            console.log("[TIMELINE DEBUG] Client view: Timeline calculation:", {
                              startDate: activeWork.startDate,
                              timelineDays,
                              calculatedEndDate: endDateString
                            });
                            
                            // Create agreement data...
                            const agreementData = {
                              jobDetails: {
                                title: activeWork.title,
                                description: activeWork.description,
                                location: activeWork.location,
                                _id: activeWork.jobId,
                                // Add numeric timeline value
                                timeline: timelineDays
                              },
                              contractorDetails: {
                                name: activeWork.contractor,
                                email: activeWork.contractorEmail,
                                phone: activeWork.contractorPhone
                              },
                              // Ensure client details are properly set
                              clientDetails: {
                                name: clientDetails?.name || "Client",
                                email: clientDetails?.email || localStorage.getItem('email') || "",
                                id: clientDetails?.id
                              },
                              bidDetails: {
                                price: activeWork.milestones.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0),
                                // Provide numeric value for timeline (days)
                                timeline: timelineDays,
                                // Provide a formatted display string for the date range
                                timelineDisplay: `${activeWork.startDate} to ${endDateString}`,
                                contractorname: activeWork.contractor
                              },
                              paymentSchedule: activeWork.milestones.map((m, index) => ({
                                milestone: m.title,
                                description: m.description,
                                // Calculate milestone dates proportionally within timeline
                                date: (() => {
                                  const milestoneDate = new Date(startDate);
                                  milestoneDate.setDate(startDate.getDate() + Math.round(timelineDays * (index + 1) / activeWork.milestones.length));
                                  return milestoneDate.toLocaleDateString();
                                })(),
                                percentage: Math.round(100 / activeWork.milestones.length),
                                amount: parseFloat(m.amount || 0)
                              }))
                            };
                            
                            console.log("[TIMELINE DEBUG] Client view: Full agreement data:", agreementData);
                            
                            // Navigate to the AcceptedAgreementView route with complete data
                            navigate(`/accepted-agreement/${activeWork.jobId}/${activeWork.bidId}`, { 
                              state: agreementData 
                            });
                          }}
                          className="inline-flex justify-center items-center px-3 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Agreement
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestones section */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Payment Milestones</h3>
                      <span className="text-sm text-gray-500">
                        {activeWork.milestones.filter(m => m.status === 'completed').length} of {activeWork.milestones.length} completed
                      </span>
                    </div>
                    
                    <div className="space-y-4">
  {activeWork.milestones.map((milestone) => (
    <div 
      key={milestone.id} 
      className={`bg-white rounded-lg border ${
        milestone.status === 'Completed' 
          ? 'border-green-200' 
          : milestone.status === 'Ready For Payment' || milestone.status.includes('ready')
            ? 'border-blue-200 bg-blue-50'
            : milestone.status === 'Pending Verification' || milestone.status.includes('verification')
              ? 'border-yellow-200 bg-yellow-50'
              : milestone.status === 'In Progress' || milestone.status.includes('progress')
                ? 'border-indigo-200 bg-indigo-50'
                : 'border-gray-200'
      } p-4 transition-all hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
            milestone.status === 'Completed' || milestone.status.includes('completed')
              ? 'bg-green-100 text-green-600' 
              : milestone.status === 'Ready For Payment' || milestone.status.includes('ready')
                ? 'bg-blue-100 text-blue-600'
                : milestone.status === 'Pending Verification' || milestone.status.includes('verification')
                  ? 'bg-yellow-100 text-yellow-600'
                  : milestone.status === 'In Progress' || milestone.status.includes('progress')
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
          }`}>
            {milestone.status === 'Completed' || milestone.status.includes('completed') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : milestone.status === 'Ready For Payment' || milestone.status.includes('ready') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : milestone.status === 'Pending Verification' || milestone.status.includes('verification') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            ) : milestone.status === 'In Progress' || milestone.status.includes('progress') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
          </div>
          <div>
            <h4 className="font-medium">{milestone.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Amount</div>
          <div className="text-lg font-semibold text-gray-900">LKR {milestone.amount}</div>
          {/* Add commission info */}
          <div className="text-xs text-gray-500 mt-1">
            + 10% service fee
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            milestone.status === 'Completed' || milestone.status.includes('completed')
              ? 'bg-green-500' 
              : milestone.status === 'Ready For Payment' || milestone.status.includes('ready')
                ? 'bg-blue-500'
                : milestone.status === 'Pending Verification' || milestone.status.includes('verification')
                  ? 'bg-yellow-500'
                  : milestone.status === 'In Progress' || milestone.status.includes('progress')
                    ? 'bg-indigo-500'
                    : 'bg-gray-300'
          }`}></div>
          <span className="text-sm font-medium capitalize">
            {milestone.status === 'Ready For Payment' || milestone.status.includes('ready')
              ? 'Ready for Payment' 
              : milestone.status === 'Pending Verification' || milestone.status.includes('verification')
                ? 'Pending Verification'
                : milestone.status === 'In Progress' || milestone.status.includes('progress')
                  ? 'In Progress'
                  : milestone.status === 'Completed' || milestone.status.includes('completed')
                    ? 'Completed'
                    : 'Pending'}
          </span>
          {milestone.completedDate && (
            <span className="text-sm text-gray-500 ml-2">
              • Completed on {milestone.completedDate}
            </span>
          )}
        </div>
        
        {/* Action buttons based on status */}
        <div>
          {/* Show "Verify Completion" button for Pending Verification milestones */}
          {(milestone.status === 'Pending Verification' || 
            milestone.status.includes('verification')) && (
            <button 
              onClick={() => handleVerifyCompletion(activeWork.id, milestone.id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Completion
            </button>
          )}
          
          {/* Show "Make Payment" button for Ready For Payment milestones */}
          {(milestone.status === 'Ready For Payment' || 
            milestone.status.includes('ready')) && (
            <button 
              onClick={() => handlePayment(activeWork.id, milestone.id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Make Payment
            </button>
          )}

          {/* Show "Paid" indicator for Completed milestones */}
          {(milestone.status === 'Completed' || milestone.status.includes('completed')) && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Paid
            </span>
          )}
          
          {/* Show "In Progress" indicator for In Progress milestones */}
          {(milestone.status === 'In Progress' || milestone.status.includes('progress')) && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              In Progress
            </span>
          )}
        </div>
      </div>
    </div>
  ))}

                    </div>
                    
                    {/* Project actions section - Reviews and Issues */}
                    <div className="mt-8 flex flex-wrap justify-between">
                      {/* Add review button if project is complete and not reviewed */}
                      {isProjectComplete(activeWork) && !hasBeenReviewed(activeWork.id) && (
                        <button 
                          onClick={() => handleOpenReviewModal(activeWork)}
                          className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                          </svg>
                          Rate & Review Contractor
                        </button>
                      )}
                      
                      {/* Show reviewed badge if already reviewed */}
                      {isProjectComplete(activeWork) && hasBeenReviewed(activeWork.id) && (
                        <div className="text-sm text-green-600 flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          Reviewed
                        </div>
                      )}
                      
                      {/* Issue reporting button */}
                      <button 
                        onClick={handleReportIssue}
                        className="text-sm text-red-600 hover:text-red-800 hover:underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Report an issue with this project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showPaymentModal && selectedMilestone && (
        <PaymentModal
          milestone={selectedMilestone}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedMilestone(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {/* Add the IssueReportModal component here */}
      {isReportModalOpen && selectedWorkForReport && (
        <IssueReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          projectId={selectedWorkForReport.id || selectedWorkForReport.jobId}
          projectName={selectedWorkForReport.projectName || selectedWorkForReport.title || 'Untitled Project'}
          title={selectedWorkForReport.title || 'Untitled Project'}
          userId={clientDetails?.id}
          username={clientDetails?.name || 'Client'} // Pass client name as username
          userRole="User"
          category={selectedWorkForReport.category || 'Construction'}
          work={selectedWorkForReport} 
        />
      )}
      
      {/* Add the Review modal */}
      {isReviewModalOpen && selectedWorkForReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedWorkForReview(null);
          }}
          projectId={selectedWorkForReview.id}
          contractorId={selectedWorkForReview.contractorId}
          contractorName={selectedWorkForReview.contractor}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
      
      {/* Add notification display */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default Ongoingworks;