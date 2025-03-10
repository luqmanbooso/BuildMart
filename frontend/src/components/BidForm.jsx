import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const BidForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Bid Submitted:", data);
    alert("Bid Submitted Successfully!");
  };

  // Estimated Budget (Read-only)
  const estimatedBudget = "RS:3000 - RS:8000";

  // Auction End Time (Set to a specific date/time in the future)
  const auctionEndTime = new Date("2025-03-16T08:05:33 GMT+08:00").getTime();

  // State for the Timer
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Calculate Time Left Function
  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = auctionEndTime - now;

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
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear Timeout if the Component Unmounts
    return () => clearTimeout(timer);
  });

  // Date and Time
  const now = new Date();
  const bidTime = now.toLocaleString();

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">Bid Submission Form</h2>

      {timeLeft.timeUp ? (
        <p className="text-red-500">Auction has ended!</p>
      ) : (
        <div className="mb-4">
          <p className="font-medium">Time Left:</p>
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
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Project Name */}
        <div className="mb-4">
          <label htmlFor="projectName" className="block font-medium mb-1">
            Project Name:
          </label>
          <input
            id="projectName"
            {...register("projectName", { required: "Project name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.projectName && (
            <p className="text-red-500 text-sm">{errors.projectName.message}</p>
          )}
        </div>

        {/* Contractor Name */}
        <div className="mb-4">
          <label htmlFor="contractorName" className="block font-medium mb-1">
            Contractor Name:
          </label>
          <input
            id="contractorName"
            {...register("contractorName", { required: "Contractor name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.contractorName && (
            <p className="text-red-500 text-sm">{errors.contractorName.message}</p>
          )}
        </div>

        {/* Estimated Budget (Read-only) */}
        <div className="mb-4">
          <label htmlFor="estimatedBudget" className="block font-medium mb-1">
            Estimated Budget:
          </label>
          <input
            id="estimatedBudget"
            value={estimatedBudget}
            className="w-full p-2 border rounded bg-gray-100"
            readOnly
          />
        </div>

        {/* Your Bid (RS) */}
        <div className="mb-4">
          <label htmlFor="yourBid" className="block font-medium mb-1">
            Your Bid (RS):
          </label>
          <input
            id="yourBid"
            type="number"
            {...register("yourBid", {
              required: "Your bid is required",
              min: { value: 1, message: "Bid must be greater than 0" },
            })}
            className="w-full p-2 border rounded"
          />
          {errors.yourBid && (
            <p className="text-red-500 text-sm">{errors.yourBid.message}</p>
          )}
        </div>

        {/* Bid Time (Read-only) */}
        <div className="mb-4">
          <label htmlFor="bidTime" className="block font-medium mb-1">
            Bid Time:
          </label>
          <input
            id="bidTime"
            value={bidTime}
            className="w-full p-2 border rounded bg-gray-100"
            readOnly
          />
        </div>

        {/* Experience (Years) */}
        <div className="mb-4">
          <label htmlFor="experience" className="block font-medium mb-1">
            Experience (Years):
          </label>
          <input
            id="experience"
            type="number"
            {...register("experience", {
              required: "Experience is required",
              min: { value: 1, message: "Experience must be at least 1 year" },
            })}
            className="w-full p-2 border rounded"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm">{errors.experience.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" disabled={timeLeft.timeUp}>
          Submit Bid
        </button>
      </form>
    </div>
  );
};

export default BidForm;
