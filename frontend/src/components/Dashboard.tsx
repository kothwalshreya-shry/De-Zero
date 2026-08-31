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

type NavItem = {
  label: string;
  icon: string;
  path?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "▦" },
  { label: "Mission", icon: "✦", path: "/mission" },
  { label: "Learn", icon: "▱", path: "/learn" },
  { label: "Projects", icon: "</>", path: "/projects" },
  { label: "Roadmap", icon: "◇", path: "/roadmap" },
  { label: "AI Career", icon: "✧", path: "/chat" },
  { label: "Progress", icon: "▥", path: "/progress" },
  { label: "Resources", icon: "□", path: "/resources" },
  { label: "Community", icon: "♧", path: "/community" },
];

function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

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

  const totalMinutes = useMemo(
    () =>
      progress.reduce(
        (total, entry) => total + Number(entry.minutes || 0),
        0
      ),
    [progress]
  );

  const completedSessions = useMemo(
    () => progress.filter((entry) => entry.completed).length,
    [progress]
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const streak = useMemo(() => {
    if (!progress.length) return 0;

    const uniqueDays = new Set(
      progress
        .filter((entry) => entry.completed)
        .map((entry) =>
          new Date(entry.date).toISOString().split("T")[0]
        )
    );

    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const key = date.toISOString().split("T")[0];

      if (uniqueDays.has(key)) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    return currentStreak;
  }, [progress]);

  const lastSevenDays = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const key = date.toISOString().split("T")[0];

      const minutes = progress
        .filter(
          (entry) =>
            new Date(entry.date).toISOString().split("T")[0] === key
        )
        .reduce((sum, entry) => sum + Number(entry.minutes || 0), 0);

      days.push({
        key,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        minutes,
      });
    }

    return days;
  }, [progress]);

  const maxMinutes = Math.max(
    ...lastSevenDays.map((day) => day.minutes),
    60
  );

  const experience = user?.currentLevel?.toLowerCase() || "";

  const levelLabel = user?.currentLevel
    ? user.currentLevel
    : "Getting started";

  const interestLabel = user?.interests || "your chosen path";

  const goalLabel = user?.goal || "your next big move";

  const getMission = () => {
    if (experience.includes("beginner") || experience.includes("basic")) {
      return {
        title: `Build your ${interestLabel} foundation.`,
        description:
          "One focused session. Learn one thing, then actually use it.",
      };
    }

    if (user?.struggle) {
      return {
        title: "Turn that struggle into a strength.",
        description:
          "Spend 30 focused minutes working on the thing that keeps slowing you down.",
      };
    }

    return {
      title: "Build something small.",
      description:
        "30 focused minutes on something that moves your career forward.",
    };
  };

  const mission = getMission();

  const completeMission = async () => {
    const token = localStorage.getItem("token");

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

      setProgress((current) => [
        ...current,
        data.progress,
      ]);
    } catch (error) {
      console.error("Mission completion error:", error);
    }
  };

  const goTo = (path: string) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-orb" />
        <p>Getting your workspace ready...</p>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-shell ${
        sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
    >
      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-mark">DZ</div>

          <div className="brand-text">
            <strong>De Zéro</strong>
            <span>BEGIN. BUILD. BECOME.</span>
          </div>
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              className={`sidebar-item ${
                index === 0 ? "active" : ""
              }`}
              onClick={() => item.path && goTo(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>

              <span className="sidebar-label">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-glow" />

            <span className="upgrade-emoji">✦</span>

            <h3>Level up faster.</h3>

            <p>
              More projects, smarter feedback & deeper career prep.
            </p>

            <button onClick={() => goTo("/ai-career")}>
              Explore AI
            </button>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "D"}
            </div>

            <div className="sidebar-user-info">
              <strong>{user?.name || "Developer"}</strong>
              <span>Keep building 🚀</span>
            </div>

            <span className="user-chevron">⌄</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="mobile-brand">
            <div className="brand-mark">DZ</div>
            <strong>De Zéro</strong>
          </div>

          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="topbar-right">
            <div className="dashboard-search">
              <span>⌕</span>
              <input placeholder="Search anything..." />
            </div>

            <button className="icon-button">
              ♧
              <span className="notification-dot" />
            </button>

            <div className="top-avatar">
              {user?.name?.charAt(0).toUpperCase() || "D"}
            </div>
          </div>
        </header>

        <div className="dashboard-container">
          {/* HERO */}

          <section className="dashboard-hero">
            <div>
              <p className="hero-small">
                Hey {user?.name || "there"}! 👋
              </p>

              <h1>
                Let&apos;s make{" "}
                <span>today</span>
                <br />
                count.
              </h1>

              <p className="hero-description">
                Consistency beats motivation. You&apos;ve got this.
              </p>
            </div>

            {/* STREAK */}

            <div className="streak-card">
              <div className="streak-top">
                <div className="streak-flame">🔥</div>

                <div>
                  <strong>{streak}</strong>
                  <span>Day streak</span>
                </div>
              </div>

              <p>
                {streak > 0
                  ? "You’re on fire! Keep it alive 🔥"
                  : "Your first streak starts today."}
              </p>

              <div className="streak-chart">
                {lastSevenDays.map((day) => (
                  <div
                    className="streak-point"
                    key={day.key}
                    style={{
                      height: `${Math.max(
                        10,
                        (day.minutes / maxMinutes) * 100
                      )}%`,
                    }}
                  />
                ))}
              </div>

              <div className="streak-days">
                {lastSevenDays.map((day) => (
                  <span key={day.key}>{day.label[0]}</span>
                ))}
              </div>
            </div>
          </section>

          {/* STATS */}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">◷</div>

              <span>Focus Time</span>

              <strong>
                {totalHours}h {remainingMinutes}m
              </strong>

              <small>Keep showing up ↗</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon pink">▣</div>

              <span>Sessions</span>

              <strong>{completedSessions}</strong>

              <small>Completed so far ↗</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">★</div>

              <span>XP Earned</span>

              <strong>{completedSessions * 120}</strong>

              <small>Keep stacking ↗</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon pink">♛</div>

              <span>Level</span>

              <strong>
                {experience.includes("advanced")
                  ? "Lv. 4"
                  : experience.includes("intermediate")
                  ? "Lv. 3"
                  : experience.includes("basic")
                  ? "Lv. 2"
                  : "Lv. 1"}
              </strong>

              <small>{levelLabel}</small>
            </div>
          </section>

          {/* TOP CONTENT */}

          <section className="dashboard-columns">
            {/* MOMENTUM */}

            <div className="dashboard-panel momentum-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">
                    YOUR MOMENTUM
                  </span>

                  <h2>Showing up matters.</h2>

                  <p>Last 7 days</p>
                </div>

                <span className="panel-badge">LIVE</span>
              </div>

              <div className="bar-chart">
                <div className="chart-y">
                  <span>120m</span>
                  <span>90m</span>
                  <span>60m</span>
                  <span>30m</span>
                  <span>0m</span>
                </div>

                <div className="bars-area">
                  {lastSevenDays.map((day) => (
                    <div className="bar-column" key={day.key}>
                      <div className="bar-wrapper">
                        <div
                          className="learning-bar"
                          style={{
                            height: `${Math.max(
                              5,
                              (day.minutes / maxMinutes) * 100
                            )}%`,
                          }}
                          title={`${day.minutes} minutes`}
                        />
                      </div>

                      <span>{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UP NEXT */}

            <div className="dashboard-panel next-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">
                    ✦ UP NEXT FOR YOU
                  </span>

                  <h2>Keep the momentum.</h2>
                </div>

                <button
                  className="text-button"
                  onClick={() => goTo("/roadmap")}
                >
                  View all →
                </button>
              </div>

              <div className="next-learning">
                <div className="tech-orb">✦</div>

                <div className="next-learning-content">
                  <h3>
                    {interestLabel} — next step
                  </h3>

                  <p>
                    Built around your current stage and where
                    you&apos;re trying to go.
                  </p>

                  <div className="learning-progress">
                    <div>
                      <span />
                    </div>

                    <strong>
                      {Math.min(
                        95,
                        completedSessions * 10 + 10
                      )}
                      %
                    </strong>
                  </div>

                  <button
                    className="outline-button"
                    onClick={() => goTo("/learn")}
                  >
                    Continue learning
                  </button>
                </div>
              </div>
            </div>

            {/* MISSION */}

            <div className="dashboard-panel mission-panel">
              <div className="mission-decoration">✦</div>

              <div className="panel-header">
                <div>
                  <span className="panel-kicker">
                    🎯 TODAY&apos;S MISSION
                  </span>
                </div>
              </div>

              <h2>{mission.title}</h2>

              <p>{mission.description}</p>

              <div className="mission-meta">
                <span>30 mins focused work</span>
                <span>
                  {Math.min(
                    30,
                    progress.length
                      ? progress[progress.length - 1].minutes
                      : 0
                  )}
                  /30 mins
                </span>
              </div>

              <div className="mission-progress">
                <span
                  style={{
                    width: `${
                      Math.min(
                        30,
                        progress.length
                          ? progress[progress.length - 1].minutes
                          : 0
                      ) * 3.333
                    }%`,
                  }}
                />
              </div>

              <button
                className="mission-button"
                onClick={completeMission}
              >
                ▶ Complete mission
              </button>
            </div>

            {/* SCHEDULE */}

            <div className="dashboard-panel schedule-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">
                    YOUR FLOW
                  </span>

                  <h2>Today&apos;s rhythm.</h2>
                </div>

                <button
                  className="text-button"
                  onClick={() => goTo("/progress")}
                >
                  See all →
                </button>
              </div>

              <div className="schedule-list">
                <div className="schedule-item">
                  <span className="schedule-time">NOW</span>

                  <div>
                    <strong>Focused learning</strong>
                    <small>30 min session</small>
                  </div>

                  <i />
                </div>

                <div className="schedule-item">
                  <span className="schedule-time">NEXT</span>

                  <div>
                    <strong>Build something</strong>
                    <small>Turn knowledge into proof</small>
                  </div>

                  <i />
                </div>

                <div className="schedule-item">
                  <span className="schedule-time">LATER</span>

                  <div>
                    <strong>AI Career Chat</strong>
                    <small>Ask what to do next</small>
                  </div>

                  <i />
                </div>
              </div>
            </div>

            {/* SKILL RADAR */}

            <div className="dashboard-panel radar-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">
                    YOUR SKILL SNAPSHOT
                  </span>

                  <h2>Growing, not guessing.</h2>
                </div>
              </div>

              <div className="radar-wrapper">
                <svg
                  className="radar-svg"
                  viewBox="0 0 300 260"
                >
                  <polygon
                    points="150,25 250,95 212,215 88,215 50,95"
                    className="radar-grid"
                  />

                  <polygon
                    points="150,55 218,103 190,185 110,185 82,103"
                    className="radar-grid"
                  />

                  <polygon
                    points="150,85 186,111 170,155 130,155 114,111"
                    className="radar-grid"
                  />

                  <line
                    x1="150"
                    y1="25"
                    x2="150"
                    y2="215"
                    className="radar-line"
                  />

                  <line
                    x1="50"
                    y1="95"
                    x2="212"
                    y2="215"
                    className="radar-line"
                  />

                  <line
                    x1="250"
                    y1="95"
                    x2="88"
                    y2="215"
                    className="radar-line"
                  />

                  <polygon
                    points="150,62 210,105 180,175 115,185 80,105"
                    className="radar-data"
                  />

                  <circle
                    cx="150"
                    cy="62"
                    r="5"
                    className="radar-point"
                  />

                  <circle
                    cx="210"
                    cy="105"
                    r="5"
                    className="radar-point"
                  />

                  <circle
                    cx="180"
                    cy="175"
                    r="5"
                    className="radar-point"
                  />

                  <circle
                    cx="115"
                    cy="185"
                    r="5"
                    className="radar-point"
                  />

                  <circle
                    cx="80"
                    cy="105"
                    r="5"
                    className="radar-point"
                  />

                  <text x="142" y="15">
                    BUILD
                  </text>

                  <text x="250" y="88">
                    CODE
                  </text>

                  <text x="210" y="235">
                    PROJECTS
                  </text>

                  <text x="35" y="235">
                    DSA
                  </text>

                  <text x="25" y="88">
                    CAREER
                  </text>
                </svg>
              </div>

              <div className="radar-legend">
                <span>
                  <i />
                  You
                </span>

                <span>
                  <i />
                  Keep growing
                </span>
              </div>
            </div>

            {/* KEEP IN MIND */}

            <div className="dashboard-panel quote-panel">
              <div className="quote-symbol">“</div>

              <span className="panel-kicker">
                KEEP IN MIND
              </span>

              <p>
                Your future isn&apos;t built in one giant leap.
                It&apos;s built in the tiny things you actually
                finish.
              </p>

              <small>
                — one session at a time.
              </small>
            </div>

            {/* QUICK ACTIONS */}

            <div className="dashboard-panel quick-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-kicker">
                    QUICK ACTIONS
                  </span>

                  <h2>What are we doing?</h2>
                </div>
              </div>

              <div className="quick-grid">
                <button onClick={() => goTo("/chat")}>
                  <span>☏</span>
                  <strong>AI Career Chat</strong>
                </button>

                <button onClick={() => goTo("/roadmap")}>
                  <span>◇</span>
                  <strong>Explore Roadmap</strong>
                </button>

                <button onClick={() => goTo("/projects")}>
                  <span>&lt;/&gt;</span>
                  <strong>Find Projects</strong>
                </button>

                <button onClick={() => goTo("/progress")}>
                  <span>▥</span>
                  <strong>View Progress</strong>
                </button>
              </div>
            </div>

            {/* GOAL CARD */}

            <div className="dashboard-panel goal-mini-panel">
              <div>
                <span className="panel-kicker">
                  THE BIGGER PICTURE
                </span>

                <h2>We&apos;re heading somewhere.</h2>

                <p>
                  Everything you do here is moving toward{" "}
                  <strong>{goalLabel}</strong>.
                </p>
              </div>

              <div className="goal-ring">
                <span>
                  {Math.min(
                    100,
                    completedSessions * 8
                  )}
                  %
                </span>
              </div>
            </div>
          </section>

          {/* FOOTER MESSAGE */}

          <div className="dashboard-footer-message">
            <span>✦</span>
            Small steps today. Big changes tomorrow.
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;