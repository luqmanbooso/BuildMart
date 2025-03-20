import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import ContractorUserNav from '../components/ContractorUserNav';
import EditContractorProfile from '../components/EditContractorProfile';
import QualificationsManager from '../components/QualificationsManager';

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
  const [contractorInfo, setContractorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation */}
      <ContractorUserNav />
      
      <br /><br /><br /><br />
      {/* Header section */}
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
      
      {/* Profile content */}
      {!showEditProfile && (
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
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
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
                      Edit Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Qualifications */}
            <div className="md:col-span-2">
              <QualificationsManager userId={getUserId()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorProfile;