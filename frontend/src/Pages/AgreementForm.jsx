import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from '../assets/images/buildmart_logo1.png';
import { jwtDecode } from 'jwt-decode';

const AgreementForm = () => {
  const location = useLocation();
  const { jobId, bidId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [bidDetails, setBidDetails] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [contractorDetails, setContractorDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bidAlreadyAccepted, setBidAlreadyAccepted] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // FIRST CHECK: If we have data in location state, use it
        if (location.state) {
          console.log("Using data from navigation state:", location.state);
          
          // Check if payment was completed
          const paymentCompleted = location.state.paymentCompleted;
          setPaymentMethod(location.state.paymentMethod || 'creditCard');
          
          // If the bid is already accepted, redirect to AcceptedAgreementView
          if (location.state.bidAlreadyAccepted) {
            navigate(`/accepted-agreement/${jobId}/${bidId}`, { 
              state: location.state 
            });
            return; // Stop further processing
          }
          
          // Continue with normal processing for non-accepted bids
          setJobDetails(location.state.jobDetails);
          setContractorDetails(location.state.contractorDetails);
          setBidDetails(location.state.bidDetails);
          
          // Use client details from state if available (NEW CODE)
          if (location.state.clientDetails) {
            setClientDetails(location.state.clientDetails);
            console.log("Client details from navigation:", location.state.clientDetails);
          } else {
            // Get client details from localStorage as fallback
            const clientName = localStorage.getItem('clientName') || 'Client';
            const clientEmail = localStorage.getItem('clientEmail') || 'Email not available';
            setClientDetails({
              name: clientName,
              email: clientEmail
            });
          }
          
          setLoading(false);
          return; // Skip the API calls
        }
        
        // SECOND CHECK: Validate jobId and bidId before making API calls
        if (!jobId || jobId === 'undefined' || !bidId || bidId === 'undefined') {
          throw new Error("Invalid job or bid ID. Please try again with valid parameters.");
        }
        
        console.log("Fetching job details for:", { jobId, bidId });
        
        // This endpoint is correct - keep as is
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setJobDetails(jobResponse.data);
        console.log("Job details:", jobResponse.data);
        
        // NEW CODE: Get client info directly from jobDetails.userid
        const jobUserId = jobResponse.data.userid;
        console.log("Job's client userId:", jobUserId);

        if (jobUserId) {
          try {
            // Get token for authentication
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // Make API call to get client data using the job's userid field
            const clientResponse = await axios.get(
              `http://localhost:5000/auth/user/${jobUserId}`, 
              { headers: { Authorization: `Bearer ${token}` }}
            );
            
            console.log('CLIENT API RESPONSE:', clientResponse.data);
            
            // Extract client data from response
            const userData = clientResponse.data.user;
            
            if (userData) {
              // Set client details with correct field mapping from API
              setClientDetails({
                name: userData.username,  // API returns username as shown in auth.js
                email: userData.email     // API returns email
              });
              
              console.log('Client details set from job userid API call', {
                name: userData.username,
                email: userData.email
              });
            }
          } catch (apiError) {
            console.error('Client API call failed:', apiError);
            
            // Fallback to using username from job
            setClientDetails({
              name: jobResponse.data.username || 'Client',
              email: 'Email not available'
            });
            console.log("Using fallback client name from job:", jobResponse.data.username);
          }
        } else {
          console.error("No userid found in job details");
          setClientDetails({
            name: jobResponse.data.username || 'Client',
            email: 'Email not available'
          });
        }
        
        // CHANGE THIS: No direct endpoint for individual bid - need to fetch by project then filter
        // Instead of: const bidResponse = await axios.get(`http://localhost:5000/api/bids/${bidId}`);
        const bidsResponse = await axios.get(`http://localhost:5000/bids/project/${jobId}`);
        const matchingBid = bidsResponse.data.find(bid => bid._id === bidId);
        
        if (!matchingBid) {
          throw new Error("Bid not found");
        }
        
        setBidDetails(matchingBid);
        console.log("Bid details:", matchingBid);
        
        // Check if bid is already accepted
        if (matchingBid.status === 'accepted') {
          setBidAlreadyAccepted(true);
          console.log("Bid is already accepted");
        }
        
        // Contractor ID from bid
        const contractor = matchingBid.contractorId || matchingBid.contractor;
        


// Get token for authentication
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
if (!token) {
  console.error('No authentication token found');
  return;
}

try {
  // Decode token - make sure we log the EXACT structure
  const decoded = jwtDecode(token);
  console.log('FULL TOKEN DATA:', JSON.stringify(decoded));
  
  // Extract client ID first 
  const userId = decoded.id || decoded._id || decoded.userId;
  console.log('User ID from token:', userId);
  
  if (!userId) {
    console.error('No user ID found in token');
    throw new Error('User ID not found');
  }
  
  // Make direct API call to get client data
  try {
    const clientResponse = await axios.get(
      `http://localhost:5000/auth/user/${userId}`, 
      { headers: { Authorization: `Bearer ${token}` }}
    );
    
    console.log('CLIENT API RESPONSE:', clientResponse.data);
    
    // Extract user data based on actual API response structure
    const userData = clientResponse.data.user;
    
    if (userData) {
      // Set client details with correct field mapping
      setClientDetails({
        name: userData.username,  // API returns username
        email: userData.email     // API returns email
      });
      
      console.log('Client details set from API call', {
        name: userData.username,
        email: userData.email
      });
    }
  } catch (apiError) {
    console.error('API call failed:', apiError);
    
    // Fall back to token data
    setClientDetails({
      name: decoded.username || 'Client',
      email: decoded.email || 'Email not available'
    });
  }
} catch (tokenError) {
  console.error('Token decode error:', tokenError);
  setClientDetails({
    name: localStorage.getItem('name') || 'Client',
    email: 'Email not available'
  });
}
        
        // CHANGE THIS: Fetch contractor details - correct endpoint
        if (contractor) {
          // Instead of: `http://localhost:5000/api/users/${contractor}`
          const contractorResponse = await axios.get(`http://localhost:5000/auth/user/${contractor}`);
          setContractorDetails(contractorResponse.data.user || contractorResponse.data);
          console.log("Contractor details:", contractorResponse.data);
        } else {
          // Fallback is fine as is
          setContractorDetails({
            name: matchingBid.contractorname || "Contractor",
            email: "contractor@example.com" // Fallback value
          });
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load agreement data. Please try again.");
        toast.error("Failed to load agreement data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId, bidId, location.state, navigate]);
  
  const handleSubmit = async (e) => {
    // alert("Button clicked - handleSubmit running");
    
    if (!agreementChecked) {
      toast.warning("Please confirm you agree to the terms and conditions");
      return;
    }
    
    // Declare userId at the beginning of the function
    let userId = localStorage.getItem('userId');
    
    try {
      const token = localStorage.getItem('token');
      if (token && !userId) {
        // Try to extract userId from JWT token
        const decoded = jwtDecode(token);
        userId = decoded.id || decoded.userId || decoded._id;
        
        // Save it for future use
        if (userId) {
          localStorage.setItem('userId', userId);
        }
      }
    } catch (e) {
      console.error("Error extracting user ID from token:", e);
    }
  
    // If still no userId, handle the error
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setSubmitting(true);
    try {
      // alert("Starting bid acceptance process...");
      
      // Now userId is properly defined
      const localClientId = userId;
      const localContractorId = bidDetails?.contractorId || 
                               bidDetails?.contractor || 
                               contractorDetails?._id;
      
      /* 
      alert(`Contractor ID: ${localContractorId || 'Not found'}`);
      alert(`Job ID: ${jobId || 'Not found'}`);
      alert(`Bid ID: ${bidId || 'Not found'}`);
      */
      
      if (!localContractorId) {
        throw new Error("Could not determine contractor ID");
      }
      
      // Check for milestones
      if (!jobDetails?.milestones || !jobDetails?.milestones.length) {
        // alert("Warning: No milestones found in job details");
      }
      
      // Calculate even distribution of price across milestones
      const totalBidPrice = parseFloat(bidDetails.price) || 0;
      const milestoneCount = jobDetails.milestones?.length || 0;

      // Calculate per-milestone amount (equal distribution)
      const pricePerMilestone = milestoneCount > 0 ? totalBidPrice / milestoneCount : 0;

      // Fix 2: Update the bid status with better error handling
      try {
        // alert("Updating bid status...");
        const bidUpdateUrl = `http://localhost:5000/bids/${bidId}/status`;
        // alert(`Using bid update URL: ${bidUpdateUrl}`);
        
        const bidUpdateResponse = await axios.put(bidUpdateUrl, {
          status: 'accepted'
        });
        
        // alert(`Bid status update successful: ${JSON.stringify(bidUpdateResponse.data)}`);
        toast.success("🎯 Contractor bid has been successfully accepted!");
      } catch (bidError) {
        // alert(`Bid status update failed: ${bidError.message}`);
        toast.error(`Failed to accept bid: ${bidError.message}`);
        throw bidError;
      }
      
      // Fix 3: Create ongoing work with proper status values
      try {
        // alert("Creating ongoing work...");
        
        // Fix: Use the correct enum values that match your backend schema
        // Get timeline from bidDetails
        const timeline = parseInt(bidDetails.timeline) || 30;
        console.log(`Using timeline for ongoing work: ${timeline} days`);

        // Create ongoing work data with timeline
        const ongoingWorkData = {
          jobId: jobId,
          bidId: bidId,
          clientId: localClientId,
          contractorId: localContractorId,
          workProgress: 0,
          timeline: timeline, // Add timeline from bid
          milestones: jobDetails.milestones?.map((milestone, index) => ({
            name: milestone.name || `Milestone ${index + 1}`,
            // Assign equal amount to each milestone - convert to string as the model expects
            amount: pricePerMilestone.toFixed(2).toString(),
            description: milestone.description || "",
            status: "In Progress", 
            completedAt: null
          })) || [],
          jobStatus: 'In Progress',
          totalPrice: totalBidPrice
        };

        // Log timeline data for debugging
        console.log(`Timeline data being sent to create ongoing work:`, {
          rawTimeline: bidDetails.timeline,
          parsedTimeline: timeline
        });
        
        // alert(`Submitting ongoing work data: ${JSON.stringify(ongoingWorkData)}`);
        
        const ongoingWorkUrl = 'http://localhost:5000/api/ongoingworks';
        // alert(`Using ongoing work URL: ${ongoingWorkUrl}`);
        
        // Log the exact data being sent
        console.log("Sending data to create ongoing work:", ongoingWorkData);
        
        // Add headers that might be required
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        };
        
        const response = await axios.post(ongoingWorkUrl, ongoingWorkData, config);
        
        // alert(`Ongoing work created successfully: ${JSON.stringify(response.data)}`);
        
        // Creative toast for successful project workspace creation
        toast.success(
          <div>
            <div className="font-bold mb-1">🎉 Project workspace created!</div>
            <div className="text-sm">Your partnership with {contractorDetails?.name || bidDetails?.contractorname} begins today.</div>
            <div className="mt-2 text-xs bg-green-50 p-1 rounded">
              Timeline: {timeline} days | Budget: LKR {parseFloat(bidDetails?.price).toLocaleString()}
            </div>
          </div>,
          {
            autoClose: 5000,
            icon: "🎉",
          }
        );
        
        // NEW CODE: Update job status to close the auction
        try {
          const jobUpdateUrl = `http://localhost:5000/api/jobs/${jobId}/auction-status`;
          await axios.put(jobUpdateUrl, {
            status: 'Closed'
          }, config);
          
          console.log("Successfully closed auction after agreement finalization");
          toast.info("📢 Auction has been closed for this project");
        } catch (jobError) {
          console.error("Failed to update job status, but agreement was created:", jobError);
          // Don't throw error here - we want to continue even if this fails
        }
        
        // NEW CODE: Update all other bids for this job to 'rejected'
        console.log("Other bids are automatically rejected when accepting a bid");
        // No need for separate API call - the backend route '/:bidId/status' already does this
        
        toast.success(
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-bold">Agreement successfully confirmed!</div>
              <div className="text-sm">Your project is now protected and ready to begin</div>
            </div>
          </div>,
          { autoClose: 6000 }
        );
        
        setShowSuccessModal(true);
        
        // Navigate after a successful creation
        setTimeout(() => {
          navigate('/ongoing-works');
        }, 3000);
      } catch (workError) {
        console.error("Error creating ongoing work:", workError);
        
        // Capture detailed server error information
        if (workError.response) {
          console.error("Server response:", workError.response.data);
          // alert(`Server Error: ${JSON.stringify(workError.response.data)}`);
          toast.error(`Server Error: ${JSON.stringify(workError.response.data)}`);
        } else {
          // alert(`Ongoing work creation failed: ${workError.message}`);
          toast.error(`Project creation failed: ${workError.message}`);
        }
        
        // If the user has developer console open, they can see this
        console.log("Debug info - data sent:", {
          jobId,
          bidId,
          clientId: localClientId,
          contractorId: localContractorId,
          milestones: jobDetails.milestones
        });
        
        throw workError;
      }
    } catch (err) {
      // alert(`Overall error: ${err.message}`);
      console.error("Error submitting agreement:", err);
      
      // Show error details if available
      if (err.response) {
        // alert(`Response error data: ${JSON.stringify(err.response.data)}`);
      }
      
      setError("Failed to process agreement: " + (err.response?.data?.message || err.message));
      toast.error("Failed to process agreement: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agreement details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fixed calculatePaymentSchedule function with proper return
  const calculatePaymentSchedule = () => {
    if (!jobDetails?.milestones || !bidDetails) return [];
    
    const totalAmount = parseFloat(bidDetails.price);
    const result = [];
    
    try {
      // Calculate total milestones amount for percentage calculation
      const totalMilestonesAmount = jobDetails.milestones.reduce(
        (sum, m) => sum + (parseFloat(m.amount?.replace(/,/g, '') || '0') || 0), 0
      );
      
      jobDetails.milestones.forEach((milestone, index) => {
        const milestoneAmount = parseFloat(milestone.amount?.replace(/,/g, '') || '0') || 0;
        const percentage = totalMilestonesAmount > 0 ? 
          Math.round((milestoneAmount / totalMilestonesAmount) * 100) : 
          Math.round(100 / jobDetails.milestones.length);
        
        const amount = (percentage / 100) * totalAmount;
        const date = new Date();
        date.setDate(date.getDate() + Math.round(bidDetails.timeline * (index + 1) / jobDetails.milestones.length));
        
        result.push({
          milestone: milestone.name || `Milestone ${index + 1}`,
          description: milestone.description || '',
          percentage,
          amount,
          date: date.toLocaleDateString(),
          status: index === 0 ? 'Pending' : 'Not Started'
        });
      });
    } catch (error) {
      console.error("Error calculating payment schedule:", error);
      // Return default schedule if there's an error
      const defaultSchedule = [
        { milestone: 'Initial Payment', percentage: 30, amount: totalAmount * 0.3, date: new Date().toLocaleDateString(), status: 'Pending' },
        { milestone: 'Midway Payment', percentage: 40, amount: totalAmount * 0.4, date: new Date(new Date().getTime() + 15*24*60*60*1000).toLocaleDateString(), status: 'Not Started' },
        { milestone: 'Final Payment', percentage: 30, amount: totalAmount * 0.3, date: new Date(new Date().getTime() + 30*24*60*60*1000).toLocaleDateString(), status: 'Not Started' }
      ];
      return defaultSchedule;
    }
    
    return result;
  };
  
  const paymentSchedule = calculatePaymentSchedule();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Modal */} 
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Agreement Confirmed!</h3>
              <p className="mt-2 text-sm text-gray-500">
                The project agreement has been successfully processed. Your project is now ready to begin.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => navigate(`/jobs`)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Go to My Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
     
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <nav className="mb-5">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link to="/myprojects" className="hover:text-gray-700">My Projects</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link to={`/job/${jobId}`} className="hover:text-gray-700">Project Details</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium">Agreement</li>
          </ol>
        </nav>
        
        {/* Agreement Form */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{jobDetails?.title}</h2>
              <p className="text-sm text-gray-500 mt-1">Review the agreement details below</p>
            </div>
            
            <div className="print-content">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Agreement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client:</h4>
                    <p className="text-md font-medium text-gray-900">
                      {clientDetails?.name || 'Client Name Not Available'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {clientDetails?.email || 'Email Not Available'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(!clientDetails?.name || !clientDetails?.email) && 
                        '(Profile information incomplete - please update your profile)'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contractor:</h4>
                    <p className="text-md font-medium text-gray-900">{contractorDetails?.name || bidDetails?.contractorname}</p>
                    <p className="text-sm text-gray-500">{contractorDetails?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Bid Amount:</h4>
                    <p className="text-md font-medium text-gray-900">LKR {parseFloat(bidDetails?.price).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Timeline:</h4>
                    <p className="text-md font-medium text-gray-900">{bidDetails?.timeline} days</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Start Date:</h4>
                    <p className="text-md font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Project Description:</h4>
                  <p className="text-md text-gray-700 bg-gray-50 p-4 rounded">{jobDetails?.description}</p>
                </div>
                
                {/* Cost Breakdown Section - NEW ADDITION */}
                {bidDetails?.costBreakdown && bidDetails.costBreakdown.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Cost Breakdown:</h4>
                    <div className="overflow-x-auto bg-gray-50 rounded">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (RS)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bidDetails.costBreakdown.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                LKR {parseFloat(item.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                              LKR {bidDetails.costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Timeline Breakdown Section - NEW ADDITION */}
                {bidDetails?.timelineBreakdown && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline Details:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Project Start</p>
                        <p className="font-medium text-gray-800">
                          {bidDetails.timelineBreakdown.startDate 
                            ? new Date(bidDetails.timelineBreakdown.startDate).toLocaleDateString() 
                            : new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Project End</p>
                        <p className="font-medium text-gray-800">
                          {bidDetails.timelineBreakdown.endDate 
                            ? new Date(bidDetails.timelineBreakdown.endDate).toLocaleDateString() 
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Work Schedule */}
                    {bidDetails.timelineBreakdown.workItems && bidDetails.timelineBreakdown.workItems.length > 0 && (
                      <div className="overflow-x-auto bg-gray-50 rounded mt-2">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bidDetails.timelineBreakdown.workItems.map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {new Date(item.startDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {new Date(item.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.duration} days</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Milestones */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Schedule:</h4>
                  
                  <div className="overflow-x-auto bg-gray-50 rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentSchedule.map((payment, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.milestone}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.percentage}%</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              LKR {payment.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            LKR {parseFloat(bidDetails?.price).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions:</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Work shall be carried out according to industry standards and local building codes.</li>
                    <li>Changes to the project scope require written approval from both parties.</li>
                    <li>The Contractor shall obtain all necessary permits and approvals before work begins.</li>
                    <li>All materials used shall be new and of good quality unless otherwise specified.</li>
                    <li>The Contractor shall maintain insurance coverage throughout the project.</li>
                    <li>The Client agrees to provide access to the work site as needed.</li>
                    <li>Payment shall be made according to the payment schedule upon completion of each milestone.</li>
                    <li>Either party may terminate this agreement with written notice if the other fails to comply with its terms.</li>
                  </ul>
                </div>
                
               
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
            
              {/* Agreement Checkbox - Only show when bid is not accepted */}
              {!bidAlreadyAccepted && (
                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreement"
                        name="agreement"
                        type="checkbox"
                        checked={agreementChecked}
                        onChange={() => setAgreementChecked(!agreementChecked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreement" className="font-medium text-gray-700">
                        I agree to the terms and conditions
                      </label>
                      <p className="text-gray-500">
                        By checking this box, I confirm that I have read and agree to the terms and conditions outlined in this agreement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="print:hidden mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/job/${jobId}`)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Project
              </button>
              
              {!bidAlreadyAccepted && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !agreementChecked}
                  className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                    (submitting || !agreementChecked) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm & Accept Bid'
                  )}
                </button>
              )}
            </div>
            
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementForm;