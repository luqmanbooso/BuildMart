import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaUser, FaBriefcase, FaAward, FaTrophy } from 'react-icons/fa';
import axios from 'axios';

const ClosedJobBidsSection = ({ bids, jobId }) => {
  const navigate = useNavigate();
  const [acceptedBid, setAcceptedBid] = useState(null);
  const [rejectedBids, setRejectedBids] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);
  const [contractorDetails, setContractorDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Organize bids into accepted, rejected, and pending categories
  useEffect(() => {
    if (!bids || !bids.length) {
      setLoading(false);
      return;
    }

    const accepted = bids.find(bid => bid.status === 'accepted');
    const rejected = bids.filter(bid => bid.status === 'rejected');
    const pending = bids.filter(bid => bid.status === 'pending');
    
    setAcceptedBid(accepted || null);
    setRejectedBids(rejected);
    setPendingBids(pending);
    
    // Fetch contractor details
    const fetchContractorData = async () => {
      setLoading(true);
      const details = {};
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      try {
        // Process all bids in parallel for efficiency
        await Promise.all(bids.map(async (bid) => {
          if (bid.contractorId) {
            try {
              // Fetch contractor profile details
              const contractorResponse = await axios.get(
                `http://localhost:5000/api/contractors/user/${bid.contractorId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              details[bid.contractorId] = contractorResponse.data;
            } catch (error) {
              console.error(`Error fetching data for contractor ${bid.contractorId}:`, error);
              // Set defaults if fetch fails
              if (!details[bid.contractorId]) {
                details[bid.contractorId] = { experienceYears: 0, completedProjects: 0 };
              }
            }
          }
        }));
        
        setContractorDetails(details);
      } catch (error) {
        console.error("Error fetching contractor data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractorData();
  }, [bids]);

  // Card component for displaying a bid with contractor details
  const BidCard = ({ bid, status }) => {
    const bidId = bid?.id || bid?._id;
    const contractor = contractorDetails[bid?.contractorId] || {};
    
    return (
      <div className={`border rounded-lg overflow-hidden shadow-sm mb-4 
        ${status === 'accepted' ? 'border-green-300 bg-green-50' : 
          status === 'rejected' ? 'border-red-200 bg-red-50' : 
          'border-gray-200 bg-white'}`}>
        
        <div className={`px-4 py-3 
          ${status === 'accepted' ? 'bg-green-100' : 
            status === 'rejected' ? 'bg-red-100' : 
            'bg-gray-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                ${status === 'accepted' ? 'bg-green-200 text-green-800' : 
                  status === 'rejected' ? 'bg-red-200 text-red-800' : 
                  'bg-blue-200 text-blue-800'}`}>
                {status === 'accepted' ? <FaCheck /> : 
                 status === 'rejected' ? <FaTimes /> : 
                 <FaUser />}
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {bid?.contractorname || 'Unknown Contractor'}
                  </p>
                  {contractor?.verified && (
                    <span className="ml-1 text-blue-600" title="Verified Contractor">
                      <FaAward size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{contractor?.companyName || 'Independent Contractor'}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium
              ${status === 'accepted' ? 'bg-green-200 text-green-800' :
                status === 'rejected' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'}`}>
              {status === 'accepted' ? 'Accepted' : 
               status === 'rejected' ? 'Rejected' : 
               'Pending'}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Bid Amount</p>
              <p className="text-lg font-bold">LKR {parseFloat(bid?.price).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Timeline</p>
              <p className="text-base">{bid?.timeline} days</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <FaBriefcase className="text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Experience</p>
                <p className="text-base">{contractor?.experienceYears || '0'} years</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaTrophy className="text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Projects</p>
                <p className="text-base">{contractor?.completedProjects || '0'} completed</p>
              </div>
            </div>
          </div>
          
          {contractor?.specialization && contractor.specialization.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {contractor.specialization.map((spec, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate(`/contractor/${bid.contractorId}/bid/${bidId}/project/${jobId}`)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-10">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Project Bids</h3>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Project Bids</h3>
      
      {bids && bids.length > 0 ? (
        <div className="space-y-10">
          {/* Accepted Bid Section */}
          {acceptedBid ? (
            <div>
              <h4 className="text-md font-semibold text-green-800 border-b border-green-200 pb-2 mb-4 flex items-center">
                <FaCheck className="mr-2 text-green-600" /> 
                Accepted Bid
              </h4>
              <BidCard bid={acceptedBid} status="accepted" />
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">No bid has been accepted for this project yet.</p>
            </div>
          )}
          
          {/* Rejected Bids Section */}
          {rejectedBids.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-red-800 border-b border-red-200 pb-2 mb-4 flex items-center">
                <FaTimes className="mr-2 text-red-600" /> 
                Rejected Bids ({rejectedBids.length})
              </h4>
              <div>
                {rejectedBids.map(bid => (
                  <BidCard key={bid.id || bid._id} bid={bid} status="rejected" />
                ))}
              </div>
            </div>
          )}
          
          {/* Pending Bids Section */}
          {pendingBids.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-yellow-800 border-b border-yellow-200 pb-2 mb-4">
                Pending Bids ({pendingBids.length})
              </h4>
              <div>
                {pendingBids.map(bid => (
                  <BidCard key={bid.id || bid._id} bid={bid} status="pending" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-blue-800 text-sm">No bids were received for this project.</p>
        </div>
      )}
    </div>
  );
};

export default ClosedJobBidsSection;