import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [contractors, setContractors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/contractors');
        setContractors(response.data);
      } catch (error) {
        console.error('Error fetching contractors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractors();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {isLoading ? (
        <p>Loading contractors...</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Contractors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractors.map((contractor, index) => (
              <div
                key={`contractor-${contractor._id || contractor.id || index}`}
                className="p-4 border rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-medium">{contractor.companyName || 'N/A'}</h3>
                <p className="text-sm text-gray-600">Specialization: {contractor.specialization.join(', ') || 'N/A'}</p>
                <p className="text-sm text-gray-600">Verified: {contractor.verified ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;