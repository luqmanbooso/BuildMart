import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCreditCard, FaMoneyBillWave, FaUniversity } from 'react-icons/fa';

const InitialPayment = () => {
  const { jobId, bidId } = useParams();
  const navigate = useNavigate();
  
  // States for form and data
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [bidDetails, setBidDetails] = useState(null);
  const [contractorDetails, setContractorDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    bankName: '',
    accountNumber: '',
    branchCode: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  // Fetch job and bid details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
        
        // Also fetch contractor details if we have a contractor ID
        if (matchingBid.contractorId) {
          const contractorResponse = await axios.get(`http://localhost:5000/auth/user/${matchingBid.contractorId}`);
          setContractorDetails(contractorResponse.data.user || contractorResponse.data);
        }
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    
    // Validation based on payment method
    if (paymentMethod === 'creditCard') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardName || 
          !paymentDetails.expiryDate || !paymentDetails.cvv) {
        toast.error("Please fill in all card details");
        return;
      }
    } else if (paymentMethod === 'bankTransfer') {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber) {
        toast.error("Please fill in all bank details");
        return;
      }
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
      //   ...paymentDetails
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
          contractorDetails // Add the contractor details here
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
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Project Title</p>
                    <p className="mt-1 text-sm text-gray-900">{jobDetails?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contractor</p>
                    <p className="mt-1 text-sm text-gray-900">{bidDetails?.contractorname || "Contractor"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Bid Amount</p>
                    <p className="mt-1 text-sm text-gray-900">LKR {parseFloat(bidDetails?.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Timeline</p>
                    <p className="mt-1 text-sm text-gray-900">{bidDetails?.timeline} days</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Initial payment of <span className="font-bold">LKR {initialPaymentAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span> is required to start the project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-base font-medium text-gray-900">Payment Method</label>
                  <p className="text-sm leading-5 text-gray-500">Select your preferred payment method</p>
                  
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                    <div 
                      className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${paymentMethod === 'creditCard' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                      onClick={() => setPaymentMethod('creditCard')}
                    >
                      <div className="flex-1 flex">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <FaCreditCard className="h-5 w-5 text-blue-600" />
                            <span className="ml-2 text-sm font-medium text-gray-900">Credit Card</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Pay securely with your credit or debit card</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 text-blue-600 ${paymentMethod === 'creditCard' ? 'block' : 'hidden'}`} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div 
                      className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${paymentMethod === 'bankTransfer' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                      onClick={() => setPaymentMethod('bankTransfer')}
                    >
                      <div className="flex-1 flex">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <FaUniversity className="h-5 w-5 text-blue-600" />
                            <span className="ml-2 text-sm font-medium text-gray-900">Bank Transfer</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Pay directly from your bank account</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 text-blue-600 ${paymentMethod === 'bankTransfer' ? 'block' : 'hidden'}`} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div 
                      className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${paymentMethod === 'cash' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="flex-1 flex">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <FaMoneyBillWave className="h-5 w-5 text-blue-600" />
                            <span className="ml-2 text-sm font-medium text-gray-900">Cash</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Pay in cash when work begins</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 text-blue-600 ${paymentMethod === 'cash' ? 'block' : 'hidden'}`} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {paymentMethod === 'creditCard' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">Name on card</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={paymentDetails.cardName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="1234 1234 1234 1234"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentDetails.expiryDate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="MM/YY"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVC/CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={paymentDetails.cvv}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'bankTransfer' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <input
                        type="text"
                        id="bankName"
                        name="bankName"
                        value={paymentDetails.bankName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={paymentDetails.accountNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700">Branch Code (optional)</label>
                      <input
                        type="text"
                        id="branchCode"
                        name="branchCode"
                        value={paymentDetails.branchCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'cash' && (
                  <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          By selecting cash payment, you agree to pay LKR {initialPaymentAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} in cash when the contractor begins work. The agreement will be provisional until this payment is made.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => navigate(`/job/${jobId}`)}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    onClick={()=> {
                        navigate(`/agreement/${jobId}/${bidId}`, { 
                            state: {
                              paymentCompleted: true,
                              paymentMethod: paymentMethod,
                              paymentAmount: calculateInitialPayment(),
                              jobDetails, 
                              bidDetails,
                              contractorDetails // Add the contractor details here
                            }
                          });
                    }}
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
                      `Continue to Agreement (LKR ${initialPaymentAmount.toLocaleString(undefined, {maximumFractionDigits: 2})})`
                    )}
                  </button>
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