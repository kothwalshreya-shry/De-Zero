import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  currentLevel: string | null;
  interests: string | null;
  goal: string | null;
  weeklyTime: string | null;
  struggle: string | null;
};

type ProgressEntry = {
  id: number;
  date: string;
  minutes: number;
  completed: boolean;
};

function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [missionLoading, setMissionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch("http://localhost:3000/api/me/profile", {
        headers,
      }),
      fetch("http://localhost:3000/api/progress", {
        headers,
      }),
    ])
      .then(async ([profileResponse, progressResponse]) => {
        if (!profileResponse.ok) {
          throw new Error("Failed to load profile");
        }

        if (!progressResponse.ok) {
          throw new Error("Failed to load progress");
        }

        const profileData = await profileResponse.json();
        const progressData = await progressResponse.json();

        setUser(profileData.user);
        setProgress(progressData.progress || []);
      })
      .catch((error) => {
        console.error("Dashboard data error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalMinutes = useMemo(() => {
    return progress.reduce((total, entry) => total + entry.minutes, 0);
  }, [progress]);

  const completedSessions = useMemo(() => {
    return progress.filter((entry) => entry.completed).length;
  }, [progress]);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const weeklyMinutes = useMemo(() => {
    const now = new Date();

    return progress.reduce((total, entry) => {
      const entryDate = new Date(entry.date);

      const difference =
        now.getTime() - entryDate.getTime();

      const days = difference / (1000 * 60 * 60 * 24);

      if (days <= 7) {
        return total + entry.minutes;
      }

      return total;
    }, 0);
  }, [progress]);

  const weeklyHours = Math.floor(weeklyMinutes / 60);
  const weeklyRemainingMinutes = weeklyMinutes % 60;

  const recentProgress = useMemo(() => {
    return progress.slice(-7);
  }, [progress]);

  const maxMinutes = useMemo(() => {
    if (recentProgress.length === 0) {
      return 60;
    }

    return Math.max(
      60,
      ...recentProgress.map((entry) => entry.minutes)
    );
  }, [recentProgress]);

  const displayName =
    user?.name?.split(" ")[0] || "Developer";

  const interest =
    user?.interests || "software development";

  const level =
    user?.currentLevel || "Starting out";

  const goal =
    user?.goal || "Build a strong developer career";

  const weeklyTime =
    user?.weeklyTime || "Not set";

  const struggle =
    user?.struggle || "Keep building consistently";

  const missionTitle = getMissionTitle(interest, level);

  const missionDescription = getMissionDescription(
    interest,
    level
  );

  const completeMission = async () => {
    if (missionLoading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setMissionLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/progress",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            minutes: 30,
            completed: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save progress");
      }

      const data = await response.json();

      setProgress((currentProgress) => [
        ...currentProgress,
        data.progress,
      ]);
    } catch (error) {
      console.error(
        "Mission completion error:",
        error
      );
    } finally {
      setMissionLoading(false);
    }
  };

  const scrollToProgress = () => {
    document
      .getElementById("learning-progress")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToMission = () => {
    document
      .getElementById("today-mission")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-orb" />
        <p>Building your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <div className="brand">
          <div className="brand-logo">
            DZ
          </div>

          <div>
            <strong>De Zéro</strong>
            <span>BEGIN. BUILD. BECOME.</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-title">
            GENERAL
          </span>

          <button className="sidebar-link active">
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="sidebar-link"
            onClick={scrollToMission}
          >
            <span>✦</span>
            Today's Mission
          </button>

          <button
            className="sidebar-link"
            onClick={scrollToProgress}
          >
            <span>◌</span>
            Progress
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-title">
            CAREER
          </span>

          <button
            className="sidebar-link"
            onClick={() =>
              (window.location.href = "/chat")
            }
          >
            <span>✧</span>
            AI Career
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              (window.location.href = "/resume")
            }
          >
            <span>▤</span>
            Resume
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              (window.location.href = "/interview")
            }
          >
            <span>◎</span>
            Interview
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{displayName}</strong>
              <span>Student</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <header className="dashboard-topbar">

          <div className="mobile-brand">
            <div className="brand-logo">
              DZ
            </div>

            <strong>De Zéro</strong>
          </div>

          <div className="topbar-actions">

            <button
              className="topbar-icon"
              aria-label="Search"
            >
              ⌕
            </button>

            <button
              className="topbar-icon"
              aria-label="Notifications"
            >
              ♢
            </button>

            <div className="topbar-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

          </div>

        </header>

        <div className="dashboard-inner">

          {/* ================= WELCOME ================= */}

          <section className="welcome-section">

            <div>
              <p className="dashboard-eyebrow">
                YOUR DEVELOPER JOURNEY
              </p>

              <h1>
                Good to see you,
                <span>{displayName}.</span>
              </h1>

              <p className="welcome-description">
                Here's where you are today — and what
                you can build next.
              </p>
            </div>

            <div className="journey-status">
              <span className="status-dot" />
              Journey active
            </div>

          </section>

          {/* ================= TOP BENTO ================= */}

          <section className="dashboard-bento">

            {/* LEVEL CARD */}

            <article className="bento-card level-card">

              <div className="card-header">

                <div>
                  <span className="card-label">
                    CURRENT LEVEL
                  </span>
                </div>

                <div className="card-symbol purple">
                  ✦
                </div>

              </div>

              <div className="card-main-content">

                <h2>{level}</h2>

                <p>
                  You're currently building your
                  foundation in{" "}
                  <strong>{interest}</strong>.
                </p>

              </div>

              <div className="level-progress">

                <div className="progress-track">
                  <div
                    className="progress-track-fill"
                    style={{
                      width:
                        completedSessions > 0
                          ? `${Math.min(
                              20 +
                                completedSessions *
                                  8,
                              100
                            )}%`
                          : "12%",
                    }}
                  />
                </div>

                <div className="progress-meta">
                  <span>
                    {completedSessions} sessions
                  </span>

                  <span>
                    Keep going
                  </span>
                </div>

              </div>

            </article>

            {/* GOAL CARD */}

            <article className="bento-card goal-card">

              <div className="card-header">

                <span className="card-label">
                  YOUR GOAL
                </span>

                <div className="card-symbol pink">
                  ◇
                </div>

              </div>

              <div className="card-main-content">

                <h2>{goal}</h2>

                <p>
                  Your learning path is shaped around
                  getting you closer to this goal.
                </p>

              </div>

              <button
                className="text-action"
                onClick={scrollToMission}
              >
                View your next step
                <span>→</span>
              </button>

            </article>

          </section>

          {/* ================= ANALYTICS ================= */}

          <section
            className="analytics-grid"
            id="learning-progress"
          >

            {/* GRAPH */}

            <article className="bento-card activity-card">

              <div className="card-header">

                <div>
                  <span className="card-label">
                    LEARNING ACTIVITY
                  </span>

                  <h2>
                    Your momentum
                  </h2>
                </div>

                <div className="activity-total">
                  <strong>
                    {totalHours}h{" "}
                    {remainingMinutes}m
                  </strong>

                  <span>
                    total learning
                  </span>
                </div>

              </div>

              <div className="chart-wrapper">

                {recentProgress.length === 0 ? (

                  <div className="empty-chart">
                    <div className="empty-chart-icon">
                      ◌
                    </div>

                    <strong>
                      Your graph starts here.
                    </strong>

                    <span>
                      Complete your first mission
                      to track your learning activity.
                    </span>
                  </div>

                ) : (

                  <div className="bar-chart">

                    {recentProgress.map(
                      (entry) => {

                        const height =
                          Math.max(
                            12,
                            (entry.minutes /
                              maxMinutes) *
                              100
                          );

                        return (
                          <div
                            className="bar-column"
                            key={entry.id}
                          >

                            <div className="bar-value">
                              {entry.minutes}m
                            </div>

                            <div className="bar-area">

                              <div
                                className={`activity-bar ${
                                  entry.completed
                                    ? "completed"
                                    : ""
                                }`}
                                style={{
                                  height: `${height}%`,
                                }}
                              />

                            </div>

                            <span>
                              {new Date(
                                entry.date
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                }
                              )}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </article>

            {/* WEEKLY STATS */}

            <article className="bento-card stats-card">

              <div className="card-header">

                <span className="card-label">
                  THIS WEEK
                </span>

                <div className="card-symbol pink">
                  ♡
                </div>

              </div>

              <div className="weekly-number">
                {weeklyHours}
                <span>h</span>
                {weeklyRemainingMinutes}
                <small>m</small>
              </div>

              <p>
                Learning time this week
              </p>

              <div className="stat-divider" />

              <div className="stat-row">

                <div>
                  <strong>
                    {completedSessions}
                  </strong>

                  <span>
                    completed
                  </span>
                </div>

                <div>
                  <strong>
                    {progress.length}
                  </strong>

                  <span>
                    sessions
                  </span>
                </div>

              </div>

              <button
                className="outline-button"
                onClick={scrollToProgress}
              >
                See progress
                <span>→</span>
              </button>

            </article>

          </section>

          {/* ================= TIME + FOCUS ================= */}

          <section className="secondary-grid">

            <article className="bento-card focus-card">

              <div className="card-header">

                <span className="card-label">
                  YOUR FOCUS
                </span>

                <span className="pink-badge">
                  PERSONALIZED
                </span>

              </div>

              <h2>
                Build your{" "}
                <span>{interest}</span>{" "}
                foundation.
              </h2>

              <p>
                Based on your current level and
                interests, your next steps should focus
                on practical skills rather than trying to
                learn everything at once.
              </p>

              <div className="focus-path">

                <span>
                  {level}
                </span>

                <div className="path-line" />

                <span className="path-highlight">
                  {interest}
                </span>

                <div className="path-line" />

                <span>
                  Job-ready
                </span>

              </div>

            </article>

            <article className="bento-card time-card">

              <div className="card-header">

                <span className="card-label">
                  YOUR TIME
                </span>

                <div className="card-symbol purple">
                  ◷
                </div>

              </div>

              <div className="time-value">
                {weeklyTime}
              </div>

              <p>
                Your planned weekly learning
                commitment.
              </p>

              <div className="week-dots">

                {[0, 1, 2, 3, 4, 5, 6].map(
                  (day) => (
                    <span
                      key={day}
                      className={
                        day <
                        Math.min(
                          completedSessions,
                          7
                        )
                          ? "active"
                          : ""
                      }
                    />
                  )
                )}

              </div>

            </article>

          </section>

          {/* ================= MISSION ================= */}

          <section
            className="mission-card"
            id="today-mission"
          >

            <div className="mission-glow" />

            <div className="mission-content">

              <div className="mission-icon">
                ✦
              </div>

              <div className="mission-text">

                <span className="card-label">
                  TODAY'S MISSION
                </span>

                <h2>
                  {missionTitle}
                </h2>

                <p>
                  {missionDescription}
                </p>

                <div className="mission-meta">

                  <span>
                    <b>30 min</b> estimated
                  </span>

                  <span>
                    {interest}
                  </span>

                </div>

              </div>

              <button
                className="mission-button"
                onClick={completeMission}
                disabled={missionLoading}
              >
                {missionLoading
                  ? "Saving..."
                  : "Complete mission"}
                <span>→</span>
              </button>

            </div>

          </section>

          {/* ================= PROFILE ================= */}

          <section className="profile-section">

            <div className="section-heading">

              <div>
                <span className="dashboard-eyebrow">
                  YOUR FOUNDATION
                </span>

                <h2>
                  What we're building around you.
                </h2>
              </div>

              <p>
                Your onboarding answers shape the
                recommendations you see throughout
                De Zéro.
              </p>

            </div>

            <div className="profile-grid">

              <div className="profile-item">
                <span>LEVEL</span>
                <strong>{level}</strong>
              </div>

              <div className="profile-item">
                <span>INTEREST</span>
                <strong>{interest}</strong>
              </div>

              <div className="profile-item">
                <span>GOAL</span>
                <strong>{goal}</strong>
              </div>

              <div className="profile-item">
                <span>STRUGGLE</span>
                <strong>{struggle}</strong>
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

/* ================================
   PERSONALIZATION HELPERS
================================ */

function getMissionTitle(
  interest: string,
  level: string
) {
  const normalizedInterest =
    interest.toLowerCase();

  if (
    normalizedInterest.includes("backend")
  ) {
    return "Build your first API endpoint.";
  }

  if (
    normalizedInterest.includes("frontend") ||
    normalizedInterest.includes("web")
  ) {
    return "Build a polished frontend component.";
  }

  if (
    normalizedInterest.includes("app") ||
    normalizedInterest.includes("mobile")
  ) {
    return "Build a small app feature.";
  }

  if (
    normalizedInterest.includes("data") ||
    normalizedInterest.includes("python")
  ) {
    return "Work through a practical data problem.";
  }

  if (
    normalizedInterest.includes("ai") ||
    normalizedInterest.includes("machine")
  ) {
    return "Build a tiny AI-powered feature.";
  }

  if (
    level.toLowerCase().includes("beginner") ||
    level.toLowerCase().includes("basic")
  ) {
    return "Strengthen one developer fundamental.";
  }

  return "Build something small and useful.";
}

function getMissionDescription(
  interest: string,
  level: string
) {
  const normalizedInterest =
    interest.toLowerCase();

  if (
    normalizedInterest.includes("backend")
  ) {
    return "Create a simple endpoint, understand what it does, and connect it to your application.";
  }

  if (
    normalizedInterest.includes("frontend") ||
    normalizedInterest.includes("web")
  ) {
    return "Take one concept you're learning and turn it into a working interface.";
  }

  if (
    normalizedInterest.includes("app") ||
    normalizedInterest.includes("mobile")
  ) {
    return "Turn one idea into a small working feature instead of only watching another tutorial.";
  }

  if (
    normalizedInterest.includes("ai") ||
    normalizedInterest.includes("machine")
  ) {
    return "Experiment with one practical AI concept and make it part of a working project.";
  }

  if (
    level.toLowerCase().includes("beginner") ||
    level.toLowerCase().includes("basic")
  ) {
    return "Pick one fundamental concept and spend 30 focused minutes understanding and applying it.";
  }

  return "Spend 30 focused minutes building, experimenting, and moving your project forward.";
}

export default Dashboard;