// Home.jsx
import React from "react";
import { FaSearch, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import heroBg from "../assets/images/hero-bg.jpg";
import person_tablet from "../assets/images/person-tablet.jpg";
import constructor_icon from "../assets/images/constructor-icon.jpg";
import construction_tools from "../assets/images/cement.png"; 
import blueprint_bg from "../assets/images/blueprint-bg.jpg";
import logo from "../assets/images/buildmart_logo1.png"; 
import logo_white from "../assets/images/builmart_logo_white.png"; 
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: "Find the Best Professionals for Your Project",
      borderColor: "border-blue-500",
    },
    {
      title: "Compare Bids & Choose the Right Expert",
      borderColor: "border-blue-500",
    },
    {
      title: "Quality Materials, Delivered to Your Project",
      borderColor: "border-blue-500",
    },
    {
      title: "Access Verified Service Providers for Seamless Construction",
      borderColor: "border-blue-500",
    },
  ];

  const auctions = [
    {
      type: "Construction",
      category: "",
      title: "I Need a Construction Estimate",
      name: "Mr.S.S.Perera",
      area: "Colombo",
      budget: "20million - 40million",
      endDate: "14.6.2022 10:00:00 GMT+8",
      active: true,
    },
    {
      type: "Construction",
      category: "Plumbing",
      title: "I Need a Construction Estimate",
      name: "Mr.S.S.Perera",
      area: "Colombo",
      budget: "20million - 40million",
      endDate: "14.6.2022 10:00:00 GMT+8",
      active: false,
    },
    {
      type: "Construction",
      category: "Electrical",
      title: "I Need a Construction Estimate",
      name: "Mr.S.S.Perera",
      area: "Colombo",
      budget: "20million - 40million",
      endDate: "6.6.2022 10:00:00 GMT+8",
      active: true,
    },
    {
      type: "Landscaping",
      category: "Design",
      title: "I Need a Landscape Design",
      name: "Mr.S.S.Perera",
      area: "Colombo",
      budget: "20million - 40million",
      endDate: "14.6.2022 10:00:00 GMT+8",
      active: true,
    },
  ];

  const professionals = [
    {
      name: "XYZ CONSTRUCTORS",
      area: "Colombo",
      completedRequests: 10,
      rating: 4,
    },
    {
      name: "XYZ CONSTRUCTORS",
      area: "Colombo",
      completedRequests: 10,
      rating: 4,
    },
    {
      name: "XYZ CONSTRUCTORS",
      area: "Colombo",
      completedRequests: 10,
      rating: 4,
    },
    {
      name: "XYZ CONSTRUCTORS",
      area: "Colombo",
      completedRequests: 10,
      rating: 4,
    },
  ];

  const products = [
    {
      id: "01",
      description: "lorem ipsum",
      price: 2000,
      active: true,
    },
    {
      id: "02",
      description: "lorem ipsum",
      price: 2000,
      active: false,
    },
    {
      id: "03",
      description: "lorem ipsum",
      price: 2000,
      active: true,
    },
    {
      id: "04",
      description: "lorem ipsum",
      price: 2000,
      active: true,
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Post Your Task",
      description: "Describe your project and set your budget.",
    },
    {
      step: 2,
      title: "Receive Bids",
      description: "Get competitive bids from verified professionals",
    },
    {
      step: 3,
      title: "Choose the Best",
      description:
        "Compare bids, reviews, and portfolios to select the right professional.",
    },
    {
      step: 4,
      title:
        "Browse and purchase premium materials directly from, all in one place.",
      description: "",
    },
  ];

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-yellow-400 text-xl ${
            i <= rating ? "opacity-100" : "opacity-30"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white py-4 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <img src={logo} alt="BuildMart" className="h-20" />
        </div>
        <div className="flex items-center space-x-8">
          <a href="#" className="text-blue-500">
            Home
          </a>
          <a href="/auctions" className="text-gray-800 hover:text-blue-500">
            Auction
          </a>
          <a href="/Shop" className="text-gray-800 hover:text-blue-500">
            Shop
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-500">
            About Us
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-500">
            Contact Us
          </a>
          <button className="bg-gray-100 text-gray-800 p-2 rounded-full hover:bg-gray-200 transition">
            <FaSearch />
          </button>
          <a href="/login">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
            Sign In
          </button></a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-180  overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="flex items-center space-x-8">
            <div className="max-w-md relative">
              {/* Circle graphic */}
              <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-100 rounded-full opacity-80"></div>

              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-black leading-tight">
                  Find Trusted Professionals for Your Construction & Design
                  Needs
                </h1>
                <a href="signup">
                <button className="mt-6 bg-white border border-gray-300 text-gray-800 px-5 py-2 text-sm uppercase font-medium hover:bg-gray-100 transition">
                  REGISTER NOW
                </button></a>
              </div>
            </div>

            <div className="h-16 border-l border-gray-400"></div>

            <div className="max-w-md">
              <h2 className="text-3xl font-medium text-black leading-tight">
                One Stop for All Your Construction Material Needs
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-4 bg-white shadow-lg rounded-lg overflow-hidden">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`py-4 px-6 border-t-4 ${feature.borderColor} flex items-center justify-center min-h-32 hover:bg-gray-50 transition`}
            >
              <p className="text-center font-medium">{feature.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="w-1/2 pr-8">
              <img
                src={person_tablet} 
                alt="Professional with tablet"
                className="rounded-md shadow-lg"
              />
            </div>
            <div className="w-1/2 pl-8">
              <h2 className="text-5xl font-bold mb-2">
                Your Services,
                <span className="text-yellow-400 block">Your Price,</span>
                Your Materials
              </h2>

              <p className="mt-8 text-gray-200">
                Post your project, receive competitive bids, choose the best
                professionals for your needs, and shop for premium materials—all
                in one place. Fast, transparent, and secure.
              </p>

              <div className="mt-8 flex space-x-4">
                <a href="/login">
                <button className="border border-white text-white px-6 py-2 hover:bg-white hover:text-blue-900 transition">
                  Post a request
                </button></a>
                <a href="signup">
                <button className="border border-white text-white px-6 py-2 hover:bg-white hover:text-blue-900 transition">
                  Join Us
                </button></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auctions Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Latest Auction</h2>
            <a href="#" className="text-blue-500 hover:underline">
              See all auction
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {auctions.map((auction, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="mb-2">
                  <span className="bg-gray-800 text-white px-2 py-1 text-xs rounded-md mr-2">
                    {auction.type}
                  </span>
                  {auction.category && (
                    <span className="bg-gray-800 text-white px-2 py-1 text-xs rounded-md">
                      {auction.category}
                    </span>
                  )}
                </div>

                <h3 className="font-medium mt-4">{auction.name}</h3>
                <p className="text-gray-600 text-sm">Area: {auction.area}</p>
                <p className="text-gray-600 text-sm">
                  Budget: {auction.budget}
                </p>

                <div className="mt-6 flex items-center">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      auction.active ? "bg-green-500" : "bg-orange-500"
                    } mr-2`}
                  ></span>
                  <span className="text-xs text-gray-500">
                    auction {auction.active ? "ends" : "start"} in{" "}
                    {auction.endDate}
                  </span>
                </div>

                <button className="mt-4 border border-gray-300 text-gray-800 px-6 py-2 w-full hover:bg-gray-100 transition">
                  Bid now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Professionals Section */}
      <div className="container mx-auto py-12">
        <div className="border-t border-gray-300 mx-12 mb-10"></div>
        <div className="px-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Professionals</h2>
            <a href="#" className="text-blue-500 hover:underline">
              See all result
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {professionals.map((professional, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-center mb-4">
                  <img
                    src={constructor_icon}
                    alt="Constructor"
                    className="w-24 h-24"
                  />
                </div>

                <h3 className="font-bold text-center">{professional.name}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  <span className="font-semibold">Area:</span>{" "}
                  {professional.area}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">Completed Requests:</span>{" "}
                  {professional.completedRequests}
                </p>

                <div className="flex justify-center my-3">
                  {renderStars(professional.rating)}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <button className="bg-blue-500 text-white px-4 py-2 text-sm w-full hover:bg-blue-600 transition">
                    More Details ››
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto py-8">
        <div className="px-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <a href="#" className="text-blue-500 hover:underline">
              See all result
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div key={index}>
                <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition">
                  <div className="flex justify-center mb-4">
                    <img
                      src={construction_tools}
                      alt={`Product ${product.id}`}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </div>

                <h3 className="font-bold">Product {product.id}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>

                <div className="border-b border-gray-200 my-3">
                  <p className="pb-2">RS : {product.price} /=</p>
                </div>

                <div className="flex items-center mb-4">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      product.active ? "bg-green-500" : "bg-orange-500"
                    } mr-2`}
                  ></span>
                  <span className="text-xs uppercase text-gray-500">
                    {product.active ? "Active" : "Unavailable"}
                  </span>
                </div>

                <button className="border border-gray-300 text-gray-800 px-4 py-1 text-sm hover:bg-gray-100 transition">
                  BUY
                </button>
              </div>
            ))}
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
                  <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                    {step.step}
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

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-12">
          <div className="flex">
            <div className="w-1/3">
              <img
                src={logo_white}
                alt="BuildMart"
                className="h-25 mb-2"
              />
              <p className="text-sm text-gray-300 mt-4">
                Your all-in-one platform for finding top-rated contractors and
                architects. Compare bids, connect with professionals, and ensure
                secure payments with our escrow system. Build smarter, faster,
                and hassle-free!
              </p>
            </div>

            <div className="w-1/3 pl-12">
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Register to bid
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div className="w-1/3"></div>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-blue-800">
            <p className="text-sm text-gray-300">
              © 2025 BuildMart - All rights reserved
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300">
                <FaFacebook />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <FaTwitter />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
