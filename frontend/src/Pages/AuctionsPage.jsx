import React from 'react';

const AuctionCard = ({ auction }) => {
  const handleClick = () => {
    window.location.href = `/project-details`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
      <h3 className="text-lg font-bold mb-2">{auction.title}</h3>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {auction.categories.map((category, index) => (
          <span 
            key={index} 
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded-sm"
          >
            {category}
          </span>
        ))}
      </div>
      
      <div className="mb-4">
        <p className="font-medium">{auction.contractor}</p>
        <p className="text-sm text-gray-600">Area: {auction.area}</p>
        <p className="text-sm text-gray-600">Budget: {auction.budget}</p>
      </div>
      
      <div className="flex items-center mb-4">
        <div className={`w-2 h-2 rounded-full ${auction.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
        <p className="text-xs text-gray-600">
          auction ends in: {auction.endDate}
        </p>
      </div>
      
      <button 
        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-sm py-1 px-4 rounded"
        onClick={handleClick}
      >
        Bid now
      </button>
    </div>
  );
};

const AuctionsPage = () => {
  const auctions = [
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
  ];
  
  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-white to-blue-900 p-12 mb-8">
        <h1 className="text-5xl text-white font-bold">AUCTIONS</h1>
      </div>
      
      <div className="w-full px-4 mb-6 flex justify-end">
        <div className="flex items-center">
          <span className="mr-3 text-sm">Sort auctions by</span>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option>Default Sorting</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {auctions.map(auction => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8 mb-12">
        <div className="flex">
          <a href="#" className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center mx-1">1</a>
          <a href="#" className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mx-1">2</a>
          <a href="#" className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mx-1">3</a>
          <a href="#" className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mx-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;