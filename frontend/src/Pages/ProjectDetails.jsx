import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ProjectDetails = ({ projectId, projectData }) => {
  // Initialize with default values if projectData is not provided
  const {
    // project details sample data for now
    projectTitle = "Fix a Leaking Water Sink",
    projectDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    projectType = "Plumbing",
    estimatedBudget = "RS:3000 - RS:8000",
    auctionEndTime = "16.4.2025 08:05:33 GMT+8",
    otherAuctions = []
  } = projectData || {};

  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [bidAmount, setBidAmount] = useState("");

  // Fetch bids from the backend
  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/bids/');
        
        // Format the bids data for display
        const formattedBids = response.data.map(bid => ({
          bidder: hideContractorName(bid.contractorName),
          bidAmount: bid.price,
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
        toast.success("Bids loaded successfully");
      } catch (error) {
        console.error("Error fetching bids:", error);
        toast.error("Failed to load bids");
        // If API fails, use sample data
        setBids(projectData?.bids || []);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [projectData]);

  // Function to hide contractor name for privacy
  const hideContractorName = (name) => {
    if (!name) return "";
    const firstChar = name.charAt(0);
    const lastChar = name.charAt(name.length - 1);
    const middleStars = "*".repeat(Math.min(name.length - 2, 10));
    return `${firstChar}${middleStars}${lastChar}`;
  };

  function parseCustomDateString(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hour, minute, second] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute, second);
  }

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const endTime = parseCustomDateString(auctionEndTime).getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        timeUp: true,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      timeUp: false,
    };
  }

  // UseEffect to Update the Timer Every Second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
  
    return () => clearInterval(timer);
  }, [auctionEndTime]);

  const handleToBid = () => {
    navigate('/bid-form');
  };

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Project Details */}
        <h1 className="text-4xl font-bold mb-4">{projectTitle}</h1>
        <p className="text-gray-700 mb-6">{projectDescription}</p>
        <div className="flex items-center mb-6">
          <span className="bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
            ✓ {projectType}
          </span>
        </div>

        {/* Estimated Budget */}
        <h2 className="text-2xl text-blue-500 font-medium mb-6">
          Estimated Budget : {estimatedBudget}
        </h2>

        {/* Time Left */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Time left</h3>
          <div className="flex gap-2 mb-3">
            <div className="bg-blue-900 text-white p-4 w-24 flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
              <span>days</span>
            </div>
            <div className="bg-blue-900 text-white p-4 w-24 flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span>hours</span>
            </div>
            <div className="bg-blue-900 text-white p-4 w-24 flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span>minutes</span>
            </div>
            <div className="bg-blue-900 text-white p-4 w-24 flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span>seconds</span>
            </div>
          </div>
          <p className="text-gray-700">Auction ends: {auctionEndTime}</p>
          <div className="border-b border-gray-300 my-6"></div>
        </div>

        {/* Your Bid */}
        <div className="mb-6">
          <div className="flex items-center">
            <button 
              onClick={handleToBid}
              className="bg-blue-900 text-white px-6 py-2 hover:bg-blue-800 transition duration-200"
              disabled={timeLeft.timeUp}
            >
              {timeLeft.timeUp ? "Auction Ended" : "Bid Now"}
            </button>
          </div>
        </div>

        {/* Bids */}
        <div className="mb-12">
          <h3 className="text-lg font-medium mb-3">Bids</h3>
          {loading ? (
            <p>Loading bids...</p>
          ) : bids.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-3 text-left">Bidder</th>
                  <th className="py-3 text-left">Bid Amount</th>
                  <th className="py-3 text-left">Bid Time</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3">{bid.bidder}</td>
                    <td className="py-3">{bid.bidAmount}</td>
                    <td className="py-3">{bid.bidTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bids yet. Be the first to bid!</p>
          )}
        </div>

        {/* Other Auctions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Other Auction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherAuctions.map((auction) => (
              <div key={auction.id} className="bg-gray-100 p-6 rounded-md">
                <h3 className="font-bold mb-1">{auction.title}</h3>
                <div className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded-md text-xs font-medium mb-2">
                  ✓ {auction.type}
                </div>
                <p className="text-sm mb-1">{auction.owner}</p>
                <p className="text-sm mb-1">Area: {auction.area}</p>
                <p className="text-sm mb-2">Budget: {auction.budget}</p>
                <p className="text-xs text-gray-500 mb-3">
                  auction {auction.status} in: {auction.auctionTime}
                </p>
                <button 
                  onClick={() => navigate(`/bid-form/${auction.id}`)}
                  className="bg-blue-900 text-white px-4 py-1 text-sm hover:bg-blue-800 transition duration-200"
                >
                  Bid now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;