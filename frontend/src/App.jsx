import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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

function App() {
  const sampleData = {
    shipmentId: "123456",
    shipmentStatus: "Out for Delivery",
    deliveryProgress: 75, // Progress percentage (e.g., 75%)
    estimatedDelivery: "Friday, October 27, 2023",
  };


  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/bid-form' element={<BidForm/>} />
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
        <Route path='/auctions' element={<AuctionsPage />} />
        {/* Fallback route */}
        <Route path="*" element={<NoPage />} />
        <Route path="/contractor-profile" element={<ContractorProfile />} />
      </Routes>
    </>
  )
}

export default App
