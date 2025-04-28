import React from 'react'

export default function UserProfile() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 mr-4"></div>
          <div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600">john.doe@example.com</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Full Name</label>
              <input type="text" className="w-full border rounded p-2" defaultValue="John Doe" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <input type="email" className="w-full border rounded p-2" defaultValue="john.doe@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Phone</label>
              <input type="tel" className="w-full border rounded p-2" defaultValue="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Address</label>
              <input type="text" className="w-full border rounded p-2" defaultValue="123 Main St" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
