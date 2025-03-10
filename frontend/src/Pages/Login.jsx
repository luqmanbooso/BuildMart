import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For the password visibility toggle

const Login = () => {
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-indigo-600 to-blue-700">
      {/* Top Bar */}
      <div className="bg-blue-800 text-white p-4 text-center text-3xl font-bold tracking-wide">
        Sign in
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-8">
        <div className="flex max-w-7xl w-full shadow-2xl rounded-3xl overflow-hidden bg-white">
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 p-12 space-y-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 animate__animated animate__fadeIn">
              Sign In
            </h1>
            <form>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Username or email address</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                  placeholder="Enter username or email"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 hover:text-blue-500"
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 mr-2 transition-all duration-300 transform hover:scale-105" />
                  <label className="text-sm text-gray-600">Remember me</label>
                </div>
                <a href="#" className="text-sm text-blue-500 hover:underline transition-all duration-300">
                  Lost your password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Right Side - Graphic Banner */}
          <div className="hidden md:flex w-1/2 bg-gradient-to-r from-blue-700 to-blue-900 text-white p-12 flex-col justify-center space-y-6">
            <h1 className="text-5xl font-bold mb-6 animate__animated animate__fadeIn">
              ONLINE AUCTION
            </h1>
            <h2 className="text-2xl font-semibold mb-6 animate__animated animate__fadeIn animate__delay-1s">
              BID NOW
            </h2>
            <p className="text-lg mb-8 animate__animated animate__fadeIn animate__delay-2s">
              Your all-in-one platform for finding top-rated construction and aesthetics. Compare
              bids, connect with professionals, and ensure secure payments with our escrow system.
              Build smarter, faster, and hassle-free!
            </p>
            <div className="space-x-4 animate__animated animate__fadeIn animate__delay-3s">
              <a href="#" className="text-white hover:underline transition-all duration-300">
                About Us
              </a>
              <a href="#" className="text-white hover:underline transition-all duration-300">
                Register to bid
              </a>
              <a href="#" className="text-white hover:underline transition-all duration-300">
                Terms & Conditions
              </a>
              <a href="#" className="text-white hover:underline transition-all duration-300">
                Privacy Policy
              </a>
            </div>
            <p className="mt-8 text-sm">© 2025 BuildMart. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center">
        <div className="flex justify-center space-x-8">
          <a href="#" className="text-white hover:underline transition-all duration-300">
            About Us
          </a>
          <a href="#" className="text-white hover:underline transition-all duration-300">
            Register to bid
          </a>
          <a href="#" className="text-white hover:underline transition-all duration-300">
            Terms & Conditions
          </a>
          <a href="#" className="text-white hover:underline transition-all duration-300">
            Privacy Policy
          </a>
        </div>
        <p className="mt-4 text-xs">© 2025 BuildMart. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
