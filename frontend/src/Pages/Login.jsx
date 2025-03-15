import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For password visibility toggle
import { motion } from "framer-motion"; // For animations
import signin_img from '../assets/images/signin_pic.png';
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For redirection after login

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailUsername, setEmailUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!emailUsername || !password) {
      setError("All fields are required");
      return;
    }
    
    console.log("Sending request with:", { emailUsername, password }); // Debugging

    setLoading(true);
    setError("");
    
    try {
      // The correct way is to send credentials to backend for verification
      const response = await axios.post('http://localhost:5000/auth/login', {
        emailUsername,
        password
      });
      
      const token = response.data.token;

    // Store token in localStorage or sessionStorage
    localStorage.setItem('token', token);
      
      // Redirect to dashboard or home
      navigate('/');
      
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          setError("Invalid username/email or password");
        } else if (error.response.status === 404) {
          setError("User not found");
        } else {
          setError("Login failed: " + (error.response.data.message || "Please try again"));
        }
      } else if (error.request) {
        // No response received
        setError("No response from server. Please check your connection.");
      } else {
        // Something else happened
        setError("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
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
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 p-12 space-y-8 mt-15">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Sign In
            </motion.h1>
            
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Username or email address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                  placeholder="Enter username or email"
                  value={emailUsername}
                  onChange={(e) => setEmailUsername(e.target.value)}
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
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="w-4 h-4 mr-2 rounded focus:ring-blue-500 transition-all duration-300"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">Remember me</label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:underline transition-all duration-300"
                >
                  Lost your password?
                </a>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                type="submit"
                className="w-full bg-[#002855] text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-xl"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </motion.button>

              {/* Don't have an account? Sign Up link */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-blue-500 hover:underline transition-all duration-300">
                    Sign Up
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Graphic Banner */}
          <div className="hidden md:flex text-white p-0 flex-col justify-center space-y-1">
            <img src={signin_img} alt="construction" />
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

export default Login;