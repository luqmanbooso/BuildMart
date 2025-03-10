import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion

const ProjectDetails = () => {
  // Sample Data (Replace with your actual data fetching)
  const projectTitle = "Fix a Leaking Water Sink";
  const projectDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
  const projectType = "Plumbing";
  const estimatedBudget = "RS:3000 - RS:8000";
  const auctionEndTime = "16.4.2025 08:05:33 GMT+8"; // Example end time

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Mock Bids Data
  const bids = [
    { bidder: "d**********3", bidAmount: 3000, bidTime: "15/02/2025 03:28:59" },
    { bidder: "d**********3", bidAmount: 3500, bidTime: "16/02/2025 02:49:13" },
    { bidder: "d**********3", bidAmount: 4000, bidTime: "15/02/2025 11:10:39" },
    { bidder: "d**********3", bidAmount: 3000, bidTime: "14/02/2025 03:03:04" },
  ];

  // Time Calculation logic
  function calculateTimeLeft() {
    const endTime = new Date(auctionEndTime).getTime();
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up the interval on unmount
    return () => clearInterval(timer);
  }, [auctionEndTime]);

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      className="container mx-auto mt-8 p-8 bg-white shadow-md rounded-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Project Details */}
      <motion.h1
        className="text-2xl font-bold mb-4"
        variants={itemVariants}
      >
        {projectTitle}
      </motion.h1>
      <motion.p
        className="text-gray-700 mb-4"
        variants={itemVariants}
      >
        {projectDescription}
      </motion.p>
      <motion.div
        className="flex items-center mb-4"
        variants={itemVariants}
      >
        <span className="bg-green-200 text-green-800 px-2 py-1 rounded mr-2">
          ✓ {projectType}
        </span>
        <p className="text-gray-600">Estimated Budget: {estimatedBudget}</p>
      </motion.div>

      {/* Time Left */}
      <motion.div
        className="mb-6"
        variants={itemVariants}
      >
        <h2 className="text-lg font-semibold mb-2">Time Left</h2>
        <div className="flex gap-4">
          <div>
            <span className="font-bold">{timeLeft.days}</span> days
          </div>
          <div>
            <span className="font-bold">{timeLeft.hours}</span> hours
          </div>
          <div>
            <span className="font-bold">{timeLeft.minutes}</span> minutes
          </div>
          <div>
            <span className="font-bold">{timeLeft.seconds}</span> seconds
          </div>
        </div>
        <p className="text-sm text-gray-500">Auction ends: {auctionEndTime}</p>
      </motion.div>

      {/* Your Bid */}
      <motion.div
        className="mb-6"
        variants={itemVariants}
      >
        <h2 className="text-lg font-semibold mb-2">Your Bid</h2>
        <div className="flex items-center">
          <span className="mr-2">RS</span>
          <input
            type="number"
            className="w-24 p-2 border rounded mr-4"
            placeholder="Enter your bid"
          />
          <Link to="/bid-form" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Bid
          </Link>
        </div>
      </motion.div>

      {/* Bids */}
      <motion.div
        variants={itemVariants}
      >
        <h2 className="text-lg font-semibold mb-2">Bids</h2>
        <motion.table
          className="w-full border-collapse"
          variants={itemVariants}
        >
          <thead>
            <tr>
              <th className="border p-2">Bidder</th>
              <th className="border p-2">Bid Amount</th>
              <th className="border p-2">Bid Time</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, index) => (
              <motion.tr key={index} variants={itemVariants}>
                <td className="border p-2">{bid.bidder}</td>
                <td className="border p-2">{bid.bidAmount}</td>
                <td className="border p-2">{bid.bidTime}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </motion.div>

      {/* Other Auctions */}
      <motion.div
        variants={itemVariants}
      >
        <h2 className="text-lg font-semibold mt-6 mb-2">Other Auctions</h2>
        <motion.div className="flex gap-4" variants={itemVariants}>
          {/* Sample Auction Cards */}
          <motion.div className="border rounded-md p-4 w-64" variants={itemVariants}>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded mb-2 block">✓ Construction</span>
            <h3 className="font-semibold">I Need a Construction Estimate</h3>
            <p className="text-sm">Mr.S.S.Perera</p>
            <p className="text-sm">Area: Colombo</p>
            <p className="text-sm">Budget: 20million - 40million</p>
            <p className="text-xs text-gray-500">Auction ends in: 14.9.2022 10:00:00 GMT+8</p>
            <Link to="/bid-form" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-2 inline-block">
              Bid now
            </Link>
          </motion.div>
          {/* Repeat this block for each auction */}
          <motion.div className="border rounded-md p-4 w-64" variants={itemVariants}>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded mb-2 block">✓ Plumbing</span>
            <h3 className="font-semibold">I Need a Construction Estimate</h3>
            <p className="text-sm">Mr.S.S.Perera</p>
            <p className="text-sm">Area: Colombo</p>
            <p className="text-sm">Budget: 20million - 40million</p>
            <p className="text-xs text-gray-500">Auction starts in: 14.9.2022 10:00:00 GMT+8</p>
            <Link to="/bid-form" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-2 inline-block">
              Bid now
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetails;
