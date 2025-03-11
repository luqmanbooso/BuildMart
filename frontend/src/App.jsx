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
import Shop from './Pages/shop'
import Payment from './components/Payment'

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
        <Route path="/Shop" element={<Shop />} />
        <Route path="/payment" element={<Payment />} />
        {/* Fallback route */}
        <Route path="*" element={<NoPage />} />
        
      </Routes>
    </>
  )
}

export default App
