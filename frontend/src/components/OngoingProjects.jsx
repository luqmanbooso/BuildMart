import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  FaTools, FaRegCalendarAlt, FaMoneyBillWave, FaUser, FaClipboardCheck, 
  FaMapMarkerAlt, FaCheck, FaHardHat, FaCamera, FaComment, FaChartLine, FaEnvelope
} from 'react-icons/fa';
import ContractorUserNav from './ContractorUserNav';
import IssueReportModal from './IssueReportModal';
import Footer from './Footer'; // Import Footer component

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
    name: 'Contractor',
    email: '' // Add email field to the state
  });
  
  // Add state for IssueReportModal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedProjectForReport, setSelectedProjectForReport] = useState(null);

  const navigate = useNavigate();

  // Get contractor ID from token
  useEffect(() => {
    const getContractorInfo = () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          toast.error("Please login first");
          navigate('/login');
          return null;
        }
    
        // Log the token (partially) for debugging
        console.log("Found token:", token.substring(0, 15) + "...");

        // Decode token and log the structure
        const decoded = jwtDecode(token);
        console.log("Decoded token data:", decoded);
        
        // Try all possible ID fields - notice the order matters
        const userId = decoded.id || decoded._id || decoded.userId;
        console.log("Extracted user ID:", userId);
        
        // Extract email from token
        const email = decoded.email || '';
        console.log("Extracted email from token:", email);
        
        if (!userId) {
          console.error("No user ID found in token");
          toast.error("Authentication error - please login again");
          navigate('/login');
          return null;
        }
        
        // Save to component state with email included
        localStorage.setItem('userId', userId);
        if (email) localStorage.setItem('email', email);
        
        setContractorData({
          id: userId,
          name: decoded.username || localStorage.getItem('name') || 'Contractor',
          email: email || localStorage.getItem('email') || ''
        });
        
        console.log("Set contractor data:", {
          id: userId,
          name: decoded.username || localStorage.getItem('name') || 'Contractor',
          email: email || localStorage.getItem('email') || ''
        });
        
        return userId;
      } catch (error) {
        console.error("Error getting contractor info:", error);
        toast.error("Authentication error - " + error.message);
        navigate('/login');
        return null;
      }
    };
    
    const contractorId = getContractorInfo();
    console.log("Contractor ID for fetching projects:", contractorId);
  }, [navigate]);
  
  // Add this helper function to extract proper user data
const getClientDataFromProject = async (project, token) => {
  try {
    if (!project.clientId) return { name: 'Client', email: '' };
    
    // Try to fetch client data from API
    const response = await axios.get(`http://localhost:5000/auth/users/${project.clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const clientData = response.data;
    console.log("Fetched client data:", clientData);
    
    return {
      name: clientData.username || clientData.name || 'Client',
      email: clientData.email || '',
      id: project.clientId
    };
  } catch (error) {
    console.error("Error fetching client data:", error);
    return { name: 'Client', email: '', id: project.clientId };
  }
};
  
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
        
        console.log("RAW API RESPONSE FROM BACKEND:", response.data[0]); // Log first item for debugging
        
        const formattedProjects = response.data.map(project => {
          console.log("Processing project with totalPrice:", project.totalPrice);
          console.log("Timeline days:", project.timeline);
          console.log("Job ID object:", project.jobId); // Log job ID to see the issue
          
          // Extract client information from jobId
          const clientId = project.clientId || project.jobId?.userid;
          const clientName = project.jobId?.username || 'Client';
          
          // Extract timeline directly from the API response
          const timelineDays = project.timeline || 2;
          
          // Calculate start and end dates
          const startDate = new Date(project.createdAt);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + parseInt(timelineDays));
          
          // Format dates consistently
          const formattedStartDate = startDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          
          const formattedEndDate = endDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          
          return {
            id: project._id,
            jobId: project.jobId?._id || project.jobId || null,
            clientId: clientId,
            clientName: clientName,
            clientEmail: '', // Will be populated later after fetching user data
            title: project.jobId?.title || 'Project',
            description: project.jobId?.description || 'No description available',
            budget: project.totalPrice || 0,
            amountPaid: project.totalAmountPaid || 0,
            amountPending: project.totalAmountPending || 0,
            workProgress: project.workProgress || 0,
            totalPrice: project.totalPrice || 0,
            timeline: timelineDays,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            status: project.jobStatus || 'In Progress',
            milestones: (project.milestones || []).map(m => ({
              id: m._id,
              name: m.name,
              description: m.description,
              amount: parseFloat(m.amount || 0),
              status: m.status,
              completedAt: m.completedAt ? new Date(m.completedAt).toLocaleDateString() : null
            })),
            location: project.jobId?.area || 'Not specified',
            category: project.jobId?.category || 'Construction',
            communication: project.communication || []
          };
        });
        
        // Now fetch client emails for each project
        const projectsWithClientData = await Promise.all(
          formattedProjects.map(async (project, index) => {
            console.log(`-------- START PROCESSING PROJECT ${index + 1} --------`);
            console.log(`Project: "${project.title}" (ID: ${project.id})`);
            console.log(`Client ID from project: ${project.clientId}`);
            
            if (!project.clientId) {
              console.log(`⚠️ No client ID found for project ${index + 1}, skipping fetch`);
              return project;
            }
            
            try {
              console.log(`🔍 Fetching data for client ID: ${project.clientId}`);
              
              // Try both API endpoints since one might work
              let clientResponse;
              try {
                // First try the auth endpoint
                clientResponse = await axios.get(`http://localhost:5000/auth/user/${project.clientId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              } catch (err) {
                // If that fails, try the API endpoint
                console.log(err);
              }
              
              // Log the entire response to see the structure
              console.log("Full client response data:", JSON.stringify(clientResponse.data));
              
              // Try different possible locations for email
              const email = clientResponse.data.email || 
                            clientResponse.data.user?.email || 
                            clientResponse.data.userEmail ||
                            '';
              

              // Log what we found
              console.log(`Email found: ${email || 'NONE'}`);
              console.log(`Username found: ${clientResponse.data.username || 'NONE'}`);
              
              const updatedProject = {
                ...project,
                clientEmail: email,
                clientName: clientResponse.data.username || project.clientName
              };
              
              console.log(`Updated project client info:`, {
                before: {
                  name: project.clientName,
                  email: project.clientEmail || 'none'
                },
                after: {
                  name: updatedProject.clientName,
                  email: updatedProject.clientEmail || 'none'
                }
              });
              
              console.log(`-------- FINISHED PROCESSING PROJECT ${index + 1} --------`);
              return updatedProject;
            } catch (err) {
              console.error(`❌ Failed to fetch client data for ${project.clientId}:`, err);
              console.log(`Error response:`, err.response?.data || 'No response data');
              console.log(`-------- ERROR PROCESSING PROJECT ${index + 1} --------`);
              return project;
            }
          })
        );
        
        console.log("🔄 Final projects with client data:");
        projectsWithClientData.forEach((project, index) => {
          console.log(`Project ${index + 1}: ${project.title}`);
          console.log(`- Client Name: ${project.clientName}`);
          console.log(`- Client Email: ${project.clientEmail || 'No email'}`);
        });
        
        setProjects(projectsWithClientData);
        if (projectsWithClientData.length > 0 && !activeProject) {
          setActiveProject(projectsWithClientData[0]);
        }
        
      } catch (error) {
        console.error("Error fetching ongoing projects:", error);
        setError("Failed to load projects");
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
    
    // Find project in the array
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      toast.error("Project not found");
      setIsUpdating(false);
      return;
    }
    
    // Find milestone by index
    const milestone = project.milestones[milestoneIndex];
    if (!milestone) {
      toast.error("Milestone not found");
      setIsUpdating(false);
      return;
    }
    
    // Enforce workflow: Can only start work on Pending milestones
    if (newStatus === 'In Progress' && milestone.status !== 'Pending') {
      toast.error("Can only start work on pending milestones");
      setIsUpdating(false);
      return;
    }
    
    // Enforce workflow: Can only mark complete milestones that are In Progress
    if (newStatus === 'Completed' && milestone.status !== 'In Progress') {
      toast.error("Can only mark in-progress milestones as complete");
      setIsUpdating(false);
      return;
    }
    
    // If contractor is marking as complete, change to "Pending Verification"
    let statusToSend = newStatus;
    if (newStatus === 'Completed') {
      statusToSend = 'Pending Verification';
    }
    
    console.log("Updating milestone status:", {
      projectId,
      milestoneIndex,
      requestedStatus: newStatus,
      actualStatus: statusToSend,
      currentMilestone: milestone
    });
    
    await axios.patch(`http://localhost:5000/api/ongoingworks/${projectId}/milestone/${milestoneIndex}`, {
      status: statusToSend,
      completedAt: statusToSend === 'Pending Verification' ? new Date() : null,
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
          status: statusToSend,
          completedAt: statusToSend === 'Pending Verification' ? new Date().toLocaleDateString() : null
        };
        
        return {
          ...p,
          milestones: updatedMilestones,
          workProgress: calculateProjectProgress(updatedMilestones)
        };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    if (activeProject && activeProject.id === projectId) {
      const updatedActiveProject = updatedProjects.find(p => p.id === projectId);
      setActiveProject(updatedActiveProject);
    }
    
    if (newStatus === 'Completed') {
      toast.success("Client has been notified for verification");
    } else {
      toast.success(`Milestone status updated to ${statusToSend}`);
    }
    
    // Upload photo if provided
    if (progressPhoto && statusToSend === 'Pending Verification') {
      await uploadProgressPhoto(projectId, milestoneIndex);
    }
    
  } catch (err) {
    console.error("Error updating milestone:", err);
    if (err.response && err.response.data) {
      console.error('Server error details:', err.response.data);
      toast.error(`Failed to update: ${err.response.data.message || 'Server error'}`);
    } else {
      toast.error("Failed to update milestone status");
    }
  } finally {
    setIsUpdating(false);
    setMilestoneUpdate({ milestoneId: null, status: '', notes: '' });
    setUpdateNotes('');
    setProgressPhoto(null);
  }
};

// Helper function to calculate overall project progress
const calculateProjectProgress = (milestones) => {
  if (!milestones || milestones.length === 0) return 0;
  
  // Count completed milestones - assign weights to different statuses
  let completionWeight = 0;
  
  milestones.forEach(m => {
    if (m.status === 'Completed') {
      completionWeight += 1;  // 100% weight
    } else if (m.status === 'Ready For Payment') {
      completionWeight += 0.9;  // 90% weight
    } else if (m.status === 'Pending Verification') {
      completionWeight += 0.7;  // 70% weight
    } else if (m.status === 'In Progress') {
      completionWeight += 0.3;  // 30% weight
    }
    // Pending gets 0%
  });
  
  return Math.round((completionWeight / milestones.length) * 100);
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
  
  // Calculate statistics with proper safeguards
const stats = {
  total: projects.length,
  inProgress: projects.filter(p => p.status === 'In Progress').length,
  completed: projects.filter(p => p.status === 'Completed').length,
  totalValue: projects.reduce((sum, p) => sum + (p.totalPrice || 0), 0)
};

  // Add function to handle opening the report modal with proper category
  const handleOpenReportModal = (project) => {
    // Log the project data for debugging
    console.log("Project data for issue report:", {
      id: project.id,
      title: project.title,
      category: project.category,
      fullProject: project
    });
    
    // Extract the actual category name, not ID
    const categoryName = project.category || 'Construction';
    
    // Set project data with explicit project name
    setSelectedProjectForReport({
      ...project,
      // Ensure we have the correct category name as a separate property
      categoryName: categoryName,
      // Ensure project name is explicitly included
      projectName: project.title || 'Untitled Project'
    });
    
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      
      <div className="container mx-auto px-4 py-8 flex-grow">
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
            <div className="mt-3">
              <Link 
                to="/my-earnings" 
                className="flex items-center justify-center w-full text-sm px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 rounded-md hover:from-purple-100 hover:to-purple-200 transition-colors"
              >
                <FaChartLine className="mr-1.5" />
                View Your Earnings
              </Link>
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
                      {project.jobId === null && (
                        <div className="mt-1 text-xs text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Missing job reference
                        </div>
                      )}
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
                        <div className="text-xl font-bold">
                          LKR {(activeProject.totalPrice || 0).toLocaleString()}
                        </div>
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
                              <div className="text-sm text-gray-500">
                                {activeProject.clientEmail && (
                                  <div className="flex items-center">
                                    <FaEnvelope className="mr-1 text-xs" /> {activeProject.clientEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              className="ml-auto bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-sm"
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
                                {/* Calculate end date based on start date and timeline */}
                                {(() => {
                                  try {
                                    // Get the raw start date string for debugging
                                    const rawStartDate = activeProject.startDate;
                                    console.log(`[DATE DEBUG] Calculating end date for ${activeProject.title}:`);
                                    console.log(`- Raw start date string: "${rawStartDate}"`);
                                    
                                    // Try to parse the date
                                    const startDate = new Date(rawStartDate);
                                    console.log(`- Parsed start date object: ${startDate}`);
                                    console.log(`- Is valid date? ${!isNaN(startDate.getTime())}`);
                                    
                                    // Get the timeline value
                                    const timelineDays = parseInt(activeProject.timeline) || 30;
                                    console.log(`- Using timeline value: ${timelineDays} days`);
                                    
                                    // Calculate end date
                                    const endDate = new Date(startDate);
                                    endDate.setDate(startDate.getDate() + timelineDays);
                                    console.log(`- Calculated end date: ${endDate}`);
                                    console.log(`- Formatted end date: ${endDate.toLocaleDateString()}`);
                                    
                                    return endDate.toLocaleDateString();
                                  } catch (error) {
                                    console.error(`[DATE ERROR] Failed to calculate end date:`, error);
                                    return "Date calculation error";
                                  }
                                })()}
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
                              // First, check if agreement fee has been paid
                              const agreementFeePaid = localStorage.getItem(`agreementFee_${activeProject.id}`) === 'paid';
                              
                              // Parse timeline value as integer with fallback
                              const timeline = parseInt(activeProject.timeline) || 30;
                              
                              // Parse start date
                              const startDateObj = new Date(activeProject.startDate);
                              
                              // Calculate end date
                              const endDateObj = new Date(startDateObj);
                              endDateObj.setDate(startDateObj.getDate() + timeline);
                              
                              const endDateString = endDateObj.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              });
                              
                              console.log("Timeline calculation:", {
                                startDate: activeProject.startDate,
                                timeline: timeline,
                                calculatedEndDate: endDateString
                              });
                              
                              // Create agreement data with the proper timeline value
                              const agreementData = {
                                jobDetails: {
                                  _id: activeProject.jobId,
                                  title: activeProject.title,
                                  description: activeProject.description,
                                  category: activeProject.category,
                                  area: activeProject.location,
                                  // Pass the actual timeline value
                                  timeline: timeline
                                },
                                bidDetails: {
                                  price: activeProject.budget,
                                  // Use the actual timeline number
                                  timeline: timeline,
                                  contractorname: contractorData.name,
                                  // Include formatted timeline string for display
                                  timelineDisplay: `${activeProject.startDate} to ${endDateString}`
                                },
                                clientDetails: {
                                  name: activeProject.clientName || 'Client',
                                  username: activeProject.clientName || 'Client',
                                  email: activeProject.clientEmail || '',
                                  id: activeProject.clientId
                                },
                                contractorDetails: {
                                  name: contractorData.name,
                                  email: contractorData.email || '',
                                  id: contractorData.id
                                },
                                bidAlreadyAccepted: true,
                                paymentSchedule: activeProject.milestones.map(milestone => ({
                                  milestone: milestone.name,
                                  description: milestone.description,
                                  date: milestone.completedAt || new Date().toLocaleDateString(),
                                  percentage: Math.round(100 / activeProject.milestones.length),
                                  amount: parseFloat(milestone.amount)
                                }))
                              };
                              
                              // Log what we're sending to verify
                              console.log("Agreement data being sent:", {
                                timeline: agreementData.jobDetails.timeline,
                                timelineDisplay: agreementData.bidDetails.timelineDisplay
                              });
                              
                              // Navigate to the agreement view
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
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                  
                                  {/* Removed "Revert to Pending" button */}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Add this section to your project details area */}
                <div className="mt-6 bg-white shadow rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Timeline</h3>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                        <p className="text-base font-semibold">{activeProject.startDate}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="text-base font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {activeProject.timeline} days
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                        <p className="text-base font-semibold text-green-600">{activeProject.endDate}</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500" 
                        style={{ width: `${activeProject.workProgress || 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>Progress: {activeProject.workProgress || 0}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Add Report Issue Button */}
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => handleOpenReportModal(activeProject)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none transition ease-in-out duration-150"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report an Issue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add IssueReportModal at the end of component */}
        {selectedProjectForReport && (
          <IssueReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            projectId={selectedProjectForReport.id}
            projectName={selectedProjectForReport.projectName || selectedProjectForReport.title || 'Untitled Project'} 
            title={selectedProjectForReport.title || 'Untitled Project'}
            userId={contractorData.id}
            username={contractorData.name} // Pass contractor name as username
            userRole="Service Provider"
            category={selectedProjectForReport.categoryName || selectedProjectForReport.category || "Construction"}
            work={selectedProjectForReport}
          />
        )}
      </div>
      
      {/* Add Footer */}
      <Footer />
    </div>
  );
};

export default OngoingProjects;
