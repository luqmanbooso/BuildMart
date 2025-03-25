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
  const [userInfo, setUserInfo] = useState(null);
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
  } = useForm({
    mode: "onChange", 
    defaultValues: {
      yourBid: "",
      timeline: "",
      additionalDetails: ""
    }
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setUserInfo({
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          experienceYears: decoded.experienceYears,
          completedProjects: decoded.completedProjects
        });
      } else {
        setSubmissionError("Authentication required. Please log in.");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setSubmissionError("Authentication error. Please log in again.");
    }
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    
    const fetchContractorProfile = async () => {
      try {
        const contractorResponse = await axios.get(`http://localhost:5000/api/contractors//${userInfo.userId}`);
        setContractorInfo(contractorResponse.data);
        console.log("Contractor data:", contractorResponse.data);
        

        setValue("contractorName", contractorResponse.data.companyName || userInfo.username);
        setValue("contractorId", userInfo.userId);
        setValue("experience", contractorResponse.data.experienceYears || "");
        

        setTimeout(() => {
          fetchQualifications(userInfo.userId, contractorResponse.data);
        }, 100);
        
      } catch (contractorError) {
        console.warn("Could not fetch contractor profile:", contractorError);
        setValue("contractorName", userInfo.username);
        setValue("contractorId", userInfo.userId);
      }
    };
    
    fetchContractorProfile();
  }, [userInfo, setValue]);

  useEffect(() => {
    if (!jobId && !sampleData) return;
    
    const fetchJobDetails = async () => {
      setLoading(true);
      
      try {
        if (jobId) {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          try {
            const jobResponse = await axios.get(`http://localhost:5000/jobs/${jobId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            setJobDetails(jobResponse.data);
            console.log("Job data:", jobResponse.data);
            setValue("projectName", jobResponse.data.title || "Untitled Project");
            
            if (jobResponse.data.biddingEndTime) {
              updateTimer(new Date(jobResponse.data.biddingEndTime));
            } else if (jobResponse.data.biddingStartTime) {
              const endDate = new Date(jobResponse.data.biddingStartTime);
              endDate.setDate(endDate.getDate() + 7);
              updateTimer(endDate);
            }
            
          } catch (jobError) {
            console.error("Error fetching job from first endpoint:", jobError);
            
            try {
              const fallbackResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              setJobDetails(fallbackResponse.data);
              console.log("Job data (fallback):", fallbackResponse.data);
              setValue("projectName", fallbackResponse.data.title || "Untitled Project");
              
              if (fallbackResponse.data.biddingEndTime) {
                updateTimer(new Date(fallbackResponse.data.biddingEndTime));
              } else if (fallbackResponse.data.biddingStartTime) {
                const endDate = new Date(fallbackResponse.data.biddingStartTime);
                endDate.setDate(endDate.getDate() + 7);
                updateTimer(endDate);
              }
            } catch (fallbackError) {
              console.error("All job fetch attempts failed:", fallbackError);
              setSubmissionError("Could not load job details. Please try again later.");
            }
          }
        } else if (sampleData) {
          setJobDetails(sampleData);
          setValue("projectName", sampleData.title || "Sample Project");
          
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 3); 
          updateTimer(endDate);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setSubmissionError(`Failed to load project details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, sampleData, setValue]);

  const fetchQualifications = async (userId, contractorData) => {
    try {
      console.log("About to fetch qualifications for user:", userId);
      
      const endpoint = `http://localhost:5000/qualify/user/${userId}`;
      
      try {
        const qualificationResponse = await axios.get(endpoint, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const qualificationData = qualificationResponse.data;
        
        if (qualificationData && Array.isArray(qualificationData) && qualificationData.length > 0) {
          console.log(`Qualifications found:`, qualificationData);
          setQualifications(qualificationData);
        } else if (qualificationData && typeof qualificationData === 'object' && !Array.isArray(qualificationData)) {
          console.log("Converting single qualification to array");
          setQualifications([qualificationData]);
        } else {
          createDefaultQualification(contractorData);
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
        createDefaultQualification(contractorData);
      }
    } catch (error) {
      console.warn("Final qualification fetch error:", error);
      createDefaultQualification(contractorData);
    }
  };
  
  // Helper function for creating default qualification
  const createDefaultQualification = (contractorData) => {
    if (contractorData?.experienceYears) {
      const defaultQualifications = [{
        type: "Experience",
        name: `${contractorData.experienceYears} years in construction`,
        issuer: contractorData.companyName || userInfo?.username,
        year: new Date().getFullYear().toString()
      }];
      console.log("Created default qualifications:", defaultQualifications);
      setQualifications(defaultQualifications);
    }
  };

  // Timer function
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

  // Extract min/max budget instead of a single budget value
const minBudget = jobDetails?.minBudget || "0";
const maxBudget = jobDetails?.maxBudget || "0";
const projectTitle = jobDetails?.title || "";
const projectDescription = jobDetails?.description || "";
  
  // Handle back to project details
  const handleBackToProject = () => {
    navigate(jobId ? `/project/${jobId}` : `/project-details`);
  };

  // Updated onSubmit function with better error handling for duplicate prices

const onSubmit = async (data) => {
  if (timeLeft.timeUp) {
    setSubmissionError("Auction has ended. You can no longer submit bids.");
    return;
  }

  setLoading(true);
  setSubmissionError(null);

  try {
    if (!userInfo) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    // Create bid data exactly matching what the backend expects
    const bidData = {
      projectId: jobId,
      contractorId: userInfo.userId,
      contractorname: contractorInfo?.companyName || userInfo?.username || "Anonymous Contractor",
      price: parseFloat(data.yourBid),
      timeline: parseInt(data.timeline),
      qualifications: `Experience: ${contractorInfo?.experienceYears || data.experience} years. ${data.additionalDetails || ""}`,
      rating: contractorInfo?.rating || null,
      completedProjects: contractorInfo?.completedProjects || userInfo?.completedProjects || 0
    };

    console.log("Sending bid data:", bidData);

    // Submit bid to API
    const response = await axios.post("http://localhost:5000/bids/submit", bidData);

    if (response.status === 201) {
      alert("Bid Submitted Successfully!");
      navigate(`/project/${jobId}`);
    }
  } catch (error) {
    console.error("Error submitting bid:", error);
    
    // Handle specific error types
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      
      if (errorData.error === 'Duplicate bid') {
        setSubmissionError("You have already submitted a bid for this project.");
      } 
      // Handle duplicate price error specifically
      else if (errorData.error === 'Duplicate price') {
        setSubmissionError(errorData.message);
        
        // Update the form field with suggested value
        if (errorData.suggestedPrice) {
          setValue("yourBid", errorData.suggestedPrice.toString());
        }
      }
      else {
        setSubmissionError(errorData.message || "Failed to submit bid. Please try again.");
      }
    } else {
      setSubmissionError(error.message || "Failed to submit bid. Please try again.");
    }
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

  // Get qualification count
  const qualificationCount = useMemo(() => {
    return qualifications && Array.isArray(qualifications) ? qualifications.length : 0;
  }, [qualifications]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white border border-gray-100 rounded-xl shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Inspiring background elements */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&q=80" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/5 z-0"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-blue-50 to-transparent rounded-bl-full opacity-80 z-0"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-t from-blue-50 to-transparent rounded-tr-full opacity-80 z-0"></div>
      
      {/* Inspirational quote */}
      <div className="relative z-10 mb-8 bg-blue-50/70 p-4 rounded-lg border border-blue-100 text-center">
        <p className="text-blue-800 italic font-medium">
          "Winning bids aren't just about the price - they're about demonstrating your unique value and expertise."
        </p>
      </div>
      
      {/* Main content - add relative positioning to appear above background */}
      <div className="relative z-10">
        {/* Back Button with enhanced styling */}
        <div className="mb-8">
          <button
            onClick={handleBackToProject}
            className="text-blue-600 hover:text-blue-800 flex items-center transition-all duration-200 font-medium hover:translate-x-[-3px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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

        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center">
          <span className="bg-blue-600 text-white p-1 rounded mr-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          Bid Submission Form
        </h2>

        {/* Enhanced Project Details */}
        {(jobDetails || sampleData) && (
          <div className="mb-8 bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100 transform transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Project Overview
              </h3>
              <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                #{jobId || "Sample"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm uppercase tracking-wide text-gray-500 font-medium">Title</h4>
                  <p className="font-semibold text-gray-900">{projectTitle || "Untitled Project"}</p>
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-wide text-gray-500 font-medium">Description</h4>
                  <p className="text-gray-700">{projectDescription || "No description available."}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm uppercase tracking-wide text-gray-500 font-medium">Budget Range</h4>
                  <p className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium inline-block">
                    LKR {minBudget} - {maxBudget}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-wide text-gray-500 font-medium">Deadline</h4>
                  <p className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-medium inline-block">
                    {new Date(timeLeft.timeUp ? new Date() : jobDetails?.biddingEndTime || sampleData?.biddingEndTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Timer */}
        {timeLeft.timeUp ? (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-xl font-medium text-center shadow-sm border border-red-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Auction has ended!
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <p className="font-semibold text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Auction ends in:
            </p>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <span className="block text-3xl font-bold text-blue-700">{timeLeft.days}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">days</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-md">
                <span className="block text-3xl font-bold text-blue-700">{timeLeft.hours}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">hours</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-md">
                <span className="block text-3xl font-bold text-blue-700">{timeLeft.minutes}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">mins</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-md">
                <span className="block text-3xl font-bold text-blue-700">{timeLeft.seconds}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">secs</span>
              </div>
            </div>
          </div>
        )}

        {/* Submission Error with improved styling */}
        {submissionError && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{submissionError}</span>
            </div>
          </div>
        )}

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit(handleConfirmation)} className="space-y-7">
          {/* Hidden inputs - properly hidden with CSS */}
          <div className="hidden">
            <input type="hidden" {...register("projectName")} value={projectTitle} />
            <input type="hidden" {...register("projectId")} value={jobId} />
            <input type="hidden" {...register("contractorName")} value={contractorInfo?.companyName || userInfo?.username || ""} />
            <input type="hidden" {...register("contractorId")} value={userInfo?.userId || ""} />
            <input type="hidden" {...register("experience")} value={contractorInfo?.experienceYears || "0"} />
          </div>

          {/* Form Sections with Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contractor Information */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 backdrop-blur-sm bg-opacity-90">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 pb-2 border-b flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Contractor Details
              </h3>
              
              <div className="space-y-4">
                {/* Contractor Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contractor Name
                  </label>
                  <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    {contractorInfo?.companyName || userInfo?.username || "Unknown"}
                  </div>
                </div>

                {/* Experience */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    {contractorInfo?.experienceYears || "Not specified"} years
                  </div>
                </div>

                {/* Qualifications */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualifications
                  </label>
                  <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    {qualificationCount > 0 
                      ? `${qualificationCount} qualification${qualificationCount !== 1 ? 's' : ''} available` 
                      : "No qualifications available"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bid Information */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 backdrop-blur-sm bg-opacity-90">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 pb-2 border-b flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Your Bid Details
              </h3>
              
              <div className="space-y-4">
                {/* Your Bid with enhanced validation */}
                <div className="relative">
                  <label htmlFor="yourBid" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Bid Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 font-medium">RS</span>
                    <input
                      id="yourBid"
                      type="text" // Changed to text for better pattern control
                      placeholder="Enter your bid amount"
                      {...register("yourBid", {
                        required: "Your bid is required",
                        maxLength: {
                          value: 12,
                          message: "Bid amount cannot exceed 12 digits"
                        },
                        pattern: {
                          value: /^[0-9]+(\.[0-9]{1,2})?$/,
                          message: "Please enter a valid number (e.g., 1000 or 1000.50)"
                        },
                        validate: {
                          positive: v => parseFloat(v) > 0 || "Bid must be greater than 0",
                          minBudgetCheck: v => {
                            const bidValue = parseFloat(v);
                            const minValue = parseFloat(minBudget);
                            return !minValue || bidValue >= minValue || `Bid must be at least LKR ${minBudget}`;
                          },
                          maxBudgetCheck: v => {
                            const bidValue = parseFloat(v);
                            const maxValue = parseFloat(maxBudget);
                            return !maxValue || bidValue <= maxValue || `Bid cannot exceed LKR ${maxBudget}`;
                          }
                        },
                        onChange: (e) => {
                          // Only allow numbers and single decimal point
                          const value = e.target.value;
                          if (!/^[0-9]*\.?[0-9]*$/.test(value)) {
                            e.target.value = value.replace(/[^0-9.]/g, '');
                          }
                        }
                      })}
                      className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.yourBid ? "border-red-500 bg-red-50" : 
                        "border-gray-300 focus:border-blue-500"
                      }`}
                      onBlur={() => trigger("yourBid")}
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
                  <p className="mt-1 text-xs text-gray-500">
                    Enter amount in RS between {minBudget} and {maxBudget}
                  </p>
                </div>

                {/* Timeline with enhanced validation */}
                <div className="relative">
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline (Days) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="timeline"
                      type="text"
                      placeholder="Enter project timeline in days"
                      maxLength={3} // Explicitly limit input to 3 characters
                      {...register("timeline", {
                        required: "Timeline is required",
                        maxLength: {
                          value: 3,
                          message: "Timeline cannot exceed 3 digits (999 days)"
                        },
                        pattern: {
                          value: /^[0-9]+$/, 
                          message: "Please enter a whole number (no decimals)"
                        },
                        validate: {
                          positive: v => parseInt(v) > 0 || "Timeline must be at least 1 day",
                          notTooLarge: v => parseInt(v) <= 365 || "Timeline must not exceed 1 year"
                        },
                        onChange: (e) => {
                          // Only allow integers and limit to 3 digits
                          let value = e.target.value;
                          
                          // Remove non-numeric characters
                          value = value.replace(/[^0-9]/g, '');
                          
                          // Limit to 3 digits
                          if (value.length > 3) {
                            value = value.slice(0, 3);
                          }
                          
                          e.target.value = value;
                        }
                      })}
                      className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.timeline ? "border-red-500 bg-red-50" : 
                        "border-gray-300 focus:border-blue-500"
                      }`}
                      onBlur={() => trigger("timeline")}
                    />
                    <span className="absolute left-3 top-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  {errors.timeline && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.timeline.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter whole number of days needed to complete the project (max 365)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 backdrop-blur-sm bg-opacity-90">
            <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Additional Details <span className="text-gray-500 ml-1">(Optional)</span>
            </label>
            <textarea
              id="additionalDetails"
              {...register("additionalDetails",
                {
                  maxLength: {
                    value: 1000,
                    message: "Description cannot exceed 1000 characters"
                  }
                }
              )}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
              rows="4"
              placeholder="Describe your approach, relevant experience, or any other information that might help your bid stand out..."
            ></textarea>
          </div>

          {/* Winning Bid Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Tips for a Winning Bid
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 pl-6 list-disc">
              <li>Consider both competitive pricing and quality delivery</li>
              <li>Highlight your specific qualifications relevant to this project</li>
              <li>Provide a realistic timeline that you can confidently deliver</li>
              <li>Use the additional details section to explain your approach</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-5">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-blue-300 disabled:to-blue-400 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
              disabled={loading || timeLeft.timeUp}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Submit Bid
                </>
              )}
            </button>
          </div>
        </form>

        {/* Enhanced Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fadeIn">
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Confirm Bid Submission</h3>
                <p className="text-gray-600">Are you sure you want to submit this bid? This action cannot be undone.</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex-1 shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default BidForm;