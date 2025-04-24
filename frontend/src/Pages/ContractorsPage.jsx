import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaPhone, FaMapMarkerAlt, FaBriefcase, FaTools, FaTimes, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contractor Details Modal Component
const ContractorDetailsModal = ({ contractor, onClose }) => {
  const username = contractor.userId?.username || 'Unknown Contractor';
  const profilePic = contractor.userId?.profilePic 
    ? contractor.userId.profilePic.startsWith('http') 
      ? contractor.userId.profilePic 
      : `http://localhost:5000${contractor.userId.profilePic}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt={username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = null;
                      e.target.parentElement.classList.add('bg-gradient-to-r', 'from-blue-400', 'to-blue-600');
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-3xl">${username.charAt(0).toUpperCase()}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{username}</h2>
                {contractor.companyName && (
                  <p className="text-lg text-gray-600">{contractor.companyName}</p>
                )}
                <div className="flex items-center mt-2">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="text-gray-700">4.8 (120 reviews)</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Verification Badge */}
          {contractor.verified && (
            <div className="flex items-center text-green-600 mb-6">
              <FaCheckCircle className="mr-2" />
              <span className="font-medium">Verified Contractor</span>
            </div>
          )}

          {/* Specializations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {contractor.specialization?.map((spec, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <FaPhone className="mr-3" />
                <span>{contractor.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaEnvelope className="mr-3" />
                <span>{contractor.userId?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-3" />
                <span>{contractor.address || 'Location not specified'}</span>
              </div>
            </div>
          </div>

          {/* Experience and Projects */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <FaBriefcase className="mr-3" />
                <span>{contractor.experienceYears || 0} years of experience</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaTools className="mr-3" />
                <span>{contractor.completedProjects || 0} projects completed</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {contractor.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{contractor.bio}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => toast.info('Contact functionality coming soon!')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Contractor Card Component
const ContractorCard = ({ contractor }) => {
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = () => {
    setShowModal(true);
  };

  // Get username from userId if available
  const username = contractor.userId?.username || 'Unknown Contractor';
  const profilePic = contractor.userId?.profilePic 
    ? contractor.userId.profilePic.startsWith('http') 
      ? contractor.userId.profilePic 
      : `http://localhost:5000${contractor.userId.profilePic}`
    : null;

  return (
    <>
      <motion.div 
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-blue-200 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ 
          y: -5,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="p-5">
          <div className="flex items-start space-x-4">
            {/* Profile Image */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = null;
                    e.target.parentElement.classList.add('bg-gradient-to-r', 'from-blue-400', 'to-blue-600');
                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-2xl">${username.charAt(0).toUpperCase()}</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Contractor Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{username}</h3>
              {contractor.companyName && (
                <p className="text-sm text-gray-600">{contractor.companyName}</p>
              )}
              <div className="flex items-center mt-1">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-sm text-gray-700">4.8 (120 reviews)</span>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {contractor.specialization?.map((spec, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <FaMapMarkerAlt className="mr-2" />
              <span>{contractor.address || 'Location not specified'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaBriefcase className="mr-2" />
              <span>{contractor.experienceYears || 0} years experience</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaTools className="mr-2" />
              <span>{contractor.completedProjects || 0} projects completed</span>
            </div>
          </div>

          {/* Bio Preview */}
          {contractor.bio && (
            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {contractor.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between space-x-4">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => toast.info('Contact functionality coming soon!')}
              className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Contact Now
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ContractorDetailsModal
            contractor={contractor}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const ContractorsPage = () => {
  const [contractors, setContractors] = useState([]);
  const [filteredContractors, setFilteredContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  // Available specializations and locations
  const specializations = [
    'All',
    'Electrical',
    'Plumbing',
    'Roofing',
    'Carpentry',
    'Masonry',
    'Painting',
    'Flooring',
    'Landscaping',
    'Interior Design'
  ];

  const locations = [
    'All',
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Galle',
    'Matara',
    'Jaffna',
    'Anuradhapura',
    'Kurunegala'
  ];

  // Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/contractors');
        setContractors(response.data);
        setFilteredContractors(response.data);
      } catch (error) {
        console.error('Error fetching contractors:', error);
        toast.error('Failed to load contractors');
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...contractors];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(contractor => 
        contractor.username.toLowerCase().includes(query) ||
        (contractor.companyName && contractor.companyName.toLowerCase().includes(query)) ||
        contractor.address.toLowerCase().includes(query) ||
        (contractor.bio && contractor.bio.toLowerCase().includes(query))
      );
    }

    // Apply specialization filter
    if (selectedSpecialization !== 'All') {
      result = result.filter(contractor => 
        contractor.specialization.includes(selectedSpecialization)
      );
    }

    // Apply location filter
    if (selectedLocation !== 'All') {
      result = result.filter(contractor => 
        contractor.address.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Apply sorting
    switch(sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        result.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      case 'projects':
        result.sort((a, b) => b.completedProjects - a.completedProjects);
        break;
      default:
        break;
    }

    setFilteredContractors(result);
  }, [contractors, searchQuery, selectedSpecialization, selectedLocation, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Professional Contractors</h1>
          <p className="text-xl text-blue-100">
            Browse through our verified contractors and find the perfect match for your project
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, company, or location"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="projects">Projects Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-5 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredContractors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map(contractor => (
              <ContractorCard key={contractor._id} contractor={contractor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">No contractors found</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorsPage; 