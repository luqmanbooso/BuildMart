import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import ContractorUserNav from '../components/ContractorUserNav';
import EditContractorProfile from '../components/EditContractorProfile';
import QualificationsManager from '../components/QualificationsManager';
import EditUserDetails from '../components/EditUserDetails'; // Import the EditUserDetails component

const ContractorProfile = () => {
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '', 
    username: '',
    email: '',
    password: '******',
    address: '',
    phone: ''
  });

  // State for UI
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditUserDetails, setShowEditUserDetails] = useState(false); // New state for editing user details
  const [contractorInfo, setContractorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // New state for delete confirmation
  const navigate = useNavigate();

  // Handle profile update function
  const handleProfileUpdate = (updatedProfile) => {
    setContractorInfo(updatedProfile);
    
    // Update personal info with the new data
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
  
  // Handle user details update function
  const handleUserUpdate = (updatedUserData) => {
    // Update personal info with the new data
    setPersonalInfo(prev => ({
      ...prev,
      firstName: updatedUserData.firstName || prev.firstName,
      lastName: updatedUserData.lastName || prev.lastName,
      username: updatedUserData.username || prev.username,
      email: updatedUserData.email || prev.email
    }));
    
    setShowEditUserDetails(false);
    toast.success("Personal details updated successfully!");
  };

  // Effect to fetch data on mount
  useEffect(() => {
    fetchUserProfile();
    fetchContractorData();
  }, []);

  // Helper to get token
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Get user ID from token
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
      console.log('User data response:', response.data); // Debug log
      
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
          password: '******'
          // Don't set address and phone here, as they come from contractor data
        }));
      } else {
        console.error('No user data in response');
        setError('User data not found in response');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contractor-specific data
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    toast.success("Logged out successfully");
    navigate('/login');       
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const token = getToken();
      const userId = getUserId();
      
      if (!userId || !token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Make API call to delete the user account
      // Fix: Change endpoint from /auth/user/${userId} to /auth/users/${userId}
      await axios.delete(`http://localhost:5000/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Clear tokens from storage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('userId');
      
      toast.success('Your account has been deleted successfully.');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // More detailed error handling
      let errorMsg = 'Failed to delete account. Please try again.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMsg = 'User account not found.';
        } else if (error.response.data?.error) {
          errorMsg = error.response.data.error;
        }
      }
      
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <ContractorUserNav />
      
      <br /><br /><br /><br />
      <div className="bg-gradient-to-r from-gray-800 to-blue-900 text-white p-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Contractor Profile</h1>
          <p className="text-blue-200">Manage your professional qualifications and profile</p>
        </div>
      </div>
      
      {/* Show the edit profile component when showEditProfile is true */}
      {showEditProfile && (
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <EditContractorProfile 
            contractorData={contractorInfo} 
            onClose={() => setShowEditProfile(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      )}
      
      {/* Show the edit user details component when showEditUserDetails is true */}
      {showEditUserDetails && (
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <EditUserDetails 
            userData={personalInfo}
            onClose={() => setShowEditUserDetails(false)}
            onUserUpdate={handleUserUpdate}
          />
        </div>
      )}
      
      {/* Profile content - only show when not editing */}
      {!showEditProfile && !showEditUserDetails && (
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Personal Info */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden mb-4 flex items-center justify-center text-gray-600">
                    <FaUserCircle className="w-full h-full" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{personalInfo.firstName} {personalInfo.lastName}</h2>
                  <p className="text-gray-600">@{personalInfo.username}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <button
                      onClick={() => setShowEditUserDetails(true)}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <FaEdit className="mr-1" />
                      Edit
                    </button>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex">
                      <span className="font-medium w-24">Email:</span>
                      <span className="text-gray-600">{personalInfo.email}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-24">Phone:</span>
                      <span className="text-gray-600">{personalInfo.phone}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-24">Address:</span>
                      <span className="text-gray-600">{personalInfo.address}</span>
                    </li>
                  </ul>
                  
                  {/* Add edit profile and logout buttons */}
                  <div className="mt-6 space-y-2">
                    <button 
                      onClick={() => setShowEditProfile(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit Professional Details
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                    
                    {/* Add Delete Account button */}
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-red-600 py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaTrashAlt className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Qualifications and Professional Details */}
            <div className="md:col-span-2">
              {/* Add Professional Details section above QualificationsManager */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
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
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Company Name</h4>
                    <p className="text-gray-800 font-medium">
                      {contractorInfo?.companyName || "Not specified"}
                    </p>
                  </div>
                  
                  {/* Experience Years */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Years of Experience</h4>
                    <p className="text-gray-800 font-medium">
                      {contractorInfo?.experienceYears ? `${contractorInfo.experienceYears} years` : "Not specified"}
                    </p>
                  </div>
                  
                  {/* Completed Projects */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Completed Projects</h4>
                    <p className="text-gray-800 font-medium">
                      {contractorInfo?.completedProjects || "0"}
                    </p>
                  </div>
                  
                  {/* Specialization */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Specialization</h4>
                    {contractorInfo?.specialization?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {contractorInfo.specialization.map((specialty, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No specializations added</p>
                    )}
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">About Me</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">
                      {contractorInfo?.bio || "No bio information added yet."}
                    </p>
                  </div>
                </div>
                
                {/* Statistics */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-md text-center">
                    <p className="text-3xl font-bold text-blue-700">{contractorInfo?.completedProjects || 0}</p>
                    <p className="text-sm text-gray-600">Completed Projects</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <p className="text-3xl font-bold text-green-700">{contractorInfo?.experienceYears || 0}</p>
                    <p className="text-sm text-gray-600">Years Experience</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md text-center">
                    <p className="text-3xl font-bold text-purple-700">{contractorInfo?.specialization?.length || 0}</p>
                    <p className="text-sm text-gray-600">Specializations</p>
                  </div>
                </div>
              </div>
              
              {/* Existing QualificationsManager component */}
              <QualificationsManager userId={getUserId()} />
            </div>
          </div>
        </div>
      )}
      
      {/* Add Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowDeleteConfirm(false)}
            ></div>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-5 pb-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorProfile;