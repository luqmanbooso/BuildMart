import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersManagement = ({ allClients, allServiceProviders, setAllClients, setAllServiceProviders, isLoading }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [userFilter, setUserFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Add this function to your component
  const refreshUserData = async () => {
    try {
      // Update this to match how you're fetching users in your app
      const clientsResponse = await axios.get('http://localhost:5000/auth/clients');
      const providersResponse = await axios.get('http://localhost:5000/auth/providers');
      
      setAllClients(clientsResponse.data);
      setAllServiceProviders(providersResponse.data);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      toast.error('Failed to refresh user list');
    }
  };

  // Add this function to your component
  const testBackendConnection = async () => {
    try {
      // Test if the users endpoint is working
      const testResponse = await axios.get('http://localhost:5000/auth/users');
      console.log("API test response:", testResponse.data);
      toast.success('API connection successful');
      return true;
    } catch (error) {
      console.error("API test failed:", error);
      toast.error('Cannot connect to backend API');
      return false;
    }
  };

  // Call this in useEffect or from a test button
  useEffect(() => {
    testBackendConnection();
  }, []);

  // Add this useEffect after your existing useEffect
  useEffect(() => {
    // Expose the tab selector function globally
    window.tabSelector = (tab) => {
      if (tab === 'clients' || tab === 'serviceProviders') {
        setActiveTab(tab);
      }
    };

    // Cleanup
    return () => {
      window.tabSelector = undefined;
    };
  }, []);

  // Add this useEffect to reset userDeleteId when component mounts
  useEffect(() => {
    // Reset userDeleteId to avoid stale references
    setUserDeleteId(null);
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      // Add more robust logging to track the issue
      console.log("Attempting to delete user with ID:", userId, typeof userId);
      
      // Ensure userId is a string
      const cleanUserId = String(userId).trim();
      
      // More thorough check for userId exists
      if (!cleanUserId || cleanUserId === 'undefined' || cleanUserId === 'null') {
        const errorMsg = 'User ID is undefined or null';
        console.error(errorMsg);
        toast.error(errorMsg);
        setShowDeleteModal(false); // Close modal on error
        throw new Error(errorMsg);
      }
      
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the delete request
      const apiUrl = `http://localhost:5000/auth/users/${cleanUserId}`;
      console.log("Sending DELETE request to:", apiUrl);
      
      const response = await axios.delete(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Delete response:", response);
      
      if (response.status === 200) {
        // Update local state immediately to reflect changes
        setAllClients(prevClients => prevClients.filter(client => 
          (client._id !== cleanUserId && client.id !== cleanUserId)
        ));
        setAllServiceProviders(prevProviders => prevProviders.filter(provider => 
          (provider._id !== cleanUserId && provider.id !== cleanUserId)
        ));
        
        toast.success('User deleted successfully');
        
        // Optional: refresh data to ensure accuracy
        await refreshUserData();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      
      // Detailed error reporting
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        // Check for specific error codes
        if (error.response.status === 401) {
          toast.error('Authentication error. Please log in again.');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to delete this user.');
        } else if (error.response.status === 404) {
          toast.error('User not found. It may have been already deleted.');
          // Update local state to remove the user anyway
          setAllClients(allClients.filter(client => client._id !== cleanUserId));
          setAllServiceProviders(allServiceProviders.filter(provider => provider._id !== cleanUserId));
        } else {
          toast.error(`Error: ${error.response.data.error || 'Failed to delete user'}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error('Server did not respond. Check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to delete user');
      }
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Users Management</h2>
        <p className="text-gray-600">Manage all users in the BuildMart platform</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`py-3 px-6 text-sm font-medium ${activeTab === 'clients' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients ({allClients.length})
        </button>
        <button 
          className={`py-3 px-6 text-sm font-medium ${activeTab === 'serviceProviders' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('serviceProviders')}
        >
          Service Providers ({allServiceProviders.length})
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        
      </div>
      
      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading users...</td>
              </tr>
            ) : activeTab === 'clients' ? (
              allClients.length > 0 ? (
                allClients.filter(user => 
                  user.username?.toLowerCase().includes(userFilter.toLowerCase()) || 
                  user.email?.toLowerCase().includes(userFilter.toLowerCase())
                ).map(client => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {client.profilePic ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={`http://localhost:5000${client.profilePic}`} 
                              alt={`${client.username}'s profile`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40?text=User";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.username}</div>
                          <div className="text-xs text-gray-500">Client</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {/* View Button */}
                        <button 
                          onClick={() => {
                            setSelectedUser(client);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => {
                            try {
                              // Validate client exists
                              if (!client) {
                                console.error("Client object is undefined");
                                toast.error("Cannot delete: User data is missing");
                                return;
                              }
                              
                              // Try different possible ID formats
                              const clientId = client._id || client.id || null;
                              
                              if (!clientId) {
                                console.error("Client ID is undefined");
                                toast.error("Cannot delete: User ID is missing");
                                return;
                              }
                              
                              console.log("Setting client delete ID:", clientId);
                              setUserDeleteId(clientId);
                              setShowDeleteModal(true);
                            } catch (err) {
                              console.error("Error preparing client deletion:", err);
                              toast.error("An error occurred while preparing to delete the user");
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
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No clients found</td>
                </tr>
              )
            ) : allServiceProviders.length > 0 ? (
              allServiceProviders.filter(user => 
                user.username?.toLowerCase().includes(userFilter.toLowerCase()) || 
                user.email?.toLowerCase().includes(userFilter.toLowerCase())
              ).map(provider => (
                <tr key={provider._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {provider.profilePic ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={`http://localhost:5000${provider.profilePic}`} 
                            alt={`${provider.username}'s profile`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=User";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{provider.username}</div>
                        <div className="text-xs text-gray-500">Service Provider</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{provider.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      {/* View Button */}
                      <button 
                        onClick={() => {
                          setSelectedUser(provider);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => {
                          try {
                            // Validate provider exists
                            if (!provider) {
                              console.error("Provider object is undefined");
                              toast.error("Cannot delete: User data is missing");
                              return;
                            }
                            
                            // Try different possible ID formats
                            const providerId = provider._id || provider.id || null;
                            
                            if (!providerId) {
                              console.error("Provider ID is undefined");
                              toast.error("Cannot delete: User ID is missing");
                              return;
                            }
                            
                            console.log("Setting provider delete ID:", providerId);
                            setUserDeleteId(providerId);
                            setShowDeleteModal(true);
                          } catch (err) {
                            console.error("Error preparing provider deletion:", err);
                            toast.error("An error occurred while preparing to delete the user");
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
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No service providers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 flex justify-between sm:hidden">
          <button key="mob-prev" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button key="mob-next" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
              <span className="font-medium">{activeTab === 'clients' ? allClients.length : allServiceProviders.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button key="prev" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button key="page1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button key="page2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button key="page3" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button key="next" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              {selectedUser.profilePic ? (
                <img 
                  className="h-24 w-24 rounded-full mb-3 object-cover" 
                  src={`http://localhost:5000${selectedUser.profilePic}`} 
                  alt={selectedUser.username}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/96?text=User";
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mb-3">
                  <FaUser className="text-gray-500 text-4xl" />
                </div>
              )}
              <h4 className="text-lg font-semibold">{selectedUser.username}</h4>
              <p className="text-gray-500">{selectedUser.email}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <p><span className="font-semibold">Role:</span> {selectedUser.role}</p>
              <p><span className="font-semibold">Member Since:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
              
              {/* Show phone number if available */}
              {selectedUser.phone && (
                <p><span className="font-semibold">Phone:</span> {selectedUser.phone}</p>
              )}
              
              {/* Show address if available */}
              {selectedUser.address && (
                <p><span className="font-semibold">Address:</span> {selectedUser.address}</p>
              )}
              
              {/* Show different fields based on role */}
              {selectedUser.role === 'serviceProvider' && (
                <>
                  {selectedUser.services && (
                    <div>
                      <span className="font-semibold">Services:</span>
                      <ul className="ml-5 list-disc">
                        {selectedUser.services.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedUser.skills && (
                    <p><span className="font-semibold">Skills:</span> {selectedUser.skills.join(', ')}</p>
                  )}
                  
                  {selectedUser.experience && (
                    <p><span className="font-semibold">Experience:</span> {selectedUser.experience} years</p>
                  )}
                </>
              )}
              
              {/* Completed projects count if available */}
              {selectedUser.completedProjects && (
                <p><span className="font-semibold">Completed Projects:</span> {selectedUser.completedProjects}</p>
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
                onClick={() => setShowUserModal(false)}
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
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
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
                    if (!userDeleteId) {
                      console.error("userDeleteId is undefined or null");
                      toast.error("Cannot delete: User ID is missing");
                      setShowDeleteModal(false); // Close modal on error
                      return;
                    }
                    
                    // Store the ID in a local variable to ensure it doesn't change
                    const idToDelete = String(userDeleteId); // Convert to string to ensure consistency
                    
                    // Log the ID being passed to ensure it's correct
                    console.log("Executing delete with ID:", idToDelete);
                    
                    // Pass the local variable to handleDeleteUser
                    handleDeleteUser(idToDelete);
                  } catch (err) {
                    console.error("Error in delete confirmation:", err);
                    toast.error("An error occurred while attempting to delete the user");
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

export default UsersManagement;