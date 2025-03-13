import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

const BidForm = ({ sampleData }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm();

  // Estimated Budget (Read-only)
  const estimatedBudget = projectDetails?.budget || sampleData?.budget || "RS:3000 - RS:8000";
  
  // Project Title
  const projectTitle = projectDetails?.title || sampleData?.title || "";

  // Auction End Time (Set to a specific date/time in the future)
  const auctionEndTime = projectDetails?.endTime 
    ? new Date(projectDetails.endTime).getTime() 
    : sampleData?.endTime 
      ? new Date(sampleData.endTime).getTime()
      : new Date("2025-03-16T08:05:33 GMT+08:00").getTime();

  // State for the Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeUp: false
  });

  // Fetch project details if projectId is available
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        // If no projectId but we have sampleData, use it
        if (sampleData) {
          setProjectDetails(sampleData);
          if (sampleData.title) {
            setValue("projectName", sampleData.title);
          }
          if (sampleData.contractorName) {
            setValue("contractorName", sampleData.contractorName);
          }
        }
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data = await response.json();
        setProjectDetails(data);

        // Pre-fill project name if available
        if (data.title) {
          setValue("projectName", data.title);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId, setValue, sampleData]);

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
    // Calculate initial time left
    setTimeLeft(calculateTimeLeft());
    
    // Set up the timer
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // If time is up, clear the interval
      if (newTimeLeft.timeUp) {
        clearInterval(timer);
      }
    }, 1000);

    // Clear interval if the component unmounts
    return () => clearInterval(timer);
  }, [auctionEndTime]); // Add auctionEndTime as a dependency

  // Date and Time
  const now = new Date();
  const bidTime = now.toLocaleString();

  // Handle back to project details
  const handleBackToProject = () => {
    navigate(`/project-details`);
  };

  // Enhanced onSubmit function with API integration
  const onSubmit = async (data) => {
    if (timeLeft.timeUp) {
      setSubmissionError("Auction has ended. You can no longer submit bids.");
      return;
    }
  
    setLoading(true);
    setSubmissionError(null);
  
    try {
      // Format bid data according to your backend's expected structure
      const bidData = {
        contractorName: data.contractorName,
        price: parseFloat(data.yourBid),         // Changed from bidAmount to price to match backend
        timeline: String(parseInt(data.timeline)),       // This matches your backend
        qualifications: `Experience: ${data.experience} years. ${data.additionalDetails || ""}`
      };
  
      // Submit bid to API - update URL to match your backend route
      const response = await fetch("http://localhost:5000/bids/submit", {  // Changed from /api/bids to /bids/submit
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Only include Authorization if you're implementing authentication
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bidData),
      });
  
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit bid");
      }
  
      const responseData = await response.json();
      alert("Bid Submitted Successfully!");
  
      // Navigate to appropriate page after submission
      navigate("/project-details");
    } catch (error) {
      console.error("Error submitting bid:", error);
      setSubmissionError(error.message || "Failed to submit bid. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Confirmation Modal Handlers
  const handleConfirmation = (data) => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBackToProject}
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Project Details
        </button>
      </div>

      <h2 className="text-lg font-bold mb-4">Bid Submission Form</h2>

      {/* Display Project Details */}
      {(projectDetails || sampleData) && (
        <div className="mb-4">
          <h3 className="font-bold">Project Details</h3>
          <p>{projectDetails?.description || sampleData?.description}</p>
          <p>Budget: {projectDetails?.budget || sampleData?.budget}</p>
          <p>Deadline: {new Date(auctionEndTime).toLocaleString()}</p>
        </div>
      )}

      {/* Timer */}
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

      {/* Submission Error */}
      {submissionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {submissionError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(handleConfirmation)}>
        {/* Project Name */}
        <div className="mb-4">
          <label htmlFor="projectName" className="block font-medium mb-1">
            Project Name: {projectTitle}
          </label>
          <input
            id="projectName"
            {...register("projectName", { required: "Project name is required" })}
            className="w-full p-2 border rounded"
            readOnly={!!projectTitle}
            defaultValue={projectTitle}
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
            defaultValue={sampleData?.contractorName || ""}
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
              validate: {
                withinRange: (value) => {
                  if (projectDetails?.minBid && value < projectDetails.minBid) {
                    return `Bid must be at least ${projectDetails.minBid}`;
                  }
                  if (projectDetails?.maxBid && value > projectDetails.maxBid) {
                    return `Bid must not exceed ${projectDetails.maxBid}`;
                  }
                  return true;
                },
              },
            })}
            className={`w-full p-2 border rounded ${errors.yourBid ? "border-red-500" : ""}`}
            onBlur={() => trigger("yourBid")}
            defaultValue={sampleData?.yourBid || ""}
          />
          {errors.yourBid && (
            <p className="text-red-500 text-sm">{errors.yourBid.message}</p>
          )}
        </div>

        {/* Timeline (Days) */}
        <div className="mb-4">
          <label htmlFor="timeline" className="block font-medium mb-1">
            Timeline (Days):
          </label>
          <input
            id="timeline"
            type="number"
            {...register("timeline", {
              required: "Timeline is required",
              min: { value: 1, message: "Timeline must be at least 1 day" },
              max: { value: 365, message: "Timeline must not exceed 1 year" },
            })}
            className={`w-full p-2 border rounded ${errors.timeline ? "border-red-500" : ""}`}
            onBlur={() => trigger("timeline")}
            defaultValue={sampleData?.timeline || ""}
          />
          {errors.timeline && (
            <p className="text-red-500 text-sm">{errors.timeline.message}</p>
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
              max: { value: 100, message: "Please enter a realistic experience value" },
            })}
            className={`w-full p-2 border rounded ${errors.experience ? "border-red-500" : ""}`}
            onBlur={() => trigger("experience")}
            defaultValue={sampleData?.experience || ""}
          />
          {errors.experience && (
            <p className="text-red-500 text-sm">{errors.experience.message}</p>
          )}
        </div>

        {/* Additional Details/Qualifications */}
        <div className="mb-4">
          <label htmlFor="additionalDetails" className="block font-medium mb-1">
            Additional Details/Qualifications:
          </label>
          <textarea
            id="additionalDetails"
            {...register("additionalDetails")}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Describe your relevant skills, past projects, or any additional information"
            defaultValue={sampleData?.additionalDetails || ""}
          />
        </div>

        {/* Form Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBackToProject}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Back to Project
          </button>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={timeLeft.timeUp || loading}
          >
            {loading ? "Submitting..." : "Submit Bid"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="font-bold mb-4">Confirm Bid Submission</h3>
            <p>Are you sure you want to submit this bid?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidForm;