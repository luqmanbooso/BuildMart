import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaCheck, FaMapMarkerAlt, FaBriefcase, FaTools, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const SPECIALIZATIONS = [
  'Electrical',
  'Plumbing',
  'Roofing',
  'Carpentry',
  'Masonry',
  'Painting',
  'Flooring',
  'Landscaping',
  'Interior Design',
];

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const EditContractorProfile = ({ onClose, contractorData, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    phone: contractorData?.phone || '',
    address: contractorData?.address || '',
    companyName: contractorData?.companyName || '',
    specialization: contractorData?.specialization || [],
    experienceYears: contractorData?.experienceYears || '',
    completedProjects: contractorData?.completedProjects || 0,
    bio: contractorData?.bio || '',
    username: contractorData?.username || ''
  });

  // Validation state
  const [validation, setValidation] = useState({
    phone: { valid: true, message: '' },
    address: { valid: true, message: '' },
    bio: { valid: true, message: '' },
    username: { valid: true, message: '' }
  });

  const isExistingContractor = Boolean(contractorData?._id);

  const validatePhone = (phone) => {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    
    const validFormat = /^(\+94|0)[7][0-9\s]*$/.test(phone);
    if (!validFormat) {
      return { valid: false, message: 'Phone number must start with +94 or 07' };
    }
    
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    
    const correctLength = cleanedPhone.startsWith('+') 
      ? cleanedPhone.length === 12 
      : cleanedPhone.length === 10;
      
    if (!correctLength) {
      return { 
        valid: false, 
        message: cleanedPhone.startsWith('+') 
          ? 'Phone number with +94 should have 11 digits total' 
          : 'Phone number with 0 should have 10 digits' 
      };
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
    let sanitized = name.replace(/[^a-zA-Z0-9\s.,&'-]/g, '');
    sanitized = sanitized.replace(/\s+/g, ' ');
    sanitized = sanitized.trim();
    return sanitized;
  };

  const sanitizeBio = (bio) => {
    if (!bio) return '';
    let sanitized = bio.replace(/[^a-zA-Z0-9\s.,!,+,@,?&'-()\n]/g, '');
    sanitized = sanitized.replace(/\s+/g, ' ');
    sanitized = sanitized.replace(/\n+/g, '\n');
    return sanitized;
  };

  const validateCompanyName = (name) => {
    if (!name || name.trim() === '') {
      return { valid: true, message: '' };
    }
    
    if (name.length < 2) {
      return { valid: false, message: 'Company name should be at least 2 characters' };
    }
    if (name.length > 50) {
      return { valid: false, message: 'Company name should not exceed 50 characters' };
    }
    return { valid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      
      const sanitizedValue = value
        .replace(/[^\d\s+]/g, '') 
        .replace(/(?!^)\+/g, ''); 
      
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      setValidation(prev => ({
        ...prev,
        phone: validatePhone(sanitizedValue)
      }));
    } else if (name === 'username') {
      const sanitizedValue = sanitizeUsername(value);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      setValidation(prev => ({
        ...prev,
        username: validateUsername(sanitizedValue)
      }));
    } else if (name === 'companyName') {
      if (!value || value.trim() === '') {
        setFormData(prev => ({
          ...prev,
          [name]: ''
        }));
        setValidation(prev => ({
          ...prev,
          companyName: { valid: true, message: '' }
        }));
      } else {
        const sanitizedValue = sanitizeCompanyName(value);
        setFormData(prev => ({
          ...prev,
          [name]: sanitizedValue
        }));
        setValidation(prev => ({
          ...prev,
          companyName: validateCompanyName(sanitizedValue)
        }));
      }
    } else if (name === 'bio') {
      const sanitizedValue = sanitizeBio(value);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      setValidation(prev => ({
        ...prev,
        bio: validateBio(sanitizedValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (name === 'bio') {
        setValidation(prev => ({
          ...prev,
          bio: validateBio(value)
        }));
      }
    }
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    if (!isExistingContractor) {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    }
  };

  const toggleSpecialization = (spec) => {
    if (formData.specialization.includes(spec)) {
      setFormData({
        ...formData,
        specialization: formData.specialization.filter(item => item !== spec)
      });
    } else if (formData.specialization.length < 5) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, spec]
      });
    } else {
      toast.warning('You can select up to 5 specializations');
    }
  };

  const isFormValid = () => {
    return (
      validation.username.valid &&
      validation.phone.valid &&
      formData.phone &&
      formData.address &&
      validation.bio.valid &&
      formData.specialization.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fill all required fields correctly.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id;
      
      const submitData = {
        ...formData,
        companyName: formData.companyName || '',
        userId: userId
      };
      
      let response;
      
      if (contractorData?._id) {
        response = await axios.put(
          `http://localhost:5000/api/contractors/${contractorData._id}`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } 
      else {
        response = await axios.post(
          'http://localhost:5000/api/contractors',
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      toast.success('Profile updated successfully!');
      
      if (onProfileUpdate) {
        onProfileUpdate(response.data);
      }
      
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          {contractorData?._id ? 'Edit Profile' : 'Complete Your Profile'}
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 border-l-4 border-red-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <FaMapMarkerAlt className="text-blue-600 mr-2" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-gray-500">(Format: +94 7XXXXXXXX or 07XXXXXXXX)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full border ${
                  !validation.phone.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="+94 71 1234567"
              />
              {!validation.phone.valid && (
                <p className="mt-1 text-sm text-red-600">{validation.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="">Select your district</option>
                {SRI_LANKA_DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <FaBriefcase className="text-blue-600 mr-2" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Your Company Ltd."
                />
                {formData.companyName && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        companyName: null
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove company name"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="experienceYears" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                Years of Experience
                {isExistingContractor && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">Read-only</span>
                )}
              </label>
              <input
                type="number"
                id="experienceYears"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleNumericChange}
                min="0"
                className={`w-full border ${isExistingContractor ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none ${!isExistingContractor && 'focus:ring-2 focus:ring-blue-500'} transition-all duration-200`}
                placeholder="5"
                readOnly={isExistingContractor}
                disabled={isExistingContractor}
              />
              {isExistingContractor && (
                <p className="mt-1 text-xs text-gray-500">This field cannot be modified after initial setup</p>
              )}
            </div>
            
            <div>
              <label htmlFor="completedProjects" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                Completed Projects
                {isExistingContractor && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">Auto-updated</span>
                )}
              </label>
              <input
                type="number"
                id="completedProjects"
                name="completedProjects"
                value={formData.completedProjects}
                onChange={handleNumericChange}
                min="0"
                className={`w-full border ${isExistingContractor ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none ${!isExistingContractor && 'focus:ring-2 focus:ring-blue-500'} transition-all duration-200`}
                placeholder="0"
                readOnly={isExistingContractor}
                disabled={isExistingContractor}
              />
              {isExistingContractor && (
                <p className="mt-1 text-xs text-gray-500">This is automatically updated by the system</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-700 flex items-center">
              <FaTools className="text-blue-600 mr-2" />
              Specializations <span className="text-red-500">*</span>
            </h3>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {formData.specialization.length}/5 selected
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${(formData.specialization.length / 5) * 100}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {SPECIALIZATIONS.map((spec) => (
              <motion.div 
                key={spec} 
                onClick={() => toggleSpecialization(spec)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-all duration-200
                  flex items-center justify-center text-center
                  ${formData.specialization.includes(spec) 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {spec}
                {formData.specialization.includes(spec) && (
                  <FaCheck className="ml-1.5 text-xs" />
                )}
              </motion.div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Click to select up to 5 areas you specialize in
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3">
            Bio / Description <span className="text-red-500">*</span>
          </h3>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            className={`w-full border ${
              !validation.bio.valid ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-200`}
            placeholder="Tell potential clients about yourself and your work experience..."
          ></textarea>
          <div className="flex justify-between mt-2">
            <p className={`text-xs ${
              !validation.bio.valid ? 'text-red-500' : 'text-gray-500'
            }`}>
              {!validation.bio.valid ? validation.bio.message : "This will be displayed on your public profile"}
            </p>
            <p className={`text-xs ${
              formData.bio.length > 500 
                ? "text-red-500" 
                : formData.bio.length < 50 && formData.bio.length > 0 
                  ? "text-amber-500" 
                  : "text-gray-500"
            }`}>
              {formData.bio.length}/500 characters
              {formData.bio.length < 50 && formData.bio.length > 0 && " (minimum 50)"}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 border-t pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`px-4 py-2 flex items-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFormValid() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditContractorProfile;