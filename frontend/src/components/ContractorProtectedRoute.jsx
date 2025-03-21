import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// If you don't have jwt-decode installed, run:
// npm install jwt-decode

const ContractorProtectedRoute = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    // No token = not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  try {
    const decoded = jwtDecode(token);
    
    // Check if user is contractor
    const isContractor = decoded.role === 'Service Provider';
    if (!isContractor) {
      // Not a contractor, redirect to home
      return <Navigate to="/" replace />;
    }
    
    // Check if profile is complete
    const profileComplete = localStorage.getItem('contractorProfileComplete') === 'true';
    if (!profileComplete) {
      // Profile incomplete, redirect to onboarding
      return <Navigate to="/contractorStart" replace />;
    }
    
    // All checks passed, render the protected route
    return <Outlet />;
  } catch (error) {
    console.error("Token validation error:", error);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ContractorProtectedRoute;