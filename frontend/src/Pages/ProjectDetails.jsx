import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // Add useParams
import axios from "axios";
import { toast } from "react-toastify";
import {FaUserCircle, FaClock, FaMoneyBillWave, FaTag, FaBell, FaTools, FaSearch, FaEdit } from "react-icons/fa";
// Import the BidUpdate component
import BidUpdate from "../components/BidUpdate";
// Import jwtDecode for token handling
import { jwtDecode } from "jwt-decode";
import ContractorUserNav from "../components/ContractorUserNav";
import Footer from "../components/Footer";

const ProjectDetails = () => {
  const { jobId } = useParams(); // Get jobId from URL params
  const navigate = useNavigate();
  
  // Add state for bid update modal
  const [showBidUpdateModal, setShowBidUpdateModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  // Add state for contractor's existing bid
  const [contractorBid, setContractorBid] = useState(null);
  // Add state for user info from token
  const [userInfo, setUserInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeUp: false,
    auctionStarted: false
  });

  // Add these state variables near the top with other state declarations
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestones, setMilestones] = useState([
    { name: '', amount: '', description: '' }
  ]);

  // Get user information from token
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo({
          userId: decoded.userId,
          username: decoded.username
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Authentication error. Please log in again.");
      }
    }
  }, []);

  // Fetch job details and contractor's bid if they exist
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const contractorId = userInfo?.userId;
        
        // Fetch job data
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (jobResponse.data) {
          const jobData = jobResponse.data;
          setJob(jobData);
          
          // Determine auction status based on backend status & time
          const now = new Date().getTime();
          const startTime = new Date(jobData.biddingStartTime).getTime();
          const endTime = new Date(jobData.biddingEndTime).getTime();
          
          // Check if auction has ended based on time
          if (now > endTime || jobData.status === 'Closed') {
            // Auction has ended
            setTimeLeft({
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              timeUp: true,
              auctionStarted: true
            });
          } else if (now >= startTime || jobData.status === 'Active') {
            // Auction is in progress
            updateTimer(new Date(jobData.biddingEndTime), 'end');
            
            // If backend status doesn't match, update it
            if (jobData.status !== 'Active') {
              try {
                await axios.put(`http://localhost:5000/api/jobs/${jobId}/auction-status`, 
                  { status: 'Active' },
                  { headers: { 'Authorization': `Bearer ${token}` }}
                );
              } catch (error) {
                console.error("Error updating auction status:", error);
              }
            }
          } else {
            // Auction hasn't started yet
            updateTimer(new Date(jobData.biddingStartTime), 'start');
          }
          
          // Fetch bids for this job and check for contractor's bid
          if (contractorId) {
            await fetchBids(jobId, contractorId);
          } else {
            await fetchBids(jobId);
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, userInfo]);

  // Function to update timer
  const updateTimer = (targetDate, timerType) => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;
      
      if (difference <= 0) {
        if (timerType === 'start') {
          // If start timer ended, switch to end timer
          const endDate = new Date(job.biddingEndTime).getTime();
          const endDifference = endDate - now;
          
          if (endDifference <= 0) {
            setTimeLeft({
              days: 0,
              hours: 0,
              minutes: 0, 
              seconds: 0,
              timeUp: true,
              auctionStarted: true
            });
          } else {
            // Switch to countdown to end time
            updateTimer(new Date(job.biddingEndTime), 'end');
          }
        } else {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0, 
            seconds: 0,
            timeUp: true,
            auctionStarted: true
          });
        }
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
        timeUp: false,
        auctionStarted: timerType === 'end'
      });
    };
    
    // Calculate immediately
    calculateTime();
    
    // Set up interval
    const interval = setInterval(calculateTime, 1000);
    
    // Cleanup
    return () => clearInterval(interval);
  };

  // Updated fetchBids function to also check for contractor's existing bid
  const fetchBids = async (jobId, contractorId = null) => {
    try {
      const response = await axios.get(`http://localhost:5000/bids/project/${jobId}`);
      
      // Format the bids data for display
      const formattedBids = response.data.map(bid => ({
        bidder: hideContractorName(bid.contractorname),
        bidAmount: `LKR ${bid.price}`,
        bidTime: new Date(bid.createdAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(',', '')
      }));
      
      setBids(formattedBids);
      
      // If contractorId is provided, check if they have a bid
      if (contractorId) {
        // Find if contractor has a bid
        const existingBid = response.data.find(bid => bid.contractorId === contractorId);
        if (existingBid) {
          // Ensure updateCount exists, default to 0 if not present
          if (existingBid.updateCount === undefined) {
            existingBid.updateCount = 0;
          }
          setContractorBid(existingBid);
        }
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  // Function to hide contractor name for privacy
  const hideContractorName = (name) => {
    if (!name) return "";
    const firstChar = name.charAt(0);
    const lastChar = name.charAt(name.length - 1);
    const middleStars = "*".repeat(Math.min(name.length - 2, 10));
    return `${firstChar}${middleStars}${lastChar}`;
  };

  // Updated handle bid button click with better authentication
  const handleToBid = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token || !userInfo?.userId) {
      toast.error("You must be logged in to place a bid");
      navigate('/login');
      return;
    }
    
    if (contractorBid) {
      // If contractor already has a bid (even with updateCount=0), show the update modal
      setShowBidUpdateModal(true);
    } else {
      // Only navigate to new bid form if they don't have any existing bid
      navigate(`/bid-form/${jobId}`);
    }
  };
  
  // Handle successful bid update
  const handleBidUpdateSuccess = (updatedBid, updatesRemaining) => {
    // Update the contractor's bid in state
    setContractorBid(updatedBid);
    
    // Refresh the bids display
    fetchBids(jobId, userInfo?.userId);
    
    // Close the modal
    setShowBidUpdateModal(false);
    
    // Show success message
    toast.success(`Bid updated successfully! You have ${updatesRemaining} updates remaining.`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-xl font-medium text-gray-700">Loading project details...</p>
      </div>
    );
  }

  // Rest of the component remains the same but uses job data instead of static values
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
     <ContractorUserNav />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <br /><br /><br /><br /><br /><br /><br />

          {/* Breadcrumbs */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-blue-700">Home</Link>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/projects" className="ml-1 text-gray-500 hover:text-blue-700">Projects</Link>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a 1 1 0 010 1.414l-4 4a 1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-blue-700 font-medium">{job?.title}</span>
              </li>
            </ol>
          </nav>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Project Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{job?.title}</h1>
              <div className="flex items-center space-x-2">
                <FaTag className="text-blue-200" />
                <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {job?.category}
                </span>
              </div>
            </div>

            {/* Project Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column - Project details */}
                <div className="md:col-span-2">
                  {/* Project Overview */}
                  <div className="prose max-w-none mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <FaTools className="mr-2 text-blue-600" />
                      Project Overview
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{job?.area || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium">{job?.category || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              timeLeft.timeUp ? 'bg-red-100 text-red-800' : 
                              timeLeft.auctionStarted ? 'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {timeLeft.timeUp ? 'Auction Ended' : 
                               timeLeft.auctionStarted ? 'Active' : 
                               'Pending'}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Posted On</p>
                          <p className="font-medium">{job?.date ? new Date(job.date).toLocaleDateString() : 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-700 mb-6">{job?.description || 'No description provided'}</p>
                  </div>

                  {/* Budget */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <FaMoneyBillWave className="text-green-600 mr-2 text-xl" />
                      <h2 className="text-xl font-semibold text-gray-800">Budget Details</h2>
                    </div>
                    <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                      <p className="text-2xl text-green-600 font-medium mb-2">
                        {job?.minBudget && job?.maxBudget ? (
                          <>LKR {job.minBudget} - {job.maxBudget}</>
                        ) : (
                          <>LKR {job?.budget || 'Not specified'}</>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bidding started: {job?.biddingStartTime ? new Date(job.biddingStartTime).toLocaleString() : 'Not yet started'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Budget Range:</span> Client is willing to pay between LKR {job?.minBudget || '0'} and LKR {job?.maxBudget || '0'} for this project based on contractor qualifications and proposal.
                      </p>
                    </div>
                  </div>

                  {/* Milestones Section - Only show when appropriate */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h2 className="text-xl font-semibold text-gray-800">Payment Milestones</h2>
                    </div>

                    {job?.milestones && job.milestones.length > 0 ? (
                      // Display existing milestones if any
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                          {job.milestones.map((milestone, index) => (
                            <div key={index} className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full mr-3 font-semibold text-sm">
                                    {index + 1}
                                  </div>
                                  <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                                </div>
                              </div>
                              <p className="ml-9 text-sm text-gray-600">{milestone.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : job?.acceptedBid && userInfo?.userId === job?.userid ? (
                      // For project owner with accepted bid but no milestones yet
                      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium text-blue-700">You can now set up payment milestones for this project</p>
                        </div>
                        <p className="text-sm text-blue-600 mb-4">
                          Break down your project into manageable payment phases to track progress and manage payments efficiently.
                        </p>
                        <button
                          onClick={() => setShowMilestoneForm(true)} 
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Set Up Milestones
                        </button>
                      </div>
                    ) : timeLeft.timeUp && !job?.acceptedBid ? (
                      // For projects with ended auction but no accepted bid
                      <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
                        <p className="text-sm text-yellow-700">
                          Payment milestones will be established once a bid has been accepted. The project owner will set up payment phases based on the accepted bid amount.
                        </p>
                      </div>
                    ) : (
                      // For active auctions or others viewing the project
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          Payment milestones will be established after bidding ends and a contractor is selected. Milestones help track progress and manage payments throughout the project.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Client Info */}
                  {job?.userid && (
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <FaUserCircle className="text-blue-600 mr-2 text-xl" />
                        <h2 className="text-xl font-semibold text-gray-800">Client Information</h2>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {job.username && <p className="font-medium">Posted by: {job.username}</p>}
                        <p className="text-sm text-gray-500 mt-2">
                          Contact the client through the BuildMart messaging system after placing your bid.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bids Section */}
                  <div className="mt-8">
  <div className="flex items-center mb-4">
    <FaTools className="text-blue-600 mr-2 text-xl" />
    <h2 className="text-xl font-semibold text-gray-800">Current Bidding</h2>
  </div>
  
  {loading ? (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : bids.length > 0 ? (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-100">
      <div className="flex flex-col items-center">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Current Lowest Bid</p>
        <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {/* Find the minimum bid amount and format it */}
          LKR {Math.min(...bids.map(bid => parseFloat(bid.bidAmount.replace('LKR ', '')))).toFixed(2)}
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <FaClock className="mr-1" /> 
          <span>{bids.length} {bids.length === 1 ? 'bid' : 'bids'} so far</span>
        </div>
        
        {!contractorBid && (
          <div className="bg-blue-600 text-white p-4 rounded-lg w-full max-w-md">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Can you offer a better price?</p>
                <p className="text-sm text-blue-100 mt-1">Place your competitive bid now to win this project!</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-5 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">
            <span className="font-medium">Bid Confidentiality:</span> All bidder identities are kept private. Only the current lowest bid amount is visible to encourage competitive pricing.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-100 shadow-md text-center">
      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Be the First Bidder!</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        No bids yet! This is your opportunity to make a great first impression and stand out to the client with your competitive offer.
      </p>
      <button
        onClick={handleToBid}
        disabled={timeLeft.timeUp || !timeLeft.auctionStarted}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Place the First Bid
      </button>
    </div>
  )}
</div>

                </div>

                {/* Right column - Auction details */}
                <div className="md:col-span-1">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-6 shadow-md">
                    {/* Timer */}
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <FaClock className="text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {timeLeft.timeUp ? "Auction Status" : 
                           timeLeft.auctionStarted ? "Auction Ends In" : "Auction Starts In"}
                        </h3>
                      </div>
                      {timeLeft.timeUp ? (
                        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-center">
                          <p className="font-semibold">This auction has ended. Browse other opportunities!</p>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white p-3 rounded-lg flex flex-col items-center shadow-md">
                              <span className="text-xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
                              <span className="text-xs uppercase">days</span>
                            </div>
                            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white p-3 rounded-lg flex flex-col items-center shadow-md">
                              <span className="text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                              <span className="text-xs uppercase">hrs</span>
                            </div>
                            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white p-3 rounded-lg flex flex-col items-center shadow-md">
                              <span className="text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                              <span className="text-xs uppercase">min</span>
                            </div>
                            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white p-3 rounded-lg flex flex-col items-center shadow-md">
                              <span className="text-xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                              <span className="text-xs uppercase">sec</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {timeLeft.auctionStarted 
                              ? `Auction ends: ${job?.biddingEndTime ? new Date(job.biddingEndTime).toLocaleString() : 'Not specified'}`
                              : `Auction starts: ${job?.biddingStartTime ? new Date(job.biddingStartTime).toLocaleString() : 'Not specified'}`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="mb-6">
                      {contractorBid ? (
                        <div>
                          <div className="mb-2 bg-green-100 text-green-800 p-2 rounded-lg">
                            <div className="flex items-center">
                              <FaEdit className="mr-2" />
                              <span className="font-medium">You've already bid on this project</span>
                            </div>
                            <p className="text-sm mt-1">
                              {contractorBid.updateCount >= 3 
                                ? "You've used all your bid updates" 
                                : `Updates remaining: ${3 - contractorBid.updateCount}`}
                            </p>
                          </div>
                          <button 
                            onClick={handleToBid}
                            className={`w-full py-3 px-6 rounded-lg shadow-md font-medium transition-all duration-300 flex items-center justify-center ${
                              timeLeft.timeUp || contractorBid.updateCount >= 3 || !timeLeft.auctionStarted
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                                : "bg-gradient-to-r from-green-600 to-green-800 text-white hover:from-green-700 hover:to-green-900 transform hover:-translate-y-1"
                            }`}
                            disabled={timeLeft.timeUp || contractorBid.updateCount >= 3 || !timeLeft.auctionStarted}
                          >
                            {timeLeft.timeUp ? "Auction Ended" : 
                             !timeLeft.auctionStarted ? "Auction Not Started Yet" :
                             contractorBid.updateCount >= 3 ? "Update Limit Reached" : 
                             "Update Your Bid"}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={handleToBid}
                          className={`w-full py-3 px-6 rounded-lg shadow-md font-medium transition-all duration-300 flex items-center justify-center ${
                            timeLeft.timeUp 
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                              : !timeLeft.auctionStarted
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 transform hover:-translate-y-1"
                          }`}
                          disabled={timeLeft.timeUp || !timeLeft.auctionStarted}
                        >
                          {timeLeft.timeUp ? "Auction Ended" : 
                           !timeLeft.auctionStarted ? "Auction Not Started Yet" :
                           "Win This Project - Place Your Bid"}
                        </button>
                      )}
                    </div>
                    
                    {/* Project Stats */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Project Stats</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bids:</span>
                          <span className="font-semibold">{bids.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project Type:</span>
                          <span className="font-semibold">{job?.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-semibold ${
                            timeLeft.timeUp ? 'text-red-600' : 
                            timeLeft.auctionStarted ? 'text-green-600' : 
                            'text-yellow-600'
                          }`}>
                            {timeLeft.timeUp ? 'Ended' : 
                             timeLeft.auctionStarted ? 'Active' : 
                             'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </main>

      <Footer/>
      
      {/* Add BidUpdate modal */}
      {showBidUpdateModal && contractorBid && (
        <BidUpdate 
          bid={contractorBid}
          onClose={() => setShowBidUpdateModal(false)}
          onSuccess={handleBidUpdateSuccess}
        />
      )}

      
    </div>
  );
};

export default ProjectDetails;