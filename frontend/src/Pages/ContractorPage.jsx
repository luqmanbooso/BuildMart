import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaTrashAlt, FaMedal, FaBriefcase, FaStar, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import ContractorUserNav from '../components/ContractorUserNav';
import EditContractorProfile from '../components/EditContractorProfile';
import QualificationsManager from '../components/QualificationsManager';
import EditUserDetails from '../components/EditUserDetails';

// Enhanced ProfileImage component with better circle display and sizing options
function ProfileImage({ profilePicPath, className = "", size = "medium" }) {
  // Check if the path is a full URL or just a relative path
  const imgSrc = profilePicPath
    ? profilePicPath.startsWith('http') 
      ? profilePicPath 
      : `http://localhost:5000${profilePicPath}`
    : '/default-profile.png'; // Fallback image

  // Size map with expanded options
  const sizeMap = {
    small: "h-10 w-10",
    medium: "h-16 w-16", 
    large: "h-20 w-20",
    xlarge: "h-24 w-24",
    xxlarge: "h-32 w-32"
  };
  
  // Get size class or default to passed dimensions
  const sizeClass = sizeMap[size] || "";
  
  // Combine size with passed className
  const containerClasses = `${sizeClass} ${className} rounded-full overflow-hidden flex-shrink-0 bg-gray-50`;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className={containerClasses} 
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background placeholder with subtle pattern */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.2) 100%)"
        }}
      ></div>
      {/* Perfect circle mask with aspect ratio enforcement */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative' 
        }}>
          <img 
            src={imgSrc} 
            alt="Profile" 
            className="absolute inset-0 w-full h-full rounded-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              e.target.src = '/default-profile.png';
              console.log("Failed to load profile image:", profilePicPath);
            }} 
          />
        </div>
      </div>
    </motion.div>
  );
}

const ContractorProfile = () => {
  // Your existing state variables...
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '', 
    username: '',
    email: '',
    password: '******',
    address: '',
    phone: '',
    profilePic: null
  });

  // State for UI
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditUserDetails, setShowEditUserDetails] = useState(false);
  const [contractorInfo, setContractorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // New state for tab navigation
  const navigate = useNavigate();

  // Your existing functions...
  const handleProfileUpdate = (updatedProfile) => {
    setContractorInfo(updatedProfile);
    setPersonalInfo(prev => ({
      ...prev,
      firstName: updatedProfile.firstName || prev.firstName,
      lastName: updatedProfile.lastName || prev.lastName,
      address: updatedProfile.address || prev.address,
      phone: updatedProfile.phone || prev.phone
    }));
    
    setShowEditProfile(false);
    toast.success("Profile updated successfully!");
  };
  
  const handleUserUpdate = (updatedUserData) => {
    setPersonalInfo(prev => ({
      ...prev,
      firstName: updatedUserData.firstName || prev.firstName,
      lastName: updatedUserData.lastName || prev.lastName,
      username: updatedUserData.username || prev.username,
      email: updatedUserData.email || prev.email
    }));
    
    setShowEditUserDetails(false);
    toast.success("Personal details updated successfully!");
    
    refreshProfilePicture();
  };

  // Existing useEffect...
  useEffect(() => {
    fetchUserProfile();
    fetchContractorData();
    fetchProfilePicture();
  }, []);

  // Existing functions: getToken, getUserId, fetchUserProfile, fetchContractorData, 
  // handleLogout, handleDeleteAccount, fetchProfilePicture, refreshProfilePicture...

  // Define animation variants for use with motion components
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Add these missing functions to your ContractorProfile component

  // Get the authentication token from storage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Extract user ID from token or use from state
  const getUserId = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/auth/user/${userId}`);
      console.log('User data response:', response.data);
      
      // Access the nested user object
      const userData = response.data.user; 
      
      if (userData) {
        // Split username to get first and last name if they don't exist separately
        const nameParts = userData.username ? userData.username.split(' ') : ['', ''];
        
        setPersonalInfo(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
          username: userData.username || '',
          email: userData.email || '',
          password: '******',
          profilePic: userData.profilePic || prev.profilePic
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contractor specific data
  const fetchContractorData = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/contractors/user/${userId}`);
      setContractorInfo(response.data);
      
      // Update personal info with contractor data
      setPersonalInfo(prev => ({
        ...prev,
        address: response.data.address || prev.address,
        phone: response.data.phone || prev.phone
      }));
    } catch (error) {
      console.error("Error fetching contractor data:", error);
    }
  };

  // Fetch profile picture separately
  const fetchProfilePicture = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/auth/user/${userId}`);
      
      if (response.data && response.data.user && response.data.user.profilePic) {
        console.log('Profile picture fetched:', response.data.user.profilePic);
        
        setPersonalInfo(prev => ({
          ...prev,
          profilePic: response.data.user.profilePic
        }));
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  // Refresh profile picture (used after updates)
  const refreshProfilePicture = () => {
    fetchProfilePicture();
  };

  // Handle user logout
  const handleLogout = () => {
    // Remove auth tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const userId = getUserId();
    const token = getToken();
    
    if (!userId || !token) {
      toast.error('Authentication required');
      navigate('/login');
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/auth/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Clear tokens and show success
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      toast.success('Your account has been deleted successfully');
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-12"
    >
      <ContractorUserNav />
      
      <br /><br /><br /><br />
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 text-white p-8 shadow-xl"
      >
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-200"
          >
            Manage your professional profile, qualifications, and track your success
          </motion.p>
        </div>
      </motion.div>

    
      
      {/* Show the edit profile component when showEditProfile is true */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="container mx-auto max-w-4xl px-4 py-8"
          >
            <EditContractorProfile 
              contractorData={contractorInfo} 
              onClose={() => setShowEditProfile(false)}
              onProfileUpdate={handleProfileUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Show the edit user details component when showEditUserDetails is true */}
      <AnimatePresence>
        {showEditUserDetails && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="container mx-auto max-w-4xl px-4 py-8"
          >
            <EditUserDetails 
              userData={personalInfo}
              onClose={() => setShowEditUserDetails(false)}
              onUserUpdate={handleUserUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Profile content - only show when not editing */}
      <AnimatePresence>
        {!showEditProfile && !showEditUserDetails && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto max-w-6xl px-4 py-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left column - Personal Info */}
              <motion.div 
                variants={cardVariants}
                className="md:col-span-1"
              >
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-50"
                >
                  <div className="flex flex-col items-center mb-6">
                    {personalInfo.profilePic ? (
                      <ProfileImage 
                        profilePicPath={personalInfo.profilePic}
                        size="xxlarge"
                        className="mb-4 border-4 border-white shadow-lg"
                      />
                    ) : (
                      <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full overflow-hidden mb-4 flex items-center justify-center text-white shadow-lg"
                      >
                        <FaUserCircle className="w-24 h-24" />
                      </motion.div>
                    )}
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-blue-800"
                    >
                      {personalInfo.firstName} {personalInfo.lastName}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600"
                    >
                      @{personalInfo.username}
                    </motion.p>

                    {contractorInfo?.verified && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-2 flex items-center bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                        </svg>
                        Verified Professional
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEditUserDetails(true)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm bg-blue-50 px-3 py-1 rounded-md"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </motion.button>
                    </div>
                    <ul className="space-y-4">
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center"
                      >
                        <span className="font-medium w-24 text-gray-600">Email:</span>
                        <span className="text-gray-800 bg-gray-50 px-3 py-1.5 rounded-md flex-1">
                          {personalInfo.email}
                        </span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center"
                      >
                        <span className="font-medium w-24 text-gray-600">Phone:</span>
                        <span className="text-gray-800 bg-gray-50 px-3 py-1.5 rounded-md flex-1">
                          {personalInfo.phone || "Not provided"}
                        </span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center"
                      >
                        <span className="font-medium w-24 text-gray-600">Address:</span>
                        <span className="text-gray-800 bg-gray-50 px-3 py-1.5 rounded-md flex-1">
                          {personalInfo.address || "Not provided"}
                        </span>
                      </motion.li>
                    </ul>
                    
                    {/* Action buttons */}
                    <motion.div 
                      variants={containerVariants}
                      className="mt-6 space-y-3"
                    >
                      <motion.button 
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowEditProfile(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center shadow-md"
                      >
                        <FaEdit className="mr-2" />
                        Edit Professional Details
                      </motion.button>
                      <motion.button 
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, backgroundColor: "#DC2626" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center shadow-md"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                      </motion.button>
                      
                      <motion.button 
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, backgroundColor: "#F3F4F6" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-red-600 py-3 px-4 rounded-lg flex items-center justify-center shadow-sm"
                      >
                        <FaTrashAlt className="mr-2" />
                        Delete Account
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right column - Qualifications and Professional Details */}
              <motion.div 
                variants={cardVariants}
                className="md:col-span-2"
              >
                {/* Professional Details */}
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-50"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Professional Details</h3>
                    <div className="flex items-center">
                      {contractorInfo?.verified && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center mr-2">
                          <svg className="w-3 h-3 mr-1 text-green-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center mb-2">
                        <FaBriefcase className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-600">Company Name</h4>
                      </div>
                      <p className="text-gray-800 font-medium text-lg">
                        {contractorInfo?.companyName || "Not specified"}
                      </p>
                    </motion.div>
                    
                    {/* Experience Years */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center mb-2">
                        <FaClock className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-600">Years of Experience</h4>
                      </div>
                      <p className="text-gray-800 font-medium text-lg">
                        {contractorInfo?.experienceYears ? `${contractorInfo.experienceYears} years` : "Not specified"}
                      </p>
                    </motion.div>
                    
                    {/* Completed Projects */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center mb-2">
                        <FaMedal className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-600">Completed Projects</h4>
                      </div>
                      <p className="text-gray-800 font-medium text-lg">
                        {contractorInfo?.completedProjects || "0"}
                      </p>
                    </motion.div>
                    
                    {/* Specialization */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center mb-2">
                        <FaStar className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-600">Specialization</h4>
                      </div>
                      {contractorInfo?.specialization?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {contractorInfo.specialization.map((specialty, index) => (
                            <motion.span 
                              key={index} 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + (index * 0.1) }}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                            >
                              {specialty}
                            </motion.span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No specializations added</p>
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Bio */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6"
                  >
                    <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      About Me
                    </h4>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-100">
                      <p className="text-gray-700 leading-relaxed">
                        {contractorInfo?.bio || "No bio information added yet. Edit your profile to add a description about yourself and your services."}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Statistics */}
                  <motion.div 
                    variants={containerVariants}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <motion.div 
                      variants={cardVariants}
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(59, 130, 246, 0.2)" }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-xl border border-blue-100 text-center"
                    >
                      <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600">{contractorInfo?.completedProjects || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Completed Projects</p>
                    </motion.div>
                    <motion.div 
                      variants={cardVariants}
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(16, 185, 129, 0.2)" }}
                      className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-xl border border-green-100 text-center"
                    >
                      <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-green-600 to-emerald-600">{contractorInfo?.experienceYears || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Years Experience</p>
                    </motion.div>
                    <motion.div 
                      variants={cardVariants}
                      whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(124, 58, 237, 0.2)" }}
                      className="bg-gradient-to-br from-purple-50 to-violet-100 p-5 rounded-xl border border-purple-100 text-center"
                    >
                      <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-600 to-violet-600">{contractorInfo?.specialization?.length || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Specializations</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                {/* Qualifications section */}
                <motion.div
                  variants={cardVariants}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-50"
                >
                  <QualificationsManager userId={getUserId()} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto" 
            aria-labelledby="modal-title" 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" 
                aria-hidden="true"
                onClick={() => setShowDeleteConfirm(false)}
              ></motion.div>

              {/* Modal Panel */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="bg-white px-6 pt-5 pb-6">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Your Account</h3>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete your account? All of your data including projects, bids, qualifications, and payment history will be permanently removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#DC2626" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleDeleteAccount}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete Account
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#F9FAFB" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContractorProfile;