import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import cementImg from "../assets/images/cement.png";
import ViewDetails from "./ViewDetails";
import Cart from "./Cart"; // Import the Cart component
import EnhancedPaymentGateway from '../components/Payment';
import { toast } from 'react-toastify';

const products = [
  { id: 1, name: "Cement", image: cementImg, price: 100 },
  { id: 2, name: "Binding Wires", image: cementImg, price: 50 },
  { id: 3, name: "Shovel", image: cementImg, price: 80 },
  { id: 4, name: "Wire Cutter", image: cementImg, price: 60 },
  { id: 5, name: "Cement Premium", image: cementImg, price: 120 },
  { id: 6, name: "Binding Wires Pro", image: cementImg, price: 70 },
  { id: 7, name: "Heavy-duty Shovel", image: cementImg, price: 90 },
  { id: 8, name: "Wire Cutter XL", image: cementImg, price: 85 },
];

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
    setIsCartOpen(true); // Open the cart when an item is added
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const viewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeDetails = () => {
    setSelectedProduct(null);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleCheckout = (total) => {
    setCheckoutAmount(total);
    setIsCartOpen(false);
    setIsCheckingOut(true);
  };

  const handleCheckoutComplete = (total) => {
    setCartItems([]); // Clear cart
    // Show success message or redirect
    toast.success('Payment completed successfully!');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg text-white"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">BuildMart</h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-yellow-300 transition">Home</a>
            <a href="#" className="hover:text-yellow-300 transition">Shop</a>
            <a href="#" className="hover:text-yellow-300 transition">Contact</a>
          </nav>
          <div className="relative cursor-pointer" onClick={toggleCart}>
            <FiShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-16">
        <div className="max-w-xl mx-auto text-center px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4"
          >
            Premium Building Materials
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl"
          >
            Everything you need for your construction projects at unbeatable prices.
          </motion.p>
        </div>
      </section>

      {/* Search Bar - Moved to the left */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex justify-start">
        <div className="relative shadow-lg rounded-full overflow-hidden w-full max-w-xs">
          <FiSearch size={20} className="absolute left-4 top-[50%] translate-y-[-50%] text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:ring-indigo-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <AnimatePresence>
          {filteredProducts.length > 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <img src={product.image} alt={product.name} className="w-full h-[200px] object-cover" />
                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-indigo-600 font-bold my-2">${product.price}</p>

                    {/* Buttons */}
                    <div className="flex justify-center gap-x-2 mt-4">
                      <button
                        onClick={() => viewDetails(product)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-full transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500">No products found.</p>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-xl mx-auto text-center">
          © {new Date().getFullYear()} BuildMart. All rights reserved.
        </div>
      </footer>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ViewDetails
            product={selectedProduct}
            onClose={closeDetails}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>

      {/* Cart Component */}
      <AnimatePresence>
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          onCheckout={handleCheckoutComplete}
        />
      </AnimatePresence>

      {isCheckingOut && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="relative w-full h-full">
            <button
              onClick={() => setIsCheckingOut(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X size={24} className="text-gray-600" />
            </button>
            <EnhancedPaymentGateway
              amount={checkoutAmount.toString()}
              onSuccess={() => {
                setIsCheckingOut(false);
                setCartItems([]);
                // You might want to show a success message here
              }}
              onCancel={() => {
                setIsCheckingOut(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;