import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaPhoneAlt, FaMapMarkerAlt, FaBriefcase, FaTools, FaAward, 
         FaEdit, FaCheck, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ContractorProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  const [formData, setFormData] = useState({
    phone: '',
    address: '', // This will now hold the selected district
    companyName: '',
    specialization: [],
    experienceYears: 0,
    completedProjects: 0,
    bio: ''
  });

  const SPECIALIZATIONS = [
    'Electrical', 'Plumbing',
    'Roofing', 'Carpentry', 'Masonry', 'Painting',
    'Flooring', 'Landscaping', 'Interior Design',

  ];

  const SRI_LANKA_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
    'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ];

  const sections = [
    { name: 'Contact', icon: <FaPhoneAlt /> },
    { name: 'Business', icon: <FaBriefcase /> },
    { name: 'Specializations', icon: <FaTools /> },
    { name: 'Bio', icon: <FaEdit /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSpecializationChange = (specialization) => {
    if (formData.specialization.includes(specialization)) {
      setFormData({
        ...formData,
        specialization: formData.specialization.filter(spec => spec !== specialization)
      });
    } else if (formData.specialization.length < 5) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, specialization]
      });
    } else {
      toast.warning('You can select up to 5 specializations');
    }
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };

  // Real-time field validation functions
const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 10 || digits.length > 12) {
    return { 
      valid: false, 
      message: 'Phone number should be 10-12 digits' 
    };
  }
  return { valid: true, message: '' };
};

const validateAddress = (address) => {
  if (!address) return { valid: false, message: 'Please select a district' };
  return { valid: true, message: '' };
};

const validateBio = (bio) => {
  if (!bio) return { valid: false, message: 'Bio is required' };
  if (bio.trim().length < 50) {
    return { 
      valid: false, 
      message: 'Bio should be at least 50 characters' 
    };
  }
  if (bio.length > 500) {
    return { 
      valid: false, 
      message: 'Bio should not exceed 500 characters' 
    };
  }
  return { valid: true, message: '' };
};

  const validateForm = () => {
    // Phone validation - should be a valid format
    if (!formData.phone) {
      toast.error('Phone number is required');
      setActiveSection(0);
      return false;
    }
    
    // Phone format validation - check for at least 10 digits
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      toast.error('Phone number should contain 10-12 digits');
      setActiveSection(0);
      return false;
    }
  
    // Address validation - minimum length
    if (!formData.address) {
      toast.error('Please select a district');
      setActiveSection(0);
      return false;
    }
  
    // Company name validation (if provided)
    if (formData.companyName && formData.companyName.trim().length < 2) {
      toast.error('Company name should be at least 2 characters');
      setActiveSection(1);
      return false;
    }
  
    // Experience years validation
    if (formData.experienceYears < 0) {
      toast.error('Experience years cannot be negative');
      setActiveSection(1);
      return false;
    }
  
    // Completed projects validation
    if (formData.completedProjects < 0) {
      toast.error('Completed projects cannot be negative');
      setActiveSection(1);
      return false;
    }
  
    // Specialization validation
    if (formData.specialization.length === 0) {
      toast.error('Please select at least one specialization');
      setActiveSection(2);
      return false;
    }
  
    // Bio validation - minimum and maximum length
    if (!formData.bio || formData.bio.trim().length < 50) {
      toast.error('Please provide a detailed bio (at least 50 characters)');
      setActiveSection(3);
      return false;
    }
  
    if (formData.bio.length > 500) {
      toast.error('Bio is too long (maximum 500 characters)');
      setActiveSection(3);
      return false;
    }
  
    return true;
  };

// Add these validation functions near your other validation functions

// Section validation functions
const isSection0Valid = () => {
  return validatePhone(formData.phone).valid && formData.address !== '';
};

const isSection1Valid = () => {
  // Company name is optional but if provided should be valid
  const isCompanyNameValid = !formData.companyName || formData.companyName.trim().length >= 2;
  // Experience and projects should not be negative
  return isCompanyNameValid && formData.experienceYears >= 0 && formData.completedProjects >= 0;
};

const isSection2Valid = () => {
  return formData.specialization.length > 0;
};

const isSection3Valid = () => {
  return validateBio(formData.bio).valid;
};

// Update the handleSubmit function to properly handle the token

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  try {
    // Get auth token from localStorage or sessionStorage
      // Debug localStorage contents
      console.log('All localStorage keys:');
      for (let i = 0; i < localStorage.length; i++) {
        console.log(`- ${localStorage.key(i)}`);
      }
      
      // Get auth token from localStorage with better error handling
      const token = localStorage.getItem('token');
      console.log('Token retrieved:', token ? 'Yes (length: ' + token.length + ')' : 'No token found');
      
    if (!token) {
      toast.error('Authentication required. Please login again.');
      navigate('/login');
      return;
    }

    // If you're using jwtDecode, make sure to handle potential errors
    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId || decoded._id || decoded.id;
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
    } catch (tokenError) {
      console.error('Token decoding error:', tokenError);
      toast.error('Authentication error. Please login again.');
      navigate('/login');
      return;
    }

    // Now make the API request with the user ID
    const response = await axios.post('http://localhost:5000/api/contractors/', {
      ...formData,
      userId
    });

    toast.success('Profile created successfully!');
    navigate('/');
  } catch (error) {
    console.error('Error creating profile:', error);
    
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('An error occurred while creating your profile');
    }
  } finally {
    setLoading(false);
  }
};

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center relative">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Set Up Your Contractor Profile
            </motion.h1>
            <motion.p 
              className="mt-2 opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Complete your profile to start receiving project opportunities
            </motion.p>
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-8">
              {sections.map((section, index) => (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center mx-4 cursor-pointer"
                  onClick={() => setActiveSection(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-1
                    ${index <= activeSection ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}
                    transition-all duration-300
                  `}>
                    {index < activeSection ? <FaCheck /> : section.icon}
                  </div>
                  <span className="text-xs">{section.name}</span>
                  {index < sections.length - 1 && (
                    <div className={`h-0.5 w-8 absolute ${index < activeSection ? 'bg-white' : 'bg-blue-400'}`} 
                      style={{ left: `calc(50% + ${(index - sections.length/2 + 0.5) * 72}px)`, top: '51%' }}></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Section container with fixed height */}
            <div className="relative min-h-[450px]">
              <AnimatePresence mode="wait">
                {/* Contact Information */}
                {activeSection === 0 && (
                  <motion.div 
                    key="contact"
                    className="bg-white p-6 rounded-lg border border-blue-300 shadow-md absolute w-full"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.3 }}
                  >
                    <motion.h2 
                      className="text-xl font-semibold text-gray-800 mb-4 flex items-center"
                      variants={itemVariants}
                    >
                      <FaPhoneAlt className="text-blue-600 mr-2" />
                      Contact Information
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full border ${
                            formData.phone && !validatePhone(formData.phone).valid
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          } rounded-md px-4 py-2 
                            focus:outline-none focus:ring-2 focus:border-transparent
                            transition-all duration-200`}
                          placeholder="e.g. 0771234567"
                          required
                        />
                        {formData.phone && !validatePhone(formData.phone).valid && (
                          <p className="text-sm text-red-500 mt-1">
                            {validatePhone(formData.phone).message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
                          District <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200"
                          required
                        >
                          <option value="">Select your district</option>
                          {SRI_LANKA_DISTRICTS.map(district => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                        <motion.p 
                          className="text-xs text-gray-500 mt-1"
                          variants={itemVariants}
                        >
                          <FaMapMarkerAlt className="inline mr-1" />
                          This helps clients find contractors in their area
                        </motion.p>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="mt-4 flex justify-end"
                      variants={itemVariants}
                    >
                      <button 
                        type="button" 
                        onClick={() => setActiveSection(1)} 
                        disabled={!isSection0Valid()}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                          isSection0Valid()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Next <FaArrowRight className="ml-2" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Business Details */}
                {activeSection === 1 && (
                  <motion.div 
                    key="business"
                    className="bg-white p-6 rounded-lg border border-blue-300 shadow-md absolute w-full"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.3 }}
                  >
                    <motion.h2 
                      className="text-xl font-semibold text-gray-800 mb-4 flex items-center"
                      variants={itemVariants}
                    >
                      <FaBriefcase className="text-blue-600 mr-2" />
                      Business Details
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="companyName" className="block text-gray-700 font-medium mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200"
                          placeholder="Optional"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label htmlFor="experienceYears" className="block text-gray-700 font-medium mb-1">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          id="experienceYears"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleNumericChange}
                          min="0"
                          className="w-full border border-gray-300 rounded-md px-4 py-2 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label htmlFor="completedProjects" className="block text-gray-700 font-medium mb-1">
                          Completed Projects
                        </label>
                        <input
                          type="number"
                          id="completedProjects"
                          name="completedProjects"
                          value={formData.completedProjects}
                          onChange={handleNumericChange}
                          min="0"
                          className="w-full border border-gray-300 rounded-md px-4 py-2 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200"
                        />
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="mt-4 flex justify-between"
                      variants={itemVariants}
                    >
                      <button 
                        type="button" 
                        onClick={() => setActiveSection(0)} 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setActiveSection(2)} 
                        disabled={!isSection1Valid()}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                          isSection1Valid()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Next <FaArrowRight className="ml-2" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Specializations */}
                {activeSection === 2 && (
                  <motion.div 
                    key="specializations"
                    className="bg-white p-6 rounded-lg border border-blue-300 shadow-md absolute w-full"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.3 }}
                  >
                    <motion.h2 
                      className="text-xl font-semibold text-gray-800 mb-4 flex items-center"
                      variants={itemVariants}
                    >
                      <FaTools className="text-blue-600 mr-2" />
                      Specializations <span className="text-red-500">*</span>
                    </motion.h2>
                    
                    <motion.div 
                      className="relative mb-6"
                      variants={itemVariants}
                    >
                      <div className="flex items-center">
                        <p className="text-sm text-gray-600">
                          Select up to 5 areas you specialize in
                        </p>
                        <div className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.specialization.length}/5 selected
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(formData.specialization.length / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                      variants={containerVariants}
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <motion.div 
                          key={spec} 
                          onClick={() => handleSpecializationChange(spec)}
                          className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-all duration-200
                            flex items-center justify-center text-center
                            ${formData.specialization.includes(spec) 
                              ? 'bg-blue-600 text-white scale-105 shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          whileHover={{ scale: formData.specialization.includes(spec) ? 1.05 : 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          variants={itemVariants}
                        >
                          {spec}
                          {formData.specialization.includes(spec) && (
                            <FaCheck className="ml-1 text-xs" />
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    <motion.div 
                      className="mt-6 flex justify-between"
                      variants={itemVariants}
                    >
                      <button 
                        type="button" 
                        onClick={() => setActiveSection(1)} 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setActiveSection(3)} 
                        disabled={!isSection2Valid()}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                          isSection2Valid()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Next <FaArrowRight className="ml-2" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Bio */}
                {activeSection === 3 && (
                  <motion.div 
                    key="bio"
                    className="bg-white p-6 rounded-lg border border-blue-300 shadow-md absolute w-full"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.3 }}
                  >
                    <motion.h2 
                      className="text-xl font-semibold text-gray-800 mb-4 flex items-center"
                      variants={itemVariants}
                    >
                      <FaEdit className="text-blue-600 mr-2" />
                      Professional Bio <span className="text-red-500">*</span>
                    </motion.h2>
                    
                    <motion.div variants={itemVariants}>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="5"
                        className={`w-full border ${
                          formData.bio && !validateBio(formData.bio).valid
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        } rounded-md px-4 py-2 
                          focus:outline-none focus:ring-2 focus:border-transparent
                          transition-all duration-200`}
                        placeholder="Describe your professional background, services offered, and what makes you stand out from other contractors..."
                        required
                      ></textarea>
                      <motion.div
                        className="flex items-center justify-between text-xs mt-2"
                        variants={itemVariants}
                      >
                        <p className={formData.bio && !validateBio(formData.bio).valid ? "text-red-500" : "text-gray-500"}>
                          <FaEdit className="inline mr-1" />
                          {formData.bio && !validateBio(formData.bio).valid 
                            ? validateBio(formData.bio).message 
                            : "This will be displayed on your public profile"}
                        </p>
                        <p className={
                          formData.bio.length > 500 
                            ? "text-red-500" 
                            : formData.bio.length < 50 && formData.bio.length > 0 
                              ? "text-yellow-500" 
                              : "text-gray-500"
                        }>
                          {formData.bio.length}/500 characters
                          {formData.bio.length < 50 && formData.bio.length > 0 && " (minimum 50)"}
                        </p>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-6 flex justify-between"
                      variants={itemVariants}
                    >
                      <button 
                        type="button" 
                        onClick={() => setActiveSection(2)} 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={loading || !isSection3Valid()}
                        className={`px-6 py-3 ${
                          isSection3Valid() && !loading
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                          transition-all duration-200 shadow-md`}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Profile...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FaAward className="mr-2" />
                            Complete Profile
                          </div>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractorProfileSetup;