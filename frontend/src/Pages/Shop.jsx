import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiSearch, FiShoppingCart, FiX, FiChevronRight } from "react-icons/fi";
import cementImg from "../assets/images/cement.png";
import ViewDetails from "./ViewDetails";
import Cart from "./Cart"; // Import the Cart component
import EnhancedPaymentGateway from '../components/Payment';
import { toast } from 'react-toastify';

// Add this helper function at the top of both files
const formatCurrency = (amount) => {
  return `LKR ${amount.toFixed(2)}`;
};

// Replace the existing products array with this expanded version
const products = [
  // Construction Materials
  { 
    id: 1, 
    category: "Construction",
    name: "Portland Cement 50kg", 
    image: cementImg, 
    price: 2500,
    description: "High-quality Portland cement for general construction use"
  },
  { 
    id: 2, 
    category: "Construction",
    name: "Steel Reinforcement Bars 12mm", 
    image: cementImg, 
    price: 3200,
    description: "TMT steel bars for concrete reinforcement"
  },
  { 
    id: 3, 
    category: "Construction",
    name: "Building Blocks 6\"", 
    image: cementImg, 
    price: 145,
    description: "Standard concrete blocks for construction"
  },
  { 
    id: 4, 
    category: "Construction",
    name: "River Sand (cuft)", 
    image: cementImg, 
    price: 850,
    description: "Clean river sand for construction"
  },

  // Plumbing Materials
  { 
    id: 5, 
    category: "Plumbing",
    name: "PVC Pipe 1\" (10ft)", 
    image: cementImg, 
    price: 420,
    description: "High-pressure PVC pipes for water supply"
  },
  { 
    id: 6, 
    category: "Plumbing",
    name: "Ball Valve 1/2\"", 
    image: cementImg, 
    price: 350,
    description: "Brass ball valve for water control"
  },
  { 
    id: 7, 
    category: "Plumbing",
    name: "Water Tank 1000L", 
    image: cementImg, 
    price: 12500,
    description: "Durable plastic water storage tank"
  },
  { 
    id: 8, 
    category: "Plumbing",
    name: "CPVC Pipe 3/4\" (10ft)", 
    image: cementImg, 
    price: 580,
    description: "Hot water resistant CPVC pipes"
  },

  // Carpentry Materials
  { 
    id: 9, 
    category: "Carpentry",
    name: "Teak Wood (cuft)", 
    image: cementImg, 
    price: 8500,
    description: "Premium quality teak wood"
  },
  { 
    id: 10, 
    category: "Carpentry",
    name: "Wood Screws 1\" (100pcs)", 
    image: cementImg, 
    price: 450,
    description: "Rust-resistant wood screws"
  },
  { 
    id: 11, 
    category: "Carpentry",
    name: "Marine Plywood 18mm", 
    image: cementImg, 
    price: 4800,
    description: "Water-resistant marine plywood sheet"
  },
  { 
    id: 12, 
    category: "Carpentry",
    name: "Wood Adhesive 1L", 
    image: cementImg, 
    price: 980,
    description: "Strong bonding wood adhesive"
  },

  // Electrical Materials
  { 
    id: 13, 
    category: "Electrical",
    name: "2.5mm² Wire (100m)", 
    image: cementImg, 
    price: 4500,
    description: "ACL electrical wiring cable"
  },
  { 
    id: 14, 
    category: "Electrical",
    name: "MCB Double Pole 32A", 
    image: cementImg, 
    price: 1200,
    description: "Circuit breaker for electrical safety"
  },
  { 
    id: 15, 
    category: "Electrical",
    name: "LED Bulb 9W", 
    image: cementImg, 
    price: 350,
    description: "Energy-saving LED light bulb"
  },
  { 
    id: 16, 
    category: "Electrical",
    name: "Distribution Board 8-Way", 
    image: cementImg, 
    price: 3800,
    description: "Electrical distribution panel"
  }
];

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Add new animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Add this before the return statement
  const categories = ["All", "Construction", "Plumbing", "Carpentry", "Electrical"];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Enhanced Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BuildMart
            </h1>
            
            <nav className="hidden md:flex space-x-8">
              {['Home', 'Shop', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="relative text-gray-700 hover:text-indigo-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="relative cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCart}
            >
              <FiShoppingCart size={24} className="text-gray-700" />
              {cartItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartItems.length}
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24 overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto text-center px-6 relative z-10"
        >
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Premium Building Materials
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Everything you need for your construction projects at unbeatable prices.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Explore Products
          </motion.button>
        </motion.div>
        
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
        </div>
      </motion.section>

      {/* Enhanced Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-md"
        >
          <FiSearch size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors duration-200`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Enhanced Products Grid */}
      <LayoutGroup>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-6 pb-16"
        >
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layoutId={`product-${product.id}`}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-w-1 aspect-h-1 rounded-t-2xl overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-indigo-600 mb-4">
                        {formatCurrency(product.price)}
                      </p>
                      
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewDetails(product)}
                          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product)}
                          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500 mt-12"
              >
                No products found.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>
      </LayoutGroup>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">BuildMart</h3>
              <p className="text-gray-400">
                Your trusted partner in construction materials.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">
                123 Construction Ave<br />
                Colombo, Sri Lanka<br />
                contact@buildmart.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© {new Date().getFullYear()} BuildMart. All rights reserved.</p>
          </div>
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