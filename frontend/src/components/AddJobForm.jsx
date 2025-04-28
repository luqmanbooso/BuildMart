import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AddJobForm = ({ onClose, onJobAdded }) => {
  const [formStep, setFormStep] = useState(1);
  const [newJob, setNewJob] = useState({
    title: '',
    categories: [],
    area: '',
    minBudget: '',
    maxBudget: '',
    description: '',
    biddingStartTime: new Date().toISOString().substr(0, 16),
    biddingEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 16),
    milestones: []
  });

  const [errors, setErrors] = useState({
    title: '',
    categories: '',
    area: '',
    description: '',
    minBudget: '',
    maxBudget: '',
    biddingStartTime: '',
    biddingEndTime: '',
    milestones: ''
  });

  const validateTitle = (value) => {
    const regex = /^[a-zA-Z0-9\s.,!?()-]+$/;
    if (!value.trim()) return "Project title is required";
    if (!regex.test(value)) return "Title cannot contain special characters like @, #, $, %, etc.";
    if (value.length < 5) return "Title should be at least 5 characters long";
    if (value.length > 100) return "Title should be at most 100 characters long";
    return "";
  };

  const validateDateTime = (fieldName, value) => {
    if (!value) return `${fieldName} is required`;
    const now = new Date();
    const selectedDate = new Date(value);
    if (fieldName === "Start time" && selectedDate < now) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(selectedDate);
      selectedDay.setHours(0, 0, 0, 0);
      if (selectedDay < today) {
        return "Start date cannot be in the past";
      }
    }
    return "";
  };

  const addMilestone = () => {
    const newId = newJob.milestones.length + 1;
    setNewJob({
      ...newJob,
      milestones: [
        ...newJob.milestones,
        { id: newId, name: `Milestone ${newId}`, description: '' }
      ]
    });
    setErrors({ ...errors, milestones: '' });
  };

  const removeMilestone = (id) => {
    setNewJob({
      ...newJob,
      milestones: newJob.milestones.filter(milestone => milestone.id !== id)
    });
    if (newJob.milestones.length <= 2) {
      setErrors({ ...errors, milestones: 'At least one milestone is required' });
    }
  };

  const updateMilestone = (id, field, value) => {
    setNewJob({
      ...newJob,
      milestones: newJob.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    });
  };

  const validateBudgetInput = (value) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return sanitized;
  };

  const handleBudgetChange = (field, value) => {
    const validValue = validateBudgetInput(value);
    setNewJob({ ...newJob, [field]: validValue });
    if (!validValue) {
      setErrors({ ...errors, [field]: `${field === 'minBudget' ? 'Minimum' : 'Maximum'} budget is required` });
    } else if (parseFloat(validValue) <= 0) {
      setErrors({ ...errors, [field]: `${field === 'minBudget' ? 'Minimum' : 'Maximum'} budget must be greater than zero` });
    } else if (field === 'maxBudget' && newJob.minBudget && parseFloat(validValue) <= parseFloat(newJob.minBudget)) {
      setErrors({ ...errors, maxBudget: 'Maximum budget must be greater than minimum budget' });
    } else if (field === 'minBudget' && newJob.maxBudget && parseFloat(validValue) >= parseFloat(newJob.maxBudget)) {
      setErrors({ ...errors, minBudget: 'Minimum budget must be less than maximum budget' });
    } else {
      setErrors({ ...errors, [field]: '' });
      const otherField = field === 'minBudget' ? 'maxBudget' : 'minBudget';
      if (errors[otherField] === 'Maximum budget must be greater than minimum budget' ||
        errors[otherField] === 'Minimum budget must be less than maximum budget') {
        setErrors({ ...errors, [field]: '', [otherField]: '' });
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewJob({ ...newJob, [field]: value });
    if (field === 'title') {
      setErrors({ ...errors, title: validateTitle(value) });
    } else if (field === 'categories') {
      setErrors({ ...errors, categories: value.length === 0 ? 'Select at least one category' : '' });
    } else if (field === 'area') {
      setErrors({ ...errors, area: !value ? 'Please select an area' : '' });
    } else if (field === 'description') {
      setErrors({
        ...errors,
        description: !value.trim() ? 'Description is required' :
          value.length < 20 ? 'Description should be at least 20 characters' : ''
      });
    } else if (field === 'biddingStartTime') {
      const startTimeError = validateDateTime('Start time', value);
      setErrors({ ...errors, biddingStartTime: startTimeError });
      if (newJob.biddingEndTime) {
        const start = new Date(value);
        const end = new Date(newJob.biddingEndTime);
        if (start > end) {
          setErrors({ ...errors, biddingStartTime: startTimeError, biddingEndTime: 'End time must be after start time' });
        }
      }
    } else if (field === 'biddingEndTime') {
      const endTimeError = validateDateTime('End time', value);
      const start = new Date(newJob.biddingStartTime);
      const end = new Date(value);
      if (end <= start) {
        setErrors({ ...errors, biddingEndTime: 'End time must be after start time' });
      } else {
        setErrors({ ...errors, biddingEndTime: endTimeError });
      }
    }
  };

  const nextStep = () => {
    if (formStep === 1) {
      const titleError = validateTitle(newJob.title);
      const categoriesError = newJob.categories.length === 0 ? 'Select at least one category' : '';
      const areaError = !newJob.area ? 'Please select an area' : '';
      const descriptionError = !newJob.description.trim() ? 'Description is required' :
        newJob.description.length < 20 ? 'Description should be at least 20 characters' : '';
      setErrors({
        ...errors,
        title: titleError,
        categories: categoriesError,
        area: areaError,
        description: descriptionError
      });
      if (titleError || categoriesError || areaError || descriptionError) {
        return;
      }
    } else if (formStep === 2) {
      const minBudgetError = !newJob.minBudget ? 'Minimum budget is required' :
        parseFloat(newJob.minBudget) <= 0 ? 'Minimum budget must be greater than zero' : '';
      const maxBudgetError = !newJob.maxBudget ? 'Maximum budget is required' :
        parseFloat(newJob.maxBudget) <= 0 ? 'Maximum budget must be greater than zero' :
          parseFloat(newJob.maxBudget) <= parseFloat(newJob.minBudget) ? 'Maximum budget must be greater than minimum budget' : '';
      const startTimeError = validateDateTime('Start time', newJob.biddingStartTime);
      const endTimeError = validateDateTime('End time', newJob.biddingEndTime);
      setErrors({
        ...errors,
        minBudget: minBudgetError,
        maxBudget: maxBudgetError,
        biddingStartTime: startTimeError,
        biddingEndTime: endTimeError
      });
      if (minBudgetError || maxBudgetError || startTimeError || endTimeError) {
        return;
      }
    }
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const hasMilestones = () => {
    return newJob.milestones.length >= 1;
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (newJob.milestones.length === 0) {
      setErrors({ ...errors, milestones: 'At least one milestone is required' });
      return;
    }
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      const jobData = {
        userid: userId,
        title: newJob.title,
        categories: newJob.categories,
        area: newJob.area,
        minBudget: newJob.minBudget,
        maxBudget: newJob.maxBudget,
        description: newJob.description,
        biddingStartTime: newJob.biddingStartTime,
        biddingEndTime: newJob.biddingEndTime,
        milestones: newJob.milestones
      };
      const response = await axios.post('http://localhost:5000/api/jobs', jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data;
      const newJobRequest = {
        id: data.job._id,
        title: data.job.title,
        categories: data.job.categories,
        area: data.job.area,
        budget: `LKR ${data.job.minBudget} - ${data.job.maxBudget}`,
        status: data.job.status || 'Pending',
        date: new Date(data.job.date).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
        bids: data.job.bids || 0
      };
      onJobAdded(newJobRequest);
      onClose();
      alert('Job created successfully! You can set up milestones after accepting a bid.');
    } catch (error) {
      console.error('Error creating job:', error.response ? error.response.data : error.message);
      alert(`Failed to create job: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-md transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-blue-100">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '15px 15px' }}></div>
              </div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-start">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white leading-tight">Create New Project</h2>
                    <p className="text-blue-200 text-sm mt-2">Fill in the details to post your construction project and receive bids from qualified professionals</p>
                    <div className="flex items-center mt-3 text-xs text-blue-200">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>All fields marked with * are required</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white bg-white/20 hover:bg-white/30 focus:outline-none transition-colors duration-200 hover:rotate-90 transform"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="bg-white px-0 py-0 max-h-[80vh] overflow-y-auto">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${formStep >= 1 ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-600'} flex items-center justify-center font-bold`}>1</div>
                    <span className={`text-xs font-medium mt-1 ${formStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Project Info</span>
                  </div>
                  <div className={`flex-1 h-1 ${formStep >= 2 ? 'bg-blue-600' : 'bg-blue-200'} mx-2`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${formStep >= 2 ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-600'} flex items-center justify-center font-bold`}>2</div>
                    <span className={`text-xs font-medium mt-1 ${formStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Timeline & Budget</span>
                  </div>
                  <div className={`flex-1 h-1 ${formStep >= 3 ? 'bg-blue-600' : 'bg-blue-200'} mx-2`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${formStep >= 3 ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-600'} flex items-center justify-center font-bold`}>3</div>
                    <span className={`text-xs font-medium mt-1 ${formStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Milestones</span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmitJob} className="px-8 py-6">
                {formStep === 1 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Project Details
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Title <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={newJob.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              className={`pl-10 block w-full px-4 py-3.5 border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900`}
                              placeholder="Enter a descriptive title for your project"
                              required
                            />
                          </div>
                          {errors.title ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">Be specific and clear to attract the right professionals</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categories <span className="text-red-500">*</span>
                          </label>
                          <div className={`mt-2 border ${errors.categories ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4 bg-white max-h-60 overflow-y-auto`}>
                            <div className="space-y-2">
                              {['Plumbing', 'Electrical', 'Carpentry', 'Masonry', 'Painting', 'Roofing', 'Landscaping', 'Flooring', 'Interior Design'].map(category => (
                                <div key={category} className="flex items-center">
                                  <input
                                    id={`category-${category}`}
                                    type="checkbox"
                                    className={`h-4 w-4 ${errors.categories ? 'text-red-600 focus:ring-red-500' : 'text-blue-600 focus:ring-blue-500'} border-gray-300 rounded`}
                                    checked={newJob.categories.includes(category)}
                                    onChange={(e) => {
                                      const updatedCategories = e.target.checked
                                        ? [...newJob.categories, category]
                                        : newJob.categories.filter(cat => cat !== category);
                                      handleInputChange('categories', updatedCategories);
                                    }}
                                  />
                                  <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                                    {category}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          {errors.categories ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.categories}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">Select all categories that apply to your project</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area/Location <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <select
                              value={newJob.area}
                              onChange={(e) => handleInputChange('area', e.target.value)}
                              className={`pl-10 block w-full px-4 py-3.5 border ${errors.area ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900 bg-white`}
                              required
                            >
                              <option value="" disabled>Select a district</option>
                              {[
                                'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
                                'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
                                'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
                                'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
                                'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
                              ].map(district => (
                                <option key={district} value={district}>
                                  {district}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.area ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.area}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">Select the district where your project is located</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <textarea
                              value={newJob.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              className={`block w-full px-4 py-3.5 border ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900`}
                              rows="4"
                              placeholder="Provide detailed information about your project requirements, specifications, materials needed, and any special considerations..."
                              required
                            ></textarea>
                          </div>
                          {errors.description ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                              The more details you provide, the more accurate bids you'll receive. Be sure to include dimensions, materials, timeline constraints, etc.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {formStep === 2 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Budget & Timeline
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Budget (LKR) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm font-medium">LKR</span>
                            </div>
                            <input
                              type="text"
                              value={newJob.minBudget}
                              onChange={(e) => handleBudgetChange('minBudget', e.target.value)}
                              className={`pl-14 block w-full px-4 py-3.5 border ${errors.minBudget ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900`}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          {errors.minBudget ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.minBudget}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                              Enter the lowest amount you're willing to pay for this project
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Budget (LKR) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm font-medium">LKR</span>
                            </div>
                            <input
                              type="text"
                              value={newJob.maxBudget}
                              onChange={(e) => handleBudgetChange('maxBudget', e.target.value)}
                              className={`pl-14 block w-full px-4 py-3.5 border ${errors.maxBudget ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900`}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          {errors.maxBudget ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.maxBudget}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                              Enter the maximum amount you're willing to pay for this project
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bidding Start Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              type="datetime-local"
                              value={newJob.biddingStartTime}
                              onChange={(e) => handleInputChange('biddingStartTime', e.target.value)}
                              className={`pl-10 block w-full px-4 py-3.5 border ${errors.biddingStartTime ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900`}
                              min={new Date().toISOString().substr(0, 16)}
                              required
                            />
                          </div>
                          {errors.biddingStartTime ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.biddingStartTime}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Select when contractors can begin submitting bids for your project
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="biddingEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Bidding End Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <input
                              type="datetime-local"
                              id="biddingEndTime"
                              name="biddingEndTime"
                              value={newJob.biddingEndTime}
                              onChange={(e) => handleInputChange('biddingEndTime', e.target.value)}
                              className={`pl-10 block w-full px-4 py-3.5 border ${errors.biddingEndTime ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all text-gray-900`}
                              min={newJob.biddingStartTime}
                              required
                            />
                          </div>
                          {errors.biddingEndTime ? (
                            <p className="mt-1.5 text-xs text-red-600">{errors.biddingEndTime}</p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                              End time must be after start time
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {formStep === 3 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Project Milestones
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Why add milestones?
                        </h4>
                        <p className="text-sm text-blue-700">
                          Breaking down your project into milestones helps track progress, organize workflow, and structure payments.
                          Each milestone can represent a phase of work to be completed before moving to the next stage.
                        </p>
                        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                          <li>Create clear, achievable milestones with specific deliverables</li>
                          <li>Define what completion looks like for each milestone</li>
                          <li>Payments can be linked to milestone completion</li>
                        </ul>
                      </div>
                      {errors.milestones && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
                          <p className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {errors.milestones}
                          </p>
                        </div>
                      )}
                      <div className="space-y-4 mb-4">
                        {newJob.milestones.map((milestone) => (
                          <div key={milestone.id} className={`border ${errors.milestones ? 'border-red-200' : 'border-gray-200'} rounded-lg p-4 bg-gray-50`}>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">{milestone.id}</span>
                                <input
                                  type="text"
                                  value={milestone.name}
                                  onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                  className="ml-2 border-0 bg-transparent font-medium focus:ring-2 focus:ring-blue-500 rounded p-1"
                                  placeholder="Milestone name"
                                />
                              </div>
                              <button
                                onClick={() => removeMilestone(milestone.id)}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Description</label>
                              <textarea
                                value={milestone.description}
                                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                rows="2"
                                className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe this milestone..."
                              ></textarea>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addMilestone}
                        className="flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Milestone
                        <span className="ml-2 text-xs text-gray-500">(Recommended: 3-5 milestones)</span>
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-10 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  {formStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all hover:shadow-lg"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!hasMilestones()}
                      className={`px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                        !hasMilestones()
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all hover:shadow-lg'
                      }`}
                    >
                      {!hasMilestones() ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Add Milestones First
                        </span>
                      ) : (
                        "Post Project"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJobForm;