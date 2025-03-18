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
import ActiveJob from './Pages/ActiveJob'
import OngoingJobs from './Pages/OngoingWorks'
import BiddingHistoryPage from './components/BiddingHistory'
import ContractorProfileSetup from './components/ContractorOnboarding'
import ViewDetails from './Pages/ViewDetails'
import Cart from './Pages/Cart'


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
        <Route path='/bid-form/:jobId' element={<BidForm
        sampleData={sampleProjectData}
        />} />
        <Route path="/myprojects" element={<ProjectsPage />} /> 
        <Route path="/project-details" element={<ProjectDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/payment" element={<Payment />} />
        <Route path='/bidhistory' element={<BiddingHistoryPage />} />
        <Route path="/shippingtracking" element={<ShippingTracking
          shipmentId={sampleData.shipmentId}
          shipmentStatus={sampleData.shipmentStatus}
          deliveryProgress={sampleData.deliveryProgress}
          estimatedDelivery={sampleData.estimatedDelivery}
        />  } />
        <Route path='/aggreement' element={<ClientContractorAgreement />} />
        <Route path='/auction' element={<AuctionsPage />} />
        {/* Fallback route */}
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/admindashboard" element={<Admindashboard />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/paymentdashboard" element={<PaymentDashboard />} />
        <Route path="*" element={<NoPage />} />
        <Route path="/contractor-profile" element={<ContractorProfile />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/job/:jobId" element={<ActiveJob />} />
        <Route path="/project/:jobId" element={<ProjectDetails />} />
        <Route path="/activejobs" element={<ActiveJob />} />
        <Route path="/contractorStart" element={<ContractorProfileSetup />} />
        <Route path="/viewdetails" element={<ViewDetails />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/ongoing-works" element={<OngoingJobs />} />
      </Routes>
    </>
  )
}

export default App
