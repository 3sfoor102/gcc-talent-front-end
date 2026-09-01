import { Routes, Route, Navigate } from "react-router";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Nav from "./components/Nav";
import SignUpForm from "./pages/SignUpForm";
import SignInForm from "./pages/SignInForm";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import "./App.css";

// Ali Saleh's imports
import Settings from "./components/Settings";

// Ali Alasfoor's imports (Contracts & Wallet)
import { WalletPage } from "./pages/WalletPage";

// Hasan Ali's imports (Jobs & Communication)
import JobsPage from "./pages/Jobs";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientJobsPage from "./pages/ClientJobsPage";
import JobFormPage from "./pages/JobFormPage";

const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.user || decoded.payload || decoded;
  } catch (err) {
    console.error("Failed to parse token:", err);
    localStorage.removeItem("token");
    return null;
  }
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
  const [user, setUser] = useState(getUserFromToken());

  return (
    <QueryClientProvider client={queryClient}>
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
            <Route
              path="/wallet"
              element={user ? <WalletPage /> : <Navigate to="/sign-in" replace />}
            />
            <Route
              path="/wallet/transactions"
              element={user ? <WalletPage /> : <Navigate to="/sign-in" replace />}
            />

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
    </QueryClientProvider>
  );
};

export default App;