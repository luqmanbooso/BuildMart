import React, { useState } from 'react';
import { FaUserCircle, FaEdit, FaTrashAlt, FaPlusCircle } from 'react-icons/fa';

const ContractorProfile = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Saman',
    lastName: 'Perera',
    username: 'saman',
    email: 'samanperera@gmail.com',
    password: '******',
    address: 'P.O. BOX 1, KOTTAWA, Pannipitiya',
    phone: '+94 71 8902897'
  });

  const [qualifications, setQualifications] = useState([
    { id: 1, type: 'Certification', name: 'Licensed Contractor', issuer: 'National Construction Authority', year: '2020', expiry: '2025' },
    { id: 2, type: 'Education', name: 'BSc in Civil Engineering', issuer: 'University of Colombo', year: '2015', expiry: 'N/A' }
  ]);

  const [newQualification, setNewQualification] = useState({
    type: 'Certification',
    name: '',
    issuer: '',
    year: '',
    expiry: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddQualification = (e) => {
    e.preventDefault();
    const id = qualifications.length ? Math.max(...qualifications.map(q => q.id)) + 1 : 1;
    setQualifications([...qualifications, { id, ...newQualification }]);
    setNewQualification({
      type: 'Certification',
      name: '',
      issuer: '',
      year: '',
      expiry: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteQualification = (id) => {
    setQualifications(qualifications.filter(q => q.id !== id));
  };

  const handleNewQualificationChange = (e) => {
    const { name, value } = e.target;
    setNewQualification(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/buildmart-logo.png" alt="BuildMart" className="h-10" />
          </div>
          <nav className="flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Auction</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">About Us</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Contact Us</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="bg-blue-900 text-white px-4 py-2 rounded">Account</button>
          </div>
        </div>
      </header>

      {/* Main Title Banner */}
      <div className="bg-blue-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white">My account</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center pb-4 border-b">
              <FaUserCircle className="w-24 h-24 text-gray-500" />
              <h2 className="mt-2 text-xl font-bold">Mr.{personalInfo.firstName} {personalInfo.lastName}</h2>
              <p className="text-gray-500">{personalInfo.email}</p>
              <button className="mt-2 text-red-500 hover:text-red-700">Logout</button>
            </div>

            <nav className="mt-6 space-y-4">
              <a href="#" className="block py-2 hover:text-blue-700">My Requirements</a>
              <a href="#" className="block py-2 hover:text-blue-700">Transaction History</a>
              <a href="#" className="block py-2 hover:text-blue-700">Bidding history</a>
              <a href="#" className="block py-2 hover:text-blue-700">Ongoing works</a>
              <a href="#" className="block py-2 text-blue-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Account Settings
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Personal Info Card */}
            <div className="bg-white shadow-md rounded-md p-6 mb-8">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Personal Info</h2>
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    <img src="/avatar-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <h3 className="text-gray-600">First name:</h3>
                  <p>{personalInfo.firstName}</p>
                </div>
                <div>
                  <h3 className="text-gray-600">Last name:</h3>
                  <p>{personalInfo.lastName}</p>
                </div>
                <div>
                  <h3 className="text-gray-600">Username:</h3>
                  <p>{personalInfo.username}</p>
                </div>
                <div>
                  <h3 className="text-gray-600">Email:</h3>
                  <p>{personalInfo.email}</p>
                </div>
                <div>
                  <h3 className="text-gray-600">Password:</h3>
                  <p>{personalInfo.password}</p>
                </div>
                <div>
                  <h3 className="text-gray-600">Address:</h3>
                  <p>{personalInfo.address}</p>
                </div>
                <div>
                  <h3 className="text-gray-600">Phone No:</h3>
                  <p>{personalInfo.phone}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button className="px-4 py-2 bg-black text-white rounded">Edit</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>

            {/* Qualifications Card */}
            <div className="bg-white shadow-md rounded-md p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Qualifications</h2>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center text-blue-700 hover:text-blue-900"
                >
                  <FaPlusCircle className="mr-1" /> Add New
                </button>
              </div>

              {showAddForm && (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-4">Add New Qualification</h3>
                  <form onSubmit={handleAddQualification}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-1">Type</label>
                        <select 
                          name="type"
                          value={newQualification.type}
                          onChange={handleNewQualificationChange}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          required
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
                          required
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
                          required
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
                          required
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
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-900 text-white rounded"
                      >
                        Save Qualification
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {qualifications.length > 0 ? (
                <div className="space-y-4">
                  {qualifications.map(qualification => (
                    <div key={qualification.id} className="border rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-2">
                            {qualification.type}
                          </span>
                          <h3 className="font-medium">{qualification.name}</h3>
                          <p className="text-sm text-gray-600">
                            {qualification.issuer} • {qualification.year}
                            {qualification.expiry && qualification.expiry !== 'N/A' && ` • Expires: ${qualification.expiry}`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-500 hover:text-blue-700">
                            <FaEdit />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-red-700"
                            onClick={() => handleDeleteQualification(qualification.id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No qualifications added yet.</p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 text-blue-700 hover:underline"
                  >
                    Add your first qualification
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="mb-4">Your all-in-one platform for finding top-rated contractors and architects. Compare bids, connect with professionals, and ensure secure payments with our escrow system. Build smarter, faster, and hassle-free!</p>
              <p className="text-sm mt-8">© 2025 BuildMart . All rights reserved</p>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:underline">About Us</a></li>
                    <li><a href="#" className="hover:underline">Register to bid</a></li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
                    <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContractorProfile;