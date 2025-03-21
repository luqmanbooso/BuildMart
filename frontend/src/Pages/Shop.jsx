import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, useScroll, useTransform } from "framer-motion";
import { FiSearch, FiShoppingCart, FiX, FiChevronRight, FiGrid, FiList, FiFilter, FiStar, FiArrowUp } from "react-icons/fi";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import cementImg from "../assets/images/cement.png";
import ViewDetails from "./ViewDetails";
import Cart from "./Cart";
import EnhancedPaymentGateway from '../components/Payment';
import { toast } from 'react-toastify';
import axios from 'axios';
import ContractorUserNav from "../components/ContractorUserNav";

// Helper function for currency formatting
const formatCurrency = (amount) => {
  return `LKR ${amount.toFixed(2)}`;
};

// Add the image URL helper function
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000${imagePath}`;
};

// Category colors for visual consistency
const categoryColors = {
  "Construction Materials": "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200",
  "Tools & Equipment": "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200", 
  "Safety Gear & Accessories": "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200",
  "Plumbing & Electrical Supplies": "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border border-orange-200",
  "Other": "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200"
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
  const [isGridView, setIsGridView] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/product/products');
        if (response.data.success) {
          const formattedProducts = response.data.products.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || `High-quality ${product.name} for your construction needs.`,
            image: product.image ? getImageUrl(product.image) : cementImg,
            stock: product.stock,
            sku: product.sku,
            rating: Math.floor(Math.random() * 5) + 1, // Mock rating for demo
            reviews: Math.floor(Math.random() * 100) // Mock reviews for demo
          }));
          setProducts(formattedProducts);
          // Select 3 random products for featured section
          const randomFeatured = [...formattedProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setFeaturedProducts(randomFeatured);
          console.log('Products loaded successfully:', formattedProducts);
        } else {
          console.error('Error from API:', response.data);
          toast.error('Error loading products');
          loadSampleData();
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error connecting to product server');
        loadSampleData();
      } finally {
        // Simulate loading for demo purposes
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    const loadSampleData = () => {
      const sampleProducts = [
        {
          id: '1',
          name: 'Premium Portland Cement',
          price: 1250.00,
          category: 'Building Materials',
          description: 'High-quality cement for construction projects with superior binding strength.',
          image: cementImg,
          stock: 25,
          sku: 'CEM-001',
          rating: 4.7,
          reviews: 32
        },
        {
          id: '2',
          name: 'Steel Rebar (10mm)',
          price: 450.00,
          category: 'Building Materials',
          description: 'Reinforcement steel bars for concrete structures with high tensile strength.',
          image: cementImg,
          stock: 120,
          sku: 'STL-010',
          rating: 4.5,
          reviews: 18
        },
        {
          id: '3',
          name: 'PVC Pipes (1 inch)',
          price: 320.00,
          category: 'Plumbing',
          description: 'Durable PVC pipes for water supply systems with leak-proof design.',
          image: cementImg,
          stock: 75,
          sku: 'PVC-100',
          rating: 4.2,
          reviews: 24
        },
        {
          id: '4',
          name: 'Professional Cordless Drill',
          price: 8500.00,
          category: 'Tools',
          description: 'Professional-grade cordless drill with battery pack and variable speed control.',
          image: cementImg,
          stock: 8,
          sku: 'TLS-DRL',
          rating: 4.9,
          reviews: 47
        },
        {
          id: '5',
          name: 'Premium Wall Paint (White)',
          price: 3200.00,
          category: 'Paint & Supplies',
          description: 'Premium quality interior wall paint, 4L bucket with stain-resistant formula.',
          image: cementImg,
          stock: 18,
          sku: 'PNT-W4L',
          rating: 4.6,
          reviews: 29
        }
      ];

      setProducts(sampleProducts);
      setFeaturedProducts(sampleProducts.slice(0, 3));
      console.log('Loaded sample products as fallback');
    };

    fetchProducts();
  }, []);

  // Apply sorting and filtering
  const sortedAndFilteredProducts = React.useMemo(() => {
    let result = [...products];
    
    // Filter by search and category
    result = result.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    // Apply sorting
    switch(sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        // Keep original order for featured
        break;
    }
    
    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
    toast.success(`Added ${product.name} to cart`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
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

  // Update handleCheckoutComplete to accept shipping details
  const handleCheckoutComplete = (total, paymentDetails, items, shippingDetails) => {
    // Submit the order to backend with shipping details
    submitOrder(items, paymentDetails, total, shippingDetails)
      .then(success => {
        if (success) {
          setCartItems([]);
          setIsCheckingOut(false);
          toast.success('Payment completed and order placed successfully!');
        } else {
          setIsCheckingOut(false);
          toast.warning('Payment completed, but your order was not recorded. Please contact support.');
        }
      })
      .catch(err => {
        console.error('Order processing error:', err);
        setIsCheckingOut(false);
        toast.error('Error processing your order. Please contact support.');
      });
  };

  // Update submitOrder to include shipping details
  const submitOrder = async (items, paymentDetails, total, shippingDetails) => {
    try {
      // Format order items for the backend
      const orderItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }));
      
      // Create order payload
      const orderData = {
        items: orderItems,
        totalAmount: total,
        paymentDetails: {
          method: paymentDetails.cardType || 'Credit Card',
          transactionId: `TXN-${Date.now()}`,
          lastFourDigits: paymentDetails.lastFourDigits || '****',
          cardholderName: paymentDetails.cardholderName || 'Customer',
          date: new Date().toISOString()
        },
        customer: {
          name: shippingDetails.fullName,
          email: shippingDetails.email,
          // You can add userId here if the user is logged in
        },
        shippingAddress: {
          address: shippingDetails.address,
          city: shippingDetails.city,
          postalCode: shippingDetails.postalCode,
          phone: shippingDetails.phone,
          notes: shippingDetails.notes
        }
      };
      
      // Send order to backend
      console.log('Submitting order data:', orderData);
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      console.log('Order submission response:', response.data);
      
      if (response.data.success) {
        toast.success('Order has been placed successfully!');
        return true;
      } else {
        toast.error('Failed to place order. Please contact support.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Error processing your order. Please try again.');
      return false;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const categories = ["All", "Construction Materials", "Tools & Equipment", "Safety Gear & Accessories", "Plumbing & Electrical Supplies"];

  const FeaturedCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    };
    
    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    };

    useEffect(() => {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      
      return () => clearInterval(timer);
    }, [currentIndex]);

    return (
      <div className="relative w-full h-96 overflow-hidden rounded-2xl shadow-xl">
        <AnimatePresence initial={false}>
          {featuredProducts.length > 0 && (
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                  <div className="w-full h-full bg-pattern-dot"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-between p-8">
                  <div className="w-1/2 text-white space-y-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${categoryColors[featuredProducts[currentIndex].category]}`}>
                      {featuredProducts[currentIndex].category}
                    </span>
                    <h2 className="text-4xl font-bold">{featuredProducts[currentIndex].name}</h2>
                    <p className="text-indigo-200">{featuredProducts[currentIndex].description}</p>
                    <p className="text-3xl font-bold">{formatCurrency(featuredProducts[currentIndex].price)}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => viewDetails(featuredProducts[currentIndex])}
                      className="bg-white text-indigo-800 px-6 py-2 rounded-lg font-medium"
                    >
                      View Details
                    </motion.button>
                  </div>
                  <div className="w-1/2 h-full flex items-center justify-center">
                    <img 
                      src={featuredProducts[currentIndex].image || cementImg} 
                      alt={featuredProducts[currentIndex].name} 
                      className="max-h-72 max-w-full object-contain filter drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <BsArrowLeftCircleFill size={24} />
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <BsArrowRightCircleFill size={24} />
        </button>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {featuredProducts.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <motion.div
        layoutId={`product-${product.id}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        {/* Ribbon for low stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1 transform rotate-45 translate-x-6 -translate-y-1 shadow-md">
              Low Stock
            </div>
          </div>
        )}
        
        <div className="relative h-64 overflow-hidden bg-gray-50">
          <motion.img
            src={product.image || cementImg}
            alt={product.name}
            className="w-full h-full object-contain object-center"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Quick action overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <div className="flex flex-col space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  viewDetails(product);
                }}
                className="bg-white text-indigo-800 px-4 py-2 rounded-lg font-medium"
              >
                View Details
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                disabled={product.stock <= 0}
                className={`bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium ${
                  product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        <div className="p-4">
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
          
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`text-yellow-400 ${i < product.rating ? 'fill-current' : 'stroke-current'}`} />
            ))}
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <ContractorUserNav />
      <br /><br /><br /><br />
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

      {/* Featured Products Carousel */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <FeaturedCarousel />
      </div>

      {/* Products Grid */}
      <LayoutGroup>
        <motion.section
          className="max-w-7xl mx-auto px-6 pb-16"
        >
          <AnimatePresence>
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-12"
              >
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-600">Loading products...</span>
              </motion.div>
            ) : sortedAndFilteredProducts.length > 0 ? (
              <motion.div className={`grid ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-8`}>
                {sortedAndFilteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <FiArrowUp size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default Shop;
