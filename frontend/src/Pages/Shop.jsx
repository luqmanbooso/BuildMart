import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiSearch, FiShoppingCart, FiX, FiChevronRight } from "react-icons/fi";
import cementImg from "../assets/images/cement.png";
import ViewDetails from "./ViewDetails";
import Cart from "./Cart"; // Import the Cart component
import EnhancedPaymentGateway from '../components/Payment';
import { toast } from 'react-toastify';
import axios from 'axios';

// Helper function for currency formatting
const formatCurrency = (amount) => {
  return `LKR ${amount.toFixed(2)}`;
};

// Category colors for visual consistency
const categoryColors = {
  "Building Materials": "bg-blue-100 text-blue-800",
  "Hardware": "bg-green-100 text-green-800",
  "Tools": "bg-purple-100 text-purple-800",
  "Plumbing": "bg-orange-100 text-orange-800",
  "Electrical": "bg-yellow-100 text-yellow-800",
  "Paint & Supplies": "bg-pink-100 text-pink-800",
  "Flooring": "bg-indigo-100 text-indigo-800",
  "Doors & Windows": "bg-teal-100 text-teal-800",
  "Safety Equipment": "bg-red-100 text-red-800",
  "Landscaping": "bg-lime-100 text-lime-800",
  "Other": "bg-gray-100 text-gray-800"
};

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/products');
        if (response.data.success) {
          const formattedProducts = response.data.products.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || `High-quality ${product.name} for your construction needs.`,
            image: product.image || cementImg, // Default image fallback
            stock: product.stock,
            sku: product.sku
          }));
          setProducts(formattedProducts);
          console.log('Products loaded successfully:', formattedProducts);
        } else {
          console.error('Error from API:', response.data);
          toast.error('Error loading products');
          loadSampleData(); // Fallback to sample data if API fails
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error connecting to product server');
        loadSampleData(); // Fallback to sample data if connection fails
      }
    };

    // Sample data function
    const loadSampleData = () => {
      const sampleProducts = [
        {
          id: '1',
          name: 'Portland Cement',
          price: 1250.00,
          category: 'Building Materials',
          description: 'High-quality cement for construction projects.',
          image: cementImg,
          stock: 25,
          sku: 'CEM-001'
        },
        {
          id: '2',
          name: 'Steel Rebar (10mm)',
          price: 450.00,
          category: 'Building Materials',
          description: 'Reinforcement steel bars for concrete structures.',
          image: cementImg,
          stock: 120,
          sku: 'STL-010'
        },
        {
          id: '3',
          name: 'PVC Pipes (1 inch)',
          price: 320.00,
          category: 'Plumbing',
          description: 'Durable PVC pipes for water supply systems.',
          image: cementImg,
          stock: 75,
          sku: 'PVC-100'
        },
        {
          id: '4',
          name: 'Cordless Drill',
          price: 8500.00,
          category: 'Tools',
          description: 'Professional-grade cordless drill with battery pack.',
          image: cementImg,
          stock: 8,
          sku: 'TLS-DRL'
        },
        {
          id: '5',
          name: 'Wall Paint (White)',
          price: 3200.00,
          category: 'Paint & Supplies',
          description: 'Premium quality interior wall paint, 4L bucket.',
          image: cementImg,
          stock: 18,
          sku: 'PNT-W4L'
        }
      ];

      setProducts(sampleProducts);
      console.log('Loaded sample products as fallback');
    };

    loadSampleData(); // Load sample data initially for testing
  }, []);

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

  const handleCheckoutComplete = () => {
    setCartItems([]); // Clear cart
    toast.success('Payment completed successfully!');
  };

  const categories = ["All", "Building Materials", "Hardware", "Tools", "Plumbing", "Electrical", "Paint & Supplies", "Flooring", "Doors & Windows", "Safety Equipment", "Landscaping", "Other"];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Navbar */}
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

      {/* Hero Section */}
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

      {/* Search Bar */}
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

      {/* Products Grid */}
      <LayoutGroup>
        <motion.section
          className="max-w-7xl mx-auto px-6 pb-16"
        >
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layoutId={`product-${product.id}`}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-w-1 aspect-h-1 rounded-t-2xl overflow-hidden bg-gray-100">
                      <img
                        src={product.image || cementImg}
                        alt={product.name}
                        className="w-full h-64 object-contain transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[product.category] || "bg-gray-100 text-gray-800"}`}>
                          {product.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock <= 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 5 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock <= 0 
                            ? 'Out of stock' 
                            : product.stock < 5 
                              ? 'Low stock' 
                              : 'In stock'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {product.name}
                      </h3>
                      
                      {product.sku && (
                        <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                      )}
                      
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
                          disabled={product.stock <= 0}
                          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                            product.stock <= 0 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
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

      {/* Footer */}
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
              <FiX size={24} className="text-gray-600" />
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
