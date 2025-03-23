import React, { useState, useEffect, useRef } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPhone, FaMapMarkerAlt, FaAt, FaComments, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ClientNavBar from '../components/ClientNavBar';
import ContractorUserNav from '../components/ContractorUserNav';
import Footer from '../components/Footer'; // Import the Footer component

const ContactUs = () => {
  // Add auth state
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Existing state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: '',
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', message: "Hello! I'm BuildMart AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const chatEndRef = useRef(null);

  // Add authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setIsAuthenticated(true);
          setUserRole(decoded.role);
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

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would typically send the form data to your backend
      // await axios.post('http://localhost:5000/api/contact', formData);
      
      // Show success message
      setFormSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          username: '',
          email: '',
          description: '',
        });
        setFormSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChatToggle = () => setChatOpen(!chatOpen);
  
  const handleInputChange = (e) => setInput(e.target.value);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isSending) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', message: userMessage }]);
    setInput('');
    setIsSending(true);

    try {
      // Send request to Python backend
      const response = await axios.post('http://localhost:5000/api/chatbot', {
        message: userMessage
      });
      
      // Add bot response to chat
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          message: response.data.response || "I'm sorry, I couldn't process that request."
        }]);
        setIsSending(false);
      }, 600);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Fallback response if API fails
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          message: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later."
        }]);
        setIsSending(false);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      {/* Use the same conditional navbar as Home component */}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label htmlFor="username" className="text-sm font-medium text-gray-700 block mb-2">Your Name</label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-colors bg-white shadow-sm"
                            required
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div className="relative">
                          <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-colors bg-white shadow-sm"
                            required
                            placeholder="john@example.com"
                          />
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

        {/* Map Section */}
        <div className="w-full h-96 bg-gray-200 relative">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.82624954921!2d79.82118336632216!3d6.921922517948811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1689842276536!5m2!1sen!2slk"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="BuildMart Office Location"
          ></iframe>
        </div>

        {/* Add Footer component here */}
        <Footer />
      </div>

      {/* Chatbot Button - keep outside the pt-[72px] div for proper fixed positioning */}
      <motion.button
        onClick={handleChatToggle}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        {chatOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
      </motion.button>

      {/* Chatbot Modal - keep this part */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            className="fixed bottom-24 right-8 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-full">
                  <FaComments className="text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">BuildMart AI Assistant</h3>
                  <p className="text-xs text-blue-100">Online | Typically replies instantly</p>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
              
              {isSending && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none shadow-md flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200">
              <div className="flex p-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                />
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 rounded-r-full"
                  whileTap={{ scale: 0.95 }}
                  disabled={isSending}
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;
