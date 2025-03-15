import { useState } from 'react'

import './App.css'
import BidForm from './components/BidForm'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import NoPage from './Pages/NoPage'
import ProjectDetails from './Pages/ProjectDetails'
import Login from './Pages/login'
import SignUp from './Pages/Signup'
import Shop from './Pages/shop'
import Payment from './components/Payment'
import ShippingTracking from './Pages/ShippingTracking'
import AuctionsPage from './Pages/AuctionsPage'
import ContractorProfile from './Pages/ContractorPage'
import Contact from './Pages/Contact'
import About from './Pages/About'
import Admindashboard from './Pages/Admindashboard'
import ClientContractorAgreement from './Pages/ClientContractorAgreement'
import PaymentDashboard from './Pages/PaymentDashboard'
import ProjectsPage from './Pages/MyProjects'
import UserProfile from './Pages/UserProfile'
import BiddingHistory from './components/BiddingHistory'
import ContractorEarnings from './Pages/ContractorEarnings'


function App() {
  const sampleData = {
    shipmentId: "123456",
    shipmentStatus: "Out for Delivery",
    deliveryProgress: 75, // Progress percentage (e.g., 75%)
    estimatedDelivery: "Friday, October 27, 2023",
  };

  const samplebid = {
    id: '123',
    title: 'Residential Kitchen Renovation',
    description: 'Complete renovation of a 200 sq ft kitchen including cabinets, countertops, and electrical work',
    budget: 'RS:3000 - RS:8000',
    minBid: 3000,
    maxBid: 8000,
    endTime: '2025-03-16T08:05:33 GMT+08:00',
    bids: []
  }

  const sampleProjectData = {
    title: "Office Renovation",
    description: "Complete renovation of the main office space including new flooring, lighting, and furniture.",
    budget: "RS:5000 - RS:10000",
    endTime: "2025-03-20T08:00:00",
    contractorName: "ABC Construction",
    yourBid: 7500,
    timeline: 30,
    experience: 5,
    additionalDetails: "Specialized in modern office renovations with 5+ years of experience working on similar projects."
  };

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/bid-form' element={<BidForm
        sampleData={sampleProjectData}
        />} />
        <Route path="/myprojects" element={<ProjectsPage />} /> 
        <Route path="/project-details" element={<ProjectDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/shippingtracking" element={<ShippingTracking
          shipmentId={sampleData.shipmentId}
          shipmentStatus={sampleData.shipmentStatus}
          deliveryProgress={sampleData.deliveryProgress}
          estimatedDelivery={sampleData.estimatedDelivery}
        />  } />
        <Route path='/aggreement' element={<ClientContractorAgreement />} />
        <Route path='/auctions' element={<AuctionsPage />} />
        {/* Fallback route */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/admindashboard" element={<Admindashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/paymentdashboard" element={<PaymentDashboard />} />
        <Route path="*" element={<NoPage />} />
        <Route path="/contractor-profile" element={<ContractorProfile />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/bidhistory" element={<BiddingHistory />} />
        <Route path='/earnings' element={<ContractorEarnings />} />
      </Routes>
    </>
  )
}

export default App
