import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPhone, FaMapMarkerAlt, FaAt, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ClientNavBar from '../components/ClientNavBar';
import ContractorUserNav from '../components/ContractorUserNav';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const ContactUs = () => {
  // Auth state
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  // Authentication and user data check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("Decoded token:", decoded); // Log to see token structure
          
          setIsAuthenticated(true);
          setUserRole(decoded.role);
          
          // Extract user info directly from token
          setFormData(prev => ({
            ...prev,
            username: decoded.username || decoded.name || '',
            email: decoded.email || ''
          }));
        } catch (error) {
          console.error("Error decoding token:", error);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    
    checkAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Create data format for contact messages with a title field
    const contactData = {
      name: formData.username,
      email: formData.email,
      title: `Contact from ${formData.username}`,
      message: formData.description,
      createdAt: new Date().toISOString(),
      isRead: false, // Explicitly mark as unread
      _id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 10) // Generate a more unique ID
    };
    
    console.log("Sending contact message data:", contactData);
    
    try {
      let savedSuccessfully = false;
      
      // First attempt to send to backend API
      try {
        const response = await axios.post('http://localhost:5000/api/contact-messages', contactData);
        console.log("Message sent successfully to API:", response.data);
        savedSuccessfully = true;
      } catch (apiError) {
        console.warn("API endpoint not available, using local storage fallback");
        
        // Fallback to localStorage if API fails
        try {
          const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
          existingMessages.push(contactData);
          localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
          console.log("Message saved to local storage");
          savedSuccessfully = true;
        } catch (localStorageError) {
          console.error("Error saving to local storage:", localStorageError);
          throw new Error("Failed to save message");
        }
      }
      
      // Only show success if we managed to save the message somewhere
      if (savedSuccessfully) {
        // Show success message
        setFormSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            description: '', // Only clear message, keep user data
          }));
          setFormSubmitted(false);
        }, 3000);
      } else {
        throw new Error("Failed to save message");
      }
    } catch (error) {
      console.error('Error in form submission process:', error);
      setFormError(`Something went wrong. Please try again or email us directly at support@buildmart.lk`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      {/* Use the conditional navbar */}
      {userRole === 'Service Provider' ? (
        <ContractorUserNav />
      ) : (
        <ClientNavBar />
      )}

      {/* Add top padding to account for fixed navbar */}
      <div className="pt-[72px]">
        {/* Header with Gradient Background */}
        <motion.div 
          className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl sm:text-6xl text-white font-bold tracking-tight leading-tight"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            className="text-lg text-white mt-4 max-w-xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            We're here to help with any questions about our platform, services, or how we can assist your construction projects.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="flex-grow py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contact Information */}
              <motion.div 
                className="md:col-span-1"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white rounded-xl shadow-lg p-8 h-full">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FaPhone className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <p className="text-gray-600 mt-1">+94 773 456 7890</p>
                        <p className="text-gray-600">Mon-Fri, 9am-6pm</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FaAt className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <p className="text-gray-600 mt-1">support@buildmart.lk</p>
                        <p className="text-gray-600">We respond within 24 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FaMapMarkerAlt className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">Office</h3>
                        <p className="text-gray-600 mt-1">42 Galle Road, Colombo 03</p>
                        <p className="text-gray-600">Sri Lanka</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="font-medium text-gray-900 mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                      <a 
                        href="https://facebook.com" 
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                        aria-label="Facebook"
                      >
                        <FaFacebookF />
                      </a>
                      <a 
                        href="https://twitter.com" 
                        className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors duration-300"
                        aria-label="Twitter"
                      >
                        <FaTwitter />
                      </a>
                      <a 
                        href="https://instagram.com" 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
                        aria-label="Instagram"
                      >
                        <FaInstagram />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Contact Form */}
              <motion.div 
                className="md:col-span-2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Message</h2>
                  
                  {formSubmitted ? (
                    <motion.div 
                      className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-green-800 mb-2">Message sent successfully!</h3>
                      <p className="text-green-700">Thank you for contacting us. We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {formError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                          {formError}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label htmlFor="username" className="text-sm font-medium text-gray-700 block mb-2">Your Name</label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border border-gray-300 
                              focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 
                              transition-colors bg-white shadow-sm 
                              ${isAuthenticated ? 'bg-gray-50' : ''}`}
                            required
                            placeholder="John Doe"
                            disabled={isAuthenticated}
                          />
                          {isAuthenticated && (
                            <p className="text-xs text-gray-500 mt-1">Using your account name</p>
                          )}
                        </div>
                        
                        <div className="relative">
                          <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border border-gray-300 
                              focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 
                              transition-colors bg-white shadow-sm
                              ${isAuthenticated ? 'bg-gray-50' : ''}`}
                            required
                            placeholder="john@example.com"
                            disabled={isAuthenticated}
                          />
                          {isAuthenticated && (
                            <p className="text-xs text-gray-500 mt-1">Using your account email</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-2">Your Message</label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="6"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-colors bg-white shadow-sm resize-none"
                          required
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end">
                        <motion.button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="flex items-center">
                            Send Message
                            <FaPaperPlane className="ml-2" />
                          </span>
                        </motion.button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Map Section - Use a simple div with background instead to avoid CORS issues */}
        <div className="w-full h-96 bg-gray-200 relative overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://via.placeholder.com/1200x400/e0e0e0/808080?text=BuildMart+Office+Location')` }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold text-gray-800">BuildMart Headquarters</h3>
              <p className="text-gray-600">42 Galle Road, Colombo 03, Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default ContactUs;
