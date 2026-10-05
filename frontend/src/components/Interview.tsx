import { useEffect, useState } from "react";

import "./Interview.css";

type InterviewMode = "Technical" | "Behavioral" | "Rapid Fire";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

type Question = {
  question: string;
  category: string;
};

type AnswerFeedback = {
  score: number;
  title: string;
  feedback: string;
  strengths: string[];
  improvement: string;
};

type FinalResult = {
  score: number;
  rating: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};

const questions: Record<InterviewMode, Question[]> = {
  Technical: [
    {
      question:
        "What is the difference between let, const and var in JavaScript?",
      category: "JavaScript Fundamentals",
    },
    {
      question:
        "Can you explain what an API is and why applications use APIs?",
      category: "Web Development",
    },
    {
      question:
        "What is the difference between a SQL database and a NoSQL database?",
      category: "Databases",
    },
    {
      question:
        "What is the purpose of Git in a software development project?",
      category: "Development Tools",
    },
    {
      question:
        "Explain what happens when you enter a URL into your browser.",
      category: "Web Fundamentals",
    },
  ],

  Behavioral: [
    {
      question:
        "Tell me about yourself and your journey into software development.",
      category: "Introduction",
    },
    {
      question:
        "Tell me about a project you are proud of building.",
      category: "Projects",
    },
    {
      question:
        "Tell me about a time you struggled with a technical problem.",
      category: "Problem Solving",
    },
    {
      question:
        "How do you learn a technology that you have never used before?",
      category: "Learning",
    },
    {
      question:
        "Why should a company choose you for this role?",
      category: "Career",
    },
  ],

  "Rapid Fire": [
    {
      question: "What is a variable?",
      category: "Fundamentals",
    },
    {
      question: "What does HTTP stand for?",
      category: "Web",
    },
    {
      question: "What is an array?",
      category: "Programming",
    },
    {
      question: "What is GitHub?",
      category: "Tools",
    },
    {
      question: "What is debugging?",
      category: "Development",
    },
  ],
};

function Interview() {
  const [screen, setScreen] = useState<
    "setup" | "launching" | "interview" | "feedback" | "results"
  >("setup");

  const [selectedMode, setSelectedMode] =
    useState<InterviewMode>("Technical");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Beginner");

  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] =
    useState<AnswerFeedback | null>(null);

  const [scores, setScores] = useState<number[]>([]);

  /*
   * AI INTERVIEW STATE
   */
  const [aiQuestion, setAiQuestion] = useState<Question | null>(null);

  const [interviewHistory, setInterviewHistory] =
    useState<any[]>([]);

  const [finalResult, setFinalResult] =
    useState<FinalResult | null>(null);

  const [aiLoading, setAiLoading] = useState(false);

  const API = "http://localhost:3000";

  const currentQuestions = questions[selectedMode];

  const currentQuestion =
    aiQuestion || currentQuestions[questionIndex];

  const totalQuestions = currentQuestions.length;

  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(
          scores.reduce((a, b) => a + b, 0) /
            scores.length
        );

  /*
   * --------------------------------
   * START INTERVIEW
   * --------------------------------
   */

  const startInterview = () => {
    setScreen("launching");

    setQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setScores([]);
    setAiQuestion(null);
    setInterviewHistory([]);
    setFinalResult(null);

    /*
     * Keep your existing launch animation.
     * The real AI request starts after it.
     */
    setTimeout(async () => {
      await startAIInterview();
    }, 1800);
  };

  /*
   * --------------------------------
   * START REAL AI INTERVIEW
   * --------------------------------
   */

  const startAIInterview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      setScreen("setup");
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch(
        `${API}/api/ai/interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "start",
            mode: selectedMode,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not start interview"
        );
      }

      setAiQuestion({
        question: data.question,
        category: data.topic || selectedMode,
      });

      setQuestionIndex(0);
      setAnswer("");
      setFeedback(null);
      setScreen("interview");
    } catch (error) {
      console.error(
        "AI interview start error:",
        error
      );

      alert(
        "Could not start the AI interview. Please make sure the backend and Ollama are running."
      );

      setScreen("setup");
    } finally {
      setAiLoading(false);
    }
  };

  /*
   * --------------------------------
   * SUBMIT ANSWER TO REAL AI
   * --------------------------------
   */

  const submitAnswer = async () => {
    if (!answer.trim() || aiLoading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    setAiLoading(true);

    try {
      const currentQuestionText =
        currentQuestion.question;

      const currentAnswer = answer.trim();

      const response = await fetch(
        `${API}/api/ai/interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "answer",
            question: currentQuestionText,
            answer: currentAnswer,
            history: interviewHistory,
            mode: selectedMode,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not evaluate answer"
        );
      }

      /*
       * Backend gives score 0-10.
       * Your existing UI displays /100.
       */
      const scoreOutOf100 = Math.min(
        100,
        Math.max(
          0,
          Math.round(Number(data.feedback?.score || 0) * 10)
        )
      );

      const aiFeedback: AnswerFeedback = {
        score: scoreOutOf100,

        title:
          scoreOutOf100 >= 85
            ? "Strong Answer"
            : scoreOutOf100 >= 70
            ? "Good Answer"
            : "Keep Building",

        feedback:
          data.feedback?.explanation ||
          "Your answer has been evaluated by the AI interviewer.",

        strengths: data.feedback?.strength
          ? [data.feedback.strength]
          : ["You attempted the question."],

        improvement:
          data.feedback?.improvement ||
          "Keep practicing structured answers.",
      };

      setFeedback(aiFeedback);

      setScores((previous) => [
        ...previous,
        scoreOutOf100,
      ]);

      /*
       * Save this answer in interview history.
       */
      const updatedHistory = [
        ...interviewHistory,
        {
          question: currentQuestionText,
          answer: currentAnswer,
          feedback: data.feedback,
        },
      ];

      setInterviewHistory(updatedHistory);

      /*
       * Store AI-generated next question.
       */
      if (data.nextQuestion) {
        setAiQuestion({
          question:
            data.nextQuestion.question,
          category:
            data.nextQuestion.topic ||
            selectedMode,
        });
      }

      setAnswer("");
      setScreen("feedback");
    } catch (error) {
      console.error(
        "AI answer evaluation error:",
        error
      );

      alert(
        "The AI could not evaluate this answer. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /*
   * --------------------------------
   * NEXT QUESTION
   * --------------------------------
   */

  const nextQuestion = () => {
    /*
     * The AI already supplied the next question.
     * We simply move back to the interview screen.
     */

    setQuestionIndex((previous) => previous + 1);

    setAnswer("");
    setFeedback(null);

    /*
     * Keep the existing 5-question session length.
     */
    if (questionIndex + 1 >= totalQuestions) {
      finishInterview();
      return;
    }

    setScreen("interview");
  };

  /*
   * --------------------------------
   * FINISH INTERVIEW
   * --------------------------------
   */

  const finishInterview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch(
        `${API}/api/ai/interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "finish",
            history: interviewHistory,
            mode: selectedMode,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not generate final result"
        );
      }

      setFinalResult({
        score: Math.min(
          100,
          Math.max(0, Number(data.score || 0))
        ),
        rating:
          data.rating || "Keep Practicing",
        summary:
          data.summary ||
          "You completed the interview.",
        strengths:
          data.strengths || [],
        improvements:
          data.improvements || [],
        nextSteps:
          data.nextSteps || [],
      });

      setScreen("results");
    } catch (error) {
      console.error(
        "AI final result error:",
        error
      );

      /*
       * If final AI evaluation fails,
       * still show the local calculated score
       * instead of breaking the interview.
       */
      setFinalResult({
        score: averageScore,
        rating:
          averageScore >= 85
            ? "Strong Performance"
            : averageScore >= 70
            ? "Good Progress"
            : "Keep Practicing",
        summary:
          "You completed your interview session. Continue practicing structured answers and technical explanations.",
        strengths: [
          "You completed the interview.",
          "You attempted each question.",
        ],
        improvements: [
          "Continue practicing clear and structured answers.",
        ],
        nextSteps: [
          "Practice another interview session.",
          "Review the topics you found difficult.",
        ],
      });

      setScreen("results");
    } finally {
      setAiLoading(false);
    }
  };

  /*
   * --------------------------------
   * GIVE UP
   * --------------------------------
   */

  const giveUp = () => {
    setScreen("setup");
    setQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setScores([]);
    setAiQuestion(null);
    setInterviewHistory([]);
    setFinalResult(null);
  };

  /*
   * --------------------------------
   * RESULTS
   * --------------------------------
   */

  const getResultMessage = () => {
    const score =
      finalResult?.score ?? averageScore;

    if (score >= 85) {
      return "You're interview ready.";
    }

    if (score >= 70) {
      return "You're building solid interview confidence.";
    }

    return "Keep practicing. You're getting there.";
  };

  /*
   * --------------------------------
   * SETUP SCREEN
   * --------------------------------
   */

  if (screen === "setup") {
    return (
      <div className="interview-page">

        <Background />

        <section className="interview-hero">
          <div className="hero-badge">
            <span className="pulse-dot" />
            DE ZÉRO // AI INTERVIEW LAB
          </div>

          <h1>
            READY TO
            <span> LEVEL UP?</span>
          </h1>

          <p>
            Step into the interview.
            <br />
            Your AI interviewer is waiting.
          </p>

          <div className="hero-line">
            <span />
            <b>BUILD. PRACTICE. BECOME.</b>
            <span />
          </div>
        </section>

        <section className="interview-console">

          <div className="console-top">
            <div>
              <span className="console-label">
                01 / SELECT YOUR MISSION
              </span>

              <h2>
                What do you want to practice?
              </h2>
            </div>

            <div className="live-status">
              <span />
              AI READY
            </div>
          </div>

          <div className="type-grid">

            <ModeCard
              icon="⌘"
              title="Technical"
              description="Coding, CS fundamentals & technical concepts"
              selected={selectedMode === "Technical"}
              onClick={() =>
                setSelectedMode("Technical")
              }
            />

            <ModeCard
              icon="◈"
              title="Behavioral"
              description="HR questions, communication & confidence"
              selected={selectedMode === "Behavioral"}
              onClick={() =>
                setSelectedMode("Behavioral")
              }
            />

            <ModeCard
              icon="⚡"
              title="Rapid Fire"
              description="Fast-paced questions to test your thinking"
              selected={selectedMode === "Rapid Fire"}
              onClick={() =>
                setSelectedMode("Rapid Fire")
              }
            />

          </div>

          <div className="settings-row">

            <div className="setting-box">

              <span>DIFFICULTY</span>

              <div className="difficulty-buttons">

                {(
                  [
                    "Beginner",
                    "Intermediate",
                    "Advanced",
                  ] as Difficulty[]
                ).map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDifficulty(level)
                    }
                  >
                    {level}
                  </button>
                ))}

              </div>

            </div>

            <div className="setting-box">

              <span>SESSION</span>

              <div className="session-info">

                <strong>
                  {totalQuestions}
                </strong>

                <small>QUESTIONS</small>

                <div className="divider" />

                <strong>~15</strong>

                <small>MINUTES</small>

              </div>

            </div>

          </div>

          <button
            className="start-button"
            onClick={startInterview}
            disabled={aiLoading}
          >
            <span>
              {aiLoading
                ? "CONNECTING TO AI..."
                : "START AI INTERVIEW"}
            </span>

            <b>↗</b>
          </button>

        </section>

        <div className="interview-stats">

          <div>
            <strong>01</strong>
            <span>CHOOSE YOUR PATH</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>PRACTICE SESSIONS</span>
          </div>

          <div>
            <strong>AI</strong>
            <span>PERSONALIZED FEEDBACK</span>
          </div>

        </div>

        <AIOrb />

      </div>
    );
  }

  /*
   * --------------------------------
   * LAUNCHING SCREEN
   * --------------------------------
   */

  if (screen === "launching") {
    return (
      <div className="launch-screen">

        <Background />

        <div className="launch-content">

          <div className="launch-orb">
            <div>✦</div>
          </div>

          <span className="launch-label">
            DE ZÉRO // INITIALIZING
          </span>

          <h1>
            GET READY
            <span> {selectedMode.toUpperCase()}</span>
          </h1>

          <p>
            Calibrating your interview session...
          </p>

          <div className="loading-line">
            <div />
          </div>

          <small>
            AI INTERVIEWER ONLINE
          </small>

        </div>

      </div>
    );
  }

  /*
   * --------------------------------
   * INTERVIEW SCREEN
   * --------------------------------
   */

  if (screen === "interview") {
    return (
      <div className="interview-page interview-mode">

        <Background />

        <div className="interview-header">

          <div>
            <span>
              DE ZÉRO // LIVE INTERVIEW
            </span>

            <strong>
              {selectedMode}
            </strong>
          </div>

          <button
            className="give-up"
            onClick={giveUp}
            disabled={aiLoading}
          >
            GIVE UP
          </button>

        </div>

        <main className="question-area">

          <div className="question-progress">

            <span>
              QUESTION{" "}
              {String(questionIndex + 1).padStart(
                2,
                "0"
              )}
              {" / "}
              {String(totalQuestions).padStart(
                2,
                "0"
              )}
            </span>

            <div>
              {currentQuestions.map(
                (_, index) => (
                  <i
                    key={index}
                    className={
                      index <= questionIndex
                        ? "filled"
                        : ""
                    }
                  />
                )
              )}
            </div>

          </div>

          <div className="question-card">

            <div className="question-category">
              {currentQuestion.category}
            </div>

            <h1>
              {currentQuestion.question}
            </h1>

            <div className="ai-interviewer">

              <AIOrb />

              <div>
                <strong>
                  DE ZÉRO AI
                </strong>

                <span>
                  Take your time. Think out loud.
                </span>
              </div>

            </div>

            <textarea
              value={answer}
              onChange={(event) =>
                setAnswer(event.target.value)
              }
              placeholder="Type your answer here..."
              autoFocus
              disabled={aiLoading}
            />

            <div className="answer-footer">

              <span>
                {answer.length} characters
              </span>

              <button
                onClick={submitAnswer}
                disabled={
                  !answer.trim() || aiLoading
                }
              >
                {aiLoading
                  ? "AI ANALYZING..."
                  : "SUBMIT ANSWER"}

                <b>→</b>
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  /*
   * --------------------------------
   * FEEDBACK SCREEN
   * --------------------------------
   */

  if (screen === "feedback" && feedback) {
    return (
      <div className="interview-page feedback-screen">

        <Background />

        <main className="feedback-container">

          <div className="feedback-top">
            <span>
              QUESTION{" "}
              {String(questionIndex + 1).padStart(
                2,
                "0"
              )}
              {" / "}
              {String(totalQuestions).padStart(
                2,
                "0"
              )}
            </span>

            <span className="feedback-tag">
              AI FEEDBACK
            </span>
          </div>

          <div className="score-circle">
            <div>
              <strong>{feedback.score}</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="feedback-title">
            <span>✦</span>
            {feedback.title}
          </div>

          <h1>
            Here's how you did.
          </h1>

          <p className="main-feedback">
            {feedback.feedback}
          </p>

          <div className="feedback-grid">

            <div>
              <span>WHAT YOU DID WELL</span>

              {feedback.strengths.map(
                (strength) => (
                  <p key={strength}>
                    <b>+</b>
                    {strength}
                  </p>
                )
              )}
            </div>

            <div>
              <span>NEXT IMPROVEMENT</span>

              <p>
                <b>→</b>
                {feedback.improvement}
              </p>
            </div>

          </div>

          <button
            className="next-question"
            onClick={nextQuestion}
            disabled={aiLoading}
          >
            {questionIndex + 1 >= totalQuestions
              ? "SEE FINAL SCORE"
              : "NEXT QUESTION"}

            <b>→</b>
          </button>

          <button
            className="feedback-give-up"
            onClick={giveUp}
            disabled={aiLoading}
          >
            END INTERVIEW
          </button>

        </main>

      </div>
    );
  }

  /*
   * --------------------------------
   * RESULTS SCREEN
   * --------------------------------
   */

  const displayedFinalScore =
    finalResult?.score ?? averageScore;

  return (
    <div className="interview-page results-screen">

      <Background />

      <main className="results-container">

        <span className="results-label">
          DE ZÉRO // INTERVIEW COMPLETE
        </span>

        <div className="result-orb">
          <div>
            <strong>
              {displayedFinalScore}
            </strong>
            <span>/100</span>
          </div>
        </div>

        <h1>
          {getResultMessage()}
        </h1>

        <p>
          You completed your{" "}
          <strong>{selectedMode}</strong> interview
          at{" "}
          <strong>{difficulty}</strong> level.
        </p>

        <div className="result-stats">

          <div>
            <strong>
              {scores.length}
            </strong>

            <span>
              QUESTIONS ANSWERED
            </span>
          </div>

          <div>
            <strong>
              {displayedFinalScore}
            </strong>

            <span>
              AVERAGE SCORE
            </span>
          </div>

          <div>
            <strong>
              {scores.length > 0
                ? Math.max(...scores)
                : 0}
            </strong>

            <span>
              BEST ANSWER
            </span>
          </div>

        </div>

        <div className="final-feedback">

          <span>AI CAREER COACH</span>

          <p>
            {finalResult?.summary ||
              "Your strongest answers showed clear understanding and willingness to explain your thinking. Keep practicing structured answers and real-world examples."}
          </p>

          {finalResult?.strengths &&
            finalResult.strengths.length > 0 && (
              <div>
                <strong>STRENGTHS</strong>

                {finalResult.strengths.map(
                  (item) => (
                    <p key={item}>+ {item}</p>
                  )
                )}
              </div>
            )}

          {finalResult?.improvements &&
            finalResult.improvements.length > 0 && (
              <div>
                <strong>AREAS TO IMPROVE</strong>

                {finalResult.improvements.map(
                  (item) => (
                    <p key={item}>→ {item}</p>
                  )
                )}
              </div>
            )}

          {finalResult?.nextSteps &&
            finalResult.nextSteps.length > 0 && (
              <div>
                <strong>NEXT STEPS</strong>

                {finalResult.nextSteps.map(
                  (item) => (
                    <p key={item}>✦ {item}</p>
                  )
                )}
              </div>
            )}

        </div>

        <div className="result-actions">

          <button
            className="start-button"
            onClick={() => {
              setScreen("setup");
              setScores([]);
              setAiQuestion(null);
              setInterviewHistory([]);
              setFinalResult(null);
            }}
          >
            PRACTICE AGAIN
            <b>↗</b>
          </button>

          <button
            className="secondary-button"
            onClick={giveUp}
          >
            BACK TO INTERVIEW LAB
          </button>

        </div>

      </main>

    </div>
  );
}

/*
 * =================================
 * COMPONENTS
 * =================================
 */

function ModeCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`type-card ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="type-icon">
        {icon}
      </div>

      <div className="type-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="arrow">
        ↗
      </div>
    </button>
  );
}

function AIOrb() {
  return (
    <div className="ai-orb">
      <div className="orb-core">
        <span>✦</span>
      </div>

      <div className="orb-ring ring-one" />
      <div className="orb-ring ring-two" />
    </div>
  );
}

function Background() {
  return (
    <>
      <div className="interview-grid" />

      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <div className="stars stars-one">✦</div>
      <div className="stars stars-two">✦</div>
      <div className="stars stars-three">✧</div>
      <div className="stars stars-four">✦</div>
    </>
  );
}

export default Interview;
