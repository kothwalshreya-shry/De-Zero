import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save authentication
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Tell App.tsx that login succeeded
      onLogin();
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to server");
    }
  };

  const goToRegister = () => {
    window.location.href = "/register";
  };

  const goToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-orb login-orb-one"></div>
      <div className="login-orb login-orb-two"></div>

      {/* Back to landing page */}
      <button className="back-home" onClick={goToHome}>
        ← Back to De Zéro
      </button>

      <main className="login-container">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">DZ</div>

          <div>
            <div className="login-brand-name">
              De Zéro
            </div>

            <div className="login-brand-tagline">
              Begin.Build.Become
            </div>
          </div>
        </div>

        {/* Login card */}
        <section className="login-card">

          <div className="login-heading">
            <p className="login-eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Continue your
              <span>journey.</span>
            </h1>

            <p>
              Sign in and keep building your path from zero
              to job-ready.
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form">

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  color: "#ff5c8a",
                  fontSize: "10px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            {/* Login */}
            <button
              type="submit"
              className="login-submit"
            >
              Continue
              <span>→</span>
            </button>

          </form>

          {/* Register */}
          <div className="register-prompt">
            <span>Don't have an account?</span>

            <button onClick={goToRegister}>
              Create one
            </button>
          </div>

        </section>

        {/* Small footer */}
        <p className="login-footer">
          Your journey starts from zero.
        </p>

      </main>
    </div>
  );
}

export default Login;