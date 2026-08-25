import "./Navbar.css";

type NavbarProps = {
  onNavigate: (page: "home" | "chat") => void;
};

function Navbar({ onNavigate }: NavbarProps) {
  const goToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <button
        className="navbar-brand"
        onClick={() => onNavigate("home")}
      >
        <div className="brand-logo">
          DZ
        </div>

        <div className="brand-text">
          <div className="brand-name">
            De Zéro
          </div>

          <div className="brand-tagline">
            Begin.Build.Become
          </div>
        </div>
      </button>

      {/* NAVIGATION */}
      <div className="nav-links">

        <button onClick={() => onNavigate("home")}>
          Home
        </button>

        <button onClick={goToLogin}>
          AI Review
        </button>

        <button onClick={goToLogin}>
          Resume
        </button>

        <button onClick={goToLogin}>
          Interview
        </button>

        <button onClick={goToLogin}>
          Progress
        </button>

      </div>

      {/* AUTH */}
      <div className="nav-auth">

        <button
          className="nav-login"
          onClick={goToLogin}
        >
          Login
        </button>

        <button
          className="nav-register"
          onClick={goToLogin}
        >
          Register
        </button>

      </div>
    </nav>
  );
}

export default Navbar;