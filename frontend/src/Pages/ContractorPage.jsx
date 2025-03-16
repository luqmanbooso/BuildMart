import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaTrashAlt, FaPlusCircle, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const ContractorProfile = () => {
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Saman',
    lastName: 'Perera',
    username: 'saman',
    email: 'samanperera@gmail.com',
    password: '******',
    address: 'P.O. BOX 1, KOTTAWA, Pannipitiya',
    phone: '+94 71 8902897'
  });

  // Qualifications state
  const [qualifications, setQualifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  
  // New qualification state with image
  const [newQualification, setNewQualification] = useState({
    type: 'Certification',
    name: '',
    issuer: '',
    year: '',
    expiry: '',
    documentImage: '' // For base64 encoded image
  });
  
  // Preview image state
  const [previewImage, setPreviewImage] = useState(null);

  // Effect to fetch data on mount
  useEffect(() => {
    fetchQualifications();
  }, []);

  // Helper to get token
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Get user ID from token
  const getUserId = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch qualifications from API
  const fetchQualifications = async () => {
    setIsLoading(true);
    setError('');
    
    const userId = getUserId();
    
    if (!userId) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/qualify/user/${userId}`);
      setQualifications(response.data);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      setError('Failed to load your qualifications. Please try again.');
      
      // Fallback data for development/demo purposes
      setQualifications([
        { _id: '1', type: 'Certification', name: 'Licensed Contractor', issuer: 'National Construction Authority', year: '2020', expiry: '2025' },
        { _id: '2', type: 'Education', name: 'BSc in Civil Engineering', issuer: 'University of Colombo', year: '2015', expiry: 'N/A' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection and conversion to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File type validation
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Please select a PNG or JPEG image');
      return;
    }
    
    // File size validation (1MB limit)
    if (file.size > 1024 * 1024) {
      toast.error('File size must be less than 1MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      
      setNewQualification(prev => ({
        ...prev,
        documentImage: base64String
      }));
      
      setPreviewImage(base64String);
    };
    
    reader.readAsDataURL(file);
  };

  // Handle form input changes
  const handleNewQualificationChange = (e) => {
    const { name, value } = e.target;
    setNewQualification(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  // Add new qualification
  const handleAddQualification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const userId = getUserId();
    
    if (!userId) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      // Add userId to the payload
      const qualificationData = {
        ...newQualification,
        userId
      };
      
      const response = await axios.post(
        'http://localhost:5000/qualify/',
        qualificationData
      );
      
      // Update state with new qualification
      setQualifications([...qualifications, response.data]);
      
      // Reset form
      setNewQualification({
        type: 'Certification',
        name: '',
        issuer: '',
        year: '',
        expiry: '',
        documentImage: ''
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

  // Update qualification
  // Simplified Update Qualification function
const handleUpdateQualification = async (e) => {
  e.preventDefault();
  
  if (!editingQualification) return;
  
  setIsLoading(true);
  setError('');
  
  // Debug what we're sending
  console.log('Updating qualification ID:', editingQualification._id);
  console.log('Sending update data:', newQualification);
  
  try {
    // Direct approach - send all form data
    const response = await axios.put(
      `http://localhost:5000/qualify/${editingQualification._id}`,
      newQualification,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Update response:', response.data);
    
    // Immediately update UI with returned data
    setQualifications(qualifications.map(q => 
      q._id === editingQualification._id ? response.data : q
    ));
    
    // Reset form
    setEditingQualification(null);
    setNewQualification({
      type: 'Certification',
      name: '',
      issuer: '',
      year: '',
      expiry: '',
      documentImage: ''
    });
    
    setPreviewImage(null);
    setShowAddForm(false);
    toast.success('Updated successfully!');
  } catch (error) {
    console.error('Update error details:', error);
    
    // More specific error message
    let errorMessage = 'Update failed';
    
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data);
      
      if (error.response.status === 404) {
        errorMessage = 'Qualification not found';
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      }
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
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
      documentImage: qualification.documentImage || ''
    });
    
    setPreviewImage(qualification.documentImage || null);
    setShowAddForm(true);
  };

  // Render verification status badge
  const renderVerificationStatus = (status) => {
    // Implementation remains the same
    switch(status) {
      case 'verified':
        return <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full ml-2">
          <FaCheckCircle className="mr-1" /> Verified
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full ml-2">
          <FaHourglassHalf className="mr-1" /> Pending
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full ml-2">
          <FaTimesCircle className="mr-1" /> Rejected
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full ml-2">
          Unverified
        </span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header section */}
      <div className="bg-gradient-to-r from-gray-800 to-blue-900 text-white p-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Contractor Profile</h1>
          <p className="text-blue-200">Manage your professional qualifications and profile</p>
        </div>
      </div>
      
      {/* Profile content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Personal Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden mb-4 flex items-center justify-center text-gray-600">
                  <FaUserCircle className="w-full h-full" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{personalInfo.firstName} {personalInfo.lastName}</h2>
                <p className="text-gray-600">@{personalInfo.username}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <span className="font-medium w-24">Email:</span>
                    <span className="text-gray-600">{personalInfo.email}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-24">Phone:</span>
                    <span className="text-gray-600">{personalInfo.phone}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-24">Address:</span>
                    <span className="text-gray-600">{personalInfo.address}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right column - Qualifications */}
          <div className="md:col-span-2">
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
                      documentImage: ''
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
                      <div>
                        <label className="block text-gray-700 mb-1">Type</label>
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
                      <div>
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input 
                          type="text"
                          name="name"
                          value={newQualification.name}
                          onChange={handleNewQualificationChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="e.g. Licensed Contractor"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Issuing Organization</label>
                        <input 
                          type="text"
                          name="issuer"
                          value={newQualification.issuer}
                          onChange={handleNewQualificationChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="e.g. National Construction Authority"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Year</label>
                        <input 
                          type="text"
                          name="year"
                          value={newQualification.year}
                          onChange={handleNewQualificationChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="e.g. 2022"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Expiry (if applicable)</label>
                        <input 
                          type="text"
                          name="expiry"
                          value={newQualification.expiry}
                          onChange={handleNewQualificationChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="N/A if not applicable"
                          disabled={isLoading}
                        />
                      </div>
                      
                      {/* Image upload field */}
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-1">
                          Certificate Image <span className="text-xs text-gray-500">(PNG/JPEG, max 1MB)</span>
                        </label>
                        <div className="flex items-center">
                          <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
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
                                setNewQualification({...newQualification, documentImage: ''});
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
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
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowAddForm(false);
                          setPreviewImage(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className={`px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
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
                            {qualification.verificationStatus && renderVerificationStatus(qualification.verificationStatus)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorProfile;