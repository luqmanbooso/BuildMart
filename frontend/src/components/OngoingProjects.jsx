import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  FaTools, FaRegCalendarAlt, FaMoneyBillWave, FaUser, FaClipboardCheck, 
  FaMapMarkerAlt, FaCheck, FaHardHat, FaCamera, FaComment
} from 'react-icons/fa';
import ContractorUserNav from './ContractorUserNav';

const OngoingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeProject, setActiveProject] = useState(null);
  const [milestoneUpdate, setMilestoneUpdate] = useState({ milestoneId: null, status: '', notes: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressPhoto, setProgressPhoto] = useState(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [contractorData, setContractorData] = useState({
    id: '',
    name: 'Contractor'
  });
  
  const navigate = useNavigate();

  // Get contractor ID from token
  useEffect(() => {
    const getContractorInfo = () => {
      try {
        // First try to get from localStorage
        let userId = localStorage.getItem('userId');
        
        // If not in localStorage, try getting from token
        if (!userId) {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (token) {
            const decoded = jwtDecode(token);
            userId = decoded.id || decoded.userId || decoded._id;
            
            if (userId) {
              localStorage.setItem('userId', userId);
              setContractorData({
                id: userId,
                name: localStorage.getItem('name') || decoded.name || 'Contractor'
              });
              return userId;
            }
          }
        } else {
          setContractorData({
            id: userId,
            name: localStorage.getItem('name') || 'Contractor'
          });
          return userId;
        }
        
        // If still no userId, show error
        toast.error("Please login first");
        navigate('/login');
        return null;
      } catch (error) {
        console.error("Error getting contractor info:", error);
        return null;
      }
    };
    
    getContractorInfo();
  }, [navigate]);
  
  // Fetch ongoing works for this contractor
  useEffect(() => {
    const fetchOngoingWorks = async () => {
      if (!contractorData.id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:5000/api/ongoingworks/contractor/${contractorData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          const formattedProjects = response.data.map(project => ({
            id: project._id,
            jobId: project.jobId._id || project.jobId,
            clientId: project.clientId,
            clientName: project.clientName || 'Client',
            title: project.jobId.title || 'Project',
            description: project.jobId.description || 'No description available',
            budget: project.totalAmountPaid + project.totalAmountPending,
            amountPaid: project.totalAmountPaid || 0,
            amountPending: project.totalAmountPending || 0,
            workProgress: project.workProgress || 0,
            startDate: new Date(project.createdAt).toLocaleDateString(),
            status: project.jobStatus || 'In Progress',
            milestones: (project.milestones || []).map(m => ({
              id: m._id,
              name: m.name,
              description: m.description,
              amount: parseFloat(m.amount || 0),
              status: m.status,
              completedAt: m.completedAt ? new Date(m.completedAt).toLocaleDateString() : null
            })),
            location: project.jobId.area || 'Not specified',
            category: project.jobId.category || 'Construction',
            communication: project.communication || []
          }));
          
          setProjects(formattedProjects);
          if (formattedProjects.length > 0 && !activeProject) {
            setActiveProject(formattedProjects[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching ongoing works:", err);
        setError("Failed to load ongoing projects");
        toast.error("Couldn't load your ongoing projects");
        
        // For development: create sample data if API fails
        if (process.env.NODE_ENV !== 'production') {
          const sampleProjects = [
            {
              id: '1',
              jobId: 'job123',
              clientId: 'client456',
              clientName: 'John Doe',
              title: 'House Renovation',
              description: 'Complete renovation of a 2-story house including kitchen, bathrooms and living room.',
              budget: 1500000,
              amountPaid: 500000,
              amountPending: 1000000,
              workProgress: 35,
              startDate: new Date().toLocaleDateString(),
              status: 'In Progress',
              milestones: [
                { id: 'm1', name: 'Foundation', description: 'Complete foundation work', amount: 300000, status: 'Completed', completedAt: new Date(Date.now() - 15*24*60*60*1000).toLocaleDateString() },
                { id: 'm2', name: 'Framing', description: 'Frame the structure', amount: 400000, status: 'In Progress', completedAt: null },
                { id: 'm3', name: 'Electrical & Plumbing', description: 'Install electrical wiring and plumbing', amount: 350000, status: 'Pending', completedAt: null },
                { id: 'm4', name: 'Finishing', description: 'Finishing touches and cleanup', amount: 450000, status: 'Pending', completedAt: null }
              ],
              location: 'Colombo',
              category: 'Residential Renovation'
            },
            {
              id: '2',
              jobId: 'job456',
              clientId: 'client789',
              clientName: 'Jane Smith',
              title: 'Office Space Construction',
              description: 'Construction of a new office space with modern amenities and open floor plan.',
              budget: 2500000,
              amountPaid: 1250000,
              amountPending: 1250000,
              workProgress: 50,
              startDate: new Date(Date.now() - 45*24*60*60*1000).toLocaleDateString(),
              status: 'In Progress',
              milestones: [
                { id: 'm5', name: 'Planning & Design', description: 'Finalize plans and designs', amount: 250000, status: 'Completed', completedAt: new Date(Date.now() - 40*24*60*60*1000).toLocaleDateString() },
                { id: 'm6', name: 'Construction Phase 1', description: 'Initial construction work', amount: 1000000, status: 'Completed', completedAt: new Date(Date.now() - 20*24*60*60*1000).toLocaleDateString() },
                { id: 'm7', name: 'Construction Phase 2', description: 'Secondary construction work', amount: 750000, status: 'In Progress', completedAt: null },
                { id: 'm8', name: 'Finishing & Furnishing', description: 'Final touches and furnishing', amount: 500000, status: 'Pending', completedAt: null }
              ],
              location: 'Kandy',
              category: 'Commercial Construction'
            }
          ];
          
          setProjects(sampleProjects);
          setActiveProject(sampleProjects[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOngoingWorks();
  }, [contractorData.id]);
  
  // Update milestone status
  const updateMilestoneStatus = async (projectId, milestoneIndex, newStatus) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Find milestone in the array
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        toast.error("Project not found");
        setIsUpdating(false);
        return;
      }
      
      await axios.patch(`http://localhost:5000/api/ongoingworks/${projectId}/milestone/${milestoneIndex}`, {
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date() : null,
        notes: updateNotes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
          const updatedMilestones = [...p.milestones];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            status: newStatus,
            completedAt: newStatus === 'Completed' ? new Date().toLocaleDateString() : null
          };
          
          // Calculate new progress based on completed milestones
          const completedCount = updatedMilestones.filter(m => m.status === 'Completed').length;
          const progress = Math.round((completedCount / updatedMilestones.length) * 100);
          
          return {
            ...p,
            milestones: updatedMilestones,
            workProgress: progress,
            status: completedCount === updatedMilestones.length ? 'Completed' : 'In Progress'
          };
        }
        return p;
      });
      
      setProjects(updatedProjects);
      if (activeProject && activeProject.id === projectId) {
        setActiveProject(updatedProjects.find(p => p.id === projectId));
      }
      
      toast.success(`Milestone status updated to ${newStatus}`);
      
      // Upload photo if provided
      if (progressPhoto && newStatus === 'Completed') {
        uploadProgressPhoto(projectId, milestoneIndex);
      }
      
    } catch (err) {
      console.error("Error updating milestone:", err);
      toast.error("Failed to update milestone status");
    } finally {
      setIsUpdating(false);
      setMilestoneUpdate({ milestoneId: null, status: '', notes: '' });
      setUpdateNotes('');
      setProgressPhoto(null);
    }
  };
  
  // Upload progress photo
  const uploadProgressPhoto = async (projectId, milestoneIndex) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('photo', progressPhoto);
      formData.append('projectId', projectId);
      formData.append('milestoneIndex', milestoneIndex);
      
      await axios.post(`http://localhost:5000/api/ongoingworks/photo`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Progress photo uploaded successfully');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Failed to upload progress photo');
    }
  };
  
  // Add comment/message to project
  const sendMessage = async (projectId, message) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/ongoingworks/${projectId}/message`, {
        message,
        senderId: contractorData.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            communication: [
              ...p.communication,
              {
                senderId: contractorData.id,
                message,
                sentAt: new Date()
              }
            ]
          };
        }
        return p;
      });
      
      setProjects(updatedProjects);
      if (activeProject && activeProject.id === projectId) {
        setActiveProject(updatedProjects.find(p => p.id === projectId));
      }
      
      toast.success('Message sent');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProgressPhoto(e.target.files[0]);
    }
  };
  
  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    if (activeTab === 'inProgress') return project.status === 'In Progress';
    if (activeTab === 'completed') return project.status === 'Completed';
    return true;
  });
  
  // Calculate statistics
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    totalValue: projects.reduce((sum, p) => sum + p.budget, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContractorUserNav />
      <br /><br /><br /><br />
      <motion.div 
        className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">My Ongoing Projects</h1>
          <p className="mt-2 text-blue-100">Manage your active construction and renovation projects</p>
        </div>
      </motion.div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaTools className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Projects</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaRegCalendarAlt className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">In Progress</p>
                <h3 className="text-2xl font-bold">{stats.inProgress}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaClipboardCheck className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <h3 className="text-2xl font-bold">{stats.completed}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaMoneyBillWave className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Value</p>
                <h3 className="text-2xl font-bold">LKR {stats.totalValue.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Project Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                All Projects
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'inProgress' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('inProgress')}
              >
                In Progress
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
            </nav>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading your projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-100 text-red-600 p-4 rounded-md">
              <p>{error}</p>
              <button 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 inline-block p-6 rounded-full">
              <FaTools className="text-4xl text-blue-600 mx-auto" />
            </div>
            <h3 className="mt-4 text-xl font-medium">No projects found</h3>
            <p className="mt-2 text-gray-500">
              {activeTab === 'all' 
                ? "You don't have any ongoing projects yet." 
                : activeTab === 'inProgress' 
                  ? "You don't have any projects in progress." 
                  : "You don't have any completed projects."}
            </p>
            <Link 
              to="/contractor-projects" 
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse Available Projects
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Project List Sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                <div className="bg-blue-600 px-4 py-3 text-white font-medium">
                  Your Projects
                </div>
                <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
                  {filteredProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`p-4 cursor-pointer transition-colors ${
                        activeProject && activeProject.id === project.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveProject(project)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <span>{project.clientName}</span>
                        <span>{project.location}</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{project.workProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              project.workProgress < 30 ? 'bg-yellow-500' : 
                              project.workProgress < 70 ? 'bg-blue-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${project.workProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Project Details */}
            {activeProject && (
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                  {/* Project Header */}
                  <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-5 text-white relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold">{activeProject.title}</h2>
                        <div className="flex items-center mt-2">
                          <FaMapMarkerAlt className="mr-1 text-blue-200" />
                          <span className="text-blue-100">{activeProject.location}</span>
                          <span className="mx-2 text-blue-300">•</span>
                          <span className="text-blue-100">{activeProject.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-200">      </div>
                        <br /><br />
                        <div className="text-xl font-bold">LKR {activeProject.budget.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{activeProject.workProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200/30 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-white"
                          style={{ width: `${activeProject.workProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        activeProject.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : activeProject.status === 'In Progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activeProject.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Project Description</h3>
                        <p className="text-gray-600">{activeProject.description}</p>
                        
                        <div className="mt-6">
                          <h3 className="font-medium text-gray-900 mb-2">Client Information</h3>
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                              <FaUser className="text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">{activeProject.clientName}</div>
                              <div className="text-sm text-gray-500">Client ID: {activeProject.clientId}</div>
                            </div>
                            <button
                              className="ml-auto bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-sm"
                              onClick={() => navigate(`/chat/${activeProject.clientId}`)}
                            >
                              Message
                            </button>
                          </div>
                        </div>
                        <div className="mt-6">
                          <h3 className="font-medium text-gray-900 mb-2">Project Timeline</h3>
                          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                              <div className="text-xs text-gray-500">Start Date</div>
                              <div className="font-medium">{activeProject.startDate}</div>
                            </div>
                            <div className="border-t-2 border-dashed border-gray-300 flex-1 mx-4 relative">
                              <div 
                                className="absolute top-0 h-2 bg-blue-500" 
                                style={{ 
                                  width: `${activeProject.workProgress}%`, 
                                  transform: 'translateY(-50%)'
                                }}
                              ></div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Estimated Completion</div>
                              <div className="font-medium text-blue-600">
                                {new Date(new Date(activeProject.startDate).getTime() + (parseInt(activeProject.timeline || 30) * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Financial Summary</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Amount Received</div>
                              <div className="font-bold text-green-600">LKR {activeProject.amountPaid.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Pending Payment</div>
                              <div className="font-bold text-amber-600">LKR {activeProject.amountPending.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Start Date</div>
                              <div>{activeProject.startDate}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Project Status</div>
                              <div className={`font-medium ${
                                activeProject.status === 'Completed' ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                {activeProject.status}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                       
                        <div className="mt-6">
                          <button 
                            onClick={() => {
                              // Create agreement data object with all necessary details
                              const agreementData = {
                                jobDetails: {
                                  _id: activeProject.jobId,
                                  title: activeProject.title,
                                  description: activeProject.description,
                                  category: activeProject.category,
                                  area: activeProject.location
                                },
                                bidDetails: {
                                  price: activeProject.budget,
                                  timeline: activeProject.milestones.length > 0 ? 
                                    `${activeProject.milestones.length * 7} days` : '30 days',
                                  contractorname: contractorData.name
                                },
                                clientDetails: {
                                  name: activeProject.clientName,
                                  username: activeProject.clientName,
                                },
                                contractorDetails: {
                                  name: contractorData.name,
                                  email: localStorage.getItem('email') || ''
                                },
                                paymentSchedule: activeProject.milestones.map(milestone => ({
                                  milestone: milestone.name,
                                  description: milestone.description,
                                  date: milestone.completedAt || new Date().toLocaleDateString(),
                                  percentage: Math.round(100 / activeProject.milestones.length),
                                  amount: parseFloat(milestone.amount)
                                }))
                              };
                              
                              // Navigate to the agreement view with the data
                              navigate(`/accepted-agreement/${activeProject.jobId}/${activeProject.id}`, {
                                state: agreementData
                              });
                            }}
                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                          >
                            View Contract Agreement
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Milestones Section */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
                      
                      <div className="space-y-4">
                        {activeProject.milestones.map((milestone, index) => (
                          <div 
                            key={milestone.id || index}
                            className={`border rounded-lg ${
                              milestone.status === 'Completed' ? 'border-green-200 bg-green-50' :
                              milestone.status === 'In Progress' ? 'border-blue-200 bg-blue-50' :
                              'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  {milestone.status === 'Completed' ? (
                                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">
                                      <FaCheck />
                                    </div>
                                  ) : milestone.status === 'In Progress' ? (
                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                                      {index + 1}
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center mr-3">
                                      {index + 1}
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium">{milestone.name}</h4>
                                    <p className="text-sm text-gray-600">{milestone.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">Payment Amount</div>
                                  <div className="font-bold">LKR {milestone.amount.toLocaleString()}</div>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${
                                    milestone.status === 'Completed' ? 'bg-green-500' :
                                    milestone.status === 'In Progress' ? 'bg-blue-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                  <span className="text-sm">{milestone.status}</span>
                                  {milestone.completedAt && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      • Completed: {milestone.completedAt}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Payment Status Indicator */}
                                <div className="flex items-center">
                                  {milestone.status === 'Completed' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Payment Received
                                    </span>
                                  )}
                                </div>
                                
                                {/* Status Update Buttons */}
                                <div className="flex space-x-2">
                                  {milestone.status === 'Pending' && (
                                    <button
                                      onClick={() => updateMilestoneStatus(activeProject.id, index, 'In Progress')}
                                      disabled={isUpdating}
                                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                      Start Work
                                    </button>
                                  )}
                                  
                                  {milestone.status === 'In Progress' && (
                                    <button
                                      onClick={() => updateMilestoneStatus(activeProject.id, index, 'Completed')}
                                      disabled={isUpdating}
                                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                      Mark Complete
                                    </button>
                                  )}
                                  
                                  {milestone.status === 'Completed' && (
                                    <button
                                      onClick={() => updateMilestoneStatus(activeProject.id, index, 'Pending')}
                                      disabled={isUpdating}
                                      className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                      Revert to Pending
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OngoingProjects;