import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For password visibility toggle
import { motion } from "framer-motion"; // For animations
import logo from '../assets/images/buildmart_logo1.png'; 
import axios from 'axios'; // Importing Axios for API requests
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // FIXED: Use named import with curly braces

const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Client"); // Default role is 'Client'
  const [profilePic, setProfilePic] = useState(null); // State to hold the profile picture
  const [profilePreview, setProfilePreview] = useState(null); // New state for preview only
  const [username, setUsername] = useState(""); // State for username
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [errorMessage, setErrorMessage] = useState(""); // State to handle error messages
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false); // Add this state to track form submission attempts

  // Handle file input change (profile picture upload)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file object itself for uploading
      setProfilePic(file);
      
      // For preview purposes only
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result); // New state for preview only
      };
      reader.readAsDataURL(file);
    }
  };

  const navigate = useNavigate();

  // Update the validateForm function for consistent password validation
  const validateForm = () => {
    // Trigger all validations explicitly
    const isUsernameValid = validateUsername(true);
    const isEmailValid = validateEmail(true);
    const isPasswordValid = validatePassword(true);
    const isConfirmPasswordValid = validateConfirmPassword(true);
    
    // Optional: validate profile picture
    let isProfilePicValid = true;
    if (profilePic) {
      // Check file size (max 5MB)
      if (profilePic.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePic: 'Profile picture must be less than 5MB'
        }));
        isProfilePicValid = false;
      }
      
      // Check file type
      const fileType = profilePic.type;
      if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setErrors(prev => ({
          ...prev,
          profilePic: 'File must be an image (JPG, PNG, or GIF)'
        }));
        isProfilePicValid = false;
      }
    }
    
    return isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isProfilePicValid;
  };

  // Update each validation function to consider the attemptedSubmit state

  const validateUsername = (showError = attemptedSubmit) => {
    if (username.trim().length < 3) {
      if (showError) {
        setErrors(prev => ({
          ...prev,
          username: 'Username must be at least 3 characters'
        }));
      }
      return false;
    } else {
      setErrors(prev => ({ ...prev, username: '' }));
      return true;
    }
  };

  const validateEmail = (showError = attemptedSubmit) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (showError) {
        setErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
      return false;
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
      return true;
    }
  };

  // First, let's fix the password validation function
  const validatePassword = (showError = attemptedSubmit) => {
    // Simplified password regex that just requires 8+ chars with at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    
    if (!password) {
      if (showError) {
        setErrors(prev => ({
          ...prev,
          password: 'Password is required'
        }));
      }
      return false;
    } else if (!passwordRegex.test(password)) {
      if (showError) {
        setErrors(prev => ({
          ...prev,
          password: 'Password must be at least 8 characters with at least one letter and one number'
        }));
      }
      return false;
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
      return true;
    }
  };

  // Update the confirm password validation function
  const validateConfirmPassword = (showError = attemptedSubmit) => {
    if (!confirmPassword) {
      if (showError) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Please confirm your password'
        }));
      }
      return false;
    } else if (password !== confirmPassword) {
      if (showError) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
      return false;
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
      return true;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark that the user has attempted to submit the form
    setAttemptedSubmit(true);
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to the first error if validation fails
      const firstErrorElement = document.querySelector('.text-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', selectedRole);
    
    // Append the actual file object, not a data URL
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }

    try {
      // Make the POST request to the backend
      const response = await axios.post('http://localhost:5000/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

            // console.log(response)
            const token = response.data.token || 
            (response.data.user && response.data.user.token) || 
            response.data.accessToken;

            localStorage.setItem('token', token);
            console.log('Token saved, verification:', localStorage.getItem('token'));
      
      // Decode the token to get user role from the actual token
      const decoded = jwtDecode(token);
      const userRole = decoded.role;
      
      console.log('User registered as:', userRole); // Debug log

      // After successful signup but before navigation:
      if (userRole === "Service Provider") {
        // For contractors, set a flag in localStorage
        localStorage.setItem('contractorProfileComplete', 'false');
        navigate('/contractorStart');
      } else {
        // For regular clients, no additional profile is needed
        navigate('/');
      }


      // Reset form fields
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setProfilePic(null);
      setSelectedRole('Client');
      
    } catch (error) {
      // Handle error
      console.error('Error during signup:', error.response ? error.response.data : error.message);
      setErrorMessage(error.response?.data?.message || 'Signup failed! Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#002855] to-[#0057B7]">
      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex max-w-7xl w-full shadow-2xl rounded-3xl overflow-hidden bg-white"
        >
          {/* Left Side - Sign Up Form */}
          <div className="w-full md:w-1/2 p-12 space-y-8">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Sign Up
            </motion.h1>
            <form onSubmit={handleSubmit}>
              {attemptedSubmit && (errors.username || errors.email || errors.password || errors.confirmPassword) && (
                <div className="p-3 border border-red-300 bg-red-50 text-red-700 rounded-md mb-6 animate-fadeIn">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    {errors.username && <li>{errors.username}</li>}
                    {errors.email && <li>{errors.email}</li>}
                    {errors.password && <li>{errors.password}</li>}
                    {errors.confirmPassword && <li>{errors.confirmPassword}</li>}
                    {errors.profilePic && <li>{errors.profilePic}</li>}
                  </ul>
                </div>
              )}
              {errorMessage && (
                <div className="text-red-500 mb-4">{errorMessage}</div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (attemptedSubmit) validateUsername(true);
                  }}
                  onBlur={() => validateUsername(true)}
                  className={`w-full px-4 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md`}
                  placeholder="Enter username"
                  required
                />
                {errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Register as
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("Client")}
                    className={`px-6 py-3 rounded-lg ${selectedRole === "Client" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
                  >
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("Service Provider")}
                    className={`px-6 py-3 rounded-lg ${selectedRole === "Service Provider" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
                  >
                    Service Provider
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (attemptedSubmit) validateEmail(true);
                  }}
                  onBlur={() => validateEmail(true)}
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md`}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      // Update the password state
                      setPassword(e.target.value);
                      
                      // Perform live validation if user has attempted to submit once already
                      // or if the field has been focused and then changed
                      if (attemptedSubmit || e.target.dataset.focused === "true") {
                        validatePassword(true);
                        // Also update confirm password validation if it's not empty
                        if (confirmPassword) {
                          validateConfirmPassword(true);
                        }
                      }
                    }}
                    onFocus={(e) => {
                      // Mark the field as having been focused
                      e.target.dataset.focused = "true";
                    }}
                    onBlur={(e) => {
                      // Validate on blur unconditionally
                      validatePassword(true);
                    }}
                    className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md`}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition-all duration-300"
                  >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {errors.password}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // Perform live validation if user has attempted to submit once already
                      // or if the field has been focused and then changed
                      if (attemptedSubmit || e.target.dataset.focused === "true") {
                        validateConfirmPassword(true);
                      }
                    }}
                    onFocus={(e) => {
                      // Mark the field as having been focused
                      e.target.dataset.focused = "true";
                    }}
                    onBlur={(e) => {
                      // Validate on blur unconditionally
                      validateConfirmPassword(true);
                    }}
                    className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md`}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition-all duration-300"
                  >
                    {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {errors.confirmPassword}
                  </div>
                )}
              </motion.div>

              {/* Update the submit button to show validation status */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                type="submit"
                className={`w-full py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-xl ${
                  attemptedSubmit && (errors.username || errors.email || errors.password || errors.confirmPassword)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#002855] hover:bg-blue-700 text-white'
                }`}
              >
                {attemptedSubmit && (errors.username || errors.email || errors.password || errors.confirmPassword)
                  ? 'Please Fix Validation Errors'
                  : 'Register'}
              </motion.button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-500 hover:underline transition-all duration-300">
                    Sign In
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Profile Image Upload */}
          <div className="hidden md:flex w-1/2 text-white p-12 flex-col justify-center items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-24 h-24 bg-blue-950 rounded-full flex justify-center items-center"
            >
              {/* Display Profile Picture if available */}
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full flex justify-center items-center text-xl text-white">
                  +
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <img src="https://img.icons8.com/ios/50/000000/upload.png" alt="Upload" width={"20px"} />
              </label>
            </motion.div>
            {errors.profilePic && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-2 text-center"
              >
                {errors.profilePic}
              </motion.p>
            )}

            {/* Logo below Profile Picture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-26"
            >
              <img
                src={logo} 
                alt="Site Logo"
                className="w-82 h-auto" 
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center">
        <div className="flex justify-center space-x-8">
          <a href="#" className="text-white hover:underline transition-all duration-300">
            About Us
          </a>
          <a href="#" className="text-white hover:underline transition-all duration-300">
            Register to bid
          </a>
          <a href="#" className="text-white hover:underline transition-all duration-300">
            Terms & Conditions
          </a>
          <a href="#" className="text-white hover:underline transition-all duration-300">
            Privacy Policy
          </a>
        </div>
        <p className="mt-4 text-xs">© 2025 BuildMart. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignUp;
