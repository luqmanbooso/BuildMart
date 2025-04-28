import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaUser, FaEnvelope, FaIdCard, FaLock, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {jwtDecode} from 'jwt-decode'; 

// ProfileImage component for consistent display
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
    <div className={containerClasses} style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
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
    </div>
  );
}

const EditUserDetails = ({ onClose, userData, onUserUpdate }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  // Add new state for profile image
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    email: userData?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation state
  const [validation, setValidation] = useState({
    email: { valid: true, message: '' },
    username: { valid: true, message: '' },
    currentPassword: { valid: true, message: '' },
    newPassword: { valid: true, message: '' },
    confirmPassword: { valid: true, message: '' }
  });

  // Set initial form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [userData]);

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Update handleSubmit function to use correct endpoints

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!isFormValid()) {
    setError('Please fill all required fields correctly.');
    return;
  }
  
  // Check if new password and confirm password match
  if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
    setError('New password and confirm password do not match');
    return;
  }
  
  setIsLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      toast.error('Authentication required');
      navigate('/login');
      return;
    }

    // Get userId from userData
    let userId = userData?._id || userData?.id;
    
    // If userId is undefined, try to get it from token
    if (!userId && token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId || decoded.id;
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
      }
    }
    
    // If still no userId, show error
    if (!userId) {
      toast.error('Could not determine user ID. Please try logging out and back in.');
      setError('User ID not found');
      setIsLoading(false);
      return;
    }
    
    // Create the base update data
    const requestData = {
      name: formData.username,
      email: formData.email
    };
    
    // Add password fields if provided
    if (formData.currentPassword && formData.newPassword) {
      requestData.currentPassword = formData.currentPassword;
      requestData.newPassword = formData.newPassword;
    }
    
    // Set up updated user data for state update
    let updatedUserData = { 
      ...userData,
      username: formData.username,
      email: formData.email
    };

    // Handle profile image upload if a new one was selected
    if (profileImage) {
      try {
        // First upload the image
        const imageFormData = new FormData();
        imageFormData.append('profilePic', profileImage);
        
        const uploadResponse = await axios.post(
          'http://localhost:5000/auth/upload/profile',
          imageFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Image upload response:', uploadResponse.data);
        
        if (uploadResponse.data && uploadResponse.data.filePath) {
          // Add the profile pic path to the request data
          requestData.profilePic = uploadResponse.data.filePath;
          
          // Update the user data to be returned
          updatedUserData.profilePic = uploadResponse.data.filePath;
        }
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        toast.error('Profile image upload failed, but other details will still be updated.');
      }
    }
    
    // Now update the user with all data including profile pic if uploaded
    console.log(`Making PUT request to /auth/user/${userId} with data:`, requestData);
    
    const response = await axios.put(
      `http://localhost:5000/auth/user/${userId}`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Update successful:', response.data);
    
    // If the response includes updated user data, use it
    if (response.data && response.data.user) {
      updatedUserData = {
        ...updatedUserData,
        ...response.data.user,
        username: response.data.user.username,
        email: response.data.user.email,
        profilePic: response.data.user.profilePic
      };
    }
    
    toast.success('Profile updated successfully!');
    
    if (onUserUpdate) {
      onUserUpdate(updatedUserData);
    }
    
    if (onClose) {
      onClose();
    }
    
  } catch (error) {
    console.error('Error updating user details:', error);
    
    let errorMsg = 'Failed to update user details';
    if (error.response) {
      if (error.response.status === 401) {
        errorMsg = 'Current password is incorrect';
      } else if (error.response.status === 409) {
        errorMsg = error.response.data?.error || 'Username or email already in use';
      } else {
        errorMsg += `: ${error.response.data?.error || error.response.statusText}`;
      }
    }
    
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setIsLoading(false);
  }
};

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name) return { valid: false, message: `${fieldName} is required` };
    if (name.length < 2) {
      return { valid: false, message: `${fieldName} should be at least 2 characters` };
    }
    if (name.length > 50) {
      return { valid: false, message: `${fieldName} should not exceed 50 characters` };
    }
    return { valid: true, message: '' };
  };

  const validateEmail = (email) => {
    if (!email) return { valid: false, message: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true, message: '' };
  };

  const validateUsername = (username) => {
    if (!username) return { valid: false, message: 'Username is required' };
    
    // Check for minimum and maximum length
    if (username.length < 3) {
      return { valid: false, message: 'Username should be at least 3 characters' };
    }
    if (username.length > 30) {
      return { valid: false, message: 'Username should not exceed 30 characters' };
    }
    
    // Check for allowed characters (only alphanumeric, hyphens, and underscores)
    const validChars = /^[a-zA-Z0-9_-]+$/;
    if (!validChars.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    
    // NEW: Must start with a letter
    if (!/^[a-zA-Z]/.test(username)) {
      return { valid: false, message: 'Username must start with a letter' };
    }
    
    // Check for consecutive special characters
    if (/([-_]){2,}/.test(username)) {
      return { valid: false, message: 'Username cannot contain consecutive special characters' };
    }
    
    // Check for start/end with special characters
    if (/^[-_]|[-_]$/.test(username)) {
      return { valid: false, message: 'Username cannot start or end with special characters' };
    }
    
    // NEW: Prevent username with only numbers
    if (/^\d+$/.test(username)) {
      return { valid: false, message: 'Username cannot consist of only numbers' };
    }
    
    // NEW: Prevent username with excessive numbers (more than 50% numbers)
    const numberCount = (username.match(/\d/g) || []).length;
    if (numberCount > username.length * 0.5) {
      return { valid: false, message: 'Username cannot contain too many numbers' };
    }
    
    // NEW: Check for reserved words or patterns
    const reservedWords = ['admin', 'administrator', 'moderator', 'mod', 'support', 'system', 'buildmart', 'root'];
    const lowerUsername = username.toLowerCase();
    for (const word of reservedWords) {
      if (lowerUsername === word || lowerUsername.startsWith(word + '_') || lowerUsername.startsWith(word + '-')) {
        return { valid: false, message: 'This username is reserved or contains a reserved prefix' };
      }
    }
    
    // NEW: Check for suspicious patterns (repeating characters)
    if (/(.)\1{3,}/.test(username)) {
      return { valid: false, message: 'Username contains too many repeating characters' };
    }
    
    return { valid: true, message: '' };
  };

  // Also update the sanitization function to ensure it starts with a letter
  const sanitizeUsername = (username) => {
    if (!username) return '';
    
    // Remove all special characters except hyphens and underscores
    let sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Remove consecutive special characters
    sanitized = sanitized.replace(/([-_]){2,}/g, '$1');
    
    // Remove special characters from start and end
    sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '');
    
    // Ensure it starts with a letter (add 'a' if it doesn't)
    if (sanitized && !/^[a-zA-Z]/.test(sanitized)) {
      sanitized = 'a' + sanitized;
    }
    
    // Limit length
    sanitized = sanitized.slice(0, 30);
    
    return sanitized;
  };

  const validatePassword = (password) => {
    if (!password) return { valid: true, message: '' }; // Password fields are optional
    if (password.length < 8) {
      return { valid: false, message: 'Password should be at least 8 characters' };
    }
    return { valid: true, message: '' };
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    if (!confirmPassword && !newPassword) return { valid: true, message: '' };
    if (confirmPassword !== newPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true, message: '' };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      const sanitizedValue = sanitizeUsername(value);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      setValidation(prev => ({
        ...prev,
        username: validateUsername(sanitizedValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (name === 'email') {
        setValidation(prev => ({
          ...prev,
          email: validateEmail(value)
        }));
      } else if (name === 'newPassword') {
        const newPasswordValidation = validatePassword(value);
        setValidation(prev => ({
          ...prev,
          newPassword: newPasswordValidation,
          // Also validate confirm password when new password changes
          confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
        }));
      } else if (name === 'confirmPassword') {
        setValidation(prev => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value, formData.newPassword)
        }));
      }
    }
  };

  // Fix the isFormValid function to handle password fields as optional
  const isFormValid = () => {
    // Required fields must always be valid
    const requiredFieldsValid = (
      validation.email.valid && formData.email &&
      validation.username.valid && formData.username
    );
    
    // If user is attempting to change password, check password validations
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      // At least one password field has content
      return requiredFieldsValid && 
             validation.newPassword.valid && 
             validation.confirmPassword.valid &&
             // If setting new password, current password must be provided
             (formData.newPassword === '' || (formData.currentPassword !== ''));
    }
    
    // If not changing password, only check required fields
    return requiredFieldsValid;
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          Edit Personal Details
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 border-l-4 border-red-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-6 pt-2">
          <div className="relative group">
            {profileImagePreview ? (
              <div className="h-24 w-24 rounded-full overflow-hidden">
                <img 
                  src={profileImagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              userData?.profilePic ? (
                <ProfileImage 
                  profilePicPath={userData.profilePic}
                  size="xlarge"
                  className="border-2 border-blue-200"
                />
              ) : (
                <div className="h-24 w-24 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {userData?.username ? userData.username[0].toUpperCase() : 'U'}
                  </span>
                </div>
              )
            )}
            
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Change profile picture"
            >
              <FaCamera size={14} />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="profile-image-upload"
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">Click the camera icon to change your profile picture</p>
        </div>

        {/* Account Information */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <FaEnvelope className="text-blue-600 mr-2" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full border ${
                  !validation.username.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="johndoe"
              />
              {!validation.username.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.username.message}</p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border ${
                  !validation.email.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="john@example.com"
              />
              {!validation.email.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <FaLock className="text-blue-600 mr-2" />
            Change Password (Optional)
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your current password"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full border ${
                    !validation.newPassword.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Enter new password"
                />
                {!validation.newPassword.valid && (
                  <p className="mt-1 text-sm text-red-600">{validation.newPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full border ${
                    !validation.confirmPassword.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Confirm new password"
                />
                {!validation.confirmPassword.valid && (
                  <p className="mt-1 text-sm text-red-600">{validation.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
              <p className="font-medium mb-1">Password requirements:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>At least 8 characters long</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number or special character</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 border-t pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`px-4 py-2 flex items-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFormValid() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Details
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditUserDetails;