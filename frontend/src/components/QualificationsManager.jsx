import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlusCircle, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileUpload, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const QualificationsManager = ({ userId }) => {
  // Qualifications state
  const [qualifications, setQualifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: '',
    issuer: '',
    year: '',
    expiry: '',
    documentFile: ''
  });
  
  // New qualification state with image
  const [newQualification, setNewQualification] = useState({
    type: 'Certification',
    name: '',
    issuer: '',
    year: '',
    expiry: '',
    documentFile: null
  });
  
  // Preview image state
  const [previewImage, setPreviewImage] = useState(null);

  // Max lengths for fields
  const MAX_LENGTHS = {
    name: 100,
    issuer: 100,
    year: 4,
    expiry: 5
  };
  
  // File size limit in bytes (1MB)
  const MAX_FILE_SIZE = 1024 * 1024;

  // Fetch qualifications from API
  const fetchQualifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:5000/qualify/user/${userId}`);
      setQualifications(response.data);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      setError('Failed to load your qualifications. Please try again.');
      setQualifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch data on mount
  useEffect(() => {
    fetchQualifications();
  }, [userId]);
  
  // Validate individual fields
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMessage = 'Name is required';
        } else if (value.length > MAX_LENGTHS.name) {
          errorMessage = `Name must be ${MAX_LENGTHS.name} characters or less`;
        }
        break;
        
      case 'issuer':
        if (!value.trim()) {
          errorMessage = 'Issuing organization is required';
        } else if (value.length > MAX_LENGTHS.issuer) {
          errorMessage = `Issuer must be ${MAX_LENGTHS.issuer} characters or less`;
        }
        break;
        
      case 'year':
        if (!value.trim()) {
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
          // Additional validation for date format could be added here
        }
        break;
        
      case 'documentFile':
        if (value && value.size > MAX_FILE_SIZE) {
          errorMessage = 'File size must be less than 1MB';
        }
        break;
        
      default:
        break;
    }
    
    return errorMessage;
  };
  
  // Check if the form is valid
  const isFormValid = () => {
    return !Object.values(formErrors).some(error => error !== '');
  };

  // Handle file selection and validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size
      const fileError = validateField('documentFile', file);
      setFormErrors({
        ...formErrors,
        documentFile: fileError
      });
      
      // Store the File object directly for FormData if valid
      setNewQualification({
        ...newQualification,
        documentFile: file
      });
      
      // Create preview URL for display
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes with validation
  const handleNewQualificationChange = (e) => {
    const { name, value } = e.target;
    
    // Apply maxLength restrictions
    let finalValue = value;
    if (MAX_LENGTHS[name] && value.length > MAX_LENGTHS[name]) {
      finalValue = value.slice(0, MAX_LENGTHS[name]);
    }
    
    // Special case for year to ensure only numbers
    if (name === 'year') {
      finalValue = finalValue.replace(/[^0-9]/g, '').slice(0, 4);
    }
    
    // Special case for expiry to auto-format as MM/YYYY
    if (name === 'expiry' && value.trim() && value.toLowerCase() !== 'n/a') {
      // Remove any non-numeric characters except the forward slash
      finalValue = value.replace(/[^0-9/]/g, '');
      
      // Handle the format MM/YYYY
      if (finalValue.length > 0) {
        // Extract digits only for processing
        const digits = finalValue.replace(/\D/g, '');
        
        // Format as MM/YYYY
        if (digits.length <= 2) {
          // Just the month part
          finalValue = digits;
        } else {
          // Format with the slash after the month part
          const month = digits.substring(0, 2);
          const year = digits.substring(2, 6);
          
          // Validate month (01-12)
          const monthNum = parseInt(month);
          if (monthNum > 12) {
            // If month > 12, correct it to 12
            finalValue = '12/' + year;
          } else if (monthNum < 1 && month.length === 2) {
            // If month < 01 but has 2 digits, correct to 01
            finalValue = '01/' + year;
          } else {
            finalValue = month + '/' + year;
          }
        }
      }
      
      // Maximum length for MM/YYYY is 7 characters
      finalValue = finalValue.slice(0, 7);
    }
    
    // Update form data
    setNewQualification({
      ...newQualification,
      [name]: finalValue
    });
    
    // Validate and set errors
    const errorMessage = validateField(name, finalValue);
    setFormErrors({
      ...formErrors,
      [name]: errorMessage
    });
  };

  // Add new qualification with validation
  const handleAddQualification = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const errors = {
      name: validateField('name', newQualification.name),
      issuer: validateField('issuer', newQualification.issuer),
      year: validateField('year', newQualification.year),
      expiry: validateField('expiry', newQualification.expiry),
      documentFile: validateField('documentFile', newQualification.documentFile)
    };
    
    setFormErrors(errors);
    
    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('userId', userId);
      formData.append('type', newQualification.type);
      formData.append('name', newQualification.name);
      formData.append('issuer', newQualification.issuer);
      formData.append('year', newQualification.year);
      formData.append('expiry', newQualification.expiry || 'N/A');
      
      // Add file if available
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

  // Update qualification with validation
  const handleUpdateQualification = async (e) => {
    e.preventDefault();
    
    if (!editingQualification) return;
    
    // Validate all fields before submission
    const errors = {
      name: validateField('name', newQualification.name),
      issuer: validateField('issuer', newQualification.issuer),
      year: validateField('year', newQualification.year),
      expiry: validateField('expiry', newQualification.expiry),
      documentFile: validateField('documentFile', newQualification.documentFile)
    };
    
    setFormErrors(errors);
    
    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      toast.error('Please correct the form errors before submitting');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('type', newQualification.type);
      formData.append('name', newQualification.name);
      formData.append('issuer', newQualification.issuer);
      formData.append('year', newQualification.year);
      formData.append('expiry', newQualification.expiry || 'N/A');
      
      // Add file if available and changed
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

  // Delete qualification
  const handleDeleteQualification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await axios.delete(`http://localhost:5000/qualify/${id}`);
      
      // Remove from state
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

  // Setup for editing a qualification
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
    // Reset form errors when starting to edit
    setFormErrors({
      name: '',
      issuer: '',
      year: '',
      expiry: '',
      documentFile: ''
    });
    
    setPreviewImage(qualification.documentImage || null);
    setShowAddForm(true);
  };

  // Format input field with validation
  const renderInputField = (label, name, placeholder, required = true) => (
    <div>
      <label className="block text-gray-700 mb-1">
        {label}{required && <span className="text-red-500">*</span>}
        {MAX_LENGTHS[name] && (
          <span className="text-xs text-gray-500 float-right">
            {newQualification[name]?.length || 0}/{MAX_LENGTHS[name]}
          </span>
        )}
      </label>
      <input 
        type="text"
        name={name}
        value={newQualification[name]}
        onChange={handleNewQualificationChange}
        className={`w-full border ${formErrors[name] ? 'border-red-300' : 'border-gray-300'} rounded px-3 py-2`}
        placeholder={placeholder}
        required={required}
        disabled={isLoading}
        maxLength={MAX_LENGTHS[name] || undefined}
      />
      {formErrors[name] && (
        <p className="text-red-500 text-xs mt-1">
          {formErrors[name]}
        </p>
      )}
    </div>
  );

  // Render verification status badge
  const renderVerificationStatus = (status) => {
    return null; // Remove verification status display
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Qualifications</h2>
        <button 
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
          className="flex items-center text-blue-700 hover:text-blue-900"
          disabled={isLoading}
        >
          <FaPlusCircle className="mr-1" /> Add New
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Qualification Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">
            {editingQualification ? 'Edit Qualification' : 'Add New Qualification'}
          </h3>
          <form onSubmit={editingQualification ? handleUpdateQualification : handleAddQualification}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Type field */}
              <div>
                <label className="block text-gray-700 mb-1">Type<span className="text-red-500">*</span></label>
                <select 
                  name="type"
                  value={newQualification.type}
                  onChange={handleNewQualificationChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                  disabled={isLoading}
                >
                  <option value="Certification">Certification</option>
                  <option value="Education">Education</option>
                  <option value="License">License</option>
                  <option value="Award">Award</option>
                  <option value="Skill">Skill</option>
                </select>
              </div>
              
              {/* Name field */}
              {renderInputField('Name', 'name', 'e.g. Licensed Contractor')}
              
              {/* Issuer field */}
              {renderInputField('Issuing Organization', 'issuer', 'e.g. National Construction Authority')}
              
              {/* Year field */}
              {renderInputField('Year', 'year', 'e.g. 2022')}
              
              {/* Expiry field (optional) */}
              {renderInputField('Expiry (if applicable)', 'expiry', 'N/A if not applicable', false)}
              
              {/* Image upload field */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-1">
                  Certificate Image <span className="text-xs text-gray-500">(PNG/JPEG, max 1MB)</span>
                </label>
                <div className="flex items-center">
                  <label className={`flex items-center px-4 py-2 bg-white border ${formErrors.documentFile ? 'border-red-300' : 'border-gray-300'} rounded cursor-pointer hover:bg-gray-50`}>
                    <FaFileUpload className="mr-2 text-gray-600" />
                    <span>{previewImage ? 'Change Image' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  {previewImage && (
                    <button 
                      type="button"
                      className="ml-2 text-sm text-red-600 hover:text-red-800"
                      onClick={() => {
                        setPreviewImage(null);
                        setNewQualification({...newQualification, documentFile: null});
                        setFormErrors({...formErrors, documentFile: ''});
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                {formErrors.documentFile && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.documentFile}
                  </p>
                )}
                
                {/* Image preview */}
                {previewImage && (
                  <div className="mt-3 border rounded p-2 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img 
                      src={previewImage} 
                      alt="Certificate preview" 
                      className="max-h-40 object-contain mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Form validation warning */}
            {!isFormValid() && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md mb-4 flex items-start">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2" />
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
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button 
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
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className={`px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 ${(isLoading || !isFormValid()) ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? 'Saving...' : editingQualification ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !showAddForm && (
        <div className="text-center py-10">
          <div className="inline-block border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full h-12 w-12 animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading qualifications...</p>
        </div>
      )}

      {/* Qualifications List */}
      {!isLoading && qualifications.length > 0 ? (
        <div className="space-y-4">
          {qualifications.map(qualification => (
            <div key={qualification._id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:justify-between">
                <div className="flex-grow">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {qualification.type}
                    </span>
                  </div>
                  <h3 className="font-medium mt-1">{qualification.name}</h3>
                  <p className="text-sm text-gray-600">
                    {qualification.issuer} • {qualification.year}
                    {qualification.expiry && qualification.expiry !== 'N/A' && ` • Expires: ${qualification.expiry}`}
                  </p>
                  
                  {/* Show certificate image if available */}
                  {qualification.documentImage && (
                    <div className="mt-3">
                      <img 
                        src={qualification.documentImage} 
                        alt={`${qualification.name} certificate`} 
                        className="max-h-28 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <button 
                    className="text-gray-500 hover:text-blue-700"
                    onClick={() => handleEditQualification(qualification)}
                    disabled={isLoading}
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button 
                    className="text-gray-500 hover:text-red-700"
                    onClick={() => handleDeleteQualification(qualification._id)}
                    disabled={isLoading}
                  >
                    <FaTrashAlt className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No qualifications added yet.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            disabled={isLoading}
          >
            Add Your First Qualification
          </button>
        </div>
      )}
    </div>
  );
};

export default QualificationsManager;
