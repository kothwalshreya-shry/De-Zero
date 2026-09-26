import { useEffect, useMemo, useState } from "react";
import "./Progress.css";

type Goal = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  xp: number;
  milestone?: number;
  date: string;
  completed: boolean;
  completedAt: string | null;
  icon?: string;
  subtitle?: string;
};

type ProgressStats = {
  totalXP: number;
  level: number;
  nextLevelXP: number;
  completedGoals: number;
  totalGoals: number;
  streak?: number;
};

type DSAProblem = {
  id: number;
  title?: string;
  difficulty: string;
  topic?: string | null;
  solved: boolean;
  solvedAt?: string | null;
};

type DSAActivity = {
  date: string;
  count: number;
};

type DSAStats = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  activity: DSAActivity[];
};

type Achievement = {
  id: number;
  icon: string;
  title: string;
  description: string;
  xp: number;
  time?: string;
  earnedAt?: string;
  earned?: boolean;
};

type LearningStep = {
  id: number;
  icon: string;
  label: string;
  title: string;
  description?: string;
  status: "current" | "next" | "locked" | "milestone";
  progress?: number;
};

const API = "http://localhost:3000";

const emptyDSA: DSAStats = {
  solved: 0,
  easy: 0,
  medium: 0,
  hard: 0,
  activity: [],
};

const emptyStats: ProgressStats = {
  totalXP: 0,
  level: 1,
  nextLevelXP: 250,
  completedGoals: 0,
  totalGoals: 0,
  streak: 0,
};

const fallbackLearningPath: LearningStep[] = [
  {
    id: 1,
    icon: "</>",
    label: "Current",
    title: "Your next learning step",
    description: "Your personalized plan will appear here.",
    status: "current",
    progress: 0,
  },
  {
    id: 2,
    icon: "ϟ",
    label: "Up Next",
    title: "Coming next",
    status: "next",
  },
  {
    id: 3,
    icon: "⚛",
    label: "After That",
    title: "Future skill",
    status: "locked",
  },
  {
    id: 4,
    icon: "♛",
    label: "Milestone",
    title: "Your next milestone",
    status: "milestone",
  },
];

function normalizeProgress(data: any) {
  const stats: ProgressStats = {
    ...emptyStats,
    ...(data?.stats || {}),
  };

  const goals: Goal[] = Array.isArray(data?.goals)
    ? data.goals
    : [];

  const rawDsa = data?.dsa || data?.dsaStats || {};
  const dsa: DSAStats = {
    solved: Number(rawDsa.solved ?? data?.dsaSolved ?? 0),
    easy: Number(rawDsa.easy ?? 0),
    medium: Number(rawDsa.medium ?? 0),
    hard: Number(rawDsa.hard ?? 0),
    activity: Array.isArray(rawDsa.activity)
      ? rawDsa.activity
      : [],
  };

  const achievements: Achievement[] = Array.isArray(
    data?.achievements
  )
    ? data.achievements
    : [];

  const learningPath: LearningStep[] =
    Array.isArray(data?.learningPath)
      ? data.learningPath
      : Array.isArray(data?.path)
      ? data.path
      : [];

  return {
    stats,
    goals,
    dsa,
    achievements,
    learningPath:
      learningPath.length > 0
        ? learningPath
        : fallbackLearningPath,
  };
}

function Progress() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] =
    useState("");

  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressStats, setProgressStats] =
    useState<ProgressStats>(emptyStats);

  const [dsa, setDsa] = useState<DSAStats>(emptyDSA);
  const [achievements, setAchievements] =
    useState<Achievement[]>([]);
  const [learningSteps, setLearningSteps] =
    useState<LearningStep[]>(fallbackLearningPath);

  const [selectedYear, setSelectedYear] =
    useState("This Year");

  const [loading, setLoading] = useState(true);
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState("");
  const [progressError, setProgressError] = useState("");

  const token = localStorage.getItem("token");

  const loadProgress = async () => {
    if (!token) {
      setProgressError("Please log in to view your progress.");
      setLoading(false);
      return;
    }

    try {
      setProgressError("");

      const response = await fetch(
        `${API}/api/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load progress");
      }

      const data = await response.json();
      const normalized = normalizeProgress(data);

      setProgressStats(normalized.stats);
      setGoals(normalized.goals);
      setDsa(normalized.dsa);
      setAchievements(normalized.achievements);
      setLearningSteps(normalized.learningPath);
    } catch (error) {
      console.error("Progress loading error:", error);
      setProgressError(
        "We couldn't load your progress right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

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

  const levelProgress = useMemo(() => {
    const levelStart =
      Math.max(
        0,
        progressStats.nextLevelXP -
          250
      );

    const earnedInLevel = Math.max(
      0,
      progressStats.totalXP - levelStart
    );

    const required =
      Math.max(
        1,
        progressStats.nextLevelXP -
          levelStart
      );

    return Math.min(
      100,
      Math.round(
        (earnedInLevel / required) * 100
      )
    );
  }, [progressStats]);

  const roadmapNodes = [
    { id: 1, className: "node-one" },
    { id: 2, className: "node-two" },
    { id: 3, className: "node-three" },
    { id: 4, className: "node-four" },
    { id: 6, className: "node-six" },
  ];

  const activeCheckpointCount = Math.min(
    roadmapNodes.length,
    totalGoals
  );

const isCheckpointComplete = (
  checkpointIndex: number
) => {
  const goalIndex =
    goals.length - checkpointIndex;

  return goals[goalIndex]?.completed ?? false;
};

  const addGoal = async () => {
    if (!newGoalTitle.trim() || goalSaving) {
      return;
    }

    if (!token) {
      setGoalError("Please log in first.");
      return;
    }

    setGoalSaving(true);
    setGoalError("");

    try {
      const response = await fetch(
        `${API}/api/goals`,
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

      if (data?.goal) {
        setGoals((current) => [
          ...current,
          data.goal,
        ]);
      }

      setNewGoalTitle("");
      setNewGoalDescription("");
      setShowGoalForm(false);

      await loadProgress();
    } catch (error) {
      console.error(
        "Goal creation error:",
        error
      );
      setGoalError(
        "Couldn't create that goal. Try again."
      );
    } finally {
      setGoalSaving(false);
    }
  };

  const toggleGoal = async (id: number) => {
    if (!token) return;

    const previous = goals;

    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
              completedAt: !goal.completed
                ? new Date().toISOString()
                : null,
            }
          : goal
      )
    );

    try {
      const response = await fetch(
        `${API}/api/goals/${id}/complete`,
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

      await loadProgress();
    } catch (error) {
      console.error(
        "Goal update error:",
        error
      );
      setGoals(previous);
    }
  };

  const deleteGoal = async (
    event: React.MouseEvent,
    id: number
  ) => {
    event.stopPropagation();

    if (!token) return;

    const previous = goals;

    setGoals((current) =>
      current.filter((goal) => goal.id !== id)
    );

    try {
      const response = await fetch(
        `${API}/api/goals/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete goal"
        );
      }

      await loadProgress();
    } catch (error) {
      console.error(
        "Goal deletion error:",
        error
      );
      setGoals(previous);
    }
  };

const contributionData = useMemo(() => {
  const year = new Date().getFullYear();

  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 53 }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start);

      date.setDate(
        start.getDate() +
          weekIndex * 7 +
          dayIndex
      );

      const dateKey = date.toISOString().slice(0, 10);

      const count = goals.filter(
        (goal) =>
          goal.completed &&
          goal.completedAt &&
          new Date(goal.completedAt)
            .toISOString()
            .slice(0, 10) === dateKey
      ).length;

      return {
        date,
        count,
      };
    });
  });
}, [goals]);

  const totalSolved =
    dsa.solved ||
    dsa.easy + dsa.medium + dsa.hard;

  return (
    <div className="progress-page">
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

        <div className="level-widget">
          <div className="level-icon">✦</div>
          <div className="level-number">
            Lv. {progressStats.level}
          </div>
          <div className="level-name">
            Explorer
          </div>
          <div className="xp-text">
            {progressStats.totalXP.toLocaleString()}{" "}
            /{" "}
            {progressStats.nextLevelXP.toLocaleString()}{" "}
            XP
          </div>
          <div className="xp-track">
            <div
              className="xp-fill"
              style={{
                width: `${levelProgress}%`,
              }}
            />
          </div>
        </div>
      </aside>

      <main className="progress-main">
        <header className="progress-topbar">
          <div className="mobile-brand">
            De Zéro <span>✦</span>
          </div>

        
        </header>

        {progressError && (
          <div className="progress-alert">
            <span>✦</span>
            {progressError}
            <button
              type="button"
              onClick={loadProgress}
            >
              Retry
            </button>
          </div>
        )}

        <section className="progress-hero">
          <div className="hero-heading">
            <div className="hero-eyebrow">
              Your Progress <span>✣</span>
            </div>

            <h1>
              Every step
              <br />
              builds your <span>future.</span>
            </h1>

            <p>
              Track. Learn. Grow. Repeat.
            </p>
          </div>

          <div className="planet">
            <div className="planet-ring" />
            <div className="planet-ball" />
          </div>

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
                  <stop
                    offset="0%"
                    stopColor="#713cff"
                  />
                  <stop
                    offset="45%"
                    stopColor="#a66cff"
                  />
                  <stop
                    offset="100%"
                    stopColor="#ed329f"
                  />
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

              <path
                d="M 160 700 C 160 600 520 610 450 500 C 380 390 90 460 150 340 C 220 200 560 290 470 150 C 430 90 330 100 330 30"
                className="road-glow"
              />
              <path
                d="M 160 700 C 160 600 520 610 450 500 C 380 390 90 460 150 340 C 220 200 560 290 470 150 C 430 90 330 100 330 30"
                className="road-main"
              />
              <path
                d="M 160 700 C 160 600 520 610 450 500 C 380 390 90 460 150 340 C 220 200 560 290 470 150 C 430 90 330 100 330 30"
                className="road-inner"
              />
            </svg>

            <span className="journey-star star-one">✦</span>
            <span className="journey-star star-two">✦</span>
            <span className="journey-star star-three">✧</span>
            <span className="journey-star star-four">✦</span>

            <div className="rocket">
              <div className="rocket-fire">≈</div>
              🚀
            </div>

            {roadmapNodes.map(
              (node, index) => {
                const checkpointIndex =
                  index + 1;

                const goalIndex =
  goals.length - checkpointIndex;

const completed =
  goals[goalIndex]?.completed ?? false;

const active =
  goalIndex >= 0;

                const pathStep =
                  learningSteps[index];

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
                        : node.id}
                    </div>

                    <div className="node-label">
                      <strong>
  {goals[goals.length - 1 - index]?.title ||
    "Next milestone"}
</strong>
                      <span>
                        {completed
                          ? "Completed"
                          : active
                          ? "In progress"
                          : "Upcoming"}
                      </span>
                    </div>
                  </div>
                );
              }
            )}

            <div className="finish-flag">
              <div className="flag-stick" />
              <div className="flag">⚑</div>
            </div>

            <div className="tiny-person">
              👩🏻‍💻
            </div>
          </div>

          <div className="goals-panel">
            <div className="goals-header">
              <div>
                <h2>Today's Goals</h2>
                <p>
                  {completedGoals} /{" "}
                  {totalGoals} completed
                </p>
              </div>

              <button
                className="add-goal-button"
                onClick={() => {
                  setGoalError("");
                  setShowGoalForm(true);
                }}
                type="button"
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
              <strong>{goalPercentage}%</strong>
            </div>

            <div className="goal-list">
              {loading ? (
                <div className="goal-empty">
                  <span>✦</span>
                  Loading your goals...
                </div>
              ) : goals.length === 0 ? (
                <div className="goal-empty">
                  <span>✦</span>
                  <strong>
                    No goals yet.
                  </strong>
                  <small>
                    Add your first goal and
                    start building momentum.
                  </small>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`goal-item ${
                      goal.completed
                        ? "completed"
                        : ""
                    }`}
                  >
                    <button
                      className="goal-main-button"
                      onClick={() =>
                        toggleGoal(goal.id)
                      }
                      type="button"
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

                    <button
                      className="goal-delete"
                      type="button"
                      title="Delete goal"
                      onClick={(event) =>
                        deleteGoal(
                          event,
                          goal.id
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {goalError && (
              <div className="goal-inline-error">
                {goalError}
              </div>
            )}

            <div className="goal-message">
              <span className="message-star">
                ☆
              </span>
              <div>
                <strong>
                  {goalPercentage === 100
                    ? "You cleared today's goals!"
                    : "Keep your momentum going."}
                </strong>
                <p>
                  {goalPercentage === 100
                    ? "Tiny steps really do stack up."
                    : "Consistency is the real flex."}
                </p>
              </div>
              <span className="message-spark">
                ✦
              </span>
            </div>
          </div>
        </section>

        <section className="lower-grid">
          <div className="dsa-section">
            <div className="section-heading">
              <div className="section-title">
                <span className="section-icon">
                  &lt;/&gt;
                </span>
                <h2>Daily Activity</h2>
              </div>
            </div>

            <div className="dsa-content">
              <div className="heatmap-area">
<div className="months">
  {contributionData.map((week, index) => {
    const date = week[0].date;

    return (
      <span key={index}>
        {date.getDate() <= 7
          ? date.toLocaleString("default", {
              month: "short",
            })
          : ""}
      </span>
    );
  })}
</div>

                <div className="heatmap-wrapper">
                  <div className="weekdays">
                    
                  </div>

                  <div className="heatmap">
  {contributionData.map(
    (month, monthIndex) => (
      <div
        className="heat-column"
        key={monthIndex}
      >
        {month.map((day) => {
          const level =
            day.count === 0
              ? 0
              : day.count === 1
              ? 1
              : day.count === 2
              ? 2
              : day.count === 3
              ? 3
              : 4;

          return (
            <div
              key={day.date.toISOString()}
              className={`heat-cell level-${level}`}
              title={`${day.date.toLocaleDateString()} • ${day.count} completed`}
            />
          );
        })}
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
            </div>
          </div>

          <div className="achievements-section">
            <div className="section-heading">
              <div className="section-title">
                <span className="section-icon trophy">
                  ♛
                </span>
                <h2>Recent Achievements</h2>
              </div>
            </div>

            <div className="achievement-list">
              {achievements.length === 0 ? (
                <div className="achievement-empty">
                  <span>✦</span>
                  <strong>
                    Your first achievement is
                    waiting.
                  </strong>
                  <small>
                    Complete goals and keep
                    learning to unlock badges.
                  </small>
                </div>
              ) : (
                achievements
                  .slice(0, 4)
                  .map((achievement) => (
                    <div
                      className={`achievement ${
                        achievement.earned === false
                          ? "locked"
                          : ""
                      }`}
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
                          {achievement.time ||
                            (achievement.earnedAt
                              ? new Date(
                                  achievement.earnedAt
                                ).toLocaleDateString()
                              : "Locked")}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <button
              className="view-achievements"
              type="button"
            >
              View all achievements
              <span>→</span>
            </button>
          </div>
        </section>

        <section className="ai-path-section">
          <div className="ai-path-header">
            <div className="ai-title">
              <div className="ai-icon">✣</div>
              <div>
                <h2>Your AI Learning Path</h2>
                <p>
                  Personalized just for you
                </p>
              </div>
            </div>
          </div>

          <div className="ai-path">
            <div className="path-line" />

            {learningSteps
              .slice(0, 4)
              .map((step, index) => (
                <div
                  className={`learning-step ${step.status}`}
                  key={step.id}
                >
                  <div className="learning-icon">
                    {step.icon}
                  </div>

                  <span className="learning-label">
                    {step.label}
                  </span>

                  <strong>{step.title}</strong>

                  {step.description && (
                    <span className="learning-description">
                      {step.description}
                    </span>
                  )}

                  {step.status ===
                    "current" && (
                    <span className="learning-progress">
                      {step.progress || 0}% Completed
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
                      ♙ Milestone
                    </span>
                  )}

                  {index <
                    learningSteps
                      .slice(0, 4)
                      .length -
                      1 && (
                    <span className="path-arrow">
                      →
                    </span>
                  )}
                </div>
              ))}

            <div className="ai-robot">
              <div className="robot-message">
                {learningSteps.length >
                0
                  ? "I'll guide you"
                  : "Your path starts here"}
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

        <div className="progress-footer">
          <span>✦</span>
          Small steps today, big changes tomorrow.
        </div>

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
                type="button"
              >
                ×
              </button>

              <div className="goal-modal-icon">
                ✦
              </div>

              <div className="goal-modal-heading">
                <span>Create a goal</span>
                <h2>Make today count.</h2>
                <p>
                  One small step is still a
                  step forward.
                </p>
              </div>

              <div className="goal-form-field">
                <label>Goal</label>
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
                  <span>Optional</span>
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
                <span>✦</span>
                <div>
                  <strong>+50 XP</strong>
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
                    setShowGoalForm(false);
                    setNewGoalTitle("");
                    setNewGoalDescription("");
                    setGoalError("");
                  }}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="goal-create"
                  onClick={addGoal}
                  disabled={
                    !newGoalTitle.trim() ||
                    goalSaving
                  }
                  type="button"
                >
                  {goalSaving
                    ? "Creating..."
                    : "Create Goal"}
                  <span>✦</span>
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
