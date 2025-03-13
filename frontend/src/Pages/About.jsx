import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import logo from '../assets/images/buildmart_logo1.png';
import left_img from '../assets/images/signin_pic.png';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Navigation */}
      <nav className="bg-white py-4 px-8 flex justify-between items-center shadow-xl">
        <div className="flex items-center space-x-6">
          <img src={logo} alt="BuildMart Logo" className="h-12" />
          <span className="text-3xl font-bold text-blue-900">BuildMart</span>
        </div>
        <div className="hidden md:flex space-x-10 text-lg font-medium text-gray-700">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <a href="/auction" className="hover:text-blue-600 transition-colors">Auction</a>
          <a href="/about" className="text-blue-600">About Us</a>
          <a href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
        </div>
        <div className="flex items-center space-x-6">
          <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-all">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 py-36">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-wide">ABOUT US</h1>
          <p className="mt-4 text-xl md:text-2xl font-light opacity-90">
            Learn more about how BuildMart simplifies the building process by connecting you with trusted professionals.
          </p>
        </div>
      </div>

      {/* About Content */}
      <div className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-xl hover:scale-105 transform transition duration-500 ease-in-out">
              <img src={logo} alt="BuildMart Logo" className="h-80 w-auto object-contain" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At BuildMart, we connect homeowners and businesses with top-rated contractors and architects. Our platform allows you to easily compare bids, communicate directly with professionals, and manage your payments securely with our built-in escrow system.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're planning a small renovation or a large construction project, BuildMart ensures you have access to the best talent in the industry.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800">Efficient Project Management</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                With BuildMart, you can easily track the progress of your project, from initial consultation to final completion. We offer project management tools that streamline communication between you and your contractors, ensuring timely delivery and quality results.
              </p>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transform transition duration-500 ease-in-out">
              <img src={left_img} alt="Service Illustration" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 w-1/3 bg-white opacity-80 p-4 rounded-lg shadow-md">
                <p className="text-sm text-gray-600">Streamline your building process with BuildMart</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-auto py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16">
            <div>
              <img src="/buildmart-logo-white.png" alt="BuildMart Logo" className="h-16 mb-4" />
              <p className="text-lg">
                BuildMart is your go-to platform for finding the best contractors and architects. Compare bids, track project progress, and ensure secure payments with our built-in escrow system. Build smarter, faster, and hassle-free.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="hover:text-blue-300 transition-colors">About Us</a></li>
                <li><a href="/register" className="hover:text-blue-300 transition-colors">Register to Bid</a></li>
                <li><a href="/contact" className="hover:text-blue-300 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/terms" className="hover:text-blue-300 transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-blue-300 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2025 BuildMart. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-300">
                <FaFacebookF className="text-xl" />
              </a>
              <a href="#" className="hover:text-blue-300">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="hover:text-blue-300">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AboutPage;
