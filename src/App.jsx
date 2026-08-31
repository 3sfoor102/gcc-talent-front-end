import Nav from "./components/Nav"
import SignUpForm from "./pages/SignUpForm"
import './App.css'
import { Routes, Route } from "react-router"
import { useState, useEffect } from "react"
import SignInForm from "./pages/SignInForm"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"

// Ali Saleh's imports 


// Ali Alasfoor's imports 


// Hasan Ali's imports 
import JobsPage from "./pages/Jobs"
import JobDetailsPage from "./pages/JobDetailsPage"
import ClientJobsPage from "./pages/ClientJobsPage"
import JobFormPage from "./pages/JobFormPage"
import { Link } from "react-router"
// End of Hasan's


const getUserFromToken = () => {
  const token = localStorage.getItem('token')

  if (!token) return null

  return JSON.parse(atob(token.split('.')[1])).payload
}

const App = () => {

  // Ali Saleh's imports 


  // Ali Alasfoor's imports 


  // Hasan Ali's imports 





  // End of Hasan's


  const [user, setUser] = useState(getUserFromToken())

  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/jobs">All Jobs</Link></li>
          <li><Link to="/jobs/my-jobs">My Posted Jobs</Link></li>
          <li><Link to="/jobs/new">Post a Job</Link></li>
        </ul>
      </nav>

      <Routes>
        {/* <Route path="/" element={  } /> */}
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/new" element={<JobFormPage />} />
        <Route path="/jobs/my-jobs" element={<ClientJobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/jobs/:jobId/edit" element={<JobFormPage />} />      </Routes>
    </div>

    // <div>
    //   <Nav user={user} setUser={setUser} />
    //   <main className="app-main">
    // <Routes>
    //     // Auth & Admin & Dashboard Rouets
    //       <Route path='/' element={user ? <Dashboard user={user} /> : <Landing />} />
    //       <Route path='/sign-up' element={<SignUpForm setUser={setUser} />} />
    //       <Route path='/sign-in' element={<SignInForm setUser={setUser} />} />


    // Profile Routes


    // Contract Routes


    // Wallet Routes


    // Jobs Routes


    // Proposal Routes


    // Messages Routes



    //     </Routes>
    //   </main>
    // </div>
  )
}

export default App