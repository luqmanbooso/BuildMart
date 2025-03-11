import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-8xl font-bold mb-4">404</h1>
        <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
        
        <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
        
        <p className="text-lg mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-white text-blue-900 hover:bg-gray-100 font-medium px-6 py-3 rounded-md transition-colors"
          >
            Go to Homepage
          </button>
          
          <button 
            onClick={() => window.history.back()}
            className="border border-white text-white hover:bg-blue-700 font-medium px-6 py-3 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
      
      <div className="mt-12 mb-6">
        <svg width="160" height="50" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10L40 40H0L20 10Z" fill="white" />
          <path d="M60 10H80V25H60V10Z" fill="white" />
          <path d="M100 40V10H140L120 25L140 40H100Z" fill="white" />
        </svg>
      </div>
      
      <p className="text-sm opacity-70">
        © 2025 BuildMart - All rights reserved
      </p>
    </div>
  );
};

export default NotFound;