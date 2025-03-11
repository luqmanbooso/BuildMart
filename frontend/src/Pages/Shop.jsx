import React, { useState } from "react";
import { motion } from "framer-motion";

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    { id: 1, name: "Cement", image: "../assets/cement.png" },
    { id: 2, name: "Binding wires", image: "binding-wires-image-url" },
    { id: 3, name: "Shovel", image: "shovel-image-url" },
    { id: 4, name: "Wire cutter", image: "wire-cutter-image-url" },
    { id: 5, name: "Cement Premium", image: "cement-image-url" },
    { id: 6, name: "Binding wires Pro", image: "binding-wires-image-url" },
    { id: 7, name: "Heavy-duty Shovel", image: "shovel-image-url" },
    { id: 8, name: "Wire cutter XL", image: "wire-cutter-image-url" },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6 shadow-md"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">BuildMart</h1>
          <nav>
            <a href="#" className="ml-4 hover:text-yellow-400 transition">Home</a>
            <a href="#" className="ml-4 hover:text-yellow-400 transition">Shop</a>
            <a href="#" className="ml-4 hover:text-yellow-400 transition">Contact</a>
          </nav>
        </div>
      </motion.header>

      {/* Search Bar */}
      <section className="py-10">
        <div className="max-w-xl mx-auto px-6">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16 px-6 max-w-7xl mx-auto">
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover"
                />
                <div className="p-5 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                  <button className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto text-center">
          © {new Date().getFullYear()} BuildMart. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Shop;
