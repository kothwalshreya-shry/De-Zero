import { useState } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Onboarding from "./components/Onboardingg";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import AppNavbar from "./components/AppNavbar";


// =========================================================
// PROTECTED LAYOUT
// =========================================================

function ProtectedLayout({
  isLoggedIn,
  onLogout,
  children,
}: {
  isLoggedIn: boolean;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <AppNavbar onLogout={onLogout} />
      {children}
    </>
  );
}


// =========================================================
// APP
// =========================================================

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
  };


  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        {/* HOME */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Home />
            )
          }
        />


        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Login
                onLogin={() => {
                  setIsLoggedIn(true);
                }}
              />
            )
          }
        />


        {/* REGISTER */}
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />


        {/* =================================================
            ONBOARDING
            ONLY AFTER LOGIN
        ================================================= */}

        <Route
          path="/onboarding"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <Onboarding />
            </ProtectedLayout>
          }
        />


        {/* =================================================
            PROTECTED ROUTES
        ================================================= */}

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <Dashboard />
            </ProtectedLayout>
          }
        />


        {/* AI CAREER CHAT */}
        <Route
          path="/chat"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <Chat />
            </ProtectedLayout>
          }
        />


        {/* RESUME */}
        <Route
          path="/resume"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <div
                style={{
                  color: "white",
                  padding: "120px 60px",
                }}
              >
                <h1>Resume</h1>
                <p>Resume page coming soon.</p>
              </div>
            </ProtectedLayout>
          }
        />


        {/* INTERVIEW */}
        <Route
          path="/interview"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <div
                style={{
                  color: "white",
                  padding: "120px 60px",
                }}
              >
                <h1>Interview</h1>
                <p>Interview page coming soon.</p>
              </div>
            </ProtectedLayout>
          }
        />


        {/* PROGRESS */}
        <Route
          path="/progress"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <div
                style={{
                  color: "white",
                  padding: "120px 60px",
                }}
              >
                <h1>Progress</h1>
                <p>Progress page coming soon.</p>
              </div>
            </ProtectedLayout>
          }
        />


        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            >
              <Profile />
            </ProtectedLayout>
          }
        />


        {/* =================================================
            UNKNOWN URL
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn ? "/dashboard" : "/"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;