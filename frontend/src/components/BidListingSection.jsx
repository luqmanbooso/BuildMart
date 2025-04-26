import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSort, FaSortUp, FaSortDown, FaStar, FaFilter, FaCheck, FaClipboardList, FaChartBar, FaExchangeAlt } from 'react-icons/fa';
import {jwtDecode} from 'jwt-decode';

const BidListingSection = ({ bids, jobId, refreshBids }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filteredBids, setFilteredBids] = useState([]);
  const [sortField, setSortField] = useState('price');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedBids, setSelectedBids] = useState([]);
  const [shortlistedBids, setShortlistedBids] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minTimeline: '',
    maxTimeline: '',
    minRating: 0,
    showShortlisted: false
  });
  
  const [weightings, setWeightings] = useState({
    price: 40,
    timeline: 30,
    rating: 15,
    experience: 15
  });

  const [sortedBids, setSortedBids] = useState([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  const [bidScores, setBidScores] = useState({});
  // New state for contractor ratings
  const [contractorRatings, setContractorRatings] = useState({});

  const handleBidSelection = (bidId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    try {
      if (token) {
        const decoded = jwtDecode(token);
        
        localStorage.setItem('clientName', decoded.username || '');
        localStorage.setItem('clientEmail', decoded.email || '');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    
    navigate(`/payment/${jobId}/${bidId}`);
  };

  useEffect(() => {
    if (bids && bids.length > 0) {
      setFilteredBids(bids);
    }
  }, [bids]);

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

  // Fetch ratings for contractors
  useEffect(() => {
    const fetchContractorRatings = async () => {
      if (!bids || bids.length === 0) return;
      
      const ratings = {};
      
      for (const bid of bids) {
        const contractorId = bid.contractorId;
        if (!contractorId || ratings[contractorId]) continue;
        
        try {
          // Try with /api/reviews path first
          try {
            const response = await axios.get(`http://localhost:5000/api/reviews/contractor/${contractorId}`);
            const reviews = response.data;
            
            if (reviews && reviews.length > 0) {
              const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
              const averageRating = (totalRating / reviews.length).toFixed(1);
              
              ratings[contractorId] = {
                rating: averageRating,
                count: reviews.length
              };
            } else {
              ratings[contractorId] = {
                rating: 0,
                count: 0
              };
            }
          } catch (firstAttemptError) {
            console.log(`First attempt failed for ${contractorId}, trying alternate path`);
            // If that fails, try with just /reviews path
            const response = await axios.get(`http://localhost:5000/reviews/contractor/${contractorId}`);
            const reviews = response.data;
            
            if (reviews && reviews.length > 0) {
              const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
              const averageRating = (totalRating / reviews.length).toFixed(1);
              
              ratings[contractorId] = {
                rating: averageRating,
                count: reviews.length
              };
            } else {
              ratings[contractorId] = {
                rating: 0,
                count: 0
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching ratings for contractor ${contractorId}:`, error);
          ratings[contractorId] = {
            rating: 0,
            count: 0
          };
        }
      }
      
      setContractorRatings(ratings);
    };
    
    fetchContractorRatings();
  }, [bids]);

  // Get rating for a bid
  const getBidRating = (bid) => {
    const contractorId = bid.contractorId;
    if (contractorRatings[contractorId]) {
      return contractorRatings[contractorId].rating;
    }
    return bid.contractor?.rating || 0;
  };

  // Get review count for a bid
  const getBidReviewCount = (bid) => {
    const contractorId = bid.contractorId;
    if (contractorRatings[contractorId]) {
      return contractorRatings[contractorId].count;
    }
    return 0;
  };

  const calculateBidScore = async (bid) => {
    const allPrices = bids.map(b => parseFloat(b.price));
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    const allTimelines = bids.map(b => parseInt(b.timeline));
    const minTimeline = Math.min(...allTimelines);
    const maxTimeline = Math.max(...allTimelines);
    
    const priceRange = maxPrice - minPrice;
    const priceScore = priceRange === 0 
      ? 100 
      : 20 + 80 * (1 - ((parseFloat(bid.price) - minPrice) / priceRange));
    
    const timelineRange = maxTimeline - minTimeline;
    const timelineScore = timelineRange === 0 
      ? 100 
      : 20 + 80 * (1 - ((parseInt(bid.timeline) - minTimeline) / timelineRange));
    
    // Use actual rating from reviews if available
    const rating = getBidRating(bid);
    const ratingScore = 20 + (rating / 5) * 80;
    
    const experience = bid.contractor?.experience || bid.experience || 0;
    const experienceScore = 20 + Math.min(experience * 8, 80);
    
    let qualificationScore = 0;
    
    try {
      if (bid.contractorId) {
        const response = await axios.get(`http://localhost:5000/qualify/user/${bid.contractorId}`);
        const qualifications = response.data;
        
        if (qualifications && qualifications.length > 0) {
         
          const qualCount = Math.min(qualifications.length, 5); 
          const countScore = qualCount * 10; 
          
          let verificationScore = 0;
          const verifiedQuals = qualifications.filter(q => q.verificationStatus === 'verified').length;
          verificationScore = Math.min((verifiedQuals / qualCount) * 30, 30);
          
          let recencyScore = 0;
          const currentYear = new Date().getFullYear();
          const qualYears = qualifications
            .map(q => parseInt(q.year))
            .filter(year => !isNaN(year));
            
          if (qualYears.length > 0) {
            const avgYear = qualYears.reduce((sum, year) => sum + year, 0) / qualYears.length;
            recencyScore = Math.min(20, ((avgYear - (currentYear - 10)) / 10) * 20);
            recencyScore = Math.max(0, recencyScore); 
          }
          
          qualificationScore = countScore + verificationScore + recencyScore;
        }
      }
    } catch (error) {
      console.error('Error fetching qualification data:', error);
      qualificationScore = 0;
    }
    
    const adjustedWeightings = {
      price: weightings.price * 0.8,
      timeline: weightings.timeline * 0.8,
      rating: weightings.rating * 0.8,
      experience: weightings.experience * 0.8,
      qualification: 20 
    };
    
    const totalScore = (
      (priceScore * (adjustedWeightings.price / 100)) +
      (timelineScore * (adjustedWeightings.timeline / 100)) +
      (ratingScore * (adjustedWeightings.rating / 100)) +
      (experienceScore * (adjustedWeightings.experience / 100)) +
      (qualificationScore)
    );
    
    return totalScore.toFixed(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    const updateSortedBids = async () => {
      setIsLoadingBids(true);
      try {
        if (!filteredBids || !filteredBids.length) {
          setSortedBids([]);
          return;
        }
        
        const bidsWithScores = await Promise.all(
          filteredBids.map(async bid => {
            const score = await calculateBidScore(bid);
            return { ...bid, calculatedScore: score };
          })
        );
        
        const sorted = bidsWithScores.sort((a, b) => {
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
              comparison = (b.contractor?.experience || b.experience || 0) - (a.contractor?.experience || a.experience || 0);
              break;
            case 'projects':
              comparison = (b.contractor?.completedProjects || b.completedProjects || 0) - (a.contractor?.completedProjects || a.completedProjects || 0);
              break;
            case 'score':
              comparison = parseFloat(b.calculatedScore) - parseFloat(a.calculatedScore);
              break;
            default:
              comparison = 0;
          }
          
          return sortDirection === 'asc' ? -comparison : comparison;
        });
        
        setSortedBids(sorted);
      } catch (error) {
        console.error("Error sorting bids:", error);
        setSortedBids(filteredBids); 
      } finally {
        setIsLoadingBids(false);
      }
    };
    
    updateSortedBids();
  }, [filteredBids, sortField, sortDirection]);

  const getBidScore = (bid) => {
    const bidId = bid.id || bid._id;
    return bidScores[bidId] || '...';
  };

  useEffect(() => {
    const calculateScores = async () => {
      if (!filteredBids || filteredBids.length === 0) return;
      
      const scores = {};
      for (const bid of filteredBids) {
        const bidId = bid.id || bid._id;
        try {
          const allPrices = bids.map(b => parseFloat(b.price));
          const minPrice = Math.min(...allPrices);
          const maxPrice = Math.max(...allPrices);
          
          const allTimelines = bids.map(b => parseInt(b.timeline));
          const minTimeline = Math.min(...allTimelines);
          const maxTimeline = Math.max(...allTimelines);
          
          const priceRange = maxPrice - minPrice;
          const priceScore = priceRange === 0 
            ? 100 
            : 20 + 80 * (1 - ((parseFloat(bid.price) - minPrice) / priceRange));
          
          const timelineRange = maxTimeline - minTimeline;
          const timelineScore = timelineRange === 0 
            ? 100 
            : 20 + 80 * (1 - ((parseInt(bid.timeline) - minTimeline) / timelineRange));
          
          // Use actual rating from fetched data
          const rating = getBidRating(bid);
          const ratingScore = 20 + (rating / 5) * 80;
          
          const experience = bid.contractor?.experience || bid.experience || 0;
          const experienceScore = 20 + Math.min(experience * 8, 80);
          
          const weightedScore = (
            (priceScore * (weightings.price / 100)) +
            (timelineScore * (weightings.timeline / 100)) +
            (ratingScore * (weightings.rating / 100)) +
            (experienceScore * (weightings.experience / 100))
          );
          
          scores[bidId] = weightedScore.toFixed(1);
        } catch (error) {
          console.error(`Error calculating score for bid ${bidId}:`, error);
          scores[bidId] = "N/A";
        }
      }
      
      setBidScores(scores);
    };
    
    calculateScores();
  }, [filteredBids, weightings, contractorRatings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

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

      <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-start space-x-3 border border-blue-200">
  <div className="text-blue-500 mt-0.5">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
    </svg>
  </div>
  <div className="text-sm text-blue-800">
    <p className="font-medium">About Bid Scores</p>
    <p className="mt-1 text-blue-700">
      Bid scores are calculated based on: price (40%), timeline (30%), contractor experience (15%), 
      and qualifications (15%). Higher scores indicate bids with better overall value.
    </p>
  </div>
  <button onClick={() => document.getElementById('score-info').classList.toggle('hidden')} 
    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex-shrink-0">
    Learn more
  </button>
</div>

<div id="score-info" className="hidden bg-white p-4 rounded-lg mb-4 border border-blue-200 text-sm text-gray-700">
  <p className="mb-2 font-medium">How Scores Are Calculated:</p>
  <ul className="list-disc pl-5 space-y-1">
    <li><span className="font-medium">Price (40%):</span> Lower bids receive higher scores</li>
    <li><span className="font-medium">Timeline (30%):</span> Faster completion times receive higher scores</li>
    <li><span className="font-medium">Experience (15%):</span> More years of experience receive higher scores</li>
    <li><span className="font-medium">Qualifications (15%):</span> Verified qualifications improve scores</li>
  </ul>
</div>

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
                <tr className="bg-blue-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">Experience</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm text-gray-900">
                      {bid.contractor?.experience || bid.experience || 'N/A'} years
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">Projects Completed</td>
                  {getSelectedBidsData().map((bid, index) => (
                    <td key={index} className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {bid.contractor?.completedProjects || bid.completedProjects || '0'}
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
        <div className="rounded-xl border border-gray-200 shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-100 table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[5%]">
                  <span className="sr-only">Select</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%]">
                  <div className="flex items-center space-x-1">
                    <span>Contractor</span>
                    {sortField === 'contractor' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[13%]">
                  <div className="flex items-center space-x-1" onClick={() => handleSort('price')}>
                    <span>Bid Amount</span>
                    {sortField === 'price' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
                  <div className="flex items-center space-x-1" onClick={() => handleSort('timeline')}>
                    <span>Timeline</span>
                    {sortField === 'timeline' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%]">
                  <div className="flex items-center space-x-1" onClick={() => handleSort('experience')}>
                    <span>Experience</span>
                    {sortField === 'experience' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%]">
                  <div className="flex items-center space-x-1" onClick={() => handleSort('projects')}>
                    <span>Projects</span>
                    {sortField === 'projects' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
                  <div className="flex items-center space-x-1" onClick={() => handleSort('date')}>
                    <span>Date</span>
                    {sortField === 'date' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
                  <div className="flex items-center space-x-1" onClick={() => handleSort('score')}>
                    <span>Score</span>
                    {sortField === 'score' ? (
                      sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
                  <span>Status</span>
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%]">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {isLoadingBids ? (
                <tr><td colSpan="9" className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent animate-spin mr-2"></div>
                    <span className="text-gray-500 text-sm">Calculating scores...</span>
                  </div>
                </td></tr>
              ) : sortedBids.map((bid) => {
                const bidId = bid.id || bid._id;
                const isSelected = selectedBids.includes(bidId);
                const isShortlisted = shortlistedBids.includes(bidId);
                const bidScore = getBidScore(bid);
                // Use actual rating and review count
                const rating = getBidRating(bid);
                const reviewCount = getBidReviewCount(bid);
                
                return (
                  <tr key={bidId} className={`group transition-all duration-200 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${isShortlisted ? 'border-l-4 border-green-400' : ''}`}>
                    {/* Keep the column widths matching the headers */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBidSelection(bid)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm border border-blue-200">
                          <span className="text-blue-800 font-semibold text-lg">
                            {(bid.contractor?.name || bid.contractorname || 'Unknown').charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {bid.contractor?.name || bid.contractorname || 'Unknown'}
                            {isShortlisted && (
                              <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">Shortlisted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">LKR {parseFloat(bid.price).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Bid amount</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{bid.timeline} days</div>
                      <div className="text-xs text-gray-500">Completion time</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {bid.contractor?.experience || bid.experience || '2'} years
                        </div>
                        {(parseInt(bid.contractor?.experience || bid.experience || 0) > 5) && (
                          <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Senior
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bid.contractor?.completedProjects || bid.completedProjects || '0'}
                      </div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1">{rating}</span>
                          {reviewCount > 0 && <span className="ml-1">({reviewCount})</span>}
                        </div>
                      </div>
                    </td>
                    {/* Add back the bid score cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          parseFloat(bidScore) >= 80 ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 ring-1 ring-green-200' : 
                          parseFloat(bidScore) >= 60 ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 ring-1 ring-blue-200' : 
                          parseFloat(bidScore) >= 40 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 ring-1 ring-yellow-200' : 
                          'bg-gradient-to-br from-red-50 to-red-100 text-red-800 ring-1 ring-red-200'
                        }`}>
                          <div className="text-lg font-bold">{bidScore}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs
                        ${bid.status === 'accepted' ? 'bg-green-50 text-green-800 ring-1 ring-green-200' : 
                          bid.status === 'rejected' ? 'bg-red-50 text-red-800 ring-1 ring-red-200' : 
                          'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200'}`}
                      >
                        <span className={`h-2 w-2 rounded-full mr-1.5 
                          ${bid.status === 'accepted' ? 'bg-green-500' : 
                            bid.status === 'rejected' ? 'bg-red-500' : 
                            'bg-yellow-500'}`}
                        ></span>
                        <span className="font-medium">
                        {bid.status === 'accepted' ? 'Accepted' : 
                         bid.status === 'rejected' ? 'Rejected' : 
                         'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-1">
                        <button 
                          className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-full transition-all duration-200 ${
                            isShortlisted 
                              ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' 
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleShortlisted(bid)}
                        >
                          {isShortlisted ? (
                            <>
                              <FaCheck className="mr-1" size={10} /> Shortlisted
                            </>
                          ) : (
                            'Shortlist'
                          )}
                        </button>
                        
                        <button 
                          className="inline-flex items-center px-2 py-1 border border-blue-300 text-xs font-medium rounded-full text-blue-700 bg-white hover:bg-blue-50 transition-all duration-200"
                          onClick={() => navigate(`/contractor/${bid.contractorId}/bid/${bidId}/project/${jobId}`)}
                        >
                          Details
                        </button>
                        
                        {bid.status === 'pending' && (
                          <button 
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200 transition-all duration-200"
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