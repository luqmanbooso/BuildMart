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
  const [username, setUsername] = useState(""); // State for username
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [errorMessage, setErrorMessage] = useState(""); // State to handle error messages

  // Handle file input change (profile picture upload)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result); // Set the uploaded image as the profile picture
      };
      reader.readAsDataURL(file);
    }
  };

  const navigate = useNavigate();


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', selectedRole);
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

      // Navigate based on role from token, not from form selection
      if (userRole === "Service Provider") {
        navigate('/contractorStart');
      } else {
        // Default to home for Client role
        navigate('/');
      }

      // Success message
      alert('Signup successful!');

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
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                  placeholder="Enter username"
                  required
                />
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                  placeholder="Enter email address"
                  required
                />
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
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
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                type="submit"
                className="w-full bg-[#002855] text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-xl"
              >
                Register
              </motion.button>
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
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-full" />
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
