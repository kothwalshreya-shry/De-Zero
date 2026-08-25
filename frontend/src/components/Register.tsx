import { useState } from "react";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Registration successful
      // Go to login so the user can authenticate
      window.location.href = "/login";

    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="register-page">

      {/* Background decoration */}
      <div className="register-orb register-orb-one"></div>
      <div className="register-orb register-orb-two"></div>

      {/* Back to landing */}
      <button
        className="register-back-home"
        onClick={goToHome}
      >
        ← Back to De Zéro
      </button>

      <main className="register-container">

        {/* Brand */}
        <div className="register-brand">
          <div className="register-logo">
            DZ
          </div>

          <div>
            <div className="register-brand-name">
              De Zéro
            </div>

            <div className="register-brand-tagline">
              Begin.Build.Become
            </div>
          </div>
        </div>

        {/* Register Card */}
        <section className="register-card">

          <div className="register-heading">

            <p className="register-eyebrow">
              START FROM ZERO
            </p>

            <h1>
              Begin your
              <span>journey.</span>
            </h1>

            <p>
              Create your account and start building
              your path from zero to job-ready.
            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="register-form"
          >

            {/* Name */}
            <div className="register-form-group">

              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

            </div>

            {/* Email */}
            <div className="register-form-group">

              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
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
            <div className="register-form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
              />

            </div>

            {/* Error */}
            {error && (
              <p className="register-error">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <span>→</span>}
            </button>

          </form>

          {/* Login */}
          <div className="login-prompt">

            <span>
              Already have an account?
            </span>

            <button onClick={goToLogin}>
              Sign in
            </button>

          </div>

        </section>

        <p className="register-footer">
          Your journey starts from zero.
        </p>

      </main>
    </div>
  );
}

export default Register;