import { Routes, Route, Navigate } from "react-router";
import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import SignUpForm from "./pages/SignUpForm";
import SignInForm from "./pages/SignInForm";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import "./App.css";

// Ali Saleh's imports
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ManageUsers from "./pages/ManageUsers";
import ManageCategories from "./pages/ManageCategories";
import ManageReports from "./pages/ManageReports";
import { LinkedInCallback } from 'react-linkedin-login-oauth2';

// Ali Alasfoor's imports
import ContractsPage from "./pages/ContractsPage";
import ContractWorkspacePage from "./pages/ContractWorkspacePage";
import WalletPage from "./pages/WalletPage";

// Hasan Ali's imports
import JobsPage from "./pages/Jobs";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientJobsPage from "./pages/ClientJobsPage";
import JobFormPage from "./pages/JobFormPage";
import JobProposalsPage from "./pages/JobProposalsPage";
import MyProposalsPage from "./pages/MyProposalsPage";
import ProfileEditorPage from "./pages/ProfileEditorPage";
import PublicFreelancerProfilePage from "./pages/PublicFreelancerProfilePage";
import PublicClientProfilePage from "./pages/PublicClientProfilePage";
import FreelancerSearchPage from "./pages/FreelancerSearchPage";
import MessagesPage from "./pages/MessagesPage";
// End of Hasan's

const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.payload || decoded.user || decoded;
  } catch (err) {
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState(getUserFromToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async function () {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth/verify`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const responseData = await res.json();

        if (res.ok) {
          const rawUser =
            responseData.data?.user || responseData.user || responseData;
          if (rawUser) {
            const formattedUser = {
              ...rawUser,
              id: rawUser.id || rawUser._id,
              role: rawUser.role || "freelancer",
            };
            setUser(formattedUser);
          }
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-brand-cream">
        <p className="text-brand-teal font-semibold text-lg animate-pulse">
          Loading session...
        </p>
      </div>
    );
  }

  return (
    <div>
      <Nav user={user} setUser={setUser} />
      <main className="app-main">
        <Routes>
          {/* Public Landing or Authenticated Dashboard */}
          <Route
            path="/"
            element={user ? <Dashboard user={user} /> : <Landing />}
          />

          {/* Guest-Only Authentication Routes */}
          <Route
            path="/sign-up"
            element={
              <GuestRoute user={user}>
                <SignUpForm setUser={setUser} />
              </GuestRoute>
            }
          />
          <Route
            path="/sign-in"
            element={
              <GuestRoute user={user}>
                <SignInForm setUser={setUser} />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute user={user}>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute user={user}>
                <ResetPassword />
              </GuestRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <ManageReports />
              </ProtectedRoute>
            }
          />

          {/* Public Directory & Browsing */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage user={user} />} />
          <Route path="/freelancers" element={<FreelancerSearchPage />} />
          <Route
            path="/freelancers/:userId"
            element={<PublicFreelancerProfilePage />}
          />
          <Route
            path="/clients/:userId"
            element={<PublicClientProfilePage />}
          />

          {/* Authenticated Routes (Any Logged-in User) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute user={user}>
                <Settings user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute user={user}>
                <EditProfile user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute user={user}>
                <MessagesPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute user={user}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Contracts & Workspace Routes */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute user={user}>
                <ContractsPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* Wallet Routes */}
          <Route
            path="/wallet"
            element={
              <ProtectedRoute user={user}>
                <WalletPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contracts/:contractId"
            element={
              <ProtectedRoute user={user}>
                <ContractWorkspacePage user={user} />
              </ProtectedRoute>
            }
          />
          {/* Client-Only Routes */}
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute user={user} allowedRoles={["client"]}>
                <ProfileEditorPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/jobs"
            element={
              <ProtectedRoute user={user} allowedRoles={["client"]}>
                <ClientJobsPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/jobs/new"
            element={
              <ProtectedRoute user={user} allowedRoles={["client"]}>
                <JobFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/jobs/:jobId/edit"
            element={
              <ProtectedRoute user={user} allowedRoles={["client"]}>
                <JobFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/jobs/:jobId/proposals"
            element={
              <ProtectedRoute user={user} allowedRoles={["client"]}>
                <JobProposalsPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* Freelancer-Only Routes */}
          <Route
            path="/freelancer/profile"
            element={
              <ProtectedRoute user={user} allowedRoles={["freelancer"]}>
                <ProfileEditorPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/proposals"
            element={
              <ProtectedRoute user={user} allowedRoles={["freelancer"]}>
                <MyProposalsPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="/linkedin" element={<LinkedInCallback />} />

          {/* 404 Splat Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;