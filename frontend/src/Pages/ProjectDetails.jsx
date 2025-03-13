import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProjectDetails = ({ 


  projectData = {
    projectTitle: "Fix a Leaking Water Sink",
    projectDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    projectType: "Plumbing",
    estimatedBudget: "RS:3000 - RS:8000",
    auctionEndTime: "16.4.2025 08:05:33 GMT+8",
    bids: [
      { bidder: "d**********3", bidAmount: 3000, bidTime: "15/02/2025 03:28:59" },
      { bidder: "d**********3", bidAmount: 3500, bidTime: "16/02/2025 02:49:13" },
      { bidder: "d**********3", bidAmount: 4000, bidTime: "15/02/2025 11:10:39" },
      { bidder: "d**********3", bidAmount: 3000, bidTime: "14/02/2025 03:03:04" },
    ],  
    otherAuctions: [
      {
        id: 1,
        title: "I Need a Construction Estimate",
        type: "Construction",
        owner: "Mr.S.S.Perera",
        area: "Colombo",
        budget: "20million - 40million",
        auctionTime: "14.9.2022 10:00:00 GMT+8",
        status: "ends"
      },
      {
        id: 2,
        title: "I Need a Construction Estimate",
        type: "Plumbing",
        owner: "Mr.S.S.Perera",
        area: "Colombo",
        budget: "20million - 40million",
        auctionTime: "14.9.2022 10:00:00 GMT+8",
        status: "starts"
      },
      {
        id: 3,
        title: "I Need a Construction Estimate",
        type: "Electrical",
        owner: "Mr.S.S.Perera",
        area: "Colombo",
        budget: "20million - 40million",
        auctionTime: "8.8.2022 10:00:00 GMT+8",
        status: "ends"
      },
      {
        id: 4,
        title: "I Need a Landscape Design",
        type: "Electrical",
        owner: "Mr.S.S.Perera",
        area: "Colombo",
        budget: "20million - 40million",
        auctionTime: "14.8.2022 10:00:00 GMT+8",
        status: "ends"
      }
    ]
  }
}) => {
  const {
    projectTitle,
    projectDescription,
    projectType,
    estimatedBudget,
    auctionEndTime,
    bids,
    otherAuctions
  } = projectData;

  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [bidAmount, setBidAmount] = useState("");

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
  }, []);

  const handleToBid = () => {
    navigate(`/bid-form`);
  };

  const handleBidChange = (e) => {
    setBidAmount(e.target.value);
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
            >
              Bid Now
            </button>
          </div>
        </div>

        {/* Bids */}
        <div className="mb-12">
          <h3 className="text-lg font-medium mb-3">Bids</h3>
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
                  onClick={handleToBid}
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