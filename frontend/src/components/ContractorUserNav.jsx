import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBriefcase, FaHistory, FaChartLine, FaCog, FaSignOutAlt, FaGavel } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';

const ContractorUserNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const decoded = jwtDecode(token);
        const userId = decoded.userId;
        
        // Fetch user data
        const response = await axios.get(`http://localhost:5000/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get active link class
  const getNavLinkClass = (path) => {
    return isActive(path) 
      ? "border-blue-500 text-blue-600 border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium" 
      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-blue-800">BuildMart</Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                to="/projects" 
                className={getNavLinkClass('/projects')}
              >
                <FaBriefcase className="mr-1" /> Find Projects
              </Link>
              <Link 
                to="/bidhistory" 
                className={getNavLinkClass('/bidhistory')}
              >
                <FaHistory className="mr-1" /> Bid History
              </Link>
              <Link 
                to="/ongoingjobs" 
                className={getNavLinkClass('/ongoingjobs')}
              >
                <FaChartLine className="mr-1" /> Ongoing Projects
              </Link>
              <Link 
                to="/auction" 
                className={getNavLinkClass('/auction')}
              >
                <FaGavel className="mr-1" /> Auction
              </Link>
            </div>
          </div>

          {/* User profile dropdown */}
          <div className="ml-3 relative flex items-center">
            <div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                id="user-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open user menu</span>
                {userData?.profilePic ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={`data:image/jpeg;base64,${userData.profilePic}`}
                    alt={userData.username}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    {getInitials(userData?.username)}
                  </div>
                )}
                <span className="ml-2 text-gray-700 hidden md:block">{userData?.username}</span>
                <svg 
                  className="ml-1 h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
            
            {/* Dropdown menu */}
            {showDropdown && (
              <div 
                className="origin-top-right absolute right-0 top-10 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <Link 
                  to="/contractor-profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaUserCircle className="inline-block mr-2" /> Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaCog className="inline-block mr-2" /> Settings
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  <FaSignOutAlt className="inline-block mr-2" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ContractorUserNav;