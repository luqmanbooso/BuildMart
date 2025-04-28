import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const BidUpdate = ({ bid, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(bid.costBreakdown || []);
  const [timelineBreakdown, setTimelineBreakdown] = useState(bid.timelineBreakdown || null);
  const [projectDetails, setProjectDetails] = useState({
    lowestBid: null,
    minDecrement: null,
    minBudget: null
  });
  const [timelineError, setTimelineError] = useState(null);
  const MAX_TIMELINE_DAYS = 365;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      price: bid.price,
      timeline: bid.timeline,
    }
  });

  const watchedPrice = watch('price');
  const watchedTimeline = watch('timeline');

  const formatPriceInput = (value) => {
    let formatted = value.replace(/[^\d.]/g, '');
    
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    
    if (parts.length > 1) {
      formatted = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
    
    return formatted;
  };

  useEffect(() => {
    if (costBreakdown && costBreakdown.length > 0 && watchedPrice) {
      const originalPrice = parseFloat(bid.price);
      const newPrice = parseFloat(watchedPrice);
      
      if (!isNaN(newPrice) && newPrice > 0 && !isNaN(originalPrice) && originalPrice > 0) {
        // Calculate the sum of original cost breakdown amounts
        const totalOriginal = bid.costBreakdown.reduce((sum, item) => sum + item.amount, 0);
        
        // Calculate new breakdown based on percentages of the original
        const updatedBreakdown = costBreakdown.map((item, index) => {
          const originalAmount = bid.costBreakdown[index].amount;
          // Calculate what percentage this item was of the original total
          const percentage = originalAmount / totalOriginal;
          // Apply that percentage to the new price
          const newAmount = parseFloat((newPrice * percentage).toFixed(2));
          
          return {
            ...item,
            amount: Math.max(0.01, newAmount) // Ensure at least 1 cent
          };
        });
        
        setCostBreakdown(updatedBreakdown);
      }
    }
  }, [watchedPrice, bid.price]);

  useEffect(() => {
    if (timelineBreakdown && watchedTimeline) {
      const originalTimeline = bid.timeline;
      const newTimeline = parseInt(watchedTimeline);
      
      if (newTimeline !== originalTimeline) {
        const ratio = newTimeline / originalTimeline;
        
        const updatedTimelineBreakdown = JSON.parse(JSON.stringify(timelineBreakdown));
        
        if (updatedTimelineBreakdown.startDate) {
          const startDate = new Date(updatedTimelineBreakdown.startDate);
          const newEndDate = new Date(startDate);
          newEndDate.setDate(startDate.getDate() + newTimeline - 1); 
          
          updatedTimelineBreakdown.endDate = newEndDate.toISOString().split('T')[0];
          updatedTimelineBreakdown.totalDays = newTimeline;
        }
        
        if (updatedTimelineBreakdown.workItems && updatedTimelineBreakdown.workItems.length > 0) {
          const startDate = new Date(updatedTimelineBreakdown.startDate);
          
          updatedTimelineBreakdown.workItems = updatedTimelineBreakdown.workItems.map(item => {
            const itemStartDate = new Date(item.startDate);
            const itemEndDate = new Date(item.endDate);
            
            const daysFromStart = Math.round((itemStartDate - startDate) / (1000 * 60 * 60 * 24));
            const originalDuration = Math.round((itemEndDate - itemStartDate) / (1000 * 60 * 60 * 24)) + 1;
            
            const newDaysFromStart = Math.round(daysFromStart * ratio);
            const newDuration = Math.max(1, Math.round(originalDuration * ratio));
            
            const newItemStartDate = new Date(startDate);
            newItemStartDate.setDate(startDate.getDate() + newDaysFromStart);
            
            const newItemEndDate = new Date(newItemStartDate);
            newItemEndDate.setDate(newItemStartDate.getDate() + newDuration - 1);
            
            const projectEndDate = new Date(updatedTimelineBreakdown.endDate);
            if (newItemEndDate > projectEndDate) {
              newItemEndDate.setTime(projectEndDate.getTime());
            }
            
            return {
              ...item,
              startDate: newItemStartDate.toISOString().split('T')[0],
              endDate: newItemEndDate.toISOString().split('T')[0],
              duration: Math.round((newItemEndDate - newItemStartDate) / (1000 * 60 * 60 * 24)) + 1
            };
          });
        }
        
        setTimelineBreakdown(updatedTimelineBreakdown);
      }
    }
  }, [watchedTimeline, bid.timeline]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo({
          userId: decoded.userId,
          username: decoded.username
        });
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Authentication error. Please log in again.');
      }
    }
  }, []);

  useEffect(() => {
    const fetchLowestBid = async () => {
      try {
        const lowestBidResponse = await axios.get(`https://build-mart-backend.vercel.app/bids/project/${bid.projectId}/lowest`);
        
        if (lowestBidResponse.data.exists) {
          const lowestBidPrice = lowestBidResponse.data.price;
          const minDecrement = lowestBidPrice <= 15000 ? 200 : 
                              lowestBidPrice <= 100000 ? 1000 : 2000;
          
          setProjectDetails(prev => ({
            ...prev,
            lowestBid: lowestBidPrice,
            minDecrement: minDecrement
          }));
        }
        
        const jobResponse = await axios.get(`https://build-mart-backend.vercel.app/api/jobs/${bid.projectId}`);
        if (jobResponse.data && jobResponse.data.minBudget) {
          setProjectDetails(prev => ({
            ...prev,
            minBudget: jobResponse.data.minBudget
          }));
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
      }
    };
    
    fetchLowestBid();
  }, [bid.projectId]);

  const onSubmit = async (data) => {
    if (!userInfo) {
      setError('You must be logged in to update a bid');
      return;
    }

    if (userInfo.userId !== bid.contractorId) {
      setError('You can only update your own bids');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        price: parseFloat(data.price),
        timeline: parseInt(data.timeline),
        qualifications: bid.qualifications, 
        contractorId: userInfo.userId,
        costBreakdown: costBreakdown, 
        timelineBreakdown: timelineBreakdown 
      };

      const response = await axios.put(
        `https://build-mart-backend.vercel.app/bids/update/${bid._id}`, 
        updateData
      );

      if (response.data) {
        onSuccess(response.data.bid, response.data.updatesRemaining);
      } else {
        throw new Error('Failed to update bid');
      }
    } catch (err) {
      console.error('Error updating bid:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update bid');
    } finally {
      setLoading(false);
    }
  };

  const totalBreakdownAmount = costBreakdown.reduce((sum, item) => sum + item.amount, 0);

  const handleTimelineChange = (e) => {
    const value = e.target.value;
    
    if (!/^\d*$/.test(value)) {
      return; 
    }
    
    if (value > MAX_TIMELINE_DAYS) {
      setTimelineError(`Timeline cannot exceed ${MAX_TIMELINE_DAYS} days (1 year)`);
      e.target.value = MAX_TIMELINE_DAYS.toString();
    } else if (value < 1) {
      setTimelineError("Timeline must be at least 1 day");
    } else {
      setTimelineError(null);
    }
    
    register('timeline').onChange(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full p-0 overflow-hidden animate-modalFadeIn transform transition-all">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-t-2xl"></div>
        
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            Update Your Bid
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 00-1-1H9a1 1 0 100 2h1a1 1 0 001-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Updates Remaining: {3 - bid.updateCount}/3</span>
                <p className="text-sm text-blue-700">
                  This will be update #{bid.updateCount + 1}
                </p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between mb-1 text-xs text-blue-800">
                <span>First Update</span>
                <span>Second Update</span>
                <span>Final Update</span>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                     style={{width: `${(bid.updateCount / 3) * 100}%`}}></div>
              </div>
            </div>
          </div>

          {projectDetails.minDecrement && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl mb-6 border-l-4 border-yellow-500 shadow-sm">
              <div className="flex items-start">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-amber-800">Bid Requirements</span>
                  <div className="space-y-2 mt-1 text-sm text-amber-700">
                    <p>
                      Your new bid must be at least <span className="font-semibold">LKR {projectDetails.minDecrement.toLocaleString()}</span> less than your current bid.
                    </p>
                    <p>
                      Maximum valid bid: <span className="font-semibold">LKR {(parseFloat(bid.price) - projectDetails.minDecrement).toLocaleString()}</span>
                    </p>
                    {parseFloat(bid.price) > projectDetails.lowestBid && (
                      <p className="py-1 px-2 rounded bg-yellow-100/70 border border-yellow-200">
                        To beat the lowest bid (LKR {projectDetails.lowestBid.toLocaleString()}), bid at most: <span className="font-semibold">LKR {(projectDetails.lowestBid - projectDetails.minDecrement).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Bid</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                  <div className="bg-gray-200 p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v1a1 1 0 00-1 1v.325c0 .18.14.335.33.437L11 7.5V9h-1V8.5l-1.3-.65c-.19-.097-.33-.255-.33-.437V7.5a2.5 2.5 0 11-5 0V5.857a5 5 0 119 0v1.642a5 5 0 01-2.45 4.289l-1.21.605-1.1 2.338a1 1 0 01-1.84-.777L7.38 12.2c.19-.398.566-.659 1-.766V11h1v.955c.434.107.81.368 1 .767l.55 1.166a1 1 0 001.84-.777L11.36 9.757l1.21-.605A5 5 0 0015 7.5V5.858a5 5 0 00-4-4.9V1a1 1 0 00-2 0zm0 13v-3a1 1 0 00-1-1h-1a1 1 0 00-1 1v3a1 1 0 001 1h1a1 1 0 001-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Current Amount</span>
                    <p className="text-lg font-semibold text-gray-800">LKR {parseFloat(bid.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Bid Amount</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">LKR</span>
                  </div>
                  <input
                    type="text"
                    {...register('price', {
                      required: 'Bid amount is required',
                      pattern: {
                        value: /^[0-9]+(\.[0-9]{1,2})?$/,
                        message: 'Please enter a valid number (e.g., 1000 or 1000.50)'
                      },
                      validate: {
                        positive: v => parseFloat(v) > 0 || 'Bid must be greater than 0',
                        lowerThanCurrent: v => parseFloat(v) < parseFloat(bid.price) || 
                          'New bid must be lower than your current bid',
                        minDecrementFromCurrentBid: v => {
                          if (!projectDetails.minDecrement) return true;
                          
                          const newBid = parseFloat(v);
                          const currentBid = parseFloat(bid.price);
                          const minDecrement = projectDetails.minDecrement;
                          
                          return (currentBid - newBid) >= minDecrement || 
                            `Your new bid must be at least LKR ${minDecrement.toLocaleString()} less than your current bid`;
                        },
                        minDecrement: v => {
                          if (!projectDetails.lowestBid || !projectDetails.minDecrement) return true;
                          
                          const newBid = parseFloat(v);
                          const lowestBid = projectDetails.lowestBid;
                          const minDecrement = projectDetails.minDecrement;
                          
                          if (parseFloat(bid.price) <= lowestBid) return true;
                          
                          return newBid <= (lowestBid - minDecrement) || 
                            `To beat the lowest bid, you must bid at least LKR ${minDecrement.toLocaleString()} less than LKR ${lowestBid.toLocaleString()}`;
                        },
                        minBudget: v => {
                          if (!projectDetails.minBudget) return true;
                          return parseFloat(v) >= projectDetails.minBudget || 
                            `Bid cannot be lower than the project minimum budget of LKR ${projectDetails.minBudget.toLocaleString()}`;
                        }
                      }
                    })}
                    onChange={(e) => {
                      e.target.value = formatPriceInput(e.target.value);
                      register('price').onChange(e);
                    }}
                    className={`block w-full pl-10 pr-12 py-3 sm:text-base rounded-lg transition-all duration-200
                      focus:ring focus:ring-opacity-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500
                      ${errors.price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Enter new amount"
                    autoComplete="off"
                  />
                </div>
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.price.message}
                  </p>
                )}
                
                {watchedPrice && parseFloat(watchedPrice) < parseFloat(bid.price) && (
                  <div className="mt-3">
                    <div className="bg-green-50 rounded-lg p-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm">
                        <span className="font-medium text-green-800">Saving: </span>
                        <span className="text-green-700">
                          LKR {(parseFloat(bid.price) - parseFloat(watchedPrice)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {costBreakdown && costBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  <h3 className="font-medium text-gray-800">Cost Breakdown</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    These costs will be adjusted proportionally to match your new bid amount.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600 font-medium">Item</th>
                          <th className="text-right py-2 text-gray-600 font-medium">Original</th>
                          <th className="text-right py-2 text-gray-600 font-medium">Adjusted</th>
                          <th className="text-right py-2 text-gray-600 font-medium">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costBreakdown.map((item, index) => {
                          const originalAmount = bid.costBreakdown && bid.costBreakdown[index]?.amount || 0;
                          const difference = item.amount - originalAmount;
                          return (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 text-gray-800">{item.description}</td>
                              <td className="text-right py-2 text-gray-600">LKR {originalAmount.toLocaleString()}</td>
                              <td className="text-right py-2 text-gray-800">LKR {item.amount.toLocaleString()}</td>
                              <td className="text-right py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                  ${difference < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {difference < 0 ? '▼' : '▲'} LKR {Math.abs(difference).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="font-semibold bg-gray-50">
                          <td className="py-3 text-gray-800">Total</td>
                          <td className="text-right py-3 text-gray-800">LKR {parseFloat(bid.price).toLocaleString()}</td>
                          <td className="text-right py-3 text-gray-800">LKR {totalBreakdownAmount.toLocaleString()}</td>
                          <td className="text-right py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {parseFloat(bid.price) > totalBreakdownAmount ? '▼' : '▲'} LKR {Math.abs(parseFloat(bid.price) - totalBreakdownAmount).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {timelineBreakdown && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium text-gray-800">Project Timeline</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-purple-800">Project Duration</span>
                      </div>
                      <p className="text-lg font-semibold text-purple-900">
                        {watchedTimeline || bid.timeline} days
                        {watchedTimeline && parseInt(watchedTimeline) !== bid.timeline && (
                          <span className="text-xs ml-2 text-purple-700">
                            (Original: {bid.timeline} days)
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-purple-800">Timeline</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-purple-800">Start:</p>
                          <p className="font-medium text-purple-900">
                            {timelineBreakdown.startDate 
                              ? new Date(timelineBreakdown.startDate).toLocaleDateString() 
                              : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-800">End:</p>
                          <p className="font-medium text-purple-900">
                            {timelineBreakdown.endDate 
                              ? new Date(timelineBreakdown.endDate).toLocaleDateString() 
                              : 'Not specified'}
                          </p>
                          {watchedTimeline && parseInt(watchedTimeline) !== bid.timeline && bid.timelineBreakdown && (
                            <p className="text-xs text-purple-700">
                              (Original: {new Date(bid.timelineBreakdown.endDate).toLocaleDateString()})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {watchedTimeline && parseInt(watchedTimeline) !== bid.timeline && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200 text-sm text-blue-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        Timeline adjusted from {bid.timeline} days to {parseInt(watchedTimeline)} days. 
                        {timelineBreakdown.workItems && timelineBreakdown.workItems.length > 0 && 
                          " All work items have been proportionally adjusted to fit the new timeline."}
                      </div>
                    </div>
                  )}
                  
                  {timelineBreakdown.workItems && timelineBreakdown.workItems.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Work Breakdown</h4>
                      
                      <div className="relative pb-12">
                        <div className="absolute h-full w-0.5 bg-purple-200 left-4 top-0"></div>
                        
                        {timelineBreakdown.workItems.map((item, index) => {
                          const originalDuration = bid.timelineBreakdown?.workItems?.[index]?.duration || item.duration;
                          const durationChanged = item.duration !== originalDuration;
                          
                          return (
                            <div key={index} className="mb-4 pl-12 relative">
                              <div className="absolute left-2.5 transform -translate-x-1/2 bg-purple-500 h-6 w-6 rounded-full flex items-center justify-center border-4 border-purple-100">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                              </div>
                              
                              <div className={`bg-white border rounded-lg p-3 shadow-sm ${
                                durationChanged ? "border-blue-200" : "border-gray-200"
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div className="font-medium text-gray-800">{item.name}</div>
                                  <div className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                                    durationChanged ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                                  }`}>
                                    {item.duration} days
                                    {durationChanged && (
                                      <span className="ml-1 text-xs text-blue-600">
                                        (Orig: {originalDuration})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                                  <div>
                                    <span className="block font-medium">Start:</span>
                                    <span>{new Date(item.startDate).toLocaleDateString()}</span>
                                  </div>
                                  <div>
                                    <span className="block font-medium">End:</span>
                                    <span>{new Date(item.endDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline (Days) <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(1-365 days)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('timeline', {
                    required: 'Timeline is required',
                    min: { value: 1, message: 'Timeline must be at least 1 day' },
                    max: { value: MAX_TIMELINE_DAYS, message: `Timeline cannot exceed ${MAX_TIMELINE_DAYS} days (1 year)` },
                    validate: {
                      isInteger: v => Number.isInteger(Number(v)) || 'Timeline must be a whole number',
                      withinRange: v => {
                        const minAllowed = Math.floor(bid.timeline * 0.5);
                        const maxAllowed = Math.min(Math.ceil(bid.timeline * 2), MAX_TIMELINE_DAYS);
                        
                        if (parseInt(v) < minAllowed) {
                          return `Timeline cannot be reduced by more than 50% (min: ${minAllowed} days)`;
                        }
                        
                        if (parseInt(v) > maxAllowed) {
                          return `Timeline cannot be extended by more than 100% (max: ${maxAllowed} days)`;
                        }
                        
                        return true;
                      }
                    }
                  })}
                  onChange={handleTimelineChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`mt-1 block w-full py-2 px-3 sm:text-sm rounded-lg transition-all duration-200
                    focus:ring focus:ring-opacity-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500
                    ${(errors.timeline || timelineError) ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  max={MAX_TIMELINE_DAYS}
                  min={1}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 flex items-center">
                  <span className="bg-gray-100 px-1 py-0.5 rounded">days</span>
                </div>
              </div>
              
              {(errors.timeline || timelineError) && (
                <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.timeline ? errors.timeline.message : timelineError}
                </p>
              )}
              
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      watchedTimeline && parseInt(watchedTimeline) > MAX_TIMELINE_DAYS * 0.75 
                        ? parseInt(watchedTimeline) > MAX_TIMELINE_DAYS * 0.9 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`} 
                    style={{ 
                      width: `${Math.min(100, (parseInt(watchedTimeline || 0) / MAX_TIMELINE_DAYS) * 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-gray-500">
                  {Math.round((parseInt(watchedTimeline || 0) / MAX_TIMELINE_DAYS) * 100)}% of max
                </span>
              </div>
              
              {watchedTimeline && parseInt(watchedTimeline) !== bid.timeline && (
                <p className="mt-2 text-sm text-blue-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  Changing the timeline will adjust all work items proportionally
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || timelineError}
                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                  flex items-center ${loading || timelineError ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Update Bid
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translate3d(0, 20px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-modalFadeIn {
          animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default BidUpdate;