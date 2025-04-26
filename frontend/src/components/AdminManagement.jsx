import React, { useState, useEffect } from 'react';
import { FaUser, FaUserPlus, FaTimes, FaUserShield, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminManagement = ({ allAdmins, setAllAdmins, isLoading }) => {
  const [nameFilter, setNameFilter] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminDeleteId, setAdminDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Function to refresh admin data
  const refreshAdminData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/admins');
      setAllAdmins(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to refresh admin data:", error);
      toast.error('Failed to refresh admin list');
      return [];
    }
  };

  // Handle input changes for new admin form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!newAdmin.username || newAdmin.username.trim() === '') {
      newErrors.username = 'Username is required';
    }
    
    if (!newAdmin.email || newAdmin.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!newAdmin.password || newAdmin.password.trim() === '') {
      newErrors.password = 'Password is required';
    } else if (newAdmin.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get token for authorization
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/auth/register', 
        {
          username: newAdmin.username,
          email: newAdmin.email,
          password: newAdmin.password,
          role: 'Admin'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        toast.success('Admin user created successfully');
        
        // Refresh the admin list
        const updatedAdmins = await refreshAdminData();
        
        // Close modal and reset form
        setShowAddAdminModal(false);
        setNewAdmin({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error("Failed to create admin:", error);
      
      if (error.response) {
        if (error.response.status === 400 && error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Failed to create admin user');
        }
      } else {
        toast.error('Error connecting to server');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle admin deletion
  const handleDeleteAdmin = async (adminId) => {
    try {
      console.log("Attempting to delete admin with ID:", adminId);
      
      // Ensure adminId is a string
      const cleanAdminId = String(adminId).trim();
      
      if (!cleanAdminId || cleanAdminId === 'undefined' || cleanAdminId === 'null') {
        const errorMsg = 'Admin ID is undefined or null';
        console.error(errorMsg);
        toast.error(errorMsg);
        setShowDeleteModal(false);
        return;
      }
      
      // Get token for authorization
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the delete request
      const apiUrl = `http://localhost:5000/auth/users/${cleanAdminId}`;
      console.log("Sending DELETE request to:", apiUrl);
      
      const response = await axios.delete(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Delete response:", response);
      
      if (response.status === 200) {
        // Update local state to remove the deleted admin
        setAllAdmins(prevAdmins => prevAdmins.filter(admin => 
          (admin._id !== cleanAdminId && admin.id !== cleanAdminId)
        ));
        
        toast.success('Admin deleted successfully');
      }
    } catch (error) {
      console.error("Failed to delete admin:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 401) {
          toast.error('Authentication error. Please log in again.');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to delete this admin.');
        } else if (error.response.status === 404) {
          toast.error('Admin not found. It may have been already deleted.');
          setAllAdmins(allAdmins.filter(admin => admin._id !== cleanAdminId));
        } else {
          toast.error(`Error: ${error.response.data.error || 'Failed to delete admin'}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error('Server did not respond. Check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to delete admin');
      }
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Admin Management</h2>
        <p className="text-gray-600">View and manage system administrators</p>
      </div>
      
      {/* Search and Add Admin */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search admins..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        
        <button 
          onClick={() => setShowAddAdminModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaUserPlus className="mr-2" /> Add New Admin
        </button>
      </div>
      
      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading admins...</td>
              </tr>
            ) : allAdmins.length > 0 ? (
              allAdmins.filter(admin => 
                admin.username?.toLowerCase().includes(nameFilter.toLowerCase()) || 
                admin.email?.toLowerCase().includes(nameFilter.toLowerCase())
              ).map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {admin.profilePic ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={`http://localhost:5000${admin.profilePic}`} 
                            alt={`${admin.username}'s profile`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=Admin";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                            <FaUserShield className="text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                        <div className="text-xs text-gray-500">Administrator</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      {/* View Button */}
                      <button 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowAdminModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => {
                          try {
                            if (!admin) {
                              console.error("Admin object is undefined");
                              toast.error("Cannot delete: Admin data is missing");
                              return;
                            }
                            
                            const adminId = admin._id || admin.id || null;
                            
                            if (!adminId) {
                              console.error("Admin ID is undefined");
                              toast.error("Cannot delete: Admin ID is missing");
                              return;
                            }
                            
                            console.log("Setting admin delete ID:", adminId);
                            setAdminDeleteId(adminId);
                            setShowDeleteModal(true);
                          } catch (err) {
                            console.error("Error preparing admin deletion:", err);
                            toast.error("An error occurred while preparing to delete the admin");
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No admins found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Admin</h3>
              <button onClick={() => setShowAddAdminModal(false)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newAdmin.username}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={newAdmin.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Admin Details Modal */}
      {showAdminModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Admin Details</h3>
              <button onClick={() => setShowAdminModal(false)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              {selectedAdmin.profilePic ? (
                <img 
                  className="h-24 w-24 rounded-full mb-3 object-cover" 
                  src={`http://localhost:5000${selectedAdmin.profilePic}`} 
                  alt={selectedAdmin.username}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/96?text=Admin";
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-200 flex items-center justify-center mb-3">
                  <FaUserShield className="text-blue-600 text-4xl" />
                </div>
              )}
              <h4 className="text-lg font-semibold">{selectedAdmin.username}</h4>
              <p className="text-gray-500">{selectedAdmin.email}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <p><span className="font-semibold">Role:</span> {selectedAdmin.role}</p>
              <p><span className="font-semibold">Member Since:</span> {new Date(selectedAdmin.createdAt).toLocaleDateString()}</p>
              <p><span className="font-semibold">Email:</span> {selectedAdmin.email}</p>
              
              {/* Show phone number if available */}
              {selectedAdmin.phone && (
                <p><span className="font-semibold">Phone:</span> {selectedAdmin.phone}</p>
              )}
              
              {/* Show address if available */}
              {selectedAdmin.address && (
                <p><span className="font-semibold">Address:</span> {selectedAdmin.address}</p>
              )}
              
              {/* Status field */}
              <p>
                <span className="font-semibold">Status:</span> 
                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </p>
            </div>
            
            {/* Add action buttons at the bottom of the modal */}
            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
              <button 
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Confirm Admin Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this admin user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  try {
                    if (!adminDeleteId) {
                      console.error("adminDeleteId is undefined or null");
                      toast.error("Cannot delete: Admin ID is missing");
                      setShowDeleteModal(false);
                      return;
                    }
                    
                    const idToDelete = String(adminDeleteId);
                    console.log("Executing delete with ID:", idToDelete);
                    
                    handleDeleteAdmin(idToDelete);
                  } catch (err) {
                    console.error("Error in delete confirmation:", err);
                    toast.error("An error occurred while attempting to delete the admin");
                    setShowDeleteModal(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
