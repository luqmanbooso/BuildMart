import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPhone, FaAt, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../assets/images/buildmart_logo1.png';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: '',
  });

  const [chatOpen, setChatOpen] = useState(false);  // Chatbot modal open/close state
  const [messages, setMessages] = useState([]);  // Chatbot message state
  const [input, setInput] = useState('');  // Input state for the chatbot

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submission:', formData);
  };

  const handleChatToggle = () => setChatOpen(!chatOpen);  // Toggle the chat modal
  const handleInputChange = (e) => setInput(e.target.value);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // User's message
    const userMessage = input.trim();
    setMessages([...messages, { sender: 'user', message: userMessage }]);

    // Simulate bot reply
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', message: `You said: ${userMessage}` }
      ]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="BuildMart" className="h-12 transition-transform transform hover:scale-105" />
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-900 transition">Home</Link>
            <Link to="/auction" className="text-gray-700 hover:text-blue-900 transition">Auction</Link>
            <Link to="/about-us" className="text-gray-700 hover:text-blue-900 transition">About Us</Link>
            <Link to="/contact-us" className="text-blue-900 font-medium hover:text-blue-600 transition">Contact Us</Link>
          </div>
        </div>
      </nav>

      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-500 via-blue-700 to-blue-900 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl text-white font-bold tracking-tight leading-tight">
          Get in Touch with Us
        </h1>
        <p className="text-lg text-white mt-4 max-w-xl mx-auto">
          We are here to assist you with your needs. Drop us a message, and we'll get back to you as soon as possible.
        </p>
      </div>

      {/* Contact Form Section */}
      <div className="flex-grow bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-xl p-8 space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800 text-center">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="username" className="text-lg font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-4 mt-2 border-b border-gray-300 focus:outline-none focus:border-blue-900 bg-gray-50 shadow-sm rounded-md"
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="email" className="text-lg font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 mt-2 border-b border-gray-300 focus:outline-none focus:border-blue-900 bg-gray-50 shadow-sm rounded-md"
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="description" className="text-lg font-medium text-gray-700">Your Message</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full p-4 mt-2 border-b border-gray-300 focus:outline-none focus:border-blue-900 bg-gray-50 shadow-sm rounded-md resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg transform hover:scale-105 transition"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Chatbot Button */}
      <button
        onClick={handleChatToggle}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        <FaComments size={24} />
      </button>

      {/* Chatbot Modal */}
      {chatOpen && (
        <div className="fixed bottom-16 right-8 w-80 bg-white shadow-xl rounded-lg p-4 z-50">
          <div className="h-80 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.sender === 'user' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              className="w-full border rounded-l-md p-3"
              placeholder="Ask me anything..."
            />
            <button
              type="submit"
              className="bg-blue-900 text-white px-4 rounded-r-md"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10">
        <div className="container mx-auto px-6">
          <div className="flex justify-between">
            <div className="w-1/3">
              <img src="/buildmart-logo-white.png" alt="BuildMart" className="h-12" />
              <p className="mt-4 text-sm text-gray-300">
                Your trusted platform for top-rated contractors and architects. Compare, connect, and build smarter!
              </p>
            </div>
            <div className="w-1/3 text-center">
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about-us" className="hover:underline">About Us</Link></li>
                <li><Link to="/signup" className="hover:underline">Register to bid</Link></li>
                <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              </ul>
            </div>
            <div className="w-1/3 text-center">
              <h3 className="text-lg font-medium mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-4">
                <a href="https://facebook.com" className="text-white hover:text-blue-300"><FaFacebookF size={20} /></a>
                <a href="https://twitter.com" className="text-white hover:text-blue-300"><FaTwitter size={20} /></a>
                <a href="https://instagram.com" className="text-white hover:text-blue-300"><FaInstagram size={20} /></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
