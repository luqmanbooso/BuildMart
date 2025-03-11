import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For password visibility toggle
import { motion } from "framer-motion"; // For animations

const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-indigo-600 to-blue-700">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-blue-800 text-white p-4 text-center text-3xl font-bold tracking-wide shadow-lg"
      >
        Sign Up
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex max-w-7xl w-full shadow-2xl rounded-3xl overflow-hidden bg-white"
        >
          {/* Left Side - Sign Up Form */}
          <div className="w-full md:w-1/2 p-12 space-y-8">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Sign Up
            </motion.h1>
            <form>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                  placeholder="Enter username"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                  placeholder="Enter email address"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition-all duration-300"
                  >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition-all duration-300"
                  >
                    {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-xl"
              >
                Sign Up
              </motion.button>
            </form>
          </div>

          {/* Right Side - Graphic Banner */}
          <div className="hidden md:flex w-1/2 bg-gradient-to-r from-blue-700 to-blue-900 text-white p-12 flex-col justify-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl font-bold mb-6"
            >
              ONLINE AUCTION
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl font-semibold mb-6"
            >
              BID NOW
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-lg mb-8"
            >
              Your all-in-one platform for finding top-rated construction and aesthetics. Compare
              bids, connect with professionals, and ensure secure payments with our escrow system.
              Build smarter, faster, and hassle-free!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="space-x-4"
            >
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
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-8 text-sm"
            >
              © 2025 BuildMart. All rights reserved.
            </motion.p>
          </div>
        </motion.div>
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

export default SignUp;
