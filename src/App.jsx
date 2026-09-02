import Nav from "./components/Nav"
import SignUpForm from "./pages/SignUpForm"
import './App.css'
import { Routes, Route, Link } from "react-router"
import { useState, useEffect } from "react"
import SignInForm from "./pages/SignInForm"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"

// Ali Saleh's imports 
import Settings from './components/Settings'

// Ali Alasfoor's imports 

// Hasan Ali's imports 
import JobsPage from "./pages/Jobs"
import JobDetailsPage from "./pages/JobDetailsPage"
import ClientJobsPage from "./pages/ClientJobsPage"
import JobFormPage from "./pages/JobFormPage"
import JobProposalsPage from "./pages/JobProposalsPage"
import MyProposalsPage from "./pages/MyProposalsPage"
import ProfileEditorPage from "./pages/ProfileEditorPage"
import PublicFreelancerProfilePage from './pages/PublicFreelancerProfilePage'
import PublicClientProfilePage from './pages/PublicClientProfilePage'
import FreelancerSearchPage from './pages/FreelancerSearchPage'
// End of Hasan's

const getUserFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  return JSON.parse(atob(token.split('.')[1])).payload
}

const App = () => {
  // Ali Saleh's CONSTS 

  // Ali Alasfoor's CONSTS 

  // Hasan Ali's CONSTS 

  // End of Hasan's 

  const [user, setUser] = useState(getUserFromToken())

  return (
    <div>
      <Nav user={user} setUser={setUser} />
      <main className="app-main">
        <Routes>
          {/* Auth & Admin & Dashboard Routes & Settings */}
          <Route path="/" element={user ? <Dashboard user={user} /> : <Landing />} />
          <Route path="/sign-up" element={<SignUpForm setUser={setUser} />} />
          <Route path="/sign-in" element={<SignInForm setUser={setUser} />} />
          <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Landing />} />

          {/* Profile Routes */}
          <Route path="/freelancers" element={<FreelancerSearchPage />} />
          <Route path="/freelancer/profile" element={<ProfileEditorPage user={user} />} />
          <Route path="/client/profile" element={<ProfileEditorPage user={user} />} />
          <Route path="/freelancers/:userId" element={<PublicFreelancerProfilePage />} />
          <Route path="/clients/:userId" element={<PublicClientProfilePage />} />

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
          <Route path="/client/jobs/:jobId/proposals" element={<JobProposalsPage user={user} />} />


          {/* Proposal Routes */}
          {/* Freelancer Proposals Management */}
          <Route path="/freelancer/proposals" element={<MyProposalsPage user={user} />} />

          {/* Messages Routes */}
        </Routes>
      </main>
    </div>
  )
}

export default App