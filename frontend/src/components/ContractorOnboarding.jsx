import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaPhoneAlt, FaMapMarkerAlt, FaBriefcase, FaTools, FaAward, 
         FaEdit, FaCheck, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Constants
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

// Helper functions
const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length !== 10) {
    return { valid: false, message: 'Phone number should be 10 digits' };
  }
  if (!digits.startsWith('07')) {
    return { valid: false, message: 'Phone number must start with 07' };
  }
  return { valid: true, message: '' };
};

const validateBio = (bio) => {
  if (!bio) return { valid: false, message: 'Bio is required' };
  if (bio.trim().length < 50) {
    return { valid: false, message: 'Bio should be at least 50 characters' };
  }
  if (bio.length > 500) {
    return { valid: false, message: 'Bio should not exceed 500 characters' };
  }
  return { valid: true, message: '' };
};

const validateUsername = (username) => {
  if (!username) return { valid: false, message: 'Username is required' };
  if (username.length < 3) {
    return { valid: false, message: 'Username should be at least 3 characters' };
  }
  if (username.length > 30) {
    return { valid: false, message: 'Username should not exceed 30 characters' };
  }
  const validChars = /^[a-zA-Z0-9_-]+$/;
  if (!validChars.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  if (/([-_]){2,}/.test(username)) {
    return { valid: false, message: 'Username cannot contain consecutive special characters' };
  }
  if (/^[-_]|[-_]$/.test(username)) {
    return { valid: false, message: 'Username cannot start or end with special characters' };
  }
  return { valid: true, message: '' };
};

const sanitizeUsername = (username) => {
  if (!username) return '';
  let sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '');
  sanitized = sanitized.replace(/([-_]){2,}/g, '$1');
  sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '');
  sanitized = sanitized.slice(0, 30);
  return sanitized;
};

const sanitizeCompanyName = (name) => {
  if (!name) return '';
  // Remove all special characters except spaces and basic punctuation
  let sanitized = name.replace(/[^a-zA-Z0-9\s.,&'-]/g, '');
  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  // Trim whitespace
  sanitized = sanitized.trim();
  return sanitized;
};

const sanitizeBio = (bio) => {
  if (!bio) return '';
  // Allow basic punctuation and newlines, but remove other special characters
  let sanitized = bio.replace(/[^a-zA-Z0-9\s.,!?&'-()\n]/g, '');
  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  // Remove multiple newlines
  sanitized = sanitized.replace(/\n+/g, '\n');
  return sanitized;
};

const validateCompanyName = (name) => {
  if (!name) return { valid: false, message: 'Company name is required' };
  if (name.length < 2) {
    return { valid: false, message: 'Company name should be at least 2 characters' };
  }
  if (name.length > 50) {
    return { valid: false, message: 'Company name should not exceed 50 characters' };
  }
  return { valid: true, message: '' };
};

// Main component
const ContractorOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    companyName: '',
    specialization: [],
    experienceYears: 0,
    completedProjects: 0,
    bio: '',
    username: ''
  });

  const sections = [
    { name: 'Contact', icon: <FaPhoneAlt /> },
    { name: 'Business', icon: <FaBriefcase /> },
    { name: 'Specializations', icon: <FaTools /> },
    { name: 'Bio', icon: <FaEdit /> }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      const sanitized = sanitizeUsername(value);
      setFormData(prev => ({ ...prev, username: sanitized }));
    } else if (name === 'companyName') {
      const sanitized = sanitizeCompanyName(value);
      setFormData(prev => ({ ...prev, companyName: sanitized }));
    } else if (name === 'bio') {
      const sanitized = sanitizeBio(value);
      setFormData(prev => ({ ...prev, bio: sanitized }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const validateForm = () => {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.message);
      return false;
    }

    if (!formData.address) {
      toast.error('Address is required');
      return false;
    }

    const companyNameValidation = validateCompanyName(formData.companyName);
    if (!companyNameValidation.valid) {
      toast.error(companyNameValidation.message);
      return false;
    }

    if (formData.specialization.length === 0) {
      toast.error('Please select at least one specialization');
      return false;
    }

    const bioValidation = validateBio(formData.bio);
    if (!bioValidation.valid) {
      toast.error(bioValidation.message);
      return false;
    }

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      toast.error(usernameValidation.message);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const decoded = jwtDecode(token);
      
      const response = await axios.post(
        'http://localhost:5000/api/contractors',
        {
          ...formData,
          userId: decoded.userId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Profile created successfully!');
      navigate('/contractor/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const isSection0Valid = () => {
    const phoneValidation = validatePhone(formData.phone);
    return phoneValidation.valid && formData.address.trim() !== '';
  };

  const isSection1Valid = () => {
    return formData.companyName.trim() !== '' && 
           formData.experienceYears > 0 && 
           formData.completedProjects >= 0;
  };

  const isSection2Valid = () => {
    return formData.specialization.length > 0;
  };

  const isSection3Valid = () => {
    const bioValidation = validateBio(formData.bio);
    const usernameValidation = validateUsername(formData.username);
    return bioValidation.valid && usernameValidation.valid;
  };

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeSection > 0) {
      setActiveSection(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-center mb-8">Complete Your Contractor Profile</h1>
          
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index <= activeSection ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= activeSection ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {index < activeSection ? <FaCheck /> : section.icon}
                </div>
                <span className="ml-2">{section.name}</span>
                {index < sections.length - 1 && (
                  <div className="w-16 h-1 mx-2 bg-gray-200">
                    <div
                      className={`h-full ${
                        index < activeSection ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ width: `${(activeSection - index) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form Sections */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="07XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {activeSection === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleNumberInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed Projects</label>
                      <input
                        type="number"
                        name="completedProjects"
                        value={formData.completedProjects}
                        onChange={handleNumberInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {activeSection === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specializations</label>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        {SPECIALIZATIONS.map((spec) => (
                          <label key={spec} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.specialization.includes(spec)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    specialization: [...prev.specialization, spec]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    specialization: prev.specialization.filter(s => s !== spec)
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2">{spec}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={6}
                        placeholder="Tell us about your experience, skills, and what makes you unique..."
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={activeSection === 0}
                className={`px-4 py-2 rounded-md ${
                  activeSection === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Back
              </button>
              {activeSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (activeSection === 0 && !isSection0Valid()) ||
                    (activeSection === 1 && !isSection1Valid()) ||
                    (activeSection === 2 && !isSection2Valid())
                  }
                  className={`px-4 py-2 rounded-md flex items-center ${
                    (activeSection === 0 && !isSection0Valid()) ||
                    (activeSection === 1 && !isSection1Valid()) ||
                    (activeSection === 2 && !isSection2Valid())
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isSection3Valid() || loading}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    !isSection3Valid() || loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractorOnboarding;