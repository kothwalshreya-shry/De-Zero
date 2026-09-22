import { useEffect, useMemo, useState } from "react";
import "./Progress.css";

type Goal = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  xp: number;
  milestone: number;
  date: string;
  completed: boolean;
  completedAt: string | null;
  icon?: string;
  subtitle?: string;
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
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedYear, setSelectedYear] = useState("This Year");

  /*
   * =========================================================
   * GOALS
   * =========================================================
   */

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const totalGoals = goals.length;

  const goalPercentage =
    totalGoals === 0
      ? 0
      : Math.round(
          (completedGoals / totalGoals) * 100
        );

  /*
   * =========================================================
   * ROADMAP
   *
   * The roadmap is currently a visual progress journey.
   *
   * It does NOT depend on manually selected milestones.
   *
   * Later, AI can personalize these stages.
   * =========================================================
   */

 const roadmapNodes = [
  {
    id: 1,
    className: "node-one",
  },
  {
    id: 2,
    className: "node-two",
  },
  {
    id: 3,
    className: "node-three",
  },
  {
    id: 4,
    className: "node-four",
  },
  {
    id: 6,
    className: "node-six",
  },
];


  /*
   * Number of roadmap checkpoints that are currently
   * relevant to the amount of work the user has.
   *
   * Example:
   *
   * 0 goals → 0 active checkpoints
   * 1 goal  → 1 active checkpoint
   * 3 goals → 3 active checkpoints
   * 5 goals → 5 active checkpoints
   * 10 goals → all 5 checkpoints
   */
  const activeCheckpointCount = Math.min(
    roadmapNodes.length,
    totalGoals
  );

  /*
   * Each completed goal moves the roadmap forward.
   *
   * Example with 4 goals:
   *
   * 1 completed → checkpoint 1 ✓
   * 2 completed → checkpoint 1, 2 ✓
   * 3 completed → checkpoint 1, 2, 3 ✓
   * 4 completed → checkpoint 1, 2, 3, 4 ✓
   */

  const isCheckpointComplete = (
    checkpointIndex: number
  ) => {
    if (totalGoals === 0) {
      return false;
    }

    if (
      checkpointIndex >
      activeCheckpointCount
    ) {
      return false;
    }

    const requiredCompleted = Math.ceil(
      (checkpointIndex / activeCheckpointCount) *
        totalGoals
    );

    return completedGoals >= requiredCompleted;
  };

  /*
   * =========================================================
   * LOAD GOALS
   * =========================================================
   */

  useEffect(() => {
    const loadGoals = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:3000/api/goals",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load goals");
        }

        const data = await response.json();

        setGoals(data.goals);
      } catch (error) {
        console.error(
          "Goals loading error:",
          error
        );
      }
    };

    loadGoals();
  }, []);

  /*
   * =========================================================
   * ADD GOAL
   * =========================================================
   */

  const addGoal = async () => {
    if (!newGoalTitle.trim()) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:3000/api/goals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newGoalTitle.trim(),
            description:
              newGoalDescription.trim() || null,
            category: "learning",

            /*
             * Keeping this for the backend for now.
             * The Progress page itself does NOT depend
             * on this milestone.
             *
             * Later the AI can decide this value.
             */
            milestone: 3,

            xp: 50,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create goal"
        );
      }

      const data = await response.json();

      setGoals((currentGoals) => [
        ...currentGoals,
        data.goal,
      ]);

      setNewGoalTitle("");
      setNewGoalDescription("");
      setShowGoalForm(false);
    } catch (error) {
      console.error(
        "Goal creation error:",
        error
      );
    }
  };

  /*
   * =========================================================
   * COMPLETE / UNCOMPLETE GOAL
   * =========================================================
   */

  const toggleGoal = async (id: number) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/api/goals/${id}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update goal"
        );
      }

      const data = await response.json();

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === id
            ? data.goal
            : goal
        )
      );
    } catch (error) {
      console.error(
        "Goal update error:",
        error
      );
    }
  };

  /*
   * =========================================================
   * FAKE CONTRIBUTION DATA FOR NOW
   * =========================================================
   */

  const contributionData = useMemo(() => {
    return Array.from(
      { length: 24 },
      (_, column) =>
        Array.from(
          { length: 7 },
          (_, row) => {
            const value =
              (column * 7 +
                row * 3 +
                5) %
              6;

            return value;
          }
        )
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
            <span className="brand-spark">
              ✦
            </span>
          </div>

          <div className="brand-tagline">
            BEGIN. BUILD. BECOME.
          </div>

        </div>

        <nav className="sidebar-nav">

          <a
            href="/dashboard"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ⌂
            </span>
            <span>Dashboard</span>
          </a>

          <a
            href="/roadmap"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ♧
            </span>
            <span>Roadmap</span>
          </a>

          <a
            href="/learn"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ▣
            </span>
            <span>Learn</span>
          </a>

          <a
            href="/projects"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ⌘
            </span>
            <span>Projects</span>
          </a>

          <a
            href="/ai-career"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ◎
            </span>
            <span>AI Career</span>
          </a>

          <a
            href="/progress"
            className="sidebar-link active"
          >
            <span className="sidebar-icon">
              ♘
            </span>
            <span>Progress</span>
          </a>

          <a
            href="/profile"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ◯
            </span>
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
              style={{
                width: "82%",
              }}
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
            De Zéro
            <span>✦</span>
          </div>

          <div className="topbar-actions">

            <div className="mini-stat">

              <span>🔥</span>

              <div>
                <strong>7</strong>
                <small>
                  Day Streak
                </small>
              </div>

            </div>

            <div className="mini-stat">

              <span>♨</span>

              <div>
                <strong>
                  2,840
                </strong>

                <small>
                  Total XP
                </small>
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
              Your Progress{" "}
              <span>✣</span>
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

          {/* =====================================================
              ROADMAP
          ====================================================== */}

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

                    <feMergeNode
                      in="SourceGraphic"
                    />

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

            <span className="journey-star star-one">
              ✦
            </span>

            <span className="journey-star star-two">
              ✦
            </span>

            <span className="journey-star star-three">
              ✧
            </span>

            <span className="journey-star star-four">
              ✦
            </span>

            {/* ROCKET */}

            <div className="rocket">

              <div className="rocket-fire">
                ≈
              </div>

              🚀

            </div>

            {/* =====================================================
                ROADMAP NODES
            ====================================================== */}

            {roadmapNodes.map(
              (node, index) => {

                const checkpointIndex =
                  index + 1;

                const completed =
                  isCheckpointComplete(
                    checkpointIndex
                  );

                const active =
                  checkpointIndex <=
                  activeCheckpointCount;

                return (
                  <div
                    key={node.id}
                    className={`journey-node ${
                      node.className
                    } ${
                      completed
                        ? "milestone-complete"
                        : active
                        ? "milestone-active"
                        : "milestone-locked"
                    }`}
                  >

                    <div className="node-circle">

                      {completed
                        ? "✓"
                        : node.id
                      }

                    </div>

                    <div className="node-label">

                    <strong>
  {goals[index]?.title || ""}
</strong>

<span>
  {goals[index]
    ? completed
      ? "Completed"
      : "In progress"
    : ""}
</span>

                    </div>

                  </div>
                );
              }
            )}

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

                <h2>
                  Today's Goals
                </h2>

                <p>
                  {completedGoals} /{" "}
                  {totalGoals} completed
                </p>

              </div>

              <button
                className="add-goal-button"
                onClick={() =>
                  setShowGoalForm(true)
                }
              >
                + Add Goal
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
                    {goal.icon || "✦"}
                  </div>

                  <div className="goal-copy">

                    <strong>
                      {goal.title}
                    </strong>

                    <span>
                      {goal.subtitle ||
                        goal.description ||
                        "Keep moving forward."}
                    </span>

                  </div>

                  <div
                    className={`goal-check ${
                      goal.completed
                        ? "checked"
                        : ""
                    }`}
                  >
                    {goal.completed
                      ? "✓"
                      : ""}
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

                <h2>
                  DSA Activity
                </h2>

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

                <span>
                  ⌄
                </span>

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
                  ].map(
                    (month) => (

                      <span key={month}>
                        {month}
                      </span>

                    )
                  )}

                </div>

                <div className="heatmap-wrapper">

                  <div className="weekdays">

                    <span>
                      Mon
                    </span>

                    <span>
                      Wed
                    </span>

                    <span>
                      Fri
                    </span>

                  </div>

                  <div className="heatmap">

                    {contributionData.map(
                      (
                        column,
                        columnIndex
                      ) => (

                        <div
                          className="heat-column"
                          key={columnIndex}
                        >

                          {column.map(
                            (
                              value,
                              rowIndex
                            ) => (

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

                  <span>
                    Less
                  </span>

                  {[
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (level) => (

                      <div
                        key={level}
                        className={`heat-cell level-${level}`}
                      />

                    )
                  )}

                  <span>
                    More
                  </span>

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

                    <strong>
                      158
                    </strong>

                    <span>
                      Problems
                    </span>

                    <span>
                      Solved
                    </span>

                  </div>

                </div>

                <div className="difficulty-list">

                  <div>

                    <span className="difficulty-dot easy" />

                    <span>
                      Easy
                    </span>

                    <strong>
                      78
                    </strong>

                  </div>

                  <div>

                    <span className="difficulty-dot medium" />

                    <span>
                      Medium
                    </span>

                    <strong>
                      56
                    </strong>

                  </div>

                  <div>

                    <span className="difficulty-dot hard" />

                    <span>
                      Hard
                    </span>

                    <strong>
                      24
                    </strong>

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

              <span>
                →
              </span>

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

                  {step.status ===
                    "next" && (
                    <span className="learning-next">
                      Start Next
                    </span>
                  )}

                  {step.status ===
                    "locked" && (
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

        {/* =========================================================
            FOOTER
        ========================================================== */}

        <div className="progress-footer">

          <span>
            ✦
          </span>

          Small steps today, big changes tomorrow.

        </div>

        {/* =========================================================
            ADD GOAL MODAL
        ========================================================== */}

        {showGoalForm && (

          <div
            className="goal-modal-overlay"
            onClick={() =>
              setShowGoalForm(false)
            }
          >

            <div
              className="goal-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                className="goal-modal-close"
                onClick={() =>
                  setShowGoalForm(false)
                }
              >
                ×
              </button>

              <div className="goal-modal-icon">
                ✦
              </div>

              <div className="goal-modal-heading">

                <span>
                  Create a goal
                </span>

                <h2>
                  Make today count.
                </h2>

                <p>
                  One small step is still a
                  step forward.
                </p>

              </div>

              <div className="goal-form-field">

                <label>
                  Goal
                </label>

                <input
                  type="text"
                  placeholder="e.g. Learn React Hooks"
                  value={newGoalTitle}
                  onChange={(e) =>
                    setNewGoalTitle(
                      e.target.value
                    )
                  }
                  autoFocus
                />

              </div>

              <div className="goal-form-field">

                <label>
                  Description{" "}
                  <span>
                    Optional
                  </span>
                </label>

                <textarea
                  placeholder="What will you do?"
                  value={newGoalDescription}
                  onChange={(e) =>
                    setNewGoalDescription(
                      e.target.value
                    )
                  }
                  rows={3}
                />

              </div>

              <div className="goal-xp-preview">

                <span>
                  ✦
                </span>

                <div>

                  <strong>
                    +50 XP
                  </strong>

                  <small>
                    You'll earn XP when you
                    complete this goal.
                  </small>

                </div>

              </div>

              <div className="goal-modal-actions">

                <button
                  className="goal-cancel"
                  onClick={() => {

                    setShowGoalForm(
                      false
                    );

                    setNewGoalTitle("");

                    setNewGoalDescription("");

                  }}
                >
                  Cancel
                </button>

                <button
                  className="goal-create"
                  onClick={addGoal}
                  disabled={
                    !newGoalTitle.trim()
                  }
                >

                  Create Goal

                  <span>
                    ✦
                  </span>

                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default Progress;