import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BidForm = ({ sampleData }) => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [contractorInfo, setContractorInfo] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeUp: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm();

  // Get user information from token
  const getUserInfo = () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        return {
          userId: decoded.userId,
          username: decoded.username ,
          email: decoded.email,
          experienceYears : decoded.experienceYears,
          completedProjects : decoded.completedProjects
        };
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  // Fetch job details and contractor profile
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user info from token
        const userInfo = getUserInfo();
        console.log("User info:", userInfo);
        if (!userInfo) {
          setSubmissionError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }
        
        // Fetch contractor profile if user is logged in
        try {
          const contractorResponse = await axios.get(`http://localhost:5000/contractor/user/${userInfo.userId}`);
          setContractorInfo(contractorResponse.data);
          console.log("Contractor data:", contractorResponse.data);
          
          // Pre-fill contractor fields
          setValue("contractorName", contractorResponse.data.companyName || userInfo.username);
          setValue("contractorId", userInfo.userId);
          setValue("experience", contractorResponse.data.experienceYears || "");
          
          // FIXED QUALIFICATION FETCHING
          setTimeout(() => {
            fetchQualifications(userInfo.userId, contractorResponse.data);
          }, 100);
          
        } catch (contractorError) {
          console.warn("Could not fetch contractor profile:", contractorError);
          // Still set basic user info even without contractor profile
          setValue("contractorName", userInfo.username);
          setValue("contractorId", userInfo.userId);
        }
        
        // If we have a job ID, fetch job details
        if (jobId) {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          try {
            // Fetch job data with authorization header
            const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            setJobDetails(jobResponse.data);
            console.log("Job data:", jobResponse.data);
            
            // Pre-fill job information
            setValue("projectName", jobResponse.data.title || "Untitled Project");
            
            // Calculate end time based on bidding start time
            if (jobResponse.data.biddingStartTime) {
              const endDate = new Date(jobResponse.data.biddingStartTime);
              
              // If bidding end time is available, use it directly
              if (jobResponse.data.biddingEndTime) {
                const directEndDate = new Date(jobResponse.data.biddingEndTime);
                updateTimer(directEndDate);
              } else {
                // Otherwise assume bidding is open for 7 days
                endDate.setDate(endDate.getDate() + 7);
                
                // Format end date string
                const formattedEndDate = `${endDate.getDate().toString().padStart(2, '0')}.${(endDate.getMonth() + 1).toString().padStart(2, '0')}.${endDate.getFullYear()} ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:${endDate.getSeconds().toString().padStart(2, '0')} GMT+8`;
                console.log("Formatted end date:", formattedEndDate);
                
                // Start timer
                updateTimer(endDate);
              }
            }
          } catch (jobError) {
            console.error("Error fetching job:", jobError);
            // Try a fallback endpoint if the first one fails
            try {
              const fallbackResponse = await axios.get(`http://localhost:5000/jobs/${jobId}`);
              setJobDetails(fallbackResponse.data);
              console.log("Job data (fallback):", fallbackResponse.data);
              setValue("projectName", fallbackResponse.data.title || "Untitled Project");
              
              // Calculate end time for fallback data
              if (fallbackResponse.data.biddingStartTime) {
                const endDate = new Date(fallbackResponse.data.biddingStartTime);
                
                if (fallbackResponse.data.biddingEndTime) {
                  const directEndDate = new Date(fallbackResponse.data.biddingEndTime);
                  updateTimer(directEndDate);
                } else {
                  // Assume 7 days
                  endDate.setDate(endDate.getDate() + 7);
                  updateTimer(endDate);
                }
              }
            } catch (fallbackError) {
              console.error("All job fetch attempts failed:", fallbackError);
              setSubmissionError("Could not load job details. Please try again later.");
            }
          }
        } else if (sampleData) {
          // Fallback to sample data if no jobId
          setJobDetails(sampleData);
          setValue("projectName", sampleData.title || "Sample Project");
          
          // Create fallback timer for sample data
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 3); // 3 days from now
          updateTimer(endDate);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmissionError(`Failed to load project details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, setValue]);

  // NEW: Separated qualification fetching function to avoid closure issues
  const fetchQualifications = async (userId, contractorData) => {
    try {
      console.log("About to fetch qualifications for user:", userId);
      
      // Try both endpoints to see which one works
      const endpoints = [
        `http://localhost:5000/qualify/user/${userId}?t=${Date.now()}`,
        `http://localhost:5000/api/qualifications/user/${userId}?t=${Date.now()}`
      ];
      
      let qualificationData = null;
      
      for (const endpoint of endpoints) {
        try {
          const qualificationResponse = await axios.get(endpoint, {
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          if (qualificationResponse.data && 
             (Array.isArray(qualificationResponse.data) || 
              typeof qualificationResponse.data === 'object')) {
            console.log(`✅ Qualifications found at ${endpoint}:`, qualificationResponse.data);
            qualificationData = qualificationResponse.data;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }
      
      if (qualificationData) {
        // Handle different response formats
        if (Array.isArray(qualificationData)) {
          console.log("Setting qualifications as array:", qualificationData.length);
          setQualifications(qualificationData);
        } else if (qualificationData?.qualifications) {
          console.log("Setting nested qualifications:", qualificationData.qualifications);
          setQualifications(qualificationData.qualifications);
        } else if (typeof qualificationData === 'object' && !Array.isArray(qualificationData)) {
          // Convert single object to array
          console.log("Converting single qualification to array");
          setQualifications([qualificationData]);
        }
      } else {
        // Create default qualification using contractor data
        if (contractorData?.experienceYears) {
          const defaultQualifications = [{
            type: "Experience",
            name: `${contractorData.experienceYears} years experience`,
            issuer: contractorData.companyName || getUserInfo()?.username,
            year: new Date().getFullYear()
          }];
          console.log("Created default qualifications:", defaultQualifications);
          setQualifications(defaultQualifications);
        }
      }
    } catch (error) {
      console.warn("Final qualification fetch error:", error);
      
      // FALLBACK: Create a qualification from contractor experience
      if (contractorData?.experienceYears) {
        const defaultQualifications = [{
          type: "Experience",
          name: `${contractorData.experienceYears} years in construction`,
          issuer: contractorData.companyName || getUserInfo()?.username
        }];
        console.log("Created fallback qualifications:", defaultQualifications);
        setQualifications(defaultQualifications);
      }
    }
  };

  // Function to update timer - updated to match reference implementation exactly
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
    
    // Return cleanup function
    return () => clearInterval(interval);
  };

  // Estimated Budget and project details from job data
  const estimatedBudget = jobDetails?.budget || "Not specified";
  const projectTitle = jobDetails?.title || "";
  const projectDescription = jobDetails?.description || "";
  
  // Handle back to project details
  const handleBackToProject = () => {
    navigate(jobId ? `/project/${jobId}` : `/project-details`);
  };

  // Submit bid form
  const onSubmit = async (data) => {
    if (timeLeft.timeUp) {
      setSubmissionError("Auction has ended. You can no longer submit bids.");
      return;
    }
  
    setLoading(true);
    setSubmissionError(null);
  
    try {
      // Get contractor info from state or token
      const userInfo = getUserInfo();
      
      if (!userInfo) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      // Format bid data for backend
      const bidData = {
        jobId: jobId, 
        projectId: jobId, // For backward compatibility
        userId: userInfo.userId,
        contractorName: data.contractorName,
        contractorId: data.contractorId,
        price: parseFloat(data.yourBid),
        timeline: parseInt(data.timeline),
        qualifications: `Experience: ${contractorInfo?.experienceYears || data.experience} years. ${data.additionalDetails || ""}`,
        experienceYears: parseInt(contractorInfo?.experienceYears || data.experience) || 0,
        submissionDate: new Date().toISOString()
      };

      console.log("Sending bid data:", bidData);

      // Submit bid to API
      const response = await axios.post("http://localhost:5000/bids/submit", bidData);

      if (response.status === 201) {
        alert("Bid Submitted Successfully!");
        navigate(`/project/${jobId}`);
      } else {
        throw new Error(response.data.error || "Failed to submit bid");
      }
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

  // Prepare qualifications for display with better error handling
  const formattedQualifications = useMemo(() => {
    try {
      if (!qualifications || qualifications.length === 0) {
        return "";
      }
      
      return qualifications.map(qual => {
        // Safety checks for each field
        if (!qual) return "";
        
        // Handle string qualifications
        if (typeof qual === 'string') return qual;
        
        // Extract fields with fallbacks for different naming conventions
        const type = qual.type || qual.qualificationType || "";
        const name = qual.name || qual.qualificationName || "";
        const issuer = qual.issuer || qual.issuingAuthority || "";
        const year = qual.year || qual.yearObtained || "";
        
        // Build formatted string
        let result = name || type;
        if (type && name && type !== name) result = `${type}: ${name}`;
        if (issuer) result += ` (${issuer}${year ? `, ${year}` : ""})`;
        else if (year) result += ` (${year})`;
        
        return result;
      }).filter(Boolean).join(", ");
    } catch (err) {
      console.error("Error formatting qualifications:", err);
      return "Error displaying qualifications";
    }
  }, [qualifications]);

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

      {loading && !jobDetails ? (
        <div className="text-center py-10">
          <div className="inline-block border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full h-12 w-12 animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading project details...</p>
        </div>
      ) : (
        <>
          {/* Display Project Details */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Project Details</h3>
            <p className="text-gray-700 mb-2">{projectDescription}</p>
            <div className="flex flex-wrap gap-4">
              <p className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Budget: {estimatedBudget}
              </p>
              <p className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Deadline: {jobDetails?.biddingEndTime ? new Date(jobDetails.biddingEndTime).toLocaleString() : "Not specified"}
              </p>
              {/* Added client name if available */}
              {jobDetails?.userName && (
                <p className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  Client: {jobDetails.userName}
                </p>
              )}
            </div>
          </div>

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

          {/* Rest of the component remains the same */}
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
            {/* Project Name - Read-only */}
            <div className="relative">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <div className="w-full p-3 border bg-gray-50 border-gray-300 rounded-lg text-gray-700">
                {projectTitle}
              </div>
              <input
                type="hidden"
                {...register("projectName")}
                value={projectTitle}
              />
            </div>

            {/* Contractor Name - Read-only */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contractor Name
              </label>
              <div className="w-full p-3 border bg-gray-50 border-gray-300 rounded-lg text-gray-700">
                {contractorInfo?.companyName || getUserInfo()?.username || "Unknown"}
              </div>
              <input
                type="hidden"
                {...register("contractorName")}
                value={contractorInfo?.companyName || getUserInfo()?.username || ""}
              />
            </div>

            {/* Hidden Contractor ID field */}
            <input
              type="hidden"
              {...register("contractorId")}
              value={getUserInfo()?.userId || ""}
            />

            {/* Experience - Always Read-only */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years)
              </label>
              <div className="w-full p-3 border bg-gray-50 border-gray-300 rounded-lg text-gray-700">
                {contractorInfo?.experienceYears || "Not specified"} years
              </div>
              <input
                type="hidden"
                {...register("experience")}
                value={contractorInfo?.experienceYears || "0"}
              />
            </div>

            {/* Qualifications Display - Using fetched qualifications with better error handling */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualifications
              </label>
              <div className="w-full p-3 border bg-gray-50 border-gray-300 rounded-lg text-gray-700">
                {formattedQualifications || 
                 (contractorInfo?.qualifications?.length > 0 
                  ? contractorInfo.qualifications.join(", ") 
                  : "No qualifications listed")}
              </div>
            </div>

            {/* Your Bid - Editable */}
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
                />
              </div>
              {errors.yourBid && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.yourBid.message}
                </p>
              )}
            </div>

            {/* Timeline - Editable */}
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
              />
              {errors.timeline && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.timeline.message}
                </p>
              )}
            </div>

            {/* Additional Details - Editable */}
            <div className="relative">
              <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                id="additionalDetails"
                rows="4"
                {...register("additionalDetails")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Add any additional information about your bid..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={timeLeft.timeUp || loading}
                className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  (timeLeft.timeUp || loading) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Submit Bid"}
              </button>
              
            </div>
          </form>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Your Bid</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                Are you sure you want to submit this bid?
              </p>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between border-b border-blue-100 pb-2 mb-2">
                  <span className="font-medium text-gray-600">Project:</span>
                  <span className="font-medium">{projectTitle}</span>
                </div>
                <div className="flex justify-between border-b border-blue-100 pb-2 mb-2">
                  <span className="font-medium text-gray-600">Your Bid:</span>
                  <span className="font-bold text-blue-700">
                    RS {document.getElementById("yourBid")?.value || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Timeline:</span>
                  <span className="font-medium">
                    {document.getElementById("timeline")?.value || "N/A"} days
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Bid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidForm;