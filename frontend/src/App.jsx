import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BidForm from './components/BidForm'
import Login from './Pages/login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BidForm />
      <Login />
    </>
  )
}

export default App
