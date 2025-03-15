import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AuctionCard = ({ auction }) => {
  const handleClick = () => {
    window.location.href = `/project-details`;
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 mb-6 relative hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <h3 className="text-lg font-bold mb-2">{auction.title}</h3>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {auction.categories.map((category, index) => (
          <motion.span 
            key={index} 
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded-sm"
            whileHover={{ backgroundColor: "#4B5563", scale: 1.05 }}
          >
            {category}
          </motion.span>
        ))}
      </div>
      
      <div className="mb-4">
        <p className="font-medium">{auction.contractor}</p>
        <p className="text-sm text-gray-600">Area: {auction.area}</p>
        <p className="text-sm text-gray-600">Budget: {auction.budget}</p>
      </div>
      
      <div className="flex items-center mb-4">
        <motion.div 
          className={`w-2 h-2 rounded-full ${auction.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}
          animate={{ scale: auction.status === 'active' ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
        ></motion.div>
        <p className="text-xs text-gray-600">
          auction ends in: {auction.endDate}
        </p>
      </div>
      
      <motion.button 
        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-sm py-1 px-4 rounded"
        onClick={handleClick}
        whileHover={{ backgroundColor: "#f3f4f6" }}
        whileTap={{ scale: 0.95 }}
      >
        Bid now
      </motion.button>
    </motion.div>
  );
};

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([
    {
      id: '1',
      title: 'I Need a Construction Estimate',
      categories: ['Construction'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '2',
      title: 'I Need a Construction Estimate',
      categories: ['Plumbing'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'pending'
    },
    {
      id: '3',
      title: 'I Need a Construction Estimate',
      categories: ['Electrical'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '18.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '4',
      title: 'I Need a Landscape Design',
      categories: ['Electrical'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '5',
      title: 'I Need a Construction Estimate',
      categories: ['Construction'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '6',
      title: 'I Need a Construction Estimate',
      categories: ['Plumbing'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'pending'
    },
    {
      id: '7',
      title: 'I Need a Construction Estimate',
      categories: ['Electrical'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '18.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '8',
      title: 'I Need a Landscape Design',
      categories: ['Electrical'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '9',
      title: 'I Need a Construction Estimate',
      categories: ['Construction'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '10',
      title: 'I Need a Construction Estimate',
      categories: ['Plumbing'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'pending'
    },
    {
      id: '11',
      title: 'I Need a Construction Estimate',
      categories: ['Electrical'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '18.12.2022 10:00:00 GMT+8',
      status: 'active'
    },
    {
      id: '12',
      title: 'I Need a Landscape Design',
      categories: ['Electrical'],
      contractor: 'Mr.S.S.Perera',
      area: 'Colombo',
      budget: '20million - 40million',
      endDate: '14.12.2022 10:00:00 GMT+8',
      status: 'active'
    }
  ]);
  
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  
  const categories = ['All', 'Construction', 'Plumbing', 'Electrical'];
  const statuses = ['All', 'active', 'pending'];
  
  // Apply filters and search when dependencies change
  useEffect(() => {
    let result = [...auctions];
    
    // Apply category filter
    if (activeCategory !== 'All') {
      result = result.filter(auction => 
        auction.categories.includes(activeCategory)
      );
    }
    
    // Apply status filter
    if (activeStatus !== 'All') {
      result = result.filter(auction => 
        auction.status === activeStatus
      );
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(auction => 
        auction.title.toLowerCase().includes(query) ||
        auction.contractor.toLowerCase().includes(query) ||
        auction.area.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch(sortOrder) {
      case 'budget-high-low':
        result = result.sort((a, b) => {
          const aBudget = parseInt(a.budget.split('-')[1]);
          const bBudget = parseInt(b.budget.split('-')[1]);
          return bBudget - aBudget;
        });
        break;
      case 'budget-low-high':
        result = result.sort((a, b) => {
          const aBudget = parseInt(a.budget.split('-')[0]);
          const bBudget = parseInt(b.budget.split('-')[0]);
          return aBudget - bBudget;
        });
        break;
      case 'date-newest':
        result = result.sort((a, b) => {
          const aDate = new Date(a.endDate);
          const bDate = new Date(b.endDate);
          return bDate - aDate;
        });
        break;
      default:
        // Keep original order
        break;
    }
    
    setFilteredAuctions(result);
  }, [auctions, activeCategory, activeStatus, searchQuery, sortOrder]);
  
  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-gradient-to-r from-white to-blue-900 p-12 mb-8"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.h1 
          className="text-5xl text-white font-bold"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          AUCTIONS
        </motion.h1>
      </motion.div>
      
      <div className="px-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Search by title, contractor, or area"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    className={`px-3 py-1 text-sm rounded-full ${
                      activeCategory === category
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => setActiveCategory(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <motion.button
                    key={status}
                    className={`px-3 py-1 text-sm rounded-full ${
                      activeStatus === status
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => setActiveStatus(status)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {status}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full px-4 mb-6 flex justify-end">
        <div className="flex items-center">
          <span className="mr-3 text-sm">Sort auctions by</span>
          <select 
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Default Sorting</option>
            <option value="budget-high-low">Budget: High to Low</option>
            <option value="budget-low-high">Budget: Low to High</option>
            <option value="date-newest">End Date: Latest</option>
          </select>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredAuctions.length > 0 ? (
          filteredAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <motion.p 
              className="text-xl text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No auctions match your criteria
            </motion.p>
          </div>
        )}
      </motion.div>
      
      {filteredAuctions.length > 0 && (
        <motion.div 
          className="flex justify-center mt-8 mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex">
            <motion.a 
              href="#" 
              className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center mx-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              1
            </motion.a>
            <motion.a 
              href="#" 
              className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mx-1"
              whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.9 }}
            >
              2
            </motion.a>
            <motion.a 
              href="#" 
              className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mx-1"
              whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.9 }}
            >
              3
            </motion.a>
            <motion.a 
              href="#" 
              className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mx-1"
              whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AuctionsPage;