import React from "react";
import { FaSearch, FaCartPlus } from "react-icons/fa"; // For search and cart icons
import { motion } from "framer-motion";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-800 to-indigo-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-3xl font-bold">BuildMart</div>
          <div className="space-x-6">
            <a href="#" className="hover:underline">Home</a>
            <a href="#auction" className="hover:underline">Auction</a>
            <a href="#professionals" className="hover:underline">Professionals</a>
            <a href="#products" className="hover:underline">Products</a>
            <a href="#about" className="hover:underline">About</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-24 px-8 text-center relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("/path-to-your-image.jpg")' }} />
        <h1 className="text-5xl font-bold mb-6 animate__animated animate__fadeIn">Your Services, Your Price, Your Materials</h1>
        <p className="text-xl mb-8 animate__animated animate__fadeIn animate__delay-1s">Find trusted professionals, contractors, and top-rated materials at the best prices!</p>
        <motion.button
          className="bg-yellow-400 text-black py-3 px-8 rounded-full shadow-xl hover:bg-yellow-500 transition duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Get Started
        </motion.button>
      </section>

      {/* Latest Auction Section */}
      <section id="auction" className="py-16 px-8 bg-white">
        <motion.h2
          className="text-3xl font-semibold text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Latest Auction
        </motion.h2>
        <div className="flex justify-center gap-6">
          {["Item 1", "Item 2", "Item 3"].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-200 p-6 rounded-lg shadow-xl w-64 transform transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: idx * 0.3 }}
            >
              <h3 className="font-semibold text-xl">{item}</h3>
              <p className="text-gray-600">Description of {item}...</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Professionals Section */}
      <section id="professionals" className="bg-blue-50 py-16 px-8">
        <motion.h2
          className="text-3xl font-semibold text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Featured Professionals
        </motion.h2>
        <div className="flex justify-center gap-10">
          {["Professional 1", "Professional 2", "Professional 3"].map((professional, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-xl w-64 text-center transform transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: idx * 0.3 }}
            >
              <h3 className="font-semibold text-xl">{professional}</h3>
              <p className="text-gray-600">Expert in construction</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="bg-white py-16 px-8">
        <motion.h2
          className="text-3xl font-semibold text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Featured Products
        </motion.h2>
        <div className="flex justify-center gap-10">
          {["Product 1", "Product 2", "Product 3"].map((product, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-200 p-6 rounded-lg shadow-xl w-64 text-center transform transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: idx * 0.3 }}
            >
              <h3 className="font-semibold text-xl">{product}</h3>
              <p className="text-gray-600">Description of {product}...</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="howitworks" className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-8 text-center">
        <motion.h2
          className="text-3xl font-semibold mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          How It Works
        </motion.h2>
        <div>
          <p className="mb-4">1. Browse services, products, and auctions.</p>
          <p className="mb-4">2. Connect with professionals and sellers.</p>
          <p className="mb-4">3. Secure payments with our escrow system.</p>
          <p className="mb-4">4. Get your work done smarter, faster, and stress-free!</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 px-8">
        <div className="container mx-auto text-center">
          <div className="space-x-8">
            <a href="#about" className="hover:underline">About</a>
            <a href="#contact" className="hover:underline">Contact</a>
            <a href="#terms" className="hover:underline">Terms</a>
            <a href="#privacy" className="hover:underline">Privacy</a>
          </div>
          <p className="mt-4 text-xs">&copy; 2025 BuildMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
