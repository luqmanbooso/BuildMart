import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ContractorViewDetails = () => {
  const { contractorId, bidId, projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contractor, setContractor] = useState(null);
  const [bid, setBid] = useState(null);
  const [error, setError] = useState(null);
  const [contractorUser, setContractorUser] = useState(null);

  useEffect(() => {
    const fetchContractorDetails = async () => {
      try {
        setLoading(true);
        
        // First, try to get all bids for the project and find the matching bid
        const bidsResponse = await axios.get(`http://localhost:5000/bids/project/${projectId}`);
        
        if (bidsResponse.data) {
          // Find the bid that matches our bidId
          const matchingBid = bidsResponse.data.find(b => b._id === bidId);
          
          if (matchingBid) {
            console.log("Found matching bid:", matchingBid);
            setBid(matchingBid);
            
            // Try to get user details from auth endpoint
            try {
              const userResponse = await axios.get(`http://localhost:5000/auth/user/${contractorId}`);
              if (userResponse.data && userResponse.data.user) {
                setContractorUser(userResponse.data.user);
              }
            } catch (userError) {
              console.log('Could not fetch user details:', userError);
            }
            
            // Extract contractor details from bid
            const extractedContractor = {
              _id: matchingBid.contractorId,
              name: matchingBid.contractorname || 'Unknown Contractor',
              rating: matchingBid.rating || 0,
              completedProjects: matchingBid.completedProjects || 0,
              qualifications: matchingBid.qualifications || 'No qualifications provided',
              // Extract experience from qualifications if possible
              experience: extractExperienceFromQualifications(matchingBid.qualifications)
            };
            
            setContractor(extractedContractor);
          } else {
            setError('Bid not found');
          }
        } else {
          setError('No bid data available');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contractor details:', error);
        setError('Failed to load contractor details');
        setLoading(false);
      }
    };
    
    fetchContractorDetails();
  }, [contractorId, bidId, projectId]);

  // Helper function to extract experience from qualifications text
  const extractExperienceFromQualifications = (qualifications) => {
    if (!qualifications) return null;
    
    // Look for patterns like "Experience: X years" in the qualifications text
    const experienceMatch = qualifications.match(/Experience:\s*(\d+)\s*years/i);
    if (experienceMatch && experienceMatch[1]) {
      return parseInt(experienceMatch[1]);
    }
    return null;
  };

  const handleBackToProject = () => {
    navigate(`/job/${projectId}`);
  };

  const handleAcceptBid = async () => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/bids/${bidId}/status`, { status: 'accepted' });
      // Update the local state
      setBid({ ...bid, status: 'accepted' });
      setLoading(false);
      // Show success message or redirect
      navigate(`/jobs/${projectId}`);
    } catch (error) {
      console.error('Error accepting bid:', error);
      setError('Failed to accept bid');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading contractor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center text-red-500 mb-4">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-semibold">{error}</h2>
            </div>
            <button 
              onClick={handleBackToProject}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <button 
            onClick={handleBackToProject}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Project
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Contractor Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Contractor Details</h1>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Contractor Profile */}
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-2xl font-bold mr-4">
                      {contractor?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{contractor?.name || 'Unknown Contractor'}</h2>
                      {contractorUser && (
                        <p className="text-sm text-gray-600">@{contractorUser.username}</p>
                      )}
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star}
                              className={`h-4 w-4 ${star <= Math.round(contractor?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({contractor?.rating || '0'}/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-blue-100 pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-500 uppercase font-semibold">Completed Projects</p>
                        <p className="font-medium text-gray-700">{contractor?.completedProjects || '0'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-500 uppercase font-semibold">Experience</p>
                        <p className="font-medium text-gray-700">
                          {contractor?.experience ? `${contractor.experience} years` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {contractorUser?.email && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
                    <div className="text-sm">
                      <p className="flex items-center text-gray-600 mb-2">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contractorUser.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bid Details */}
              <div className="md:w-2/3">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bid Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600 uppercase font-semibold">Bid Amount</p>
                      <p className="text-2xl font-bold text-gray-800">LKR {parseFloat(bid?.price || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 uppercase font-semibold">Timeline</p>
                      <p className="text-2xl font-bold text-gray-800">{bid?.timeline || 0} days</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Qualifications & Approach</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {bid?.qualifications || contractor?.qualifications || 'No additional details provided.'}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-2">Bid Status</h4>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full 
                      ${bid?.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : bid?.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {bid?.status === 'accepted' ? 'Accepted' : 
                       bid?.status === 'pending' ? 'Pending' : 
                       bid?.status === 'rejected' ? 'Rejected' : 'Unknown'}
                    </span>
                  </div>

                  {bid?.status === 'pending' && (
                    <div className="mt-6">
                      <button 
                        onClick={handleAcceptBid}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Accept This Bid
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About the Contractor</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {contractor?.qualifications || 
                      "This contractor has not provided detailed information about their experience and qualifications."}
                    </p>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-blue-500 uppercase font-semibold">Specialization</p>
                        <p className="text-sm text-gray-700">
                          {extractSpecializationFromQualifications(bid?.qualifications) || "General Contractor"}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-blue-500 uppercase font-semibold">Bid Date</p>
                        <p className="text-sm text-gray-700">
                          {bid?.createdAt ? new Date(bid.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              // Add the following section inside your component where appropriate:

{/* Bid Update History */}
{bid?.previousPrices && bid.previousPrices.length > 0 && (
  <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Bid Updates History</h3>
    <div className="space-y-4">
      {bid.previousPrices.map((prevBid, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Previous Price:</span>
            <span className="font-medium text-gray-900">LKR {parseFloat(prevBid.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-500">Updated on:</span>
            <span className="text-sm text-gray-700">{new Date(prevBid.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-2">
        <div className="flex justify-between">
          <span className="font-medium text-blue-700">Current Price:</span>
          <span className="font-medium text-blue-800">LKR {parseFloat(bid.price).toLocaleString()}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm text-blue-600">Updates Used:</span>
          <span className="text-sm text-blue-800">{bid.updateCount || 0}/3</span>
        </div>
      </div>
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract specialization from qualifications
function extractSpecializationFromQualifications(qualifications) {
  if (!qualifications) return null;
  
  // Common specializations in construction
  const specializations = [
    'Residential', 'Commercial', 'Industrial', 'Renovation', 
    'Plumbing', 'Electrical', 'Carpentry', 'Masonry', 
    'Roofing', 'Flooring', 'Painting', 'Interior Design'
  ];
  
  // Check if any specialization is mentioned in the qualifications
  for (const spec of specializations) {
    if (qualifications.includes(spec)) {
      return spec;
    }
  }
  
  return null;
}

export default ContractorViewDetails;