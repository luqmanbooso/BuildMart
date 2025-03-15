import React, { useState, useEffect } from 'react';
import logo from '../assets/images/buildmart_logo1.png';

const UserProfilePage = () => {
  const [user, setUser] = useState({
    name: 'Mr.Saman Perera',
    email: 'samanperera@gmail.com',
    memberSince: 'January 2023',
    completedProjects: 12,
    ongoingProjects: 3,
    rating: 4.8,
    requests: [
      {
        id: '01',
        title: 'Fix a Leaking Water Sink',
        category: 'Plumbing',
        area: 'Colombo',
        budget: 'LKR : 5000-8000',
        status: 'Active',
        date: '12 Mar 2025',
        bids: 4
      },
      {
        id: '02',
        title: 'Kitchen Cabinet Installation',
        category: 'Carpentry',
        area: 'Kandy',
        budget: 'LKR : 15000-25000',
        status: 'Pending',
        date: '10 Mar 2025',
        bids: 2
      }
    ]
  });

  const [activeTab, setActiveTab] = useState('requirements');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    category: '',
    area: '',
    budget: '',
    description: '',
    milestones: [
      { id: 1, name: 'Initial Payment', amount: '', description: 'Payment made at the start of the project' }
    ]
  });

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setShowAddJobForm(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleAddJob = () => {
    setShowAddJobForm(true);
  };

  // Function to add a new milestone
  const addMilestone = () => {
    const newId = newJob.milestones.length + 1;
    setNewJob({
      ...newJob,
      milestones: [
        ...newJob.milestones,
        { id: newId, name: `Milestone ${newId}`, amount: '', description: '' }
      ]
    });
  };

  // Function to remove a milestone
  const removeMilestone = (id) => {
    setNewJob({
      ...newJob,
      milestones: newJob.milestones.filter(milestone => milestone.id !== id)
    });
  };

  // Function to update milestone data
  const updateMilestone = (id, field, value) => {
    setNewJob({
      ...newJob,
      milestones: newJob.milestones.map(milestone => 
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    });
  };

  // Modified form submission to handle milestones
  const handleSubmitJob = (e) => {
    e.preventDefault();
    const newJobRequest = {
      id: (user.requests.length + 1).toString().padStart(2, '0'),
      title: newJob.title,
      category: newJob.category,
      area: newJob.area,
      budget: `LKR : ${newJob.budget}`,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      bids: 0,
      milestones: newJob.milestones
    };
    
    setUser({
      ...user,
      requests: [...user.requests, newJobRequest]
    });
    
    setShowAddJobForm(false);
    setNewJob({
      title: '',
      category: '',
      area: '',
      budget: '',
      description: '',
      milestones: [
        { id: 1, name: 'Initial Payment', amount: '', description: 'Payment made at the start of the project' }
      ]
    });
  };

  // Sample data for the new tabs
  const ongoingWorks = [
    { id: '01', title: 'Kitchen Renovation', contractor: 'ABC Contractors', progress: '65%', startDate: '15 Jan 2025', dueDate: '15 Apr 2025' },
    { id: '02', title: 'Bathroom Plumbing', contractor: 'Best Plumbers Ltd', progress: '40%', startDate: '1 Mar 2025', dueDate: '15 Mar 2025' }
  ];

  const pastWorks = [
    { id: '01', title: 'Living Room Painting', contractor: 'Color Masters', completionDate: '10 Jan 2025', rating: 4.5 },
    { id: '02', title: 'Fence Installation', contractor: 'Garden Pros', completionDate: '5 Dec 2024', rating: 5.0 }
  ];

  const paymentHistory = [
    { id: 'PMT001', description: 'Advance Payment - Kitchen Renovation', amount: 'LKR 25,000', date: '15 Jan 2025', status: 'Completed' },
    { id: 'PMT002', description: 'Final Payment - Living Room Painting', amount: 'LKR 15,000', date: '12 Jan 2025', status: 'Completed' },
    { id: 'PMT003', description: 'Advance Payment - Bathroom Plumbing', amount: 'LKR 8,000', date: '1 Mar 2025', status: 'Pending' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="">
              <img src={logo} alt="BuildMart Logo" className="h-15" />
            </div>
          </div>
          
          <nav className="hidden lg:flex space-x-8">
            {['Home', 'Auction', 'Projects', 'About Us', 'Contact Us'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="font-medium relative group text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 p-2">
                  <div className="p-3">
                    <h3 className="font-medium">Notifications</h3>
                    <div className="mt-2 p-2 rounded-lg bg-blue-50 flex items-start space-x-3">
                      <div className="bg-blue-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">New bid received</p>
                        <p className="text-gray-500">You received a new bid on your kitchen project</p>
                        <p className="text-xs text-blue-500 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              <span>Account</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Stylish Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-70"></div>
          <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1920x300')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-500/30 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold text-white leading-tight">My <span className="text-blue-300">Account</span></h1>
          <p className="mt-4 text-blue-200 max-w-xl">Manage your projects, track bids, and connect with top professionals in the construction industry.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar with user card */}
            <div className="lg:w-1/4">
              {/* User Profile Card */}
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="relative px-6 pb-6">
                  <div className="flex justify-center">
                    <div className="absolute -top-10 rounded-full border-4 border-white p-1 bg-white">
                      <div className="h-16 w-16 bg-blue-500 rounded-full flex justify-center items-center">
                        <span className="text-white text-xl">{user.name[0]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 text-center">
                    <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">{`Member since ${user.memberSince}`}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="block font-medium text-gray-800">Completed Projects</span>
                          <span className="block text-gray-600">{user.completedProjects}</span>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800">Ongoing Projects</span>
                          <span className="block text-gray-600">{user.ongoingProjects}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="block font-medium text-gray-800">Rating</span>
                          <span className="block text-gray-600">{user.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:w-3/4">
              <div className="flex flex-wrap justify-start gap-2 mb-6">
                {['requirements', 'ongoing', 'past', 'payments', 'transactions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-medium py-2 px-4 rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'requirements' ? 'My Requirements' : 
                     tab === 'ongoing' ? 'Ongoing Works' :
                     tab === 'past' ? 'Past Works' :
                     tab === 'payments' ? 'Payment History' :
                     'Transaction History'}
                  </button>
                ))}
                <button
                  onClick={handleAddJob}
                  className="font-medium py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
                >
                  Add New Job
                </button>
              </div>

              <div className="mt-8">
                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    {user.requests.map((request, index) => (
                      <div
                        key={`${request.id}-${index}`}
                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300 flex justify-between"
                      >
                        <div>
                          <h3 className="font-medium text-gray-800">{request.title}</h3>
                          <p className="text-sm text-gray-600">{request.category}</p>
                          <p className="text-xs text-gray-400">{request.date}</p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              request.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'ongoing' && (
                  <div className="space-y-4">
                    {ongoingWorks.map((work) => (
                      <div
                        key={work.id}
                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-800">{work.title}</h3>
                          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-500 text-white">
                            In Progress
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Contractor: {work.contractor}</p>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 w-20">Progress:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: work.progress }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs font-medium text-gray-500">{work.progress}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex text-xs text-gray-500">
                          <p>Started: {work.startDate}</p>
                          <p className="ml-4">Due: {work.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'past' && (
                  <div className="space-y-4">
                    {pastWorks.map((work) => (
                      <div
                        key={work.id}
                        className="p-4 rounded-lg shadow-md bg-white border border-gray-300"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-800">{work.title}</h3>
                          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-500 text-white">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Contractor: {work.contractor}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-xs text-gray-500">Completed on: {work.completionDate}</p>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 mr-1">Rating:</span>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(work.rating) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-xs text-gray-600">({work.rating})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{payment.description}</div>
                              <div className="text-xs text-gray-500">{payment.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <p className="mt-4 text-gray-500">Your transaction history will be displayed here soon.</p>
                )}

                {showAddJobForm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      {/* Background overlay with blur effect */}
                      <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" 
                        aria-hidden="true"
                        onClick={() => setShowAddJobForm(false)}
                      ></div>

                      {/* Modal panel with modern styling */}
                      <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                        <div className="relative">
                          {/* Header section with gradient background */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex justify-between items-center">
                              <h2 className="text-xl font-bold text-white">Post a New Project</h2>
                              <button 
                                onClick={() => setShowAddJobForm(false)}
                                className="rounded-full p-1 text-white bg-white/20 hover:bg-white/30 focus:outline-none transition-colors duration-200"
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Form content */}
                          <div className="bg-white px-6 py-5 max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleSubmitJob}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 col-span-2">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Project Title</label>
                                    <input
                                      type="text"
                                      value={newJob.title}
                                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Enter a descriptive title for your project"
                                      required
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Category</label>
                                  <select
                                    value={newJob.category}
                                    onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                  >
                                    <option value="">Select a category</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="Masonry">Masonry</option>
                                    <option value="Painting">Painting</option>
                                    <option value="Roofing">Roofing</option>
                                    <option value="Landscaping">Landscaping</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Area/Location</label>
                                  <input
                                    type="text"
                                    value={newJob.area}
                                    onChange={(e) => setNewJob({ ...newJob, area: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Where is the project located?"
                                    required
                                  />
                                </div>
                                
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-gray-700">Description</label>
                                  <textarea
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Provide details about the project requirements..."
                                    required
                                  ></textarea>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Total Budget (LKR)</label>
                                  <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 sm:text-sm">LKR</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={newJob.budget}
                                      onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                                      className="pl-12 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="0.00"
                                      required
                                    />
                                  </div>
                                </div>

                                {/* Empty div for grid alignment */}
                                <div></div>

                                {/* Milestone section */}
                                <div className="col-span-2">
                                  <div className="border-t border-gray-200 pt-4 mt-2">
                                    <div className="flex justify-between items-center mb-3">
                                      <h3 className="text-lg font-medium text-gray-900">Payment Milestones</h3>
                                      <button
                                        type="button"
                                        onClick={addMilestone}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Milestone
                                      </button>
                                    </div>

                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                      {newJob.milestones.map((milestone, index) => (
                                        <div key={milestone.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                          <div className="flex justify-between mb-2">
                                            <h4 className="font-medium text-gray-700 text-sm">Milestone {index + 1}</h4>
                                            {newJob.milestones.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => removeMilestone(milestone.id)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                              </button>
                                            )}
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <label className="block text-xs font-medium text-gray-500">Milestone Name</label>
                                              <input
                                                type="text"
                                                value={milestone.name}
                                                onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                required
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-500">Amount (LKR)</label>
                                              <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                  <span className="text-gray-500 sm:text-xs">LKR</span>
                                                </div>
                                                <input
                                                  type="text"
                                                  value={milestone.amount}
                                                  onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                                                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                  required
                                                />
                                              </div>
                                            </div>
                                            <div className="md:col-span-2">
                                              <label className="block text-xs font-medium text-gray-500">Description</label>
                                              <input
                                                type="text"
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="What does this milestone involve?"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-8 flex justify-end space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setShowAddJobForm(false)}
                                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none"
                                >
                                  Post Project
                                </button>
                              </div>
                            </form>
                          </div>
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

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2025 BuildMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserProfilePage;