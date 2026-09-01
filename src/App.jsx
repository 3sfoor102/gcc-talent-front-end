import Nav from "./components/Nav";
import SignUpForm from "./pages/SignUpForm";
import "./App.css";
import { Routes, Route, Link } from "react-router";
import { useState, useEffect } from "react";
import SignInForm from "./pages/SignInForm";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

// Ali Saleh's imports
import Settings from "./components/Settings";

// Ali Alasfoor's imports
import { BrowserRouter, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletPage } from "./pages/WalletPage";

// Hasan Ali's imports
import JobsPage from "./pages/Jobs";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientJobsPage from "./pages/ClientJobsPage";
import JobFormPage from "./pages/JobFormPage";
import { Scale } from "lucide-react";
// End of Hasan's

const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return JSON.parse(atob(token.split(".")[1])).payload;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Ali Saleh's CONSTS

  // Ali Alasfoor's CONSTS

  // Hasan Ali's CONSTS

  // End of Hasan's

  const [user, setUser] = useState(getUserFromToken());

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

          {/* Contract Routes */}

          {/* Wallet Routes */}

          {/* Jobs Routes */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/new" element={<JobFormPage />} />
          <Route path="/jobs/my-jobs" element={<ClientJobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage user={user} />} />
          <Route path="/jobs/:jobId/edit" element={<JobFormPage />} />

          {/* Proposal Routes */}

          {/* Messages Routes */}
        </Routes>
      </main>
    </div>
  );
};

export default App;
