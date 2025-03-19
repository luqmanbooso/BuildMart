import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSort, FaSortUp, FaSortDown, FaStar, FaFilter, FaCheck, FaClipboardList, FaChartBar, FaExchangeAlt } from 'react-icons/fa';

const BidListingSection = ({ bids, jobId, refreshBids }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filtering, sorting and comparison
  const [filteredBids, setFilteredBids] = useState([]);
  const [sortField, setSortField] = useState('price');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedBids, setSelectedBids] = useState([]);
  const [shortlistedBids, setShortlistedBids] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'shortlisted', 'compare'
  
  // Filter states
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minTimeline: '',
    maxTimeline: '',
    minRating: 0,
    showShortlisted: false
  });
  
  // Calculate bid scores
  const [weightings, setWeightings] = useState({
    price: 40,
    timeline: 30,
    rating: 15,
    experience: 15
  });

  // Navigate to agreement form instead of direct acceptance
  const handleBidSelection = (bidId) => {
    navigate(`/agreement/${jobId}/${bidId}`);
  };

  // Initialize filtered bids
  useEffect(() => {
    if (bids && bids.length > 0) {
      setFilteredBids(bids);
    }
  }, [bids]);

  // Toggle bid selection for comparison
  const toggleBidSelection = (bid) => {
    const bidId = bid.id || bid._id;
    if (selectedBids.includes(bidId)) {
      setSelectedBids(selectedBids.filter(id => id !== bidId));
    } else {
      if (selectedBids.length < 3) {
        setSelectedBids([...selectedBids, bidId]);
      } else {
        toast.warning("You can only compare up to 3 bids at once");
      }
    }
  };

  // Toggle bid shortlisting
  const toggleShortlisted = (bid) => {
    const bidId = bid.id || bid._id;
    if (shortlistedBids.includes(bidId)) {
      setShortlistedBids(shortlistedBids.filter(id => id !== bidId));
      toast.info("Removed from shortlist");
    } else {
      setShortlistedBids([...shortlistedBids, bidId]);
      toast.success("Added to shortlist");
    }
  };

  // Apply filters to bids
  const applyFilters = () => {
    let result = [...bids];
    
    if (filters.minPrice) {
      result = result.filter(bid => parseFloat(bid.price) >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      result = result.filter(bid => parseFloat(bid.price) <= parseFloat(filters.maxPrice));
    }
    
    if (filters.minTimeline) {
      result = result.filter(bid => parseInt(bid.timeline) >= parseInt(filters.minTimeline));
    }
    
    if (filters.maxTimeline) {
      result = result.filter(bid => parseInt(bid.timeline) <= parseInt(filters.maxTimeline));
    }
    
    if (filters.minRating > 0) {
      result = result.filter(bid => {
        const rating = bid.contractor?.rating || 0;
        return rating >= filters.minRating;
      });
    }
    
    if (viewMode === 'shortlisted') {
      result = result.filter(bid => shortlistedBids.includes(bid.id || bid._id));
    }
    
    setFilteredBids(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minTimeline: '',
      maxTimeline: '',
      minRating: 0,
      showShortlisted: false
    });
    setFilteredBids(bids);
  };

  // Calculate bid score based on weightings
  const calculateBidScore = (bid) => {
    // Find min and max values for normalization
    const allPrices = bids.map(b => parseFloat(b.price));
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    const allTimelines = bids.map(b => parseInt(b.timeline));
    const minTimeline = Math.min(...allTimelines);
    const maxTimeline = Math.max(...allTimelines);
    
    // Normalize values to score between 0-100 (lower is better for price and timeline)
    const priceRange = maxPrice - minPrice;
    const priceScore = priceRange === 0 ? 100 : 100 - ((parseFloat(bid.price) - minPrice) / priceRange * 100);
    
    const timelineRange = maxTimeline - minTimeline;
    const timelineScore = timelineRange === 0 ? 100 : 100 - ((parseInt(bid.timeline) - minTimeline) / timelineRange * 100);
    
    const rating = bid.contractor?.rating || 0;
    const ratingScore = (rating / 5) * 100;
    
    const experience = bid.contractor?.experience || bid.experience || 0;
    const experienceScore = Math.min(experience * 10, 100); // Cap at 10 years = 100%
    
    // Calculate weighted score
    const totalScore = (
      (priceScore * (weightings.price / 100)) +
      (timelineScore * (weightings.timeline / 100)) +
      (ratingScore * (weightings.rating / 100)) +
      (experienceScore * (weightings.experience / 100))
    );
    
    return totalScore.toFixed(1);
  };

  // Handle sorting changes
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get bids sorted by current criteria
  const getSortedBids = () => {
    if (!filteredBids || !filteredBids.length) return [];
    
    return [...filteredBids].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'timeline':
          comparison = parseInt(a.timeline) - parseInt(b.timeline);
          break;
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'contractor':
          comparison = (a.contractor?.name || a.contractorname || '').localeCompare(b.contractor?.name || b.contractorname || '');
          break;
        case 'rating':
          comparison = (a.contractor?.rating || 0) - (b.contractor?.rating || 0);
          break;
        case 'experience':
          comparison = (a.contractor?.experience || a.experience || 0) - (b.contractor?.experience || b.experience || 0);
          break;
        case 'score':
          comparison = calculateBidScore(b) - calculateBidScore(a);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Render sortable table header
  const renderSortableHeader = (label, field) => {
    const isActive = sortField === field;
    
    return (
      <th 
        scope="col" 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          {isActive ? (
            sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
          ) : (
            <FaSort className="text-gray-400" />
          )}
        </div>
      </th>
    );
  };

  // Get selected bids for comparison
  const getSelectedBidsData = () => {
    return bids.filter(bid => selectedBids.includes(bid.id || bid._id));
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="text-lg font-bold text-gray-900">
          Bids 
          <span className="ml-2 text-sm font-medium bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
            {bids?.length || 0}
          </span>
          {shortlistedBids.length > 0 && (
            <span className="ml-2 text-sm font-medium bg-green-100 text-green-700 py-1 px-2 rounded-full">
              {shortlistedBids.length} shortlisted
            </span>
          )}
        </h3>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaFilter className="mr-1.5" /> Filters
          </button>
          
          {shortlistedBids.length > 0 && (
            <button 
              onClick={() => setViewMode(viewMode === 'shortlisted' ? 'all' : 'shortlisted')} 
              className={`flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                viewMode === 'shortlisted' 
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaClipboardList className="mr-1.5" /> 
              {viewMode === 'shortlisted' ? 'View All Bids' : 'View Shortlisted'}
            </button>
          )}
          
          {selectedBids.length > 0 && (
            <button 
              onClick={() => setShowCompare(!showCompare)} 
              className={`flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                showCompare 
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaExchangeAlt className="mr-1.5" /> 
              {showCompare ? 'Hide Comparison' : `Compare (${selectedBids.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">Min</span>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="pl-10 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">Max</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="pl-10 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="∞"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (days)</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">Min</span>
                  <input
                    type="number"
                    name="minTimeline"
                    value={filters.minTimeline}
                    onChange={handleFilterChange}
                    className="pl-10 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">Max</span>
                  <input
                    type="number"
                    name="maxTimeline"
                    value={filters.maxTimeline}
                    onChange={handleFilterChange}
                    className="pl-10 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="∞"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setFilters({...filters, minRating: filters.minRating === star ? 0 : star})}
                    className={`p-1 ${filters.minRating >= star ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison panel */}
      {showCompare && selectedBids.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200 animate-fade-in">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Compare Selected Bids</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-blue-800 uppercase">Criteria</th>
                  {getSelectedBidsData().map((bid, index) => (
                    <th key={index} className="py-3 px-4 text-left text-xs font-medium text-blue-800">
                      {bid.contractor?.name || bid.contractorname || 'Contractor ' + (index + 1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr>
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">Bid Amount</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm text-gray-900 font-medium">
                      LKR {parseFloat(bid.price).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">Timeline</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm text-gray-900">
                      {bid.timeline} days
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">Rating</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm text-gray-900">
                      {bid.contractor?.rating || 'N/A'} <span className="text-yellow-500">★</span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">Experience</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm text-gray-900">
                      {bid.contractor?.experience || bid.experience || 'N/A'} years
                    </td>
                  ))}
                </tr>
                <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                  <td className="py-3 px-4 text-sm font-medium text-blue-800">Overall Score</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm font-bold text-blue-900">
                      {calculateBidScore(bid)}/100
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                setSelectedBids([]);
                setShowCompare(false);
              }}
              className="px-3 py-1.5 border border-blue-300 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {bids && bids.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Select
                </th>
                {renderSortableHeader('Contractor', 'contractor')}
                {renderSortableHeader('Bid Amount', 'price')}
                {renderSortableHeader('Timeline', 'timeline')}
                {renderSortableHeader('Rating', 'rating')}
                {renderSortableHeader('Date', 'date')}
                {renderSortableHeader('Score', 'score')}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedBids().map((bid) => {
                const bidId = bid.id || bid._id;
                const isSelected = selectedBids.includes(bidId);
                const isShortlisted = shortlistedBids.includes(bidId);
                const bidScore = calculateBidScore(bid);
                
                return (
                  <tr key={bidId} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${isShortlisted ? 'border-l-4 border-green-400' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBidSelection(bid)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-medium">
                            {(bid.contractor?.name || bid.contractorname || 'Unknown').charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {bid.contractor?.name || bid.contractorname || 'Unknown'}
                            {isShortlisted && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">Shortlisted</span>
                            )}
                          </div>
                          {bid.contractor?.experience && (
                            <div className="text-xs text-gray-500">{bid.contractor.experience} years experience</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">LKR {parseFloat(bid.price).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{bid.timeline} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-1">
                          {bid.contractor?.rating || 'N/A'}
                        </span>
                        {bid.contractor?.rating && (
                          <span className="text-yellow-400">
                            <FaStar size={14} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold rounded-full w-12 h-8 flex items-center justify-center 
                        ${parseFloat(bidScore) >= 80 ? 'bg-green-100 text-green-800' : 
                         parseFloat(bidScore) >= 60 ? 'bg-blue-100 text-blue-800' : 
                         parseFloat(bidScore) >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                         'bg-red-100 text-red-800'}`}
                      >
                        {bidScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium rounded-full px-3 py-1 inline-flex items-center
                        ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          bid.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        <span className={`h-2 w-2 rounded-full mr-2 
                          ${bid.status === 'accepted' ? 'bg-green-500' : 
                            bid.status === 'rejected' ? 'bg-red-500' : 
                            'bg-yellow-500'}`}
                        ></span>
                        {bid.status === 'accepted' ? 'Accepted' : 
                         bid.status === 'rejected' ? 'Rejected' : 
                         'Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                            isShortlisted 
                              ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' 
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleShortlisted(bid)}
                        >
                          {isShortlisted ? (
                            <>
                              <FaCheck className="mr-1" /> Shortlisted
                            </>
                          ) : (
                            'Shortlist'
                          )}
                        </button>
                        
                        <button 
                          className="inline-flex items-center px-2 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                          onClick={() => navigate(`/contractor/${bid.contractorId}/bid/${bidId}/project/${jobId}`)}
                        >
                          Details
                        </button>
                        
                        {bid.status === 'pending' && (
                          <button 
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            onClick={() => handleBidSelection(bidId)}
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">No bids yet</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>No bids have been placed yet for this job. Check back later or adjust your job details to attract more contractors.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidListingSection;