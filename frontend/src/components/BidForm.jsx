import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Import axios for API requests

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
        const response = await axios.get(`/api/projects/${projectId}`);
        setProjectDetails(response.data);
        // Pre-fill project name if available
        if (response.data.title) {
          setValue("projectName", response.data.title);
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
        projectId: projectId || "sample-project-id", // Use projectId from route params
        contractorName: data.contractorName,
        contractorId: data.contractorId,  // Added contractorId field
        price: parseFloat(data.yourBid),
        timeline: parseInt(data.timeline),
        qualifications: `Experience: ${data.experience} years. ${data.additionalDetails || ""}`,
        rating: parseFloat(data.experience) / 2 || 0, // Approximate rating based on experience
        completedProjects: 0, // Set completedProjects to default 0
      };

      // Submit bid to API
      const response = await axios.post("http://localhost:5000/bids/submit", bidData);

      if (response.status !== 201) {
        throw new Error(response.data.error || "Failed to submit bid");
      }

      alert("Bid Submitted Successfully!");
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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-100 rounded-xl shadow-lg transition-all duration-300">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBackToProject}
          className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200 font-medium"
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

      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Bid Submission Form</h2>

      {/* Display Project Details */}
      {(projectDetails || sampleData) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Project Details</h3>
          <p className="text-gray-700 mb-2">{projectDetails?.description || sampleData?.description}</p>
          <div className="flex flex-wrap gap-4">
            <p className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Budget: {projectDetails?.budget || sampleData?.budget}
            </p>
            <p className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Deadline: {new Date(auctionEndTime).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Timer */}
      {timeLeft.timeUp ? (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg font-medium text-center">
          Auction has ended!
        </div>
      ) : (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <p className="font-medium text-blue-800 mb-2">Auction ends in:</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{timeLeft.days}</span>
              <span className="text-xs text-gray-500">days</span>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{timeLeft.hours}</span>
              <span className="text-xs text-gray-500">hours</span>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{timeLeft.minutes}</span>
              <span className="text-xs text-gray-500">minutes</span>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{timeLeft.seconds}</span>
              <span className="text-xs text-gray-500">seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* Submission Error */}
      {submissionError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {submissionError}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(handleConfirmation)} className="space-y-6">
        {/* Project Name */}
        <div className="relative">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            id="projectName"
            {...register("projectName", { required: "Project name is required" })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            readOnly={!!projectTitle}
            defaultValue={projectTitle}
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.projectName.message}
            </p>
          )}
        </div>

        {/* Contractor Name */}
        <div className="relative">
          <label htmlFor="contractorName" className="block text-sm font-medium text-gray-700 mb-1">
            Contractor Name
          </label>
          <input
            id="contractorName"
            {...register("contractorName", { required: "Contractor name is required" })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            defaultValue={sampleData?.contractorName || ""}
          />
          {errors.contractorName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.contractorName.message}
            </p>
          )}
        </div>

        {/* Contractor ID */}
        <div className="relative">
          <label htmlFor="contractorId" className="block text-sm font-medium text-gray-700 mb-1">
            Contractor ID
          </label>
          <input
            id="contractorId"
            {...register("contractorId")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            defaultValue={sampleData?.contractorId || ""}
          />
        </div>

        {/* Your Bid */}
        <div className="relative">
          <label htmlFor="yourBid" className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid (RS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">RS</span>
            <input
              id="yourBid"
              type="number"
              {...register("yourBid", {
                required: "Your bid is required",
                min: { value: 1, message: "Bid must be greater than 0" },
              })}
              className={`w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.yourBid ? "border-red-500" : "border-gray-300"}`}
              onBlur={() => trigger("yourBid")}
              defaultValue={sampleData?.yourBid || ""}
            />
          </div>
          {errors.yourBid && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.yourBid.message}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Timeline (Days)
          </label>
          <input
            id="timeline"
            type="number"
            {...register("timeline", {
              required: "Timeline is required",
              min: { value: 1, message: "Timeline must be at least 1 day" },
              max: { value: 365, message: "Timeline must not exceed 1 year" },
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.timeline ? "border-red-500" : "border-gray-300"}`}
            onBlur={() => trigger("timeline")}
            defaultValue={sampleData?.timeline || ""}
          />
          {errors.timeline && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.timeline.message}
            </p>
          )}
        </div>

        {/* Experience */}
        <div className="relative">
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Experience (Years)
          </label>
          <input
            id="experience"
            type="number"
            {...register("experience", {
              required: "Experience is required",
              min: { value: 1, message: "Experience must be at least 1 year" },
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.experience ? "border-red-500" : "border-gray-300"}`}
            onBlur={() => trigger("experience")}
            defaultValue={sampleData?.experience || ""}
          />
          {errors.experience && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.experience.message}
            </p>
          )}
        </div>

        {/* Additional Details */}
        <div className="relative">
          <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details/Qualifications
          </label>
          <textarea
            id="additionalDetails"
            {...register("additionalDetails")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            rows="4"
            placeholder="Describe your relevant skills, past projects, or any additional information"
            defaultValue={sampleData?.additionalDetails || ""}
          />
        </div>

        {/* Form Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleBackToProject}
            className="bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-300 flex items-center"
            disabled={timeLeft.timeUp || loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Bid"
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Bid Submission</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to submit this bid? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
