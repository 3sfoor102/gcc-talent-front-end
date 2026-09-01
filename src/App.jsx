import Nav from "./components/Nav"
import SignUpForm from "./pages/SignUpForm"
import './App.css'
import { Routes, Route } from "react-router"
import { useState, useEffect } from "react"
import SignInForm from "./pages/SignInForm"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import Settings from './components/Settings'
import Profile from './components/Profile'
import EditProfile from './components/EditProfile'

const getUserFromToken = () => {
  const token = localStorage.getItem('token')

  if (!token) return null

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    return decoded.payload || decoded.user || decoded
  } catch (err) {
    return null
  }
}

const App = () => {

  const [user, setUser] = useState(getUserFromToken())

  useEffect(() => {
    const verifySession = async function () 
    {
        const token = localStorage.getItem('token')
        
        if (token) {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACK_END_SERVER_URL}/auth/verify`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                
                const responseData = await res.json()
                
                if (res.ok) {
                    const validUser = responseData.data?.user || responseData.user || responseData
                    if (validUser) {
                        setUser(validUser)
                    }
                } else {
                    localStorage.removeItem('token')
                    setUser(null)
                }
            } catch (err) {
                console.error("Session verification failed:", err)
            }
        }
    }

    verifySession()
  }, [])

  return (
    <div>
      <Nav user={user} setUser={setUser} />
      <main className="app-main">
      <Routes>
        <Route path='/' element={user ? <Dashboard user={user} /> : <Landing />} />
        <Route path='/sign-up' element={<SignUpForm setUser={setUser} />} />
        <Route path='/sign-in' element={<SignInForm setUser={setUser} />} />
        <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Landing />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Landing />} />
        <Route path="/profile/edit" element={user ? <EditProfile user={user} /> : <Landing />} />
      </Routes>
      </main>
    </div>
  )
}

export default App