import { useMemo, useState } from "react";
import "./Progress.css";

type Goal = {
  id: number;
  title: string;
  subtitle: string;
  completed: boolean;
  icon: string;
};

type Achievement = {
  id: number;
  icon: string;
  title: string;
  description: string;
  xp: number;
  time: string;
};

type LearningStep = {
  id: number;
  icon: string;
  label: string;
  title: string;
  status: "current" | "next" | "locked" | "milestone";
  progress?: number;
};

const initialGoals: Goal[] = [
  {
    id: 1,
    title: "Learn React Props",
    subtitle: "Watch & take notes",
    completed: true,
    icon: "✦",
  },
  {
    id: 2,
    title: "Solve 2 DSA Problems",
    subtitle: "Arrays & Hashing",
    completed: true,
    icon: "⌘",
  },
  {
    id: 3,
    title: "Work on Mini Project",
    subtitle: "Build a Navbar",
    completed: true,
    icon: "⌁",
  },
  {
    id: 4,
    title: "Read for 20 Minutes",
    subtitle: "Any tech article",
    completed: false,
    icon: "◈",
  },
];

const achievements: Achievement[] = [
  {
    id: 1,
    icon: "💎",
    title: "First Steps",
    description: "Completed your first goal",
    xp: 100,
    time: "2 days ago",
  },
  {
    id: 2,
    icon: "🔥",
    title: "7 Day Streak",
    description: "Learning every single day!",
    xp: 250,
    time: "Yesterday",
  },
  {
    id: 3,
    icon: "🚀",
    title: "DSA Starter",
    description: "Solved 10 DSA problems",
    xp: 300,
    time: "3 days ago",
  },
];

const learningSteps: LearningStep[] = [
  {
    id: 1,
    icon: "</>",
    label: "Current",
    title: "JavaScript Basics",
    status: "current",
    progress: 60,
  },
  {
    id: 2,
    icon: "ϟ",
    label: "Up Next",
    title: "DOM & Events",
    status: "next",
  },
  {
    id: 3,
    icon: "⚛",
    label: "After That",
    title: "React Fundamentals",
    status: "locked",
  },
  {
    id: 4,
    icon: "♛",
    label: "Milestone",
    title: "Build Real Project",
    status: "milestone",
  },
];

function Progress() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedYear, setSelectedYear] = useState("This Year");

  const completedGoals = goals.filter((goal) => goal.completed).length;

  const goalPercentage = Math.round(
    (completedGoals / goals.length) * 100
  );

  const toggleGoal = (id: number) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === id
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  /*
   * Fake contribution data for now.
   *
   * Later this will come from the backend:
   * DSA problems solved per day.
   */
  const contributionData = useMemo(() => {
    return Array.from({ length: 24 }, (_, column) =>
      Array.from({ length: 7 }, (_, row) => {
        const value =
          (column * 7 + row * 3 + 5) % 6;

        return value;
      })
    );
  }, []);

  return (
    <div className="progress-page">

      {/* =========================================================
          SIDEBAR
      ========================================================== */}

      <aside className="progress-sidebar">

        <div className="sidebar-brand">
          <div className="brand-name">
            De Zéro
            <span className="brand-spark">✦</span>
          </div>

          <div className="brand-tagline">
            BEGIN. BUILD. BECOME.
          </div>
        </div>

        <nav className="sidebar-nav">

          <a href="/dashboard" className="sidebar-link">
            <span className="sidebar-icon">⌂</span>
            <span>Dashboard</span>
          </a>

          <a href="/roadmap" className="sidebar-link">
            <span className="sidebar-icon">♧</span>
            <span>Roadmap</span>
          </a>

          <a href="/learn" className="sidebar-link">
            <span className="sidebar-icon">▣</span>
            <span>Learn</span>
          </a>

          <a href="/projects" className="sidebar-link">
            <span className="sidebar-icon">⌘</span>
            <span>Projects</span>
          </a>

          <a href="/ai-career" className="sidebar-link">
            <span className="sidebar-icon">◎</span>
            <span>AI Career</span>
          </a>

          <a
            href="/progress"
            className="sidebar-link active"
          >
            <span className="sidebar-icon">♘</span>
            <span>Progress</span>
          </a>

          <a href="/profile" className="sidebar-link">
            <span className="sidebar-icon">◯</span>
            <span>Profile</span>
          </a>

        </nav>

        {/* LEVEL */}
        <div className="level-widget">

          <div className="level-icon">
            ✦
          </div>

          <div className="level-number">
            Lv. 12
          </div>

          <div className="level-name">
            Explorer
          </div>

          <div className="xp-text">
            2,480 / 3,000 XP
          </div>

          <div className="xp-track">
            <div
              className="xp-fill"
              style={{ width: "82%" }}
            />
          </div>

        </div>

      </aside>


      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <main className="progress-main">

        {/* TOP BAR */}

        <header className="progress-topbar">

          <div className="mobile-brand">
            De Zéro<span>✦</span>
          </div>

          <div className="topbar-actions">

            <div className="mini-stat">
              <span>🔥</span>
              <div>
                <strong>7</strong>
                <small>Day Streak</small>
              </div>
            </div>

            <div className="mini-stat">
              <span>♨</span>
              <div>
                <strong>2,840</strong>
                <small>Total XP</small>
              </div>
            </div>

            <button className="notification-button">
              ♧
              <span />
            </button>

            <div className="avatar">
              SK
            </div>

          </div>

        </header>


        {/* =========================================================
            HERO
        ========================================================== */}

        <section className="progress-hero">

          <div className="hero-heading">

            <div className="hero-eyebrow">
              Your Progress <span>✣</span>
            </div>

            <h1>
              Every step
              <br />
              builds your{" "}
              <span>future.</span>
            </h1>

            <p>
              Track. Learn. Grow. Repeat.
            </p>

          </div>


          {/* FLOATING PLANET */}

          <div className="planet">
            <div className="planet-ring" />
            <div className="planet-ball" />
          </div>


          {/* ROADMAP ILLUSTRATION */}

          <div className="journey">

            <svg
              className="journey-road"
              viewBox="0 0 620 720"
              preserveAspectRatio="none"
            >

              <defs>

                <linearGradient
                  id="roadGradient"
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" />
                  <stop offset="45%" />
                  <stop offset="100%" />
                </linearGradient>

                <filter id="roadGlow">
                  <feGaussianBlur
                    stdDeviation="12"
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

              </defs>

              {/* Glow */}
              <path
                d="
                  M 160 700
                  C 160 600 520 610 450 500
                  C 380 390 90 460 150 340
                  C 220 200 560 290 470 150
                  C 430 90 330 100 330 30
                "
                className="road-glow"
              />

              {/* Main road */}
              <path
                d="
                  M 160 700
                  C 160 600 520 610 450 500
                  C 380 390 90 460 150 340
                  C 220 200 560 290 470 150
                  C 430 90 330 100 330 30
                "
                className="road-main"
              />

              {/* Inner road */}
              <path
                d="
                  M 160 700
                  C 160 600 520 610 450 500
                  C 380 390 90 460 150 340
                  C 220 200 560 290 470 150
                  C 430 90 330 100 330 30
                "
                className="road-inner"
              />

            </svg>


            {/* STARS */}

            <span className="journey-star star-one">✦</span>
            <span className="journey-star star-two">✦</span>
            <span className="journey-star star-three">✧</span>
            <span className="journey-star star-four">✦</span>


            {/* ROCKET */}

            <div className="rocket">
              <div className="rocket-fire">≈</div>
              🚀
            </div>


            {/* MILESTONE 01 */}

            <div className="journey-node node-one">

              <div className="node-circle">
                01
              </div>

              <div className="node-label">
                <strong>Foundation</strong>
                <span>HTML · CSS · Git</span>
              </div>

            </div>


            {/* MILESTONE 02 */}

            <div className="journey-node node-two">

              <div className="node-circle">
                02
              </div>

              <div className="node-label">
                <strong>Core Concepts</strong>
                <span>JavaScript Basics</span>

                <div className="node-check">
                  ✓
                </div>
              </div>

            </div>


            {/* MILESTONE 03 */}

            <div className="journey-node node-three">

              <div className="node-circle">
                03
              </div>

              <div className="node-label">
                <strong>Build & Practice</strong>
                <span>Mini Projects</span>
              </div>

            </div>


            {/* MILESTONE 04 */}

            <div className="journey-node node-four">

              <div className="node-circle">
                04
              </div>

              <div className="node-label">
                <strong>Build Real</strong>
                <span>Major Projects</span>
              </div>

            </div>


            {/* MILESTONE 06 */}

            <div className="journey-node node-six">

              <div className="node-circle">
                06
              </div>

              <div className="node-label">
                <strong>Career Ready</strong>
                <span>Apply & Shine</span>
              </div>

            </div>


            {/* FINISH FLAG */}

            <div className="finish-flag">
              <div className="flag-stick" />
              <div className="flag">
                ⚑
              </div>
            </div>

            <div className="tiny-person">
              👩🏻‍💻
            </div>

          </div>


          {/* =====================================================
              TODAY'S GOALS
          ====================================================== */}

          <div className="goals-panel">

            <div className="goals-header">

              <div>
                <h2>Today's Goals</h2>
                <p>
                  {completedGoals} / {goals.length} completed
                </p>
              </div>

              <button className="calendar-button">
                ▣
              </button>

            </div>


            <div className="goal-progress">

              <div className="goal-progress-bar">
                <span
                  style={{
                    width: `${goalPercentage}%`,
                  }}
                />
              </div>

              <strong>
                {goalPercentage}%
              </strong>

            </div>


            <div className="goal-list">

              {goals.map((goal) => (

                <button
                  key={goal.id}
                  className={`goal-item ${
                    goal.completed
                      ? "completed"
                      : ""
                  }`}
                  onClick={() =>
                    toggleGoal(goal.id)
                  }
                >

                  <div className="goal-icon">
                    {goal.icon}
                  </div>

                  <div className="goal-copy">
                    <strong>
                      {goal.title}
                    </strong>

                    <span>
                      {goal.subtitle}
                    </span>
                  </div>

                  <div
                    className={`goal-check ${
                      goal.completed
                        ? "checked"
                        : ""
                    }`}
                  >
                    {goal.completed ? "✓" : ""}
                  </div>

                </button>

              ))}

            </div>


            <div className="goal-message">

              <span className="message-star">
                ☆
              </span>

              <div>
                <strong>
                  You're doing great, Shreya!
                </strong>

                <p>
                  Consistency is the real flex.
                </p>
              </div>

              <span className="message-spark">
                ✦
              </span>

            </div>

          </div>

        </section>


        {/* =========================================================
            FOCUS TIME
        ========================================================== */}

        <section className="focus-section">

          <div className="focus-header">

            <div>
              <span>Focus Time</span>
              <small>(This Week)</small>
            </div>

            <span className="growth-badge">
              +12%
            </span>

          </div>

          <div className="focus-number">
            6h 45m
          </div>

          <div className="focus-chart">

            {[35, 48, 43, 38, 72, 52, 30].map(
              (height, index) => (

                <div
                  className={`focus-column ${
                    index === 4
                      ? "today"
                      : ""
                  }`}
                  key={index}
                >
                  <div
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <span>
                    {
                      [
                        "M",
                        "T",
                        "W",
                        "T",
                        "F",
                        "S",
                        "S",
                      ][index]
                    }
                  </span>

                </div>

              )
            )}

          </div>

        </section>


        {/* =========================================================
            LOWER GRID
        ========================================================== */}

        <section className="lower-grid">


          {/* =====================================================
              DSA ACTIVITY
          ====================================================== */}

          <div className="dsa-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="section-icon">
                  &lt;/&gt;
                </span>

                <h2>DSA Activity</h2>
              </div>

              <button
                className="year-button"
                onClick={() =>
                  setSelectedYear(
                    selectedYear ===
                      "This Year"
                      ? "Last Year"
                      : "This Year"
                  )
                }
              >
                {selectedYear}
                <span>⌄</span>
              </button>

            </div>


            <div className="dsa-content">

              <div className="heatmap-area">

                <div className="months">
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                  ].map((month) => (
                    <span key={month}>
                      {month}
                    </span>
                  ))}
                </div>


                <div className="heatmap-wrapper">

                  <div className="weekdays">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  <div className="heatmap">

                    {contributionData.map(
                      (column, columnIndex) => (

                        <div
                          className="heat-column"
                          key={columnIndex}
                        >

                          {column.map(
                            (value, rowIndex) => (

                              <div
                                key={rowIndex}
                                className={`heat-cell level-${value}`}
                                title={`${value} problems`}
                              />

                            )
                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>


                <div className="heatmap-legend">

                  <span>Less</span>

                  {[0, 1, 2, 3, 4, 5].map(
                    (level) => (
                      <div
                        key={level}
                        className={`heat-cell level-${level}`}
                      />
                    )
                  )}

                  <span>More</span>

                </div>

              </div>


              {/* DSA SUMMARY */}

              <div className="dsa-summary">

                <div className="problem-ring">

                  <svg
                    viewBox="0 0 120 120"
                  >

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      className="ring-bg"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      className="ring-progress"
                    />

                  </svg>

                  <div>
                    <strong>158</strong>
                    <span>Problems</span>
                    <span>Solved</span>
                  </div>

                </div>


                <div className="difficulty-list">

                  <div>
                    <span className="difficulty-dot easy" />
                    <span>Easy</span>
                    <strong>78</strong>
                  </div>

                  <div>
                    <span className="difficulty-dot medium" />
                    <span>Medium</span>
                    <strong>56</strong>
                  </div>

                  <div>
                    <span className="difficulty-dot hard" />
                    <span>Hard</span>
                    <strong>24</strong>
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              ACHIEVEMENTS
          ====================================================== */}

          <div className="achievements-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="section-icon trophy">
                  ♛
                </span>

                <h2>
                  Recent Achievements
                </h2>
              </div>

            </div>


            <div className="achievement-list">

              {achievements.map(
                (achievement) => (

                  <div
                    className="achievement"
                    key={achievement.id}
                  >

                    <div className="achievement-icon">
                      {achievement.icon}
                    </div>

                    <div className="achievement-copy">

                      <strong>
                        {achievement.title}
                      </strong>

                      <span>
                        {achievement.description}
                      </span>

                    </div>

                    <div className="achievement-meta">

                      <strong>
                        +{achievement.xp} XP
                      </strong>

                      <span>
                        {achievement.time}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>


            <button className="view-achievements">
              View all achievements
              <span>→</span>
            </button>

          </div>

        </section>


        {/* =========================================================
            AI LEARNING PATH
        ========================================================== */}

        <section className="ai-path-section">

          <div className="ai-path-header">

            <div className="ai-title">

              <div className="ai-icon">
                ✣
              </div>

              <div>
                <h2>
                  Your AI Learning Path
                </h2>

                <p>
                  Personalized just for you
                </p>
              </div>

            </div>

          </div>


          <div className="ai-path">

            <div className="path-line" />


            {learningSteps.map(
              (step, index) => (

                <div
                  className={`learning-step ${
                    step.status
                  }`}
                  key={step.id}
                >

                  <div className="learning-icon">
                    {step.icon}
                  </div>

                  <span className="learning-label">
                    {step.label}
                  </span>

                  <strong>
                    {step.title}
                  </strong>

                  {step.status ===
                    "current" && (
                    <span className="learning-progress">
                      {step.progress}% Completed
                    </span>
                  )}

                  {step.status === "next" && (
                    <span className="learning-next">
                      Start Next
                    </span>
                  )}

                  {step.status === "locked" && (
                    <span className="learning-locked">
                      ♙ Locked
                    </span>
                  )}

                  {step.status ===
                    "milestone" && (
                    <span className="learning-locked">
                      ♙ Locked
                    </span>
                  )}

                  {index <
                    learningSteps.length - 1 && (
                    <span className="path-arrow">
                      →
                    </span>
                  )}

                </div>

              )
            )}


            {/* AI ROBOT */}

            <div className="ai-robot">

              <div className="robot-message">
                I'll guide you
                <br />
                all the way! 💗
              </div>

              <div className="robot-body">

                <div className="robot-head">
                  <div className="robot-eye left" />
                  <div className="robot-eye right" />
                  <div className="robot-smile" />
                </div>

                <div className="robot-torso">
                  <span>✦</span>
                </div>

                <div className="robot-arm left-arm">
                  ╱
                </div>

                <div className="robot-arm right-arm">
                  ╲
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FOOTER MOTIVATION */}

        <div className="progress-footer">
          <span>✦</span>
          Small steps today, big changes tomorrow.
        </div>

      </main>

    </div>
  );
}

export default Progress;