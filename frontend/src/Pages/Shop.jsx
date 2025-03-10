import React from "react";

const Shop = () => {
  const products = [
    { id: 1, name: "Cement", image: "cement-image-url", rating: 4 },
    { id: 2, name: "Binding wires", image: "binding-wires-image-url", rating: 5 },
    { id: 3, name: "Shovel", image: "shovel-image-url", rating: 3 },
    { id: 4, name: "Wire cutter", image: "wire-cutter-image-url", rating: 4 },
    { id: 5, name: "Cement", image: "cement-image-url", rating: 5 },
    { id: 6, name: "Binding wires", image: "binding-wires-image-url", rating: 4 },
    { id: 7, name: "Shovel", image: "shovel-image-url", rating: 4 },
    { id: 8, name: "Wire cutter", image: "wire-cutter-image-url", rating: 5 },
  ];

  return (
    <div className="bg-gray-100">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">BuildMart</h1>
          <nav>
            <a href="#" className="text-white font-medium hover:text-yellow-400 transition duration-300 ml-6">
              Home
            </a>
            <a href="#" className="text-white font-medium hover:text-yellow-400 transition duration-300 ml-6">
              Shop
            </a>
            <a href="#" className="text-white font-medium hover:text-yellow-400 transition duration-300 ml-6">
              Contact Us
            </a>
          </nav>
        </div>
      </header>

      {/* Shop Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <h2 className="text-5xl font-extrabold text-gray-800 mb-4">Shop Our Products</h2>
          <p className="text-xl text-gray-600">Browse through a wide variety of construction tools and materials.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 px-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-xl overflow-hidden transition-transform transform hover:scale-105"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-60 object-cover transform transition-all duration-300 hover:scale-110"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800">{product.name}</h3>
                <div className="my-3 text-yellow-500">
                  {"★".repeat(product.rating)}
                  {"★".repeat(5 - product.rating)}
                </div>
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-300"
                >
                  More Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg">&copy; 2023 BuildMart. All Rights Reserved.</p>
          <div className="mt-4">
            <a href="#" className="text-white hover:text-yellow-400 transition duration-300 ml-4">
              Quick Links
            </a>
            <a href="#" className="text-white hover:text-yellow-400 transition duration-300 ml-4">
              Terms & Conditions
            </a>
            <a href="#" className="text-white hover:text-yellow-400 transition duration-300 ml-4">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;