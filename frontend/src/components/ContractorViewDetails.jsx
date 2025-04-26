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
  // New state for qualifications
  const [qualifications, setQualifications] = useState([]);

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
            
            // Fetch contractor qualifications
            try {
              const qualificationsResponse = await axios.get(`http://localhost:5000/qualify/user/${contractorId}`);
              if (qualificationsResponse.data) {
                setQualifications(qualificationsResponse.data);
                console.log("Fetched qualifications:", qualificationsResponse.data);
              }
            } catch (qualError) {
              console.log('Could not fetch qualifications:', qualError);
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

  const handleAcceptBid = () => {
    // Navigate to agreement form instead of directly updating the bid status
    navigate(`/agreement/${projectId}/${bidId}`);
  };

  // Function to get the icon for a qualification type
  const getQualificationIcon = (type) => {
    switch (type) {
      case 'Certification':
        return (
          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'Education':
        return (
          <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        );
      case 'License':
        return (
          <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
          </svg>
        );
      case 'Award':
        return (
          <svg className="h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
          </svg>
        );
      case 'Skill':
        return (
          <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
                
                {/* Qualifications Display Section - NEW */}
                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                    Qualifications ({qualifications.length})
                  </h3>
                  
                  {qualifications.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {qualifications.map((qual) => (
                        <div 
                          key={qual._id} 
                          className="p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getQualificationIcon(qual.type)}
                              <span className="ml-2 text-xs font-semibold text-gray-500">{qual.type}</span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {qual.year}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-800 mt-1">{qual.name}</h4>
                          <p className="text-sm text-gray-600">{qual.issuer}</p>
                          
                          {qual.expiry && qual.expiry !== 'N/A' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Expires: {qual.expiry}
                            </p>
                          )}
                          
                          {qual.documentImage && (
                            <div className="mt-2">
                              <a 
                                href={qual.documentImage} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Certificate
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p className="text-sm text-gray-500">No formal qualifications found</p>
                    </div>
                  )}
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

                  {/* Cost Breakdown Section - New Addition */}
                  {bid?.costBreakdown && bid.costBreakdown.length > 0 && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cost Breakdown
                      </h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (RS)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bid.costBreakdown.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{parseFloat(item.amount).toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 font-medium">
                              <td className="px-4 py-2 text-sm text-gray-900">Total</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {bid.costBreakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Timeline Details Section - New Addition */}
                  {bid?.timelineBreakdown && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Timeline Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Project Start</p>
                          <p className="font-medium text-gray-800">
                            {bid.timelineBreakdown.startDate 
                              ? new Date(bid.timelineBreakdown.startDate).toLocaleDateString() 
                              : "Not specified"}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Project End</p>
                          <p className="font-medium text-gray-800">
                            {bid.timelineBreakdown.endDate 
                              ? new Date(bid.timelineBreakdown.endDate).toLocaleDateString() 
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Work Items Timeline */}
                      {bid.timelineBreakdown.workItems && bid.timelineBreakdown.workItems.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Work Schedule</h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {bid.timelineBreakdown.workItems.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      {new Date(item.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      {new Date(item.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{item.duration} days</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Qualifications & Approach</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {bid?.qualifications || contractor?.qualifications || 'No additional details provided.'}
                    </p>
                  </div>

                  {/* Special Requests Section - New Addition */}
                  {bid?.specialRequests && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Special Requests & Additional Information
                      </h4>
                      <div className="bg-white p-3 rounded-md border border-gray-100">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {bid.specialRequests}
                        </p>
                      </div>
                    </div>
                  )}

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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Review & Accept Bid
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