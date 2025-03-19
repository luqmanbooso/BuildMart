import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import logo from '../assets/images/buildmart_logo1.png';
import { jwtDecode } from 'jwt-decode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const AgreementForm = () => {
  const location = useLocation();
  const { jobId, bidId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  
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
  
  // Setup print handler
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Project_Agreement_${jobId}`,
    onAfterPrint: () => toast.success('Agreement printed successfully')
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // FIRST CHECK: If we have data in location state, use it
        if (location.state) {
          console.log("Using data from navigation state:", location.state);
          setJobDetails(location.state.jobDetails);
          setContractorDetails(location.state.contractorDetails);
          setBidDetails(location.state.bidDetails);
          
          // Set bidAlreadyAccepted based on state data
          setBidAlreadyAccepted(location.state.bidAlreadyAccepted || false);
          
          // Get client details from localStorage
          const clientName = localStorage.getItem('name') || 'Client';
          setClientDetails({
            name: clientName,
            // other client details
          });
          
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
        
        // CHANGE THIS: Auth route, not api/users
        // Fetch client details - correct endpoint from auth.js
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
          // Instead of: `http://localhost:5000/api/users/${userId}`
          const clientResponse = await axios.get(`http://localhost:5000/auth/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setClientDetails(clientResponse.data.user || clientResponse.data);
          console.log("Client details:", clientResponse.data);
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
  }, [jobId, bidId, location.state]);
  
  const handleSubmit = async (e) => {
    alert("Button clicked - handleSubmit running");
    
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
      alert("Starting bid acceptance process...");
      
      // Now userId is properly defined
      const localClientId = userId;
      const localContractorId = bidDetails?.contractorId || 
                               bidDetails?.contractor || 
                               contractorDetails?._id;
      
      alert(`Contractor ID: ${localContractorId || 'Not found'}`);
      alert(`Job ID: ${jobId || 'Not found'}`);
      alert(`Bid ID: ${bidId || 'Not found'}`);
      
      if (!localContractorId) {
        throw new Error("Could not determine contractor ID");
      }
      
      // Check for milestones
      if (!jobDetails?.milestones || !jobDetails?.milestones.length) {
        alert("Warning: No milestones found in job details");
      }
      
   
      
      // Fix 2: Update the bid status with better error handling
      try {
        alert("Updating bid status...");
        const bidUpdateUrl = `http://localhost:5000/bids/${bidId}/status`;
        alert(`Using bid update URL: ${bidUpdateUrl}`);
        
        const bidUpdateResponse = await axios.put(bidUpdateUrl, {
          status: 'accepted'
        });
        
        alert(`Bid status update successful: ${JSON.stringify(bidUpdateResponse.data)}`);
      } catch (bidError) {
        alert(`Bid status update failed: ${bidError.message}`);
        throw bidError;
      }
      
      // Fix 3: Create ongoing work with proper status values
      try {
        alert("Creating ongoing work...");
        
        // Fix: Use the correct enum values that match your backend schema
        const ongoingWorkData = {
          jobId: jobId,
          bidId: bidId,
          clientId: localClientId,
          contractorId: localContractorId,
          workProgress: 0,
          milestones: jobDetails.milestones?.map(milestone => ({
            name: milestone.name || "Milestone",
            amount: parseFloat(milestone.amount?.toString().replace(/,/g, '') || '0'),
            description: milestone.description || "",
            // IMPORTANT FIX: Use the correct enum value from your schema
            status: "In Progress", // Use the exact case as defined in your schema enum
            completedAt: null
          })) || [],
          // IMPORTANT FIX: Also update this status to match your schema
          jobStatus: 'In Progress' // Use "In Progress" instead of "in_progress"
        };
        
        alert(`Submitting ongoing work data: ${JSON.stringify(ongoingWorkData)}`);
        
        const ongoingWorkUrl = 'http://localhost:5000/api/ongoingworks';
        alert(`Using ongoing work URL: ${ongoingWorkUrl}`);
        
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
        
        alert(`Ongoing work created successfully: ${JSON.stringify(response.data)}`);
        toast.success('Agreement successfully confirmed!');
        
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
          alert(`Server Error: ${JSON.stringify(workError.response.data)}`);
        } else {
          alert(`Ongoing work creation failed: ${workError.message}`);
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
      alert(`Overall error: ${err.message}`);
      console.error("Error submitting agreement:", err);
      
      // Show error details if available
      if (err.response) {
        alert(`Response error data: ${JSON.stringify(err.response.data)}`);
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
  
  // Alternative simple PDF generation approach

const handleDownloadPdf = async () => {
  toast.info("Generating agreement PDF...");
  
  try {
    // Create a simple PDF with text only - avoiding html2canvas completely
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Project Agreement: ${jobDetails?.title || 'Project'}`, 20, 20);
    
    // Add date
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add parties
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Agreement Between:", 20, 40);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Client: ${clientDetails?.name || clientDetails?.username || 'Client'}`, 20, 50);
    pdf.text(`Contractor: ${contractorDetails?.name || bidDetails?.contractorname || 'Contractor'}`, 20, 60);
    
    // Add project details
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Details:", 20, 75);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Project: ${jobDetails?.title || 'Project Title'}`, 20, 85);
    pdf.text(`Bid Amount: LKR ${parseFloat(bidDetails?.price).toLocaleString() || 'N/A'}`, 20, 95);
    pdf.text(`Timeline: ${bidDetails?.timeline || 'N/A'} days`, 20, 105);
    
    // Add description - handle text wrapping
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Description:", 20, 120);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const description = jobDetails?.description || 'No description provided';
    const splitDescription = pdf.splitTextToSize(description, 170);
    pdf.text(splitDescription, 20, 130);
    
    // Add payment details
    let yPosition = 130 + splitDescription.length * 7;
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Payment Details:", 20, yPosition);
    
    // Add signature lines
    yPosition = Math.min(yPosition + 100, 250);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Signatures:", 20, yPosition);
    
    pdf.setFont("helvetica", "normal");
    pdf.text("Client Signature: _______________________", 20, yPosition + 20);
    pdf.text(`Name: ${clientDetails?.name || clientDetails?.username || ''}`, 20, yPosition + 30);
    
    pdf.text("Contractor Signature: _______________________", 120, yPosition + 20);
    pdf.text(`Name: ${contractorDetails?.name || bidDetails?.contractorname || ''}`, 120, yPosition + 30);
    
    pdf.save(`${jobDetails?.title || 'Project'}_Agreement.pdf`);
    toast.success("Agreement PDF downloaded successfully");
  } catch (err) {
    console.error("Error generating PDF:", err);
    toast.error(`Could not generate PDF: ${err.message}`);
  }
};
  
  const sendAgreementEmail = async () => {
    if (!contractorDetails?.email) {
      toast.error("Contractor email not found");
      return;
    }
    
    try {
      toast.info("Sending agreement to contractor...");
      
      // Prepare the data
      const emailData = {
        recipientEmail: contractorDetails.email,
        subject: `Project Agreement: ${jobDetails?.title}`,
        projectTitle: jobDetails?.title,
        clientName: clientDetails?.name || clientDetails?.username,
        contractorName: contractorDetails?.name || bidDetails?.contractorname,
        agreementId: jobId,
        bidAmount: parseFloat(bidDetails?.price).toLocaleString()
      };
      
      console.log("Sending email with data:", emailData);
      
      // Make API request
      const response = await axios.post('http://localhost:5000/api/email/send-agreement', emailData);
      
      console.log("Email API response:", response.data);
      
      toast.success("Agreement sent to contractor's email!");
      
      // If using Ethereal for testing, open the preview URL
      if (response.data.previewUrl) {
        window.open(response.data.previewUrl, '_blank');
      }
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Fallback to mailto if API fails
      const fallbackToMailto = window.confirm(
        "Email service is currently unavailable. Would you like to open your email client instead?"
      );
      
      if (fallbackToMailto) {
        const subject = encodeURIComponent(`Project Agreement: ${jobDetails?.title || 'Project'}`);
        const body = encodeURIComponent(
          `Dear ${contractorDetails?.name || bidDetails?.contractorname},\n\n` +
          `I'm sending you the agreement for the project "${jobDetails?.title}". ` +
          `The bid amount is LKR ${parseFloat(bidDetails?.price).toLocaleString()} ` +
          `with a timeline of ${bidDetails?.timeline} days.\n\n` +
          `Please review the agreement details. You can access the full agreement at: ` +
          `${window.location.href}\n\n` +
          `Regards,\n${clientDetails?.name || clientDetails?.username}`
        );
        
        window.location.href = `mailto:${contractorDetails.email}?subject=${subject}&body=${body}`;
      } else {
        toast.error("Failed to send email. Please try again later.");
      }
    }
  };
  
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
    
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="BuildMart Logo" className="h-10" />
            <h1 className="ml-4 text-xl font-bold text-gray-900">Project Agreement</h1>
          </div>
          <div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </header>
      
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
            
            {/* Printable Content */}
            <div ref={printRef} className="print-content">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Agreement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client:</h4>
                    <p className="text-md font-medium text-gray-900">{clientDetails?.name || clientDetails?.username}</p>
                    <p className="text-sm text-gray-500">{clientDetails?.email}</p>
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
                
                {/* Signature Section (for print only) */}
                <div className="hidden print:block mt-8 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold mb-8">Client Signature:</p>
                      <div className="border-b border-gray-400 w-48"></div>
                      <p className="mt-2">{clientDetails?.name || clientDetails?.username}</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-bold mb-8">Contractor Signature:</p>
                      <div className="border-b border-gray-400 w-48"></div>
                      <p className="mt-2">{contractorDetails?.name || bidDetails?.contractorname}</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Method - Not shown in print */}
            <div className="print:hidden mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select your preferred payment method for the initial milestone payment.
              </p>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="paymentMethod-card"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === 'creditCard'}
                    onChange={() => setPaymentMethod('creditCard')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="paymentMethod-card" className="ml-3 block text-sm font-medium text-gray-700">
                    Credit/Debit Card
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="paymentMethod-bank"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === 'bankTransfer'}
                    onChange={() => setPaymentMethod('bankTransfer')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="paymentMethod-bank" className="ml-3 block text-sm font-medium text-gray-700">
                    Bank Transfer
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="paymentMethod-cash"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="paymentMethod-cash" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash on Start
                  </label>
                </div>
              </div>
              
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
            
            {/* Action Buttons - Not shown in print */}
            <div className="print:hidden mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/job/${jobId}`)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Project
              </button>
              
              {/* Download PDF Button - shown when bid is already accepted */}
              {bidAlreadyAccepted && (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  
                  {/* Email Agreement Button - if contractor has email */}
                  {contractorDetails?.email && (
                    <button
                      type="button"
                      onClick={sendAgreementEmail}
                      className="px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email to Contractor
                    </button>
                  )}
                </>
              )}
              
              {/* Submit Button - only shown when bid is not accepted yet */}
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
            
            {/* If bid is already accepted, show a status banner */}
            {bidAlreadyAccepted && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Agreement Accepted</h3>
                    <p className="text-sm text-green-700 mt-1">
                      This agreement has been accepted and the project is in progress. You can download the agreement as a PDF or send it via email.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementForm;