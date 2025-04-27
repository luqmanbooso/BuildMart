import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlusCircle, FaCheckCircle, FaTimesCircle, 
         FaHourglassHalf, FaFileUpload, FaExclamationTriangle, FaMedal,
         FaUniversity, FaCertificate, FaAward, FaTools, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion'; 

const typeIcons = {
  'Certification': <FaCertificate className="mr-2 text-blue-600" />,
  'Education': <FaUniversity className="mr-2 text-indigo-600" />,
  'License': <FaMedal className="mr-2 text-green-600" />,
  'Award': <FaAward className="mr-2 text-amber-600" />,
  'Skill': <FaTools className="mr-2 text-purple-600" />
};

const QualificationsManager = ({ userId }) => {
  const [qualifications, setQualifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    issuer: '',
    year: '',
    expiry: '',
    documentFile: ''
  });
  
  const [newQualification, setNewQualification] = useState({
    type: 'Certification',
    name: '',
    issuer: '',
    year: '',
    expiry: '',
    documentFile: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);

  const MAX_LENGTHS = {
    name: 100,
    issuer: 100,
    year: 4,
    expiry: 5
  };
  
  const MAX_FILE_SIZE = 1024 * 1024;

  const ensureFullImagePath = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const fetchQualifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:5000/qualify/user/${userId}`);
      
      const processedQualifications = response.data.map(qual => {
        if (qual.documentImage) {
          qual.documentImage = ensureFullImagePath(qual.documentImage);
        }
        return qual;
      });
      
      setQualifications(processedQualifications);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      setError('Failed to load your qualifications. Please try again.');
      setQualifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, [userId]);
  
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'name':
        if (!value || !value.trim()) {
          errorMessage = 'Name is required';
        } else if (value.length > MAX_LENGTHS.name) {
          errorMessage = `Name must be ${MAX_LENGTHS.name} characters or less`;
        } else if (!/^[a-zA-Z0-9\s\-.,()&]+$/.test(value)) {
          errorMessage = 'Name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed';
        }
        break;
        
      case 'issuer':
        if (!value || !value.trim()) {
          errorMessage = 'Issuing organization is required';
        } else if (value.length > MAX_LENGTHS.issuer) {
          errorMessage = `Issuer must be ${MAX_LENGTHS.issuer} characters or less`;
        } else if (!/^[a-zA-Z0-9\s\-.,()&]+$/.test(value)) {
          errorMessage = 'Organization name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed';
        }
        break;
        
      case 'year':
        if (!value || !value.trim()) {
          errorMessage = 'Year is required';
        } else if (!/^\d{4}$/.test(value)) {
          errorMessage = 'Year must be a 4-digit number';
        } else {
          const currentYear = new Date().getFullYear();
          const yearValue = parseInt(value);
          if (yearValue > currentYear) {
            errorMessage = 'Year cannot be in the future';
          } else if (yearValue < 1900) {
            errorMessage = 'Please enter a year after 1900';
          }
        }
        break;
        
      case 'expiry':
        if (value.trim() && value.toLowerCase() !== 'n/a') {
          if (value.length > MAX_LENGTHS.expiry) {
            errorMessage = `Expiry must be ${MAX_LENGTHS.expiry} characters or less`;
          }
        }
        break;
        
      case 'documentFile':
        if (value) {
          if (value.size > MAX_FILE_SIZE) {
            errorMessage = `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
          }
          
          const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          if (!acceptedTypes.includes(value.type)) {
            errorMessage = 'Only JPEG and PNG image formats are allowed';
          }
          
          if (!errorMessage && (value.type === 'image/jpeg' || value.type === 'image/png' || value.type === 'image/jpg')) {
            const checkDimensions = () => {
              return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                  URL.revokeObjectURL(img.src);
                  if (img.width < 200 || img.height < 200) {
                    resolve('Image is too small. Minimum dimensions: 200x200 pixels');
                  } else {
                    resolve('');
                  }
                };
                img.onerror = () => {
                  URL.revokeObjectURL(img.src);
                  resolve('Failed to load image. Please try another file.');
                };
                img.src = URL.createObjectURL(value);
              });
            };
            
            value._dimensionCheck = checkDimensions;
          }
        }
        break;
        
      default:
        break;
    }
    
    return errorMessage;
  };
  
  const isFormValid = () => {
    return !Object.values(formErrors).some(error => error !== '');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const fileError = validateField('documentFile', file);
      
      if (fileError) {
        setFormErrors({
          ...formErrors,
          documentFile: fileError
        });
        return;
      }
      
      if (file._dimensionCheck) {
        const dimensionError = await file._dimensionCheck();
        if (dimensionError) {
          setFormErrors({
            ...formErrors,
            documentFile: dimensionError
          });
          return;
        }
      }
      
      setFormErrors({
        ...formErrors,
        documentFile: ''
      });
      
      setNewQualification({
        ...newQualification,
        documentFile: file
      });
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewQualificationChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    if (MAX_LENGTHS[name] && value.length > MAX_LENGTHS[name]) {
      finalValue = value.slice(0, MAX_LENGTHS[name]);
    }
    
    if (name === 'year') {
      finalValue = finalValue.replace(/[^0-9]/g, '').slice(0, 4);
    }
    
    if (name === 'expiry' && value.trim() && value.toLowerCase() !== 'n/a') {
      finalValue = value.replace(/[^0-9/]/g, '');
      
      if (finalValue.length > 0) {
        const digits = finalValue.replace(/\D/g, '');
        
        if (digits.length <= 2) {
          finalValue = digits;
        } else {
          const month = digits.substring(0, 2);
          const year = digits.substring(2, 6);
          
          const monthNum = parseInt(month);
          if (monthNum > 12) {
            finalValue = '12/' + year;
          } else if (monthNum < 1 && month.length === 2) {
            finalValue = '01/' + year;
          } else {
            finalValue = month + '/' + year;
          }
        }
      }
      
      finalValue = finalValue.slice(0, 7);
    }
    
    
    setNewQualification({
      ...newQualification,
      [name]: finalValue
    });
    
    const errorMessage = validateField(name, finalValue);
    setFormErrors({
      ...formErrors,
      [name]: errorMessage
    });
  };

  const handleAddQualification = async (e) => {
    e.preventDefault();
    
    if (!newQualification.name.trim()) {
      setFormErrors({
        ...formErrors,
        name: 'Name is required'
      });
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    if (!newQualification.issuer.trim()) {
      setFormErrors({
        ...formErrors,
        issuer: 'Issuing organization is required'
      });
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    const errors = {
      name: validateField('name', newQualification.name),
      issuer: validateField('issuer', newQualification.issuer),
      year: validateField('year', newQualification.year),
      expiry: validateField('expiry', newQualification.expiry),
      documentFile: validateField('documentFile', newQualification.documentFile)
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error !== '')) {
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      formData.append('userId', userId);
      formData.append('type', newQualification.type);
      formData.append('name', newQualification.name);
      formData.append('issuer', newQualification.issuer);
      formData.append('year', newQualification.year);
      formData.append('expiry', newQualification.expiry || 'N/A');
      
      if (newQualification.documentFile) {
        formData.append('documentImage', newQualification.documentFile);
      }
      
      const response = await axios.post('http://localhost:5000/qualify/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setQualifications([...qualifications, response.data]);
      setNewQualification({
        type: 'Certification',
        name: '',
        issuer: '',
        year: '',
        expiry: '',
        documentFile: null
      });
      setFormErrors({
        name: '',
        issuer: '',
        year: '',
        expiry: '',
        documentFile: ''
      });
      setPreviewImage(null);
      setShowAddForm(false);
      toast.success('Qualification added successfully!');
    } catch (error) {
      console.error('Error adding qualification:', error);
      setError(error.response?.data?.error || 'Failed to add qualification');
      toast.error('Failed to add qualification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQualification = async (e) => {
    e.preventDefault();
    
    if (!editingQualification) return;
    
    if (!newQualification.name.trim()) {
      setFormErrors({
        ...formErrors,
        name: 'Name is required'
      });
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    if (!newQualification.issuer.trim()) {
      setFormErrors({
        ...formErrors,
        issuer: 'Issuing organization is required'
      });
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    const errors = {
      name: validateField('name', newQualification.name),
      issuer: validateField('issuer', newQualification.issuer),
      year: validateField('year', newQualification.year),
      expiry: validateField('expiry', newQualification.expiry),
      documentFile: validateField('documentFile', newQualification.documentFile)
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error !== '')) {
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      formData.append('type', newQualification.type);
      formData.append('name', newQualification.name);
      formData.append('issuer', newQualification.issuer);
      formData.append('year', newQualification.year);
      formData.append('expiry', newQualification.expiry || 'N/A');
      
      if (newQualification.documentFile) {
        formData.append('documentImage', newQualification.documentFile);
      }
      
      const response = await axios.put(
        `http://localhost:5000/qualify/${editingQualification._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setQualifications(qualifications.map(q => 
        q._id === editingQualification._id ? response.data : q
      ));
      
      setEditingQualification(null);
      setNewQualification({
        type: 'Certification',
        name: '',
        issuer: '',
        year: '',
        expiry: '',
        documentFile: null
      });
      setFormErrors({
        name: '',
        issuer: '',
        year: '',
        expiry: '',
        documentFile: ''
      });
      setPreviewImage(null);
      setShowAddForm(false);
      toast.success('Qualification updated successfully!');
    } catch (error) {
      console.error('Error updating qualification:', error);
      setError(error.response?.data?.error || 'Failed to update qualification');
      toast.error('Failed to update qualification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQualification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await axios.delete(`http://localhost:5000/qualify/${id}`);
      
      setQualifications(qualifications.filter(q => q._id !== id));
      toast.success('Qualification deleted successfully!');
    } catch (error) {
      console.error('Error deleting qualification:', error);
      setError(error.response?.data?.error || 'Failed to delete qualification');
      toast.error('Failed to delete qualification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQualification = (qualification) => {
    setEditingQualification(qualification);
    setNewQualification({
      type: qualification.type || 'Certification',
      name: qualification.name || '',
      issuer: qualification.issuer || '',
      year: qualification.year || '',
      expiry: qualification.expiry || '',
      documentFile: null
    });
  
    setFormErrors({
      name: '',
      issuer: '',
      year: '',
      expiry: '',
      documentFile: ''
    });
    
    setPreviewImage(ensureFullImagePath(qualification.documentImage) || null);
    setShowAddForm(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
    exit: { opacity: 0, y: -20 }
  };
  
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  const renderInputField = (label, name, placeholder, required = true, icon = null) => (
    <motion.div 
      variants={fadeVariants}
      className="relative"
    >
      <div className="flex items-center mb-1">
        {icon}
        <label className="block text-gray-700 font-medium">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {MAX_LENGTHS[name] && (
          <span className="text-xs text-gray-500 ml-auto">
            {newQualification[name]?.length || 0}/{MAX_LENGTHS[name]}
          </span>
        )}
      </div>
      <div className="relative">
        <input 
          type="text"
          name={name}
          value={newQualification[name]}
          onChange={handleNewQualificationChange}
          className={`w-full border ${formErrors[name] ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'} 
                     rounded-lg px-4 py-3 focus:outline-none focus:ring-2 
                     ${formErrors[name] ? 'focus:ring-red-200' : 'focus:ring-blue-200'} 
                     transition-all duration-200`}
          placeholder={placeholder}
          required={required}
          disabled={isLoading}
          maxLength={MAX_LENGTHS[name] || undefined}
        />
        {formErrors[name] && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center"
          >
            <FaExclamationTriangle className="mr-1" /> {formErrors[name]}
          </motion.p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
  
      <div className="flex justify-between items-center border-b border-blue-100 pb-4 mb-8">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
            <FaMedal className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">
            Professional Qualifications
          </h2>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingQualification(null);
            setNewQualification({
              type: 'Certification',
              name: '',
              issuer: '',
              year: '',
              expiry: '',
              documentFile: null
            });
            setFormErrors({
              name: '',
              issuer: '',
              year: '',
              expiry: '',
              documentFile: ''
            });
            setPreviewImage(null);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-5 py-3 rounded-lg shadow-md transition-all duration-200"
          disabled={isLoading}
        >
          {showAddForm ? (
            <>
              <FaTimesCircle className="mr-2" /> Cancel
            </>
          ) : (
            <>
              <FaPlusCircle className="mr-2" /> Add Qualification
            </>
          )}
        </motion.button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 shadow-sm border border-red-200 flex items-start"
        >
          <FaExclamationTriangle className="text-red-500 mr-3 mt-1" />
          <div>
            <h4 className="font-medium">Error</h4>
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="mb-10 bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100 overflow-hidden"
          >
            <motion.div variants={itemVariants} className="flex items-center mb-6 pb-4 border-b border-blue-200">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                {editingQualification ? (
                  <FaEdit className="text-blue-600 text-xl" />
                ) : (
                  <FaPlusCircle className="text-blue-600 text-xl" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {editingQualification ? 'Update Qualification' : 'Add Professional Qualification'}
              </h3>
            </motion.div>
            
            <form onSubmit={editingQualification ? handleUpdateQualification : handleAddQualification}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-gray-700 font-medium mb-1">Type<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <select 
                      name="type"
                      value={newQualification.type}
                      onChange={handleNewQualificationChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="Certification">Certification</option>
                      <option value="Education">Education</option>
                      <option value="License">License</option>
                      <option value="Award">Award</option>
                      <option value="Skill">Skill</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {typeIcons[newQualification.type]}
                    </div>
                  </div>
                </motion.div>
                
                {renderInputField('Qualification Name', 'name', 'e.g. Licensed Contractor', true, <FaCertificate className="mr-2 text-blue-600" />)}
                
                {renderInputField('Issuing Organization', 'issuer', 'e.g. National Construction Authority', true, <FaUniversity className="mr-2 text-indigo-600" />)}
                
                {renderInputField('Year', 'year', 'e.g. 2022', true, <FaCalendarAlt className="mr-2 text-green-600" />)}
                
                {renderInputField('Expiry (if applicable)', 'expiry', 'MM/YYYY or N/A', false, <FaCalendarAlt className="mr-2 text-amber-600" />)}
                
              </div>
              
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FaFileUpload className="mr-2 text-purple-600" />
                  Certificate Image <span className="text-xs text-gray-500 ml-2">(PNG/JPEG, max 1MB)</span>
                </label>
                
                <div className="relative">
                  <label 
                    htmlFor="documentImage" 
                    className={`flex flex-col items-center justify-center w-full border-2 border-dashed ${
                      formErrors.documentFile ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500'
                    } rounded-lg p-6 cursor-pointer transition-all duration-200`}
                  >
                    <div className="flex flex-col items-center text-center">
                      {previewImage ? (
                        <div className="mb-4 w-full">
                          <img 
                            src={previewImage} 
                            alt="Certificate preview" 
                            className="max-h-52 object-contain mx-auto rounded-lg shadow-md"
                            onError={(e) => {
                              console.error("Failed to display preview image");
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23f87171' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                            }}
                          />
                          <div className="flex justify-center mt-3">
                            <button 
                              type="button"
                              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium flex items-center"
                              onClick={(e) => {
                                e.preventDefault();
                                setPreviewImage(null);
                                setNewQualification({...newQualification, documentFile: null});
                                setFormErrors({...formErrors, documentFile: ''});
                              }}
                            >
                              <FaTimesCircle className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-700">
                            <span className="font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 1MB</p>
                        </>
                      )}
                    </div>
                  </label>
                  
                  <input
                    id="documentImage"
                    name="documentImage"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>
                
                {formErrors.documentFile && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-2 flex items-center"
                  >
                    <FaExclamationTriangle className="mr-1" /> {formErrors.documentFile}
                  </motion.p>
                )}
              </motion.div>
              
              {!isFormValid() && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex items-start"
                >
                  <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-sm">Please correct the following errors:</p>
                    <ul className="text-xs mt-1 list-disc list-inside">
                      {Object.entries(formErrors)
                        .filter(([_, value]) => value !== '')
                        .map(([key, value]) => (
                          <li key={key}>{value}</li>
                        ))}
                    </ul>
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                variants={itemVariants}
                className="flex justify-end space-x-4 mt-8"
              >
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setPreviewImage(null);
                    setFormErrors({
                      name: '',
                      issuer: '',
                      year: '',
                      expiry: '',
                      documentFile: ''
                    });
                  }}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 font-medium shadow-sm"
                  disabled={isLoading}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center
                  ${(isLoading || !isFormValid()) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLoading || !isFormValid()}
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
                      {editingQualification ? <FaEdit className="mr-2" /> : <FaCheckCircle className="mr-2" />}
                      {editingQualification ? 'Update Qualification' : 'Save Qualification'}
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && !showAddForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-block border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full h-14 w-14 animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your qualifications...</p>
        </motion.div>
      )}

      <AnimatePresence>
        {!isLoading && qualifications.length > 0 ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {qualifications.map((qualification, index) => (
              <motion.div 
                key={qualification._id}
                variants={itemVariants}
                layoutId={qualification._id}
                className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row">
                  {qualification.documentImage && (
                    <div className="md:w-1/4 overflow-hidden md:border-r border-blue-100 relative">
                      <div className="aspect-w-4 aspect-h-3 bg-gray-100 relative flex items-center justify-center h-full">
                        <img 
                          src={ensureFullImagePath(qualification.documentImage)} 
                          alt={`${qualification.name} certificate`} 
                          className="object-cover h-full w-full transition-all duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            console.error("Failed to load image:", qualification.documentImage);
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23f87171' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            onClick={() => handleEditQualification(qualification)}
                            className="px-4 py-2 bg-white rounded-lg text-blue-700 font-medium shadow-md hover:bg-blue-50 transform transition hover:scale-105"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-6 ${qualification.documentImage ? 'md:w-3/4' : 'w-full'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-sm">
                            {typeIcons[qualification.type] || <FaCertificate className="mr-1" />}
                            {qualification.type}
                          </div>
                          
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FaCalendarAlt className="mr-1" />
                            {qualification.year}
                          </div>
                          
                          {qualification.expiry && qualification.expiry !== 'N/A' && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Expires: {qualification.expiry}
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-800 transition-colors duration-200">
                          {qualification.name}
                        </h3>
                        
                        <p className="text-gray-600 mt-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">{qualification.issuer}</span>
                        </p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: "#e6f7ff" }}
                          whileTap={{ scale: 0.9 }}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          onClick={() => handleEditQualification(qualification)}
                          disabled={isLoading}
                          title="Edit qualification"
                        >
                          <FaEdit className="text-lg" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: "#fff5f5" }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                          onClick={() => handleDeleteQualification(qualification._id)}
                          disabled={isLoading}
                          title="Delete qualification"
                        >
                          <FaTrashAlt className="text-lg" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {!qualification.documentImage && (
                      <div className="mt-4 px-4 py-6 border border-dashed border-blue-200 rounded-lg bg-blue-50 bg-opacity-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="ml-3 text-blue-700">No document attached</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gradient-to-b from-gray-50 to-blue-50 rounded-xl border border-dashed border-blue-200 px-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Qualifications Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Add your professional qualifications, certifications, or education to showcase your expertise to potential clients.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 transform font-medium"
              disabled={isLoading}
            >
              <FaPlusCircle className="inline-block mr-2" />
              Add Your First Qualification
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QualificationsManager;
