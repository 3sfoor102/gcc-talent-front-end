import { Routes, Route } from "react-router"
import { useState, useEffect } from "react"
import Nav from "./components/Nav"
import SignUpForm from "./pages/SignUpForm"
import SignInForm from "./pages/SignInForm"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import "./App.css"

// Ali Saleh's imports
import Settings from "./components/Settings"
import Profile from "./components/Profile"
import EditProfile from "./components/EditProfile"

// Ali Alasfoor's imports

// Hasan Ali's imports
import JobsPage from "./pages/Jobs"
import JobDetailsPage from "./pages/JobDetailsPage"
import ClientJobsPage from "./pages/ClientJobsPage"
import JobFormPage from "./pages/JobFormPage"
import JobProposalsPage from "./pages/JobProposalsPage"
import MyProposalsPage from "./pages/MyProposalsPage"
import ProfileEditorPage from "./pages/ProfileEditorPage"
import PublicFreelancerProfilePage from "./pages/PublicFreelancerProfilePage"
import PublicClientProfilePage from "./pages/PublicClientProfilePage"
import FreelancerSearchPage from "./pages/FreelancerSearchPage"
// End of Hasan's

const getUserFromToken = () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]))
    return decoded.payload || decoded.user || decoded
  } catch (err) {
    return null
  }
}

const App = () => {
  const [user, setUser] = useState(getUserFromToken())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifySession = async function () {
      const token = localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth/verify`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const responseData = await res.json()

        if (res.ok) {
          const rawUser =
            responseData.data?.user || responseData.user || responseData
          if (rawUser) {
            const formattedUser = {
              ...rawUser,
              id: rawUser.id || rawUser._id,
              role: rawUser.role || "freelancer",
            }
            setUser(formattedUser)
          }
        } else {
          localStorage.removeItem("token")
          setUser(null)
        }
      } catch (err) {
        console.error("Session verification failed:", err)
        localStorage.removeItem("token")
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
        <p className="text-brand-teal font-semibold text-lg animate-pulse">
          Loading session...
        </p>
      </div>
    )
  }

  return (
    <div>
      <Nav user={user} setUser={setUser} />
      <main className="app-main">
        <Routes>
          {/* Auth & Admin & Dashboard Routes & Settings */}
          <Route
            path="/"
            element={user ? <Dashboard user={user} /> : <Landing />}
          />
          <Route path="/sign-up" element={<SignUpForm setUser={setUser} />} />
          <Route path="/sign-in" element={<SignInForm setUser={setUser} />} />
          <Route
            path="/settings"
            element={
              user ? <Settings user={user} setUser={setUser} /> : <Landing />
            }
          />

          {/* Profile Routes */}
          <Route path="/freelancers" element={<FreelancerSearchPage />} />
          <Route
            path="/freelancer/profile"
            element={<ProfileEditorPage user={user} />}
          />
          <Route
            path="/client/profile"
            element={<ProfileEditorPage user={user} />}
          />
          <Route
            path="/freelancers/:userId"
            element={<PublicFreelancerProfilePage />}
          />
          <Route
            path="/clients/:userId"
            element={<PublicClientProfilePage />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} /> : <Landing />}
          />
          <Route
            path="/profile/edit"
            element={user ? <EditProfile user={user} /> : <Landing />}
          />

          {/* Contract Routes */}

          {/* Wallet Routes */}

          {/* Jobs Routes */}
          {/* Jobs Public Browsing */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage user={user} />} />

          {/* Client Job & Proposal Management */}
          <Route path="/client/jobs" element={<ClientJobsPage user={user} />} />
          <Route path="/client/jobs/new" element={<JobFormPage />} />
          <Route path="/client/jobs/:jobId/edit" element={<JobFormPage />} />
          <Route
            path="/client/jobs/:jobId/proposals"
            element={<JobProposalsPage user={user} />}
          />

          {/* Proposal Routes */}
          {/* Freelancer Proposals Management */}
          <Route
            path="/freelancer/proposals"
            element={<MyProposalsPage user={user} />}
          />

          {/* Messages Routes */}
        </Routes>
      </main>
    </div>
  )
}

export default App