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

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifySession = async function () 
    {
        const token = localStorage.getItem('token')
        
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACK_END_SERVER_URL}/auth/verify`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            const responseData = await res.json()
            
            if (res.ok) {
                // نلتقط اليوزر من أي مكان محتمل في الرد ونتاكد إن عنده اسم
                const rawUser = responseData.data?.user || responseData.user || responseData
                if (rawUser) {
                    // نوحّد شكل اليوزر عشان يضمن وجود الـ name والـ role والـ id بشكل سليم
                    const formattedUser = {
                        ...rawUser,
                        id: rawUser.id || rawUser._id,
                        role: rawUser.role || 'freelancer'
                    }
                    setUser(formattedUser)
                }
            } else {
                localStorage.removeItem('token')
                setUser(null)
            }
        } catch (err) {
            console.error("Session verification failed:", err)
            localStorage.removeItem('token')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    verifySession()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-brand-cream">
        <p className="text-brand-teal font-semibold text-lg animate-pulse">Loading session...</p>
      </div>
    )
  }

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