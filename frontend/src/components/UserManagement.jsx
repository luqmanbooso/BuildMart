import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaTimes, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersManagement = ({ allClients, allServiceProviders, setAllClients, setAllServiceProviders, isLoading }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [userFilter, setUserFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCriteria, setReportCriteria] = useState({
    userType: 'all',
    verificationStatus: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    fields: ['username', 'email', 'role', 'createdAt']
  });
  const [reportData, setReportData] = useState(null);

  // Available fields for reports
  const availableFields = {
    basic: ['username', 'email', 'role', 'createdAt', 'updatedAt'],
    contractor: ['companyName', 'address', 'phone', 'specialization', 'experienceYears', 'completedProjects', 'verified']
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [contractorProfiles, setContractorProfiles] = useState({});

  const refreshUserData = async () => {
    try {
      const clientsResponse = await axios.get('http://localhost:5000/api/users?role=Client');
      const providersResponse = await axios.get('http://localhost:5000/api/users?role=Service Provider');
      
      if (clientsResponse.data && Array.isArray(clientsResponse.data)) {
        setAllClients(clientsResponse.data);
      }
      
      if (providersResponse.data && Array.isArray(providersResponse.data)) {
        setAllServiceProviders(providersResponse.data);
        fetchContractorProfiles(providersResponse.data);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      toast.error('Failed to refresh user list. Please check API connectivity.');
    }
  };

  const fetchContractorProfile = async (userId) => {
    if (!userId) {
      console.error("Cannot fetch contractor profile: userId is undefined");
      return null;
    }
    
    console.log("Fetching contractor profile for userId:", userId);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/contractors/user/${userId}`);
      console.log("Contractor profile fetched successfully:", response.data);
      return response.data;
    } catch (firstError) {
      console.log("First endpoint failed:", firstError.message);
      
      try {
        const altResponse = await axios.get(`http://localhost:5000/contractors/user/${userId}`);
        console.log("Contractor profile fetched from alternative endpoint:", altResponse.data);
        return altResponse.data;
      } catch (secondError) {
        console.error("Both contractor profile endpoints failed for userId:", userId);
        return null;
      }
    }
  };

  const fetchContractorProfiles = async (providers) => {
    try {
      const newProfiles = { ...contractorProfiles };
      console.log("Starting to fetch contractor profiles for", providers.length, "providers");
      
      for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        const providerId = provider._id || provider.id;
        
        if (!providerId) {
          console.log(`Provider at index ${i} has no ID:`, provider);
          continue;
        }
        
        try {
          console.log(`[${i+1}/${providers.length}] Fetching profile for provider:`, providerId);
          const response = await axios.get(`http://localhost:5000/api/contractors/user/${providerId}`);
          
          if (response.data) {
            console.log(`Profile found for ${providerId}:`, response.data);
            newProfiles[providerId] = response.data;
            
            provider.verified = response.data.verified || false;
            provider.contractorId = response.data._id;
            console.log(`Updated provider ${providerId} verification status to:`, provider.verified);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`No contractor profile found for user ${providerId}`);
          } else {
            console.error(`Error fetching profile for ${providerId}:`, error);
          }
        }
      }
      
      console.log("Finished fetching contractor profiles, updating state");
      setContractorProfiles(newProfiles);
    } catch (error) {
      console.error("Failed to fetch contractor profiles:", error);
    }
  };

  const testBackendConnection = async () => {
    try {
      const testResponse = await axios.get('http://localhost:5000/api/users');
      console.log("API test response:", testResponse.data);
      toast.success('API connection successful');
      return true;
    } catch (error) {
      console.error("API test failed:", error);
      toast.error('Cannot connect to backend API');
      return false;
    }
  };

  const showUserDetails = async (user) => {
    let enhancedUser = { ...user };
    
    if (user.role === 'serviceProvider') {
      try {
        const contractorProfile = await fetchContractorProfile(user._id);
        if (contractorProfile) {
          enhancedUser = { 
            ...enhancedUser, 
            contractorProfile,
            verified: contractorProfile.verified
          };
        }
      } catch (error) {
        console.error("Error enhancing user with contractor details:", error);
      }
    }
    
    setSelectedUser(enhancedUser);
    setShowUserModal(true);
  };

  const handleVerifyContractor = async (provider) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required to verify contractors');
        return;
      }
      
      console.log("VERIFICATION START - Provider data:", provider);
      
      const userId = provider._id || provider.id;
      let contractorId = provider.contractorId;
      
      console.log("Using userId:", userId, "contractorId:", contractorId);
      
      if (!userId) {
        toast.error('Cannot verify: User ID not found');
        return;
      }
      
      if (!contractorId) {
        try {
          console.log("No contractor ID available, fetching profile for userId:", userId);
          const response = await axios.get(`http://localhost:5000/api/contractors/user/${userId}`);
          
          if (response.data) {
            contractorId = response.data._id;
            console.log("Found contractorId from API:", contractorId);
          } else {
            throw new Error("No contractor profile returned");
          }
        } catch (error) {
          console.error("Failed to fetch contractor profile:", error);
          toast.error('Contractor profile not found. The user may not have created a contractor profile.');
          return;
        }
      }
      
      if (!contractorId) {
        toast.error('Cannot verify: Missing contractor ID');
        return;
      }
      
      console.log("Sending verification request for contractorId:", contractorId);
      const response = await axios.put(
        `http://localhost:5000/api/contractors/verify/${contractorId}`,
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Verification API response:", response.data);
      
      if (response.data && response.data.contractor) {
        const newVerificationStatus = response.data.contractor.verified;
        console.log(`Contractor ${contractorId} new verification status:`, newVerificationStatus);
        
        setAllServiceProviders(prevProviders => 
          prevProviders.map(p => {
            if (p._id === userId || p.id === userId) {
              console.log("Updating provider in list:", p._id || p.id);
              return { 
                ...p, 
                verified: newVerificationStatus,
                contractorId: contractorId
              };
            }
            return p;
          })
        );
        
        setContractorProfiles(prev => {
          const updatedProfiles = { ...prev };
          if (updatedProfiles[userId]) {
            console.log("Updating contractor profile in cache for:", userId);
            updatedProfiles[userId] = {
              ...updatedProfiles[userId],
              verified: newVerificationStatus
            };
          }
          return updatedProfiles;
        });
        
        if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
          console.log("Updating selected user in modal view");
          setSelectedUser(prev => ({
            ...prev,
            verified: newVerificationStatus,
            contractorProfile: prev.contractorProfile ? {
              ...prev.contractorProfile,
              verified: newVerificationStatus
            } : undefined
          }));
        }
        
        toast.success(`Contractor ${newVerificationStatus ? 'verified' : 'unverified'} successfully`);
        
        setTimeout(() => {
          console.log("Refreshing service provider data after verification");
          fetchContractorProfiles(allServiceProviders);
        }, 500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error('Failed to toggle verification status: ' + (error.message || 'Unknown error'));
    }
  };

  const generateReport = () => {
    try {
      console.log("Generating report with criteria:", reportCriteria);
      
      // Filter users based on type
      let usersToInclude = [];
      if (reportCriteria.userType === 'all') {
        usersToInclude = [...allClients, ...allServiceProviders];
      } else if (reportCriteria.userType === 'clients') {
        usersToInclude = [...allClients];
      } else {
        usersToInclude = [...allServiceProviders];
      }
      
      // Filter by date range if specified
      if (reportCriteria.dateRange.start) {
        const startDate = new Date(reportCriteria.dateRange.start);
        usersToInclude = usersToInclude.filter(user => 
          new Date(user.createdAt) >= startDate
        );
      }
      
      if (reportCriteria.dateRange.end) {
        const endDate = new Date(reportCriteria.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        usersToInclude = usersToInclude.filter(user => 
          new Date(user.createdAt) <= endDate
        );
      }
      
      // Filter service providers by verification status if needed
      if (reportCriteria.userType === 'serviceProviders' || reportCriteria.userType === 'all') {
        if (reportCriteria.verificationStatus === 'verified') {
          usersToInclude = usersToInclude.filter(user => 
            user.role === 'Client' || user.verified
          );
        } else if (reportCriteria.verificationStatus === 'unverified') {
          usersToInclude = usersToInclude.filter(user => 
            user.role === 'Client' || !user.verified
          );
        }
      }
      
      // Remove duplicates (by ID)
      const uniqueIds = new Set();
      const uniqueUsers = usersToInclude.filter(user => {
        const userId = user._id || user.id;
        if (uniqueIds.has(userId)) {
          return false;
        }
        uniqueIds.add(userId);
        return true;
      });
      
      // Enhance service provider data with contractor profiles if selected
      const enhancedUsers = uniqueUsers.map(user => {
        if (user.role === 'serviceProvider') {
          const userId = user._id || user.id;
          const contractorProfile = contractorProfiles[userId];
          
          if (contractorProfile) {
            return {
              ...user,
              // Add contractor fields if they're in the selected fields
              ...(reportCriteria.fields.includes('companyName') && { companyName: contractorProfile.companyName }),
              ...(reportCriteria.fields.includes('address') && { address: contractorProfile.address }),
              ...(reportCriteria.fields.includes('phone') && { phone: contractorProfile.phone || user.phone }),
              ...(reportCriteria.fields.includes('specialization') && { specialization: contractorProfile.specialization?.join(', ') }),
              ...(reportCriteria.fields.includes('experienceYears') && { experienceYears: contractorProfile.experienceYears }),
              ...(reportCriteria.fields.includes('completedProjects') && { completedProjects: contractorProfile.completedProjects }),
              verified: user.verified || contractorProfile.verified || false
            };
          }
        }
        return user;
      });
      
      // Filter fields based on selection
      const reportResult = enhancedUsers.map(user => {
        const filteredUser = {};
        reportCriteria.fields.forEach(field => {
          if (user[field] !== undefined) {
            filteredUser[field] = user[field];
          }
        });
        return filteredUser;
      });
      
      setReportData(reportResult);
      
      // Format date for filename
      const today = new Date().toISOString().split('T')[0];
      const userTypeLabel = reportCriteria.userType === 'all' ? 'all_users' : reportCriteria.userType;
      const filename = `${userTypeLabel}_report_${today}.csv`;
      
      // Convert to CSV and download
      const csvData = convertToCSV(reportResult);
      downloadCSV(csvData, filename);
      
      toast.success(`Report generated successfully: ${reportResult.length} records`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  
  const filteredClients = allClients.filter(user => 
    user.username?.toLowerCase().includes(userFilter.toLowerCase()) || 
    user.email?.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  const filteredProviders = allServiceProviders.filter(user => 
    user.username?.toLowerCase().includes(userFilter.toLowerCase()) || 
    user.email?.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  const currentClients = filteredClients.slice(indexOfFirstRecord, indexOfLastRecord);
  const currentProviders = filteredProviders.slice(indexOfFirstRecord, indexOfLastRecord);
  
  const totalPages = Math.ceil(
    (activeTab === 'clients' ? filteredClients.length : filteredProviders.length) / recordsPerPage
  );
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await testBackendConnection();
      
      if (allServiceProviders.length > 0) {
        console.log("Loading contractor profiles for service providers...");
        await fetchContractorProfiles(allServiceProviders);
      }
    };
    
    loadInitialData();

    window.tabSelector = (tab) => {
      if (tab === 'clients' || tab === 'serviceProviders') {
        setActiveTab(tab);
      }
    };

    setUserDeleteId(null);
    
    return () => {
      window.tabSelector = undefined;
    };
  }, [allServiceProviders.length]);

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const allKeys = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] !== 'object' && item[key] !== null) {
          allKeys.add(key);
        }
      });
    });
    
    const headers = Array.from(allKeys).filter(key => 
      !['__v', 'password', 'profilePic'].includes(key)
    );
    
    let csv = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header] !== undefined ? item[header] : '';
        
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        
        if (header === 'createdAt' || header === 'updatedAt') {
          return value ? new Date(value).toLocaleString() : '';
        }
        
        return value;
      }).join(',');
      
      csv += row + '\n';
    });
    
    return csv;
  };

  const downloadCSV = (csvData, filename = 'users_data.csv') => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${filename} downloaded successfully`);
  };
  
  const handleDownloadUsers = () => {
    try {
      let usersToExport = [];
      let filename = '';
      
      if (activeTab === 'clients') {
        usersToExport = allClients;
        filename = `clients_data_${new Date().toISOString().slice(0,10)}.csv`;
      } else {
        usersToExport = allServiceProviders;
        filename = `service_providers_data_${new Date().toISOString().slice(0,10)}.csv`;
      }
      
      if (usersToExport.length === 0) {
        toast.info('No users available to export');
        return;
      }
      
      const csvData = convertToCSV(usersToExport);
      downloadCSV(csvData, filename);
      
    } catch (error) {
      console.error('Error exporting users data:', error);
      toast.error('Failed to export users data');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Users Management</h2>
        <p className="text-gray-600">Manage all users in the BuildMart platform</p>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`py-3 px-6 text-sm font-medium ${activeTab === 'clients' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('clients');
            setCurrentPage(1);
          }}
        >
          Clients ({filteredClients.length})
        </button>
        <button 
          className={`py-3 px-6 text-sm font-medium ${activeTab === 'serviceProviders' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('serviceProviders');
            setCurrentPage(1);
          }}
        >
          Service Providers ({filteredProviders.length})
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleDownloadUsers}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FaDownload className="mr-2" />
            <span>Export {activeTab === 'clients' ? 'Clients' : 'Service Providers'}</span>
          </button>
        </div>
      </div>
      
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
              currentClients.length > 0 ? (
                currentClients.map(client => (
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
                        <button 
                          onClick={() => showUserDetails(client)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        
                        <button 
                          onClick={() => {
                            try {
                              if (!client) {
                                console.error("Client object is undefined");
                                toast.error("Cannot delete: User data is missing");
                                return;
                              }
                              
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
            ) : currentProviders.length > 0 ? (
              currentProviders.map(provider => (
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (provider.verified || contractorProfiles[provider._id]?.verified || contractorProfiles[provider.id]?.verified)
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(provider.verified || contractorProfiles[provider._id]?.verified || contractorProfiles[provider.id]?.verified) 
                        ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => showUserDetails(provider)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      
                      <button 
                        onClick={() => {
                          try {
                            if (!provider) {
                              console.error("Provider object is undefined");
                              toast.error("Cannot delete: User data is missing");
                              return;
                            }
                            
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
                      <button
                        onClick={() => handleVerifyContractor({
                          ...provider,
                          _id: provider._id || provider.id,
                          id: provider.id || provider._id,
                          contractorId: provider.contractorId || 
                                      (contractorProfiles[provider._id] && contractorProfiles[provider._id]._id) ||
                                      (contractorProfiles[provider.id] && contractorProfiles[provider.id]._id)
                        })}
                        className={`text-${
                          (provider.verified || contractorProfiles[provider._id]?.verified || contractorProfiles[provider.id]?.verified) ? 'red' : 'blue'
                        }-600 hover:text-${
                          (provider.verified || contractorProfiles[provider._id]?.verified || contractorProfiles[provider.id]?.verified) ? 'red' : 'blue'
                        }-900`}
                      >
                        {(provider.verified || contractorProfiles[provider._id]?.verified || contractorProfiles[provider.id]?.verified) 
                          ? 'Unverify' : 'Verify'}
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
      
      <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 flex justify-between sm:hidden">
          <button 
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border ${
              currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } text-sm font-medium rounded-md bg-white`}
          >
            Previous
          </button>
          <button 
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border ${
              currentPage === totalPages || totalPages === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } text-sm font-medium rounded-md bg-white`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, (activeTab === 'clients' ? filteredClients.length : filteredProviders.length))}
              </span> of{" "}
              <span className="font-medium">{activeTab === 'clients' ? filteredClients.length : filteredProviders.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                  currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                } bg-white text-sm font-medium`}
              >
                Previous
              </button>
              
              {pageNumbers.map(number => (
                <button 
                  key={`page-${number}-${activeTab}`}
                  onClick={() => goToPage(number)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === number 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600 z-10' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  {number}
                </button>
              ))}
              
              <button 
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                  currentPage === totalPages || totalPages === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                } bg-white text-sm font-medium`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
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
              
              {selectedUser.role === 'serviceProvider' && (
                <div className="mt-2">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedUser.verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.verified ? 'Verified Provider' : 'Not Verified'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 mb-4">
              <h5 className="font-semibold text-gray-700 mb-2">Basic Information</h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
              </div>
            </div>
            
            {selectedUser.role === 'serviceProvider' && selectedUser.contractorProfile && (
              <div className="border-t pt-4 mb-4">
                <h5 className="font-semibold text-gray-700 mb-2">Contractor Information</h5>
                <div className="space-y-3">
                  {selectedUser.contractorProfile.companyName && (
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{selectedUser.contractorProfile.companyName}</p>
                    </div>
                  )}
                  
                  {selectedUser.contractorProfile.address && (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedUser.contractorProfile.address}</p>
                    </div>
                  )}
                  
                  {selectedUser.contractorProfile.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium">{selectedUser.contractorProfile.phone}</p>
                    </div>
                  )}
                  
                  {selectedUser.contractorProfile.specialization && selectedUser.contractorProfile.specialization.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Specializations</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUser.contractorProfile.specialization.map((spec, index) => (
                          <span key={`spec-${spec}-${index}`} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.contractorProfile.experienceYears !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{selectedUser.contractorProfile.experienceYears} years</p>
                      </div>
                    )}
                    
                    {selectedUser.contractorProfile.completedProjects !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Projects</p>
                        <p className="font-medium">{selectedUser.contractorProfile.completedProjects} completed</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedUser.contractorProfile.bio && (
                    <div>
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="text-sm mt-1 text-gray-700">{selectedUser.contractorProfile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t flex justify-between">
              <button 
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              
              {selectedUser.role === 'serviceProvider' && (
                <button
                  onClick={() => {
                    handleVerifyContractor({
                      ...selectedUser,
                      id: selectedUser.id || selectedUser._id,
                      _id: selectedUser._id || selectedUser.id
                    });
                  }}
                  className={`px-4 py-2 rounded text-white ${
                    selectedUser.verified
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {selectedUser.verified ? 'Unverify Provider' : 'Verify Provider'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
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
                      setShowDeleteModal(false);
                      return;
                    }
                    
                    const idToDelete = String(userDeleteId);
                    
                    console.log("Executing delete with ID:", idToDelete);
                    
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

      {showReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Generate Custom Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">User Type</h4>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="all"
                      checked={reportCriteria.userType === 'all'}
                      onChange={() => setReportCriteria({...reportCriteria, userType: 'all'})}
                      className="text-blue-600"
                    />
                    <span>All Users</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="clients"
                      checked={reportCriteria.userType === 'clients'}
                      onChange={() => setReportCriteria({...reportCriteria, userType: 'clients'})}
                      className="text-blue-600"
                    />
                    <span>Clients Only</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="serviceProviders"
                      checked={reportCriteria.userType === 'serviceProviders'}
                      onChange={() => setReportCriteria({...reportCriteria, userType: 'serviceProviders'})}
                      className="text-blue-600"
                    />
                    <span>Service Providers Only</span>
                  </label>
                </div>
              </div>
              
              {(reportCriteria.userType === 'serviceProviders' || reportCriteria.userType === 'all') && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Verification Status</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="verificationStatus"
                        value="all"
                        checked={reportCriteria.verificationStatus === 'all'}
                        onChange={() => setReportCriteria({...reportCriteria, verificationStatus: 'all'})}
                        className="text-blue-600"
                      />
                      <span>All</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="verificationStatus"
                        value="verified"
                        checked={reportCriteria.verificationStatus === 'verified'}
                        onChange={() => setReportCriteria({...reportCriteria, verificationStatus: 'verified'})}
                        className="text-blue-600"
                      />
                      <span>Verified Only</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="verificationStatus"
                        value="unverified"
                        checked={reportCriteria.verificationStatus === 'unverified'}
                        onChange={() => setReportCriteria({...reportCriteria, verificationStatus: 'unverified'})}
                        className="text-blue-600"
                      />
                      <span>Unverified Only</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Date Range</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={reportCriteria.dateRange.start}
                      onChange={(e) => setReportCriteria({
                        ...reportCriteria, 
                        dateRange: {...reportCriteria.dateRange, start: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={reportCriteria.dateRange.end}
                      onChange={(e) => setReportCriteria({
                        ...reportCriteria, 
                        dateRange: {...reportCriteria.dateRange, end: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Fields to Include</h4>
                <div className="border rounded p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <h5 className="col-span-2 font-medium text-gray-600 text-sm mb-1">Basic Fields</h5>
                    {availableFields.basic.map(field => (
                      <label key={field} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={reportCriteria.fields.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReportCriteria({
                                ...reportCriteria,
                                fields: [...reportCriteria.fields, field]
                              });
                            } else {
                              setReportCriteria({
                                ...reportCriteria,
                                fields: reportCriteria.fields.filter(f => f !== field)
                              });
                            }
                          }}
                          className="text-blue-600"
                        />
                        <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                      </label>
                    ))}
                    
                    {(reportCriteria.userType === 'serviceProviders' || reportCriteria.userType === 'all') && (
                      <>
                        <h5 className="col-span-2 font-medium text-gray-600 text-sm mb-1 mt-3">Contractor Fields</h5>
                        {availableFields.contractor.map(field => (
                          <label key={field} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={reportCriteria.fields.includes(field)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReportCriteria({
                                    ...reportCriteria,
                                    fields: [...reportCriteria.fields, field]
                                  });
                                } else {
                                  setReportCriteria({
                                    ...reportCriteria,
                                    fields: reportCriteria.fields.filter(f => f !== field)
                                  });
                                }
                              }}
                              className="text-blue-600"
                            />
                            <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between">
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              
              <button
                onClick={generateReport}
                disabled={reportCriteria.fields.length === 0}
                className={`px-4 py-2 rounded text-white ${
                  reportCriteria.fields.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;