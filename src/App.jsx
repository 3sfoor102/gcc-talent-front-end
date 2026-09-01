import Nav from "./components/Nav"
import SignUpForm from "./pages/SignUpForm"
import './App.css'
import { Routes, Route } from "react-router"
import { useState } from "react"
import SignInForm from "./pages/SignInForm"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"

// Ali Saleh's imports 
import Settings from './components/Settings'


// Ali Alasfoor's imports 


// Hasan Ali's imports 





const getUserFromToken = () => {
  const token = localStorage.getItem('token')

  if (!token) return null

  return JSON.parse(atob(token.split('.')[1])).payload
}

const App = () => {

  const [user, setUser] = useState(getUserFromToken())
  
  return (
    <div>
      <Nav user={user} setUser={setUser} />
      <main className="app-main">
      <Routes>
        // Auth & Admin & Dashboard Rouets & Settings
        <Route path='/' element={user ? <Dashboard user={user} /> : <Landing />} />
        <Route path='/sign-up' element={<SignUpForm setUser={setUser} />} />
        <Route path='/sign-in' element={<SignInForm setUser={setUser} />} />
        <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Landing />} />


        // Profile Routes


        // Contract Routes


        // Wallet Routes


        // Jobs Routes


        // Proposal Routes

        
        // Messages Routes



      </Routes>
      </main>
    </div>
  )
}

export default App