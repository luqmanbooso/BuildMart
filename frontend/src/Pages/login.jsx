import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Side - Login Form */}
      <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-8">Sign in</h1>
        <form>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Username or email address</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username or email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 mr-2"
              />
              <label className="text-sm">Remember me</label>
            </div>
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Lost your password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Sign in
          </button>
        </form>
      </div>

      {/* Right Side - Banner */}
      <div className="w-1/2 bg-blue-500 p-12 flex flex-col justify-center text-white">
        <h1 className="text-5xl font-bold mb-6">ONLINE AUCTION</h1>
        <h2 className="text-3xl font-bold mb-6">BID NOW</h2>
        <p className="text-lg mb-8">
          Your all-in-one platform for finding top-rated construction and aesthetics. Compare
          tabs, connect with professionals, and ensure secure payments with our escrow system.
          Build smarter, faster, and stress-free!
        </p>
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:underline">
            About Us
          </a>
          <a href="#" className="text-white hover:underline">
            Register to bid
          </a>
          <a href="#" className="text-white hover:underline">
            Terms & Conditions
          </a>
          <a href="#" className="text-white hover:underline">
            Privacy Policy
          </a>
        </div>
        <p className="mt-8 text-sm">© 2025 BuildMart. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;