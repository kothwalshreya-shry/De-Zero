import "./Home.css";

function Home() {
  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToRegister = () => {
    window.location.href = "/register";
  };

  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="landing-navbar">

        {/* LOGO */}
        <button
          className="landing-brand"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <div className="landing-logo">
            DZ
          </div>

          <div className="landing-brand-text">
            <span className="landing-brand-name">
              De Zéro
            </span>

            <span className="landing-brand-tagline">
              Begin.Build.Become
            </span>
          </div>
        </button>


        {/* NAV LINKS */}
        <nav className="landing-nav-links">

          <button
            className="landing-nav-link active"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Home
          </button>

          <button
            className="landing-nav-link"
            onClick={goToLogin}
          >
            AI Review
          </button>

          <button
            className="landing-nav-link"
            onClick={goToLogin}
          >
            Resume
          </button>

          <button
            className="landing-nav-link"
            onClick={goToLogin}
          >
            Interview
          </button>

          <button
            className="landing-nav-link"
            onClick={goToLogin}
          >
            Progress
          </button>

          <button
            className="landing-nav-link"
            onClick={goToLogin}
          >
            Profile
          </button>

        </nav>


        {/* LOGIN */}
        <button
          className="landing-login-button"
          onClick={goToLogin}
        >
          Log in
        </button>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <main>

        <section className="hero-section">

          {/* LEFT SIDE */}

          <div className="hero-content">

            <p className="hero-eyebrow">
              YOUR JOURNEY STARTS HERE
            </p>

            <h1 className="hero-title">
              Begin.
              <span>Build.</span>
              <strong>Become.</strong>
            </h1>

            <p className="hero-description">
              De Zéro empowers aspiring software engineers
              with AI-powered guidance for coding, learning,
              interview preparation, and career growth—all
              in one platform.
            </p>

            <div className="hero-actions">

              <button
                className="primary-cta"
                onClick={goToRegister}
              >
                Start Your Journey
                <span>→</span>
              </button>

              <button
                className="secondary-cta"
                onClick={scrollToFeatures}
              >
                Explore De Zéro
                <span>↓</span>
              </button>

            </div>

          </div>


          {/* RIGHT SIDE — HERO ILLUSTRATION */}

          <div className="hero-visual">

            <div className="hero-glow"></div>

            <div className="hero-orbit hero-orbit-one"></div>
            <div className="hero-orbit hero-orbit-two"></div>

            <img
  src="/de-zero-hero.png"
  alt="De Zéro"
  className="home-hero-image"
/>

          

          </div>

        </section>


        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section
          className="features-section"
          id="features"
        >

          <div className="section-intro">

            <p className="section-eyebrow">
              EVERYTHING YOU NEED
            </p>

            <h2>
              From zero to <span>job-ready.</span>
            </h2>

            <p>
              One platform to learn, build, prepare,
              and grow.
            </p>

          </div>


          <div className="features-grid">

            {/* CARD 1 */}

            <button
              className="feature-card"
              onClick={goToRegister}
            >

              <div className="feature-icon purple">
                &lt;/&gt;
              </div>

              <div className="feature-card-content">

                <h3>
                  AI Career Guidance
                </h3>

                <p>
                  Get personalized guidance for your
                  learning and career journey.
                </p>

              </div>

              <span className="feature-arrow">
                ↗
              </span>

            </button>


            {/* CARD 2 */}

            <button
              className="feature-card"
              onClick={goToRegister}
            >

              <div className="feature-icon blue">
                ◫
              </div>

              <div className="feature-card-content">

                <h3>
                  Learn & Build
                </h3>

                <p>
                  Turn what you learn into real projects
                  you can actually show.
                </p>

              </div>

              <span className="feature-arrow">
                ↗
              </span>

            </button>


            {/* CARD 3 */}

            <button
              className="feature-card"
              onClick={goToRegister}
            >

              <div className="feature-icon pink">
                ✦
              </div>

              <div className="feature-card-content">

                <h3>
                  Resume Builder
                </h3>

                <p>
                  Build a resume that represents the
                  skills you've actually developed.
                </p>

              </div>

              <span className="feature-arrow">
                ↗
              </span>

            </button>


            {/* CARD 4 */}

            <button
              className="feature-card"
              onClick={goToRegister}
            >

              <div className="feature-icon green">
                ◎
              </div>

              <div className="feature-card-content">

                <h3>
                  Interview Prep
                </h3>

                <p>
                  Practice interviews and become confident
                  before the real thing.
                </p>

              </div>

              <span className="feature-arrow">
                ↗
              </span>

            </button>

          </div>

        </section>


        {/* =====================================================
            CTA / JOURNEY SECTION
        ===================================================== */}

        <section className="journey-section">

          <div className="journey-glow"></div>

          <div className="journey-content">

            <p className="section-eyebrow">
              NO MATTER WHERE YOU START
            </p>

            <h2>
              You don't need to
              <span>know everything.</span>
            </h2>

            <p>
              You just need to start.
              De Zéro helps you figure out what to learn,
              what to build, and what to do next.
            </p>

            <button
              className="journey-button"
              onClick={goToRegister}
            >
              Start from zero
              <span>→</span>
            </button>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="landing-footer">

        <div className="footer-main">

          {/* BRAND */}

          <div className="footer-brand">

            <div className="footer-logo">
              DZ
            </div>

            <div>

              <div className="footer-brand-name">
                De Zéro
              </div>

              <div className="footer-tagline">
                Begin.Build.Become
              </div>

            </div>

          </div>


          {/* PRODUCT */}

          <div className="footer-column">

            <h4>
              Product
            </h4>

            <button onClick={goToLogin}>
              Features
            </button>

            <button onClick={goToLogin}>
              How It Works
            </button>

            <button onClick={goToLogin}>
              Roadmap
            </button>

            <button onClick={goToLogin}>
              Pricing
            </button>

          </div>


          {/* COMPANY */}

          <div className="footer-column">

            <h4>
              Company
            </h4>

            <button>
              About Us
            </button>

            <button>
              Careers
            </button>

            <button>
              Contact
            </button>

            <button>
              Privacy Policy
            </button>

          </div>


          {/* STAY CONNECTED */}

          <div className="footer-column connected">

            <h4>
              Stay Connected
            </h4>

            <div className="social-links">

              <button>𝕏</button>
              <button>in</button>
              <button>◎</button>
              <button>◉</button>

            </div>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 De Zéro. All rights reserved.
          </span>

          <span>
            Your journey starts from zero.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Home;