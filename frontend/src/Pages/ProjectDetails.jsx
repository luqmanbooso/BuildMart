import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // Add useParams
import axios from "axios";
import { toast } from "react-toastify";
import { FaHammer, FaUserCircle, FaClock, FaMoneyBillWave, FaTag, FaBell, FaTools, FaSearch } from "react-icons/fa";

const ProjectDetails = () => {
  const { jobId } = useParams(); // Get jobId from URL params
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeUp: false
  });

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Fetch job data
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (jobResponse.data) {
          setJob(jobResponse.data);
          
          // Calculate end time based on bidding start time
          if (jobResponse.data.biddingStartTime) {
            const endDate = new Date(jobResponse.data.biddingStartTime);
            // Assuming bidding is open for 7 days
            endDate.setDate(endDate.getDate() + 7);
            
            // Set auction end time for timer
            const formattedEndDate = `${endDate.getDate().toString().padStart(2, '0')}.${(endDate.getMonth() + 1).toString().padStart(2, '0')}.${endDate.getFullYear()} ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:${endDate.getSeconds().toString().padStart(2, '0')} GMT+8`;
            
            // Start timer
            updateTimer(endDate);
          }
          
          // Fetch bids for this job
          fetchBids(jobId);
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
  }, [jobId]);

  // Function to update timer
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
    
    // Calculate immediately
    calculateTime();
    
    // Set up interval
    const interval = setInterval(calculateTime, 1000);
    
    // Cleanup
    return () => clearInterval(interval);
  };

  // Fetch bids for the job
  const fetchBids = async (jobId) => {
    try {
      const response = await axios.get(`http://localhost:5000/bids/project/${jobId}`);
      
      // Format the bids data for display
      const formattedBids = response.data.map(bid => ({
        bidder: hideContractorName(bid.contractorName),
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

  const handleToBid = () => {
    navigate(`/bid-form/${jobId}`);
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
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <FaHammer className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-blue-900">BuildMart</span>
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link to="/projects" className="border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Projects
                </Link>
                <Link to="/contractors" className="border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contractors
                </Link>
                <Link to="/how-it-works" className="border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  How It Works
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative">
                  <button className="p-1 rounded-full text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <FaBell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                  </button>
                </div>
              </div>
              <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-3">
                    <Link to="/profile" className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                      <FaUserCircle className="h-8 w-8 text-gray-400" />
                      <span className="ml-1">Contractor Profile</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a 1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
                              job?.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              job?.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {job?.status || 'Pending'}
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
                        LKR {job?.budget}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bidding started: {job?.biddingStartTime ? new Date(job.biddingStartTime).toLocaleString() : 'Not yet started'}
                      </p>
                    </div>
                  </div>

                  {/* Milestones */}
                  {job?.milestones && job.milestones.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-800">Payment Milestones</h2>
                      </div>
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
                                <span className="font-medium text-green-600">LKR {milestone.amount}</span>
                              </div>
                              <p className="ml-9 text-sm text-gray-600">{milestone.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Client Info */}
                  {job?.userid && (
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <FaUserCircle className="text-blue-600 mr-2 text-xl" />
                        <h2 className="text-xl font-semibold text-gray-800">Client Information</h2>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="font-medium">User ID: {job.userid}</p>
                        {job.userName && <p className="text-gray-700">Name: {job.userName}</p>}
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
                      <h2 className="text-xl font-semibold text-gray-800">Bids</h2>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : bids.length > 0 ? (
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {bids.map((bid, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bid.bidder}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{bid.bidAmount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.bidTime}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <p className="text-gray-600">Seize this opportunity! Be the first contractor to bid and stand out to the client.</p>
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
                        <h3 className="text-lg font-semibold text-gray-800">Auction Ends In</h3>
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
                            Auction ends: {job?.biddingEndTime ? new Date(job.biddingEndTime).toLocaleString() : 'Not specified'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="mb-6">
                      <button 
                        onClick={handleToBid}
                        className={`w-full py-3 px-6 rounded-lg shadow-md font-medium transition-all duration-300 flex items-center justify-center ${
                          timeLeft.timeUp 
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                            : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 transform hover:-translate-y-1"
                        }`}
                        disabled={timeLeft.timeUp}
                      >
                        {timeLeft.timeUp ? "Auction Ended" : "Win This Project - Place Your Bid"}
                      </button>
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
                          <span className="font-semibold text-blue-600">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Auctions */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaSearch className="mr-2 text-blue-600" />
              Similar Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {job?.otherAuctions?.length > 0 ? job.otherAuctions.map((auction) => (
                <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{auction.title}</h3>
                    <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mb-2">
                      {auction.type}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{auction.owner}</p>
                    <p className="text-sm text-gray-600 mb-1">Area: {auction.area}</p>
                    <p className="text-sm font-medium text-gray-800 mb-3">Budget: {auction.budget}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {auction.status} in: {auction.auctionTime}
                      </p>
                      <button 
                        onClick={() => navigate(`/bid-form/${auction.id}`)}
                        className="bg-blue-600 text-white px-4 py-1 text-sm rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        Bid now
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No similar projects right now. Check back soon for new bidding opportunities!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center">
                <FaHammer className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">BuildMart</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Connecting contractors with projects since 2023. Your trusted platform for construction bidding.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">For Contractors</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/find-projects" className="text-gray-400 hover:text-blue-400">Find Projects</Link>
                </li>
                <li>
                  <Link to="/bid-history" className="text-gray-400 hover:text-blue-400">Bid History</Link>
                </li>
                <li>
                  <Link to="/contractor-dashboard" className="text-gray-400 hover:text-blue-400">Dashboard</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">For Clients</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/post-project" className="text-gray-400 hover:text-blue-400">Post a Project</Link>
                </li>
                <li>
                  <Link to="/find-contractors" className="text-gray-400 hover:text-blue-400">Find Contractors</Link>
                </li>
                <li>
                  <Link to="/client-dashboard" className="text-gray-400 hover:text-blue-400">Dashboard</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-blue-400">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-blue-400">FAQ</Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-gray-400 hover:text-blue-400">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-blue-400">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2023 BuildMart. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectDetails;