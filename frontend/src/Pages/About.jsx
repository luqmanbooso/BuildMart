import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowRight, FaTools, FaHandshake, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import logo from '../assets/images/buildmart_logo1.png';
import left_img from '../assets/images/signin_pic.png';


const AboutPage = () => {
  // Animation controls and refs for scroll animations
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.2 });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Navigation - Modern Design */}
      <nav className="bg-white py-5 px-8 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="BuildMart Logo" className="h-12 transition-transform hover:scale-105 duration-300" />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-600 text-transparent bg-clip-text">BuildMart</span>
        </div>
        <div className="hidden md:flex space-x-10 text-base font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/auction" className="hover:text-blue-600 transition-colors relative group">
            Auction
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/about" className="text-blue-600 relative group">
            About Us
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
          </Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors relative group">
            Contact Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            Sign In
          </motion.button>
        </div>
      </nav>

      {/* Hero Section - Modern with Abstract Elements */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 py-28 md:py-40 relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 text-transparent bg-clip-text mb-6">
            Our Story
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 text-xl md:text-2xl font-light text-gray-700 max-w-3xl mx-auto"
          >
            BuildMart transforms the construction industry by connecting clients with trusted professionals through our innovative bidding platform.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex justify-center"
          >
            <Link to="/auction" className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors group">
              Explore Projects
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Mission and Values Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.span variants={itemVariants} className="text-blue-600 font-semibold text-sm uppercase tracking-wider">OUR MISSION</motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mt-2 mb-6">Building Trust and Connecting Expertise</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 leading-relaxed">
              At BuildMart, we're dedicated to revolutionizing how construction projects come to life by creating a transparent marketplace where quality, reliability, and fair pricing are guaranteed.
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img src={left_img} alt="BuildMart Vision" className="w-full h-auto" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We're a team of industry experts, tech innovators, and customer advocates passionate about improving the construction bidding process. Our platform bridges the gap between clients with construction needs and qualified professionals ready to deliver exceptional results.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                With BuildMart, you gain access to a vetted network of contractors, transparent pricing, and tools that simplify project management from concept to completion.
              </p>
              
              <div className="flex space-x-4">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Transparency</span>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">Quality</span>
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">Innovation</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Core Values Cards */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">OUR VALUES</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">What Drives Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our core values shape everything we do at BuildMart, from how we build our platform to how we interact with our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FaTools />, title: "Quality Craftsmanship", description: "We celebrate and promote excellence in construction through our platform." },
              { icon: <FaHandshake />, title: "Trust & Reliability", description: "We foster relationships built on transparency and consistent delivery." },
              { icon: <FaShieldAlt />, title: "Security & Safety", description: "We protect our users through secure transactions and verified professionals." },
              { icon: <FaChartLine />, title: "Continuous Innovation", description: "We constantly improve our platform to better serve our community." }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-blue-600 text-3xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Timeline Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">OUR JOURNEY</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">BuildMart Through the Years</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to industry innovation, follow our path of growth and development.
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-100"></div>
            
            {/* Timeline items */}
            {[
              { year: "2020", title: "Foundation", description: "BuildMart was established with a mission to revolutionize construction bidding." },
              { year: "2021", title: "Platform Launch", description: "Our first version launched connecting dozens of contractors with local clients." },
              { year: "2022", title: "Expansion", description: "Expanded to serve the entire Sri Lankan market with hundreds of projects." },
              { year: "2023", title: "Innovation", description: "Introduced secure payment escrow and advanced project management tools." },
              { year: "2025", title: "Today", description: "Leading the construction marketplace with thousands of successful projects." }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative mb-16 ${index % 2 === 0 ? 'md:text-right md:ml-auto md:mr-[50%] md:pr-12' : 'md:text-left md:mr-auto md:ml-[50%] md:pl-12'} max-w-md z-10`}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                  <div className={`absolute top-6 hidden md:block ${index % 2 === 0 ? 'right-0 transform translate-x-1/2' : 'left-0 transform -translate-x-1/2'}`}>
                    <div className="h-5 w-5 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                  </div>
                  <span className="text-blue-600 font-bold text-xl">{item.year}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">OUR TEAM</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">Meet the Experts</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our diverse team brings decades of combined experience in construction, technology, and customer service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-lg group"
              >
                <div className="overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                  <div className="flex justify-center mt-4 space-x-4">
                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <FaLinkedinIn />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <FaTwitter />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-blue-800 to-indigo-800 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5000+", label: "Projects Completed" },
              { value: "1200+", label: "Verified Contractors" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "24/7", label: "Customer Support" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Start Your Project?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of satisfied clients who found the perfect contractors for their construction needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                  Sign Up Now
                </Link>
                <Link to="/contact" className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-6">
                <img src={logo} alt="BuildMart Logo" className="h-10 mr-3" />
                <span className="text-xl font-bold">BuildMart</span>
              </div>
              <p className="text-gray-300 mb-6">
                BuildMart is your go-to platform for finding the best contractors and architects. Compare bids, track project progress, and ensure secure payments.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <FaFacebookF className="text-white" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <FaTwitter className="text-white" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <FaInstagram className="text-white" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <FaLinkedinIn className="text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
              </h3>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/register" className="text-gray-300 hover:text-white transition-colors">Register to Bid</Link></li>
                <li><Link to="/projects" className="text-gray-300 hover:text-white transition-colors">Browse Projects</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 relative inline-block">
                Legal
                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
              </h3>
              <ul className="space-y-4">
                <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link to="/security" className="text-gray-300 hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 relative inline-block">
                Newsletter
                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
              </h3>
              <p className="text-gray-300 mb-4">Subscribe for updates on new features and projects.</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} BuildMart. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors text-sm">
                Sitemap
              </Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-white transition-colors text-sm">
                Accessibility
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
