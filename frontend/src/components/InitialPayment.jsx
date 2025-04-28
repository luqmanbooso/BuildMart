import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCreditCard, FaMoneyBillWave, FaUniversity, FaCheck } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import Payment from './Payment'; // Import the Payment component

// Function to calculate agreement fee based on bid amount
const calculateAgreementFee = (bidAmount) => {
  // Parse the bid amount to ensure it's a number
  const amount = parseFloat(bidAmount || 0);
  
  // Determine agreement fee based on bid price range
  if (amount <= 50000) {
    return 250;  // Small projects
  } else if (amount <= 200000) {
    return 1000; // Medium projects
  } else if (amount <= 500000) {
    return 2000; // Large projects
  } else {
    return 3000; // Very large projects
  }
};

const InitialPayment = () => {
  const { jobId, bidId } = useParams();
  const navigate = useNavigate();
  
  // States for form and data
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [bidDetails, setBidDetails] = useState(null);
  const [contractorDetails, setContractorDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [showAgreementFeePayment, setShowAgreementFeePayment] = useState(false);
  const [agreementFeePaid, setAgreementFeePaid] = useState(false);
  const [agreementFee, setAgreementFee] = useState(250); // Default value

  // Fetch job and bid details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if agreement fee is already paid
        const feePaid = localStorage.getItem(`agreementFee_${jobId}_${bidId}`) === 'paid';
        setAgreementFeePaid(feePaid);
        
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setJobDetails(jobResponse.data);
        
        // Fetch all bids for this job and find the matching one
        const bidsResponse = await axios.get(`http://localhost:5000/bids/project/${jobId}`);
        const matchingBid = bidsResponse.data.find(bid => bid._id === bidId);
        
        if (!matchingBid) {
          throw new Error("Bid not found");
        }
        
        setBidDetails(matchingBid);
        
        // After setting bid details, calculate the agreement fee
        if (matchingBid) {
          const agreementFee = calculateAgreementFee(matchingBid.price);
          setAgreementFee(agreementFee); // Add this state variable
        }
        
        // Also fetch contractor details if we have a contractor ID
        if (matchingBid.contractorId) {
          const contractorResponse = await axios.get(`http://localhost:5000/auth/user/${matchingBid.contractorId}`);
          setContractorDetails(contractorResponse.data.user || contractorResponse.data);
        }

        // Add client details from localStorage or token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        let clientName = localStorage.getItem('clientName');
        let clientEmail = localStorage.getItem('clientEmail');
        
        // If not in localStorage, try to get from token
        if (token && (!clientName || !clientEmail)) {
          try {
            const decoded = jwtDecode(token);
            clientName = decoded.username || clientName;
            clientEmail = decoded.email || clientEmail;
            
            // Save for future use
            localStorage.setItem('clientName', clientName || '');
            localStorage.setItem('clientEmail', clientEmail || '');
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
        
        // Create client details object
        const clientDetails = {
          name: clientName || 'Client',
          email: clientEmail || 'Email not available'
        };
        
        // Store in component state if needed
        setClientDetails(clientDetails);

      } catch (err) {
        console.error("Error fetching payment data:", err);
        setError("Failed to load payment data. Please try again.");
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId, bidId]);

  // Calculate initial payment amount (first milestone)
  const calculateInitialPayment = () => {
    if (!bidDetails || !jobDetails?.milestones?.length) return 0;
    
    const totalAmount = parseFloat(bidDetails.price);
    // If we have milestones, use the first milestone percentage, otherwise use 30%
    if (jobDetails.milestones.length > 0) {
      const firstMilestoneAmount = parseFloat(jobDetails.milestones[0].amount?.replace(/,/g, '') || '0') || 0;
      const totalMilestonesAmount = jobDetails.milestones.reduce(
        (sum, m) => sum + (parseFloat(m.amount?.replace(/,/g, '') || '0') || 0), 0
      );
      const percentage = totalMilestonesAmount > 0 ? 
        (firstMilestoneAmount / totalMilestonesAmount) * 100 : 30;
      return (percentage / 100) * totalAmount;
    }
    return totalAmount * 0.3; // Default to 30% if no milestones
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if agreement fee is paid
    if (!agreementFeePaid) {
      toast.info("Please pay the agreement fee first");
      setShowAgreementFeePayment(true);
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call to process the payment
      // const response = await axios.post('http://localhost:5000/api/payments', {
      //   jobId,
      //   bidId,
      //   amount: calculateInitialPayment(),
      //   paymentMethod,
      // });
      
      toast.success("Payment processed successfully!");
      
      // Navigate to agreement form with all necessary data
      navigate(`/agreement/${jobId}/${bidId}`, { 
        state: {
          paymentCompleted: true,
          paymentMethod: paymentMethod,
          paymentAmount: calculateInitialPayment(),
          jobDetails, 
          bidDetails,
          contractorDetails,
          agreementFeePaid: true // Include fee paid status
        }
      });
      
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("Failed to process payment. Please try again.");
      toast.error("Payment processing failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle agreement fee payment success
  const handleAgreementFeeSuccess = (paymentResult) => {
    console.log("Agreement fee payment successful:", paymentResult);
    localStorage.setItem(`agreementFee_${jobId}_${bidId}`, 'paid');
    setAgreementFeePaid(true);
    setShowAgreementFeePayment(false);
    toast.success("Agreement fee paid successfully!");
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowAgreementFeePayment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
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

  // Show the Payment component for agreement fee if needed
  if (showAgreementFeePayment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900">Agreement Fee Payment</h2>
              <p className="mt-1 text-sm text-gray-500">
                A one-time fee of RS {agreementFee.toLocaleString()} is required to access the contract agreement
              </p>
              
              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This fee covers contract creation and legal documentation. You'll need to complete this payment before proceeding to the initial project payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 mb-2">
                <button
                  onClick={handlePaymentCancel}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          {/* Use the Payment component for agreement fee */}
          <Payment 
            amount={agreementFee} // Instead of AGREEMENT_FEE
            onSuccess={handleAgreementFeeSuccess}
            onCancel={handlePaymentCancel}
            context="agreement_fee"  // CHANGE THIS LINE - use underscore to match enum in model
            userData={clientDetails}
            order={{
              orderId: `AGREEMENT-${jobId}-${bidId}-${Date.now()}`,
              items: [{
                name: "Agreement Fee",
                price: agreementFee, // Instead of AGREEMENT_FEE
                quantity: 1
              }],
              shippingDetails: {}
            }}
          />
        </div>
      </div>
    );
  }

  const initialPaymentAmount = calculateInitialPayment();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-5">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link to="/myprojects" className="hover:text-gray-700">My Projects</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link to={`/job/${jobId}`} className="hover:text-gray-700">Project Details</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium">Initial Payment</li>
          </ol>
        </nav>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900">Initial Payment</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please complete your initial payment to proceed with the agreement
            </p>
            
            {/* Agreement Fee Notice */}
            {!agreementFeePaid && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Agreement Fee Required</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>A one-time fee of RS {agreementFee.toLocaleString()} is required to access the contract agreement.</p>
                      <button
                        onClick={() => setShowAgreementFeePayment(true)}
                        className="mt-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium py-1 px-3 rounded text-sm"
                      >
                        Pay Agreement Fee
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show paid confirmation if fee is paid */}
            {agreementFeePaid && (
              <div className="mt-4 bg-green-50 p-4 rounded-md border-l-4 border-green-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Agreement Fee Paid</h3>
                    <div className="text-sm text-green-700">
                      <p>The agreement fee has been processed successfully. You can now proceed with the agreement.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              {/* Project Details Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Project Summary</h3>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Title</p>
                      <p className="mt-1 text-md font-medium text-gray-900">{jobDetails?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contractor</p>
                      <p className="mt-1 text-md font-medium text-gray-900">{bidDetails?.contractorname || "Contractor"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Bid Amount</p>
                      <p className="mt-1 text-md font-medium text-gray-900">LKR {parseFloat(bidDetails?.price).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Timeline</p>
                      <p className="mt-1 text-md font-medium text-gray-900">{bidDetails?.timeline} days</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Summary - Updated to show only Agreement Fee */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Summary</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-medium">Agreement Fee</h4>
                  </div>
                  
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Legal Documentation Fee</span>
                      <span className="font-medium">RS {agreementFee.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-blue-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Fee</span>
                      <span className={`font-bold text-lg ${agreementFeePaid ? 'text-green-600' : 'text-gray-900'}`}>
                        RS {agreementFee.toLocaleString()}
                        {agreementFeePaid ? ' (Paid)' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method state is preserved but UI is removed */}
                <input type="hidden" name="paymentMethod" value={paymentMethod} />
                
                {/* Agreement Fee Information */}
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Agreement Fee Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>A one-time fee of RS {agreementFee.toLocaleString()} is required to access the contract agreement.</p>
                        <p className="mt-1">This fee covers the legal documentation and processing of your agreement.</p>
                        <p className="mt-1">This fee is calculated based on the project size:</p>
                        <ul className="list-disc pl-5 mt-1">
                          <li>RS 250 for projects up to 50,000 LKR</li>
                          <li>RS 1,000 for projects up to 200,000 LKR</li>
                          <li>RS 2,000 for projects up to 500,000 LKR</li>
                          <li>RS 3,000 for larger projects</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Accept Terms */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I agree to the terms and conditions
                    </label>
                    <p className="text-gray-500">
                      By checking this box, I confirm that I understand and accept the agreement fee conditions.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => navigate(`/job/${jobId}`)}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  
                  {!agreementFeePaid ? (
                    <button
                      type="button"
                      onClick={() => setShowAgreementFeePayment(true)}
                      disabled={processingPayment}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Pay Agreement Fee (RS ${agreementFee.toLocaleString()})`
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Continue to Agreement"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialPayment;