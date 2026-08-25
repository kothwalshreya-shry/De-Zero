import "./AppNavbar.css";
import { useLocation, useNavigate } from "react-router-dom";

type Page =
  | "dashboard"
  | "chat"
  | "resume"
  | "interview"
  | "progress";

function AppNavbar({ onLogout }: { onLogout: () => void }) {
    const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <nav className="app-navbar">

      {/* =================================================
          LOGO
      ================================================= */}

      <button
        className="app-navbar-brand"
        onClick={() => navigate("/dashboard")}
      >
        <div className="app-brand-logo">
          DZ
        </div>

        <div className="app-brand-text">

          <div className="app-brand-name">
            De Zéro
          </div>

          <div className="app-brand-tagline">
            Begin.Build.Become
          </div>

        </div>
      </button>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="app-nav-links">

        {/* DASHBOARD */}

        <button
          className={
            currentPath === "/dashboard"
              ? "active"
              : ""
          }
          onClick={() => navigate("/dashboard")}
        >
          Home
        </button>


        {/* AI CAREER */}

        <button
          className={
            currentPath === "/chat"
              ? "active"
              : ""
          }
          onClick={() => navigate("/chat")}
        >
          AI Career
        </button>


        {/* RESUME */}

        <button
          className={
            currentPath === "/resume"
              ? "active"
              : ""
          }
          onClick={() => navigate("/resume")}
        >
          Resume
        </button>


        {/* INTERVIEW */}

        <button
          className={
            currentPath === "/interview"
              ? "active"
              : ""
          }
          onClick={() => navigate("/interview")}
        >
          Interview
        </button>


        {/* PROGRESS */}

        <button
          className={
            currentPath === "/progress"
              ? "active"
              : ""
          }
          onClick={() => navigate("/progress")}
        >
          Progress
        </button>

      </div>


      {/* =================================================
          PROFILE
      ================================================= */}

      <button
        className="profile-button"
        onClick={() => navigate("/profile")}
      >
        Student
      </button>

    </nav>
  );
}

export default AppNavbar;