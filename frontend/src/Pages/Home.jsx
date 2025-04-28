import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaFacebook, FaTwitter, FaInstagram, FaUserCircle, 
  FaChevronDown, FaHammer, FaHandshake, FaStar, FaShoppingCart, 
  FaMapMarkerAlt, FaCrown, FaAngleRight, FaArrowRight, 
  FaChartBar, FaCog, FaSignOutAlt, FaTools, FaRegClock,
  FaUsers, FaLayerGroup, FaHeadset, FaRegLightbulb, FaCheckCircle
} from "react-icons/fa";
import heroBg from "../assets/images/hero-bg.jpg";
import person_tablet from "../assets/images/person-tablet.jpg";
import constructor_icon from "../assets/images/constructor-icon.jpg";
import construction_tools from "../assets/images/cement.png";
import blueprint_bg from "../assets/images/blueprint-bg.jpg";
import logo from "../assets/images/buildmart_logo1.png";
import logo_white from "../assets/images/builmart_logo_white.png";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import ClientNavBar from "../components/ClientNavBar";
import ContractorUserNav from "../components/ContractorUserNav";
import Footer from "../components/Footer";
import axios from 'axios';

// Enhanced component for animated section headings
const SectionHeading = ({ title, accent, description, align = "center" }) => (
  <div className={`mb-16 text-${align}`}>
    <div className="inline-block">
      <h2 className="text-3xl md:text-5xl font-bold mb-3 relative">
        {title} <span className="text-blue-600">{accent}</span>
        <div className="absolute -bottom-3 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
      </h2>
    </div>
    {description && (
      <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-lg">{description}</p>
    )}
  </div>
);

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [auctionError, setAuctionError] = useState(null);
  
  const [userRole,setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  
  const [featuredContractors, setFeaturedContractors] = useState([]);
  const [isLoadingContractors, setIsLoadingContractors] = useState(true);
  const [contractorError, setContractorError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setIsAuthenticated(true);
          setUserRole(decoded.role);
        } catch (error) {
          console.error("Error decoding token:", error);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }

    checkAuth();

  },[]);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Handle clicks outside user menu to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // In your Home component
// Check if user is logged in on component mount
useEffect(() => {
  // Get token from localStorage or sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  // console.log(token);

  if (token) {
    try {
      // Decode the token to get user data
      const decoded = jwtDecode(token);
      
      // Create a user object from the decoded token
      const userData = {
        _id: decoded.userId,
        username: decoded.username,
        email: decoded.email, // if available in token
        role: decoded.role, // if available in token
        // Add other fields as needed
      };
      
      // Set the user state
      setUser(userData);
      
    } catch (error) {
      console.error("Error decoding token:", error);
      // Handle invalid token (e.g., by redirecting to login)
    }
  }
}, []);

  // Auto-rotate hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

// Handle logout
const handleLogout = () => {
  // Remove user data
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  
  // Remove token
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  
  // Reset user state
  setUser(null);
  
  // Redirect to login page
  navigate("/login");
};

  const features = [
    {
      title: "Find the Best Professionals",
      description: "Connect with verified experts for your unique project needs",
      icon: <FaHandshake className="text-3xl text-blue-500" />,
      borderColor: "border-blue-500",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      title: "Compare Competitive Bids",
      description: "Review multiple proposals and choose the best value",
      icon: <FaHammer className="text-3xl text-indigo-500" />,
      borderColor: "border-indigo-500",
      bgColor: "from-indigo-50 to-indigo-100",
    },
    {
      title: "Premium Materials Delivery",
      description: "Shop quality materials with convenient project delivery",
      icon: <FaShoppingCart className="text-3xl text-emerald-500" />,
      borderColor: "border-emerald-500",
      bgColor: "from-emerald-50 to-emerald-100",
    },
    {
      title: "Verified Service Network",
      description: "Access our curated network of construction professionals",
      icon: <FaCrown className="text-3xl text-amber-500" />,
      borderColor: "border-amber-500", 
      bgColor: "from-amber-50 to-amber-100",
    },
  ];

  const heroSlides = [
    {
      heading: "Find Trusted Professionals",
      subheading: "For Your Construction & Design Needs",
      cta: "Start Your Project",
      bgColor: "from-blue-900 to-blue-700",
      image: heroBg,
    },
    {
      heading: "Quality Materials",
      subheading: "Delivered Right to Your Doorstep",
      cta: "Shop Materials",
      bgColor: "from-indigo-900 to-indigo-700",
      image: blueprint_bg,
    },
    {
      heading: "Competitive Bids",
      subheading: "From Verified Construction Experts",
      cta: "Post a Project",
      bgColor: "from-emerald-800 to-blue-800",
      image: heroBg,
    },
  ];

  const products = [
    {
      id: "01",
      name: "Premium Cement",
      description: "High-quality construction cement for durable structures",
      price: 2000,
      active: true,
      discount: 10,
      image: construction_tools,
    },
    {
      id: "02",
      name: "Steel Reinforcement",
      description: "Industrial-grade steel for reinforced concrete structures",
      price: 2500,
      active: false,
      discount: 0,
      image: construction_tools,
    },
    {
      id: "03",
      name: "Ceramic Tiles",
      description: "Premium ceramic floor tiles with elegant patterns",
      price: 4000,
      active: true,
      discount: 15,
      image: construction_tools,
    },
    {
      id: "04",
      name: "Paint Bundle",
      description: "Weather-resistant exterior paint in various colors",
      price: 3000,
      active: true,
      discount: 5,
      image: construction_tools,
    },
  ];

  const stats = [
    {
      value: "10K+",
      label: "Happy Clients",
      icon: <FaUsers className="text-blue-400 text-2xl" />
    },
    {
      value: "500+",
      label: "Verified Professionals",
      icon: <FaTools className="text-emerald-400 text-2xl" />
    },
    {
      value: "15K+",
      label: "Projects Completed",
      icon: <FaLayerGroup className="text-purple-400 text-2xl" />
    },
    {
      value: "24/7",
      label: "Customer Support",
      icon: <FaHeadset className="text-amber-400 text-2xl" />
    },
  ];
  
  const howItWorks = [
    {
      step: 1,
      title: "Post Your Task",
      description: "Describe your project requirements and set your budget.",
      icon: <FaRegLightbulb className="text-3xl text-white" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      step: 2,
      title: "Receive Bids",
      description: "Get competitive bids from our network of verified professionals",
      icon: <FaUsers className="text-3xl text-white" />,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      step: 3,
      title: "Choose the Best",
      description: "Compare bids, reviews, and portfolios to select the right professional.",
      icon: <FaStar className="text-3xl text-white" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      step: 4,
      title: "Shop Materials",
      description: "Browse and purchase premium materials directly from our marketplace.",
      icon: <FaShoppingCart className="text-3xl text-white" />,
      color: "from-emerald-500 to-emerald-600"
    },
  ];

  // Function to render star ratings with improved visuals
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar key={i} className="text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FaStar className="text-gray-300" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <FaStar className="text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FaStar key={i} className="text-gray-300" />
        );
      }
    }
    return (
      <div className="flex space-x-1">{stars}</div>
    );
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoadingAuctions(true);
      setAuctionError(null);
      
      try {
        // Make API call to get jobs/auctions from backend
        const response = await axios.get('http://localhost:5000/api/jobs');
        
        if (!response.data || response.data.length === 0) {
          setAuctions([]);
          return;
        }
        
        // Map the backend data structure to match the frontend component
        const formattedAuctions = response.data
          // Take only the first 4 auctions for the home page
          .slice(0, 4)
          .map(job => {
            // Determine if the auction is active based on status and times
            const now = new Date().getTime();
            const startTime = new Date(job.biddingStartTime || job.date).getTime();
            const endTime = new Date(job.biddingEndTime || '').getTime();
            const isActive = job.status === 'Active' || (now >= startTime && (!job.biddingEndTime || now <= endTime));
            
            return {
              id: job._id,
              title: job.title || 'Untitled Project',
              type: job.category || 'Construction', 
              category: job.subCategory || '',
              name: job.username || 'Unknown User',
              area: job.area || 'Not specified',
              budget: job.budget ? `LKR ${job.budget}` : 'Not specified',
              startTime: job.biddingStartTime,
              endDate: job.biddingEndTime,
              active: isActive,
              bids: job.bids?.length || 0,
              image: job.imageUrl || blueprint_bg, // Use job image if available, else default
              description: job.description || 'No description provided'
            };
          });
        
        console.log('Auctions fetched for homepage:', formattedAuctions);
        setAuctions(formattedAuctions);
      } catch (error) {
        console.error('Error fetching auctions for homepage:', error);
        setAuctionError("Failed to load latest projects");
      } finally {
        setIsLoadingAuctions(false);
      }
    };
    
    fetchAuctions();
  }, []);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add this function outside the useEffect
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    
    try {
      console.log('Fetching products from:', 'http://localhost:5000/product/products');
      const response = await axios.get('http://localhost:5000/product/products');
      console.log('Raw API response:', response);
      
      if (response.data.success) {
        // Take only the first 4 products for the featured section
        const formattedProducts = response.data.products
          .slice(0, 4)
          .map(product => ({
            id: product._id,
            name: product.name,
            description: product.description || `High-quality ${product.name} for construction needs`,
            price: product.price,
            active: product.stock > 0,
            image: product.image ? `http://localhost:5000${product.image}` : construction_tools,
            stock: product.stock
          }));
        
        console.log('Products fetched for homepage:', formattedProducts);
        setFeaturedProducts(formattedProducts);
      } else {
        console.error('Error fetching products:', response.data);
        setProductError("Failed to load product data");
      }
    } catch (error) {
      console.error('Error details:', error.response || error.message || error);
      setProductError(`Failed to connect: ${error.message}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const fetchContractors = async () => {
      setIsLoadingContractors(true);
      setContractorError(null);
      
      try {
        const response = await axios.get('http://localhost:5000/api/contractors');
        
        if (!response.data || response.data.length === 0) {
          setFeaturedContractors([]);
          return;
        }
        
        // Map the backend data structure to match the frontend component needs
        // and take only the first 4 contractors for the featured section
        const formattedContractors = response.data
          .slice(0, 4)
          .map(contractor => {
            // Get username from userId if available
            const username = contractor.userId?.username || 'Unknown Contractor';
            const companyName = contractor.companyName || username;
            // Format profile picture URL
            const profilePic = contractor.userId?.profilePic 
              ? contractor.userId.profilePic.startsWith('http') 
                ? contractor.userId.profilePic 
                : `http://localhost:5000${contractor.userId.profilePic}`
              : constructor_icon;
            
            return {
              id: contractor._id,
              name: companyName,
              area: contractor.address || 'Not specified',
              completedRequests: contractor.completedProjects || 0,
              rating: contractor.averageRating || 0,
              specialty: contractor.specialization?.join(', ') || 'General Contractor',
              image: profilePic,
              verified: contractor.verified || false,
              experienceYears: contractor.experienceYears || 0
            };
          });
          
        console.log('Contractors fetched for homepage:', formattedContractors);
        setFeaturedContractors(formattedContractors);
      } catch (error) {
        console.error('Error fetching contractors:', error);
        setContractorError("Failed to load featured professionals");
      } finally {
        setIsLoadingContractors(false);
      }
    };
    
    fetchContractors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Enhanced Sticky Navbar with dynamic glassmorphism effect */}
      {userRole == "Service Provider" ? (
        <ContractorUserNav/>   
      ) : (
        <ClientNavBar/>
      )} 

      {/* Dynamic Hero Section with Advanced Carousel */}
      <div className="pt-[72px]">
        <div className="relative h-[700px] overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`absolute inset-0 bg-gradient-to-r ${heroSlides[activeSlide].bgColor}`}
            >
              {/* Background image with overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${heroSlides[activeSlide].image})` }}
              ></div>
              
             

              {/* Hero content */}
              <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="w-full md:w-3/4 lg:w-2/3 mx-auto text-center text-white"
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                    {heroSlides[activeSlide].heading}
                  </h1>
                  <p className="text-xl md:text-2xl mb-10 text-blue-100">
                    {heroSlides[activeSlide].subheading}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/signup">
                      <button className="bg-white text-blue-800 px-8 py-3 rounded-full font-medium hover:bg-blue-50 transition-all transform hover:scale-105 hover:shadow-lg flex items-center">
                        {heroSlides[activeSlide].cta}
                        <FaArrowRight className="ml-2" />
                      </button>
                    </Link>
                    <Link to="/how-it-works">
                      <button className="border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-all flex items-center">
                        Learn More
                        <FaAngleRight className="ml-2" />
                      </button>
                    </Link>
                  </div>
                  
                  {/* Scroll indicator */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="w-8 h-12 rounded-full border-2 border-white flex items-start justify-center p-1">
                      <motion.div 
                        animate={{ y: [0, 14, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1 h-3 bg-white rounded-full"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Carousel indicators */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === index ? "w-10 bg-white" : "w-3 bg-white/50 hover:bg-white/80"
                    }`}
                  ></button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Wave shape divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10">
            <svg
              className="relative block w-full h-16 md:h-24"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                fill="#f9fafb"
                opacity="1"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Features Section with Card Grid */}
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`h-2 ${feature.borderColor}`}></div>
              <div className="p-6">
                <div className={`bg-gradient-to-r ${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Services Section with Overlapping Elements */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-24 mt-24 relative">
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 border-4 border-white rounded-full"></div>
          <div className="absolute top-40 right-40 w-20 h-20 bg-white rounded-md transform rotate-45"></div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-10 md:mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -top-6 -left-6 w-1/2 h-1/2 border-2 border-blue-300 rounded-lg opacity-50"></div>
                <img
                  src={person_tablet}
                  alt="Professional with tablet"
                  className="rounded-xl shadow-2xl relative z-10"
                />
                
              </motion.div>
            </div>
            
            <div className="w-full md:w-1/2 pl-0 md:pl-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Your Services,
                  <span className="text-yellow-400 block mt-2">Your Price,</span>
                  Your Materials
                </h2>

                <p className="mt-6 text-lg text-blue-100 leading-relaxed">
                  Post your project, receive competitive bids, choose the best
                  professionals for your needs, and shop for premium materials—all
                  in one place. Fast, transparent, and secure.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link to="/login">
                    <button className="bg-white text-blue-700 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all transform hover:scale-105 hover:shadow-lg flex items-center">
                      Post a Request <FaArrowRight className="ml-2" />
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-all flex items-center">
                      Join Our Network <FaArrowRight className="ml-2" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Auctions Section with Enhanced Cards */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Latest" 
            accent="Projects" 
            description="Browse our most recent construction projects and submit your competitive bids"
          />

          {isLoadingAuctions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-40 bg-gray-300"></div>
                  <div className="p-5">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-blue-300 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : auctionError ? (
            <div className="text-center py-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mt-5">{auctionError}</h3>
              <button
                onClick={() => {
                  setIsLoadingAuctions(true);
                  fetchAuctions();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {auctions.map((auction, index) => (
                <motion.div
                  key={auction.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={auction.image || blueprint_bg} 
                      alt={auction.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 p-3 flex gap-2">
                      <span className="bg-gray-900 text-white px-3 py-1 text-xs font-medium rounded-full">
                        {auction.type || "Construction"}
                      </span>
                      {auction.category && (
                        <span className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                          {auction.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{auction.title}</h3>
                    
                    <div className="flex items-center mb-3">
                      <FaUserCircle className="mr-2 text-gray-600" />
                      <span className="text-gray-600 text-sm">{auction.name || "Unknown"}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      <span className="text-gray-600 text-sm">{auction.area || "Not specified"}</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700">Budget:</div>
                      <div className="text-blue-600 font-bold">{auction.budget || "Not specified"}</div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            auction.active ? "bg-green-500 animate-pulse" : "bg-orange-500"
                          } mr-2`}
                        ></span>
                        <span className="text-xs font-medium">
                          {auction.active ? "Active" : "Starts Soon"}
                        </span>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                        {auction.bids || 0} Bids
                      </span>
                    </div>

                    <Link to={`/project/${auction.id}`}>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all">
                        View Details
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mt-5">No Projects Available</h3>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                There are no active projects at the moment. Check back later or create your own project.
              </p>
              <Link to="/login">
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Post a Project
                </button>
              </Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/auctions">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center"
              >
                View All Projects
                <FaArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Professionals Section */}
      <div className="container mx-auto py-12">
        <div className="border-t border-gray-300 mx-12 mb-10"></div>
        <div className="px-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Professionals</h2>
            <Link to="/contractors" className="text-blue-500 hover:underline">
              See all professionals
            </Link>
          </div>

          {isLoadingContractors ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-center mb-3">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 rounded-full bg-gray-300"></div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : contractorError ? (
            <div className="text-center py-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mt-5">{contractorError}</h3>
              <button 
                onClick={() => {
                  setIsLoadingContractors(true);
                  fetchContractors();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : featuredContractors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredContractors.map((contractor, index) => (
                <motion.div
                  key={contractor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-center mb-4 relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={contractor.image}
                        alt={contractor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = constructor_icon;
                        }}
                      />
                    </div>
                    {contractor.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-center">{contractor.name}</h3>
                  <p className="text-gray-600 text-sm mt-2 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-blue-500 mr-1"/> {contractor.area}
                  </p>
                  <p className="text-gray-600 text-sm text-center">
                    <span className="font-semibold">Experience:</span>{" "}
                    {contractor.experienceYears} years
                  </p>
                  <p className="text-gray-600 text-sm text-center">
                    <span className="font-semibold">Projects:</span>{" "}
                    {contractor.completedRequests}
                  </p>

                  <div className="flex justify-center my-3">
                    {renderStars(contractor.rating)}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <Link to={`/contractors`}>
                      <button className="bg-blue-500 text-white px-4 py-2 text-sm w-full hover:bg-blue-600 transition rounded-md">
                        More Details ››
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mt-5">No Professionals Available</h3>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                There are no professionals in our system at this time. Check back later.
              </p>
              <Link to="/contractors">
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Contractors
                </button>
              </Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/contractors">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center"
              >
                View All Professionals
                <FaArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto py-8">
        <div className="px-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/shop" className="text-blue-500 hover:underline">
              See all products
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : productError ? (
            <div className="text-center py-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mt-5">{productError}</h3>
              <button
                onClick={() => {
                  setIsLoadingProducts(true);
                  fetchProducts();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition">
                    <div className="flex justify-center mb-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                  </div>

                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

                  <div className="border-b border-gray-200 my-3">
                    <p className="pb-2">RS : {product.price.toLocaleString()} /=</p>
                  </div>

                  <div className="flex items-center mb-4">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        product.active ? "bg-green-500" : "bg-orange-500"
                      } mr-2`}
                    ></span>
                    <span className="text-xs uppercase text-gray-500">
                      {product.active ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <Link to={`/shop`}>
                    <button className="border border-gray-300 text-gray-800 px-4 py-1 text-sm hover:bg-gray-100 transition w-full">
                      VIEW DETAILS
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mt-5">No Products Available</h3>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                There are no products available at the moment. Check back later.
              </p>
              <Link to="/shop">
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Go to Shop
                </button>
              </Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/shop">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center"
              >
                View All Products
                <FaArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-100 py-12 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${blueprint_bg})` }}
        ></div>

        <div className="container mx-auto px-12 relative z-10">
          <div className="flex">
            <div className="w-1/3">
              <h2 className="text-5xl font-bold">
                How It <br />
                Works
              </h2>
            </div>

            <div className="w-2/3">
              {howItWorks.map((step, index) => (
                <div key={index} className="flex items-start mb-10">
                  <div className={`bg-gradient-to-r ${step.color} text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}

              <button className="border border-gray-400 px-4 py-2 mt-4 hover:bg-white transition">
                Learn more ››
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replace the existing footer with the Footer component */}
      <Footer />
    </div>
  );
};

export default Home;
