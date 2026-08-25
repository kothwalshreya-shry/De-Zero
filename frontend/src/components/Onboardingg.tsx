import { useState } from "react";
import "./Onboarding.css";

type OnboardingData = {
  experience: string;
  interests: string;
  goal: string;
  time: string;
  struggle: string;
};

function Onboarding() {
  const [step, setStep] = useState(1);

  const [data, setData] = useState<OnboardingData>({
    experience: "",
    interests: "",
    goal: "",
    time: "",
    struggle: "",
  });

  const updateAnswer = (
    field: keyof OnboardingData,
    value: string
  ) => {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

 const nextStep = async () => {
  if (step < 5) {
    setStep(step + 1);
    return;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/me/onboarding",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
  currentLevel: data.experience,
  interests: data.interests,
  goal: data.goal,
  weeklyTime: data.time,
  struggle: data.struggle,
}),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Onboarding save failed:", result);
      return;
    }

    // Keep local copy as well
    localStorage.setItem(
      "onboarding",
      JSON.stringify(data)
    );

    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Onboarding save error:", error);
  }
};

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="onboarding-page">

      <div className="onboarding-orb onboarding-orb-one"></div>
      <div className="onboarding-orb onboarding-orb-two"></div>

      <main className="onboarding-container">

        {/* BRAND */}

        <div className="onboarding-brand">
          <div className="onboarding-logo">
            DZ
          </div>

          <div>
            <div className="onboarding-brand-name">
              De Zéro
            </div>

            <div className="onboarding-brand-tagline">
              Begin.Build.Become
            </div>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="onboarding-progress">

          <div className="onboarding-progress-top">
            <span>
              STEP {step} OF 5
            </span>

            <span>
              {step * 20}%
            </span>
          </div>

          <div className="onboarding-progress-bar">
            <div
              className="onboarding-progress-fill"
              style={{
                width: `${step * 20}%`,
              }}
            />
          </div>

        </div>

        {/* CARD */}

        <section className="onboarding-card">

          {/* STEP 1 */}

          {step === 1 && (
            <div className="onboarding-step">

              <p className="onboarding-eyebrow">
                LET'S START WITH YOU
              </p>

              <h1>
                Where are you
                <span>right now?</span>
              </h1>

              <p className="onboarding-description">
                No pressure. There is no wrong answer.
                We just want to understand where you're
                starting from.
              </p>

              <div className="onboarding-options">

                {[
                  "Complete beginner",
                  "I've learned some basics",
                  "I've built a few things",
                  "I'm already job hunting",
                ].map((option) => (
                  <button
                    key={option}
                    className={
                      data.experience === option
                        ? "onboarding-option selected"
                        : "onboarding-option"
                    }
                    onClick={() =>
                      updateAnswer(
                        "experience",
                        option
                      )
                    }
                  >
                    <span>{option}</span>

                    <span className="option-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <div className="onboarding-step">

              <p className="onboarding-eyebrow">
                FIND YOUR DIRECTION
              </p>

              <h1>
                What sounds
                <span>interesting?</span>
              </h1>

              <p className="onboarding-description">
                You don't have to know exactly what you
                want yet. Pick what catches your attention.
              </p>

              <div className="onboarding-options">

                {[
                  "Web development",
                  "AI / Machine Learning",
                  "Data",
                  "App development",
                  "Backend development",
                  "I'm not sure yet",
                ].map((option) => (
                  <button
                    key={option}
                    className={
                      data.interests === option
                        ? "onboarding-option selected"
                        : "onboarding-option"
                    }
                    onClick={() =>
                      updateAnswer(
                        "interests",
                        option
                      )
                    }
                  >
                    <span>{option}</span>

                    <span className="option-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <div className="onboarding-step">

              <p className="onboarding-eyebrow">
                YOUR GOAL
              </p>

              <h1>
                What are you
                <span>working toward?</span>
              </h1>

              <p className="onboarding-description">
                Tell us what success looks like for you.
              </p>

              <div className="onboarding-options">

                {[
                  "Get my first internship",
                  "Get my first job",
                  "Build real projects",
                  "Become confident at coding",
                  "Explore tech careers",
                ].map((option) => (
                  <button
                    key={option}
                    className={
                      data.goal === option
                        ? "onboarding-option selected"
                        : "onboarding-option"
                    }
                    onClick={() =>
                      updateAnswer(
                        "goal",
                        option
                      )
                    }
                  >
                    <span>{option}</span>

                    <span className="option-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <div className="onboarding-step">

              <p className="onboarding-eyebrow">
                YOUR PACE
              </p>

              <h1>
                How much time can
                <span>you realistically give?</span>
              </h1>

              <p className="onboarding-description">
                We care more about consistency than huge
                study sessions.
              </p>

              <div className="onboarding-options">

                {[
                  "30 minutes a day",
                  "1 hour a day",
                  "2+ hours a day",
                  "Mostly weekends",
                ].map((option) => (
                  <button
                    key={option}
                    className={
                      data.time === option
                        ? "onboarding-option selected"
                        : "onboarding-option"
                    }
                    onClick={() =>
                      updateAnswer(
                        "time",
                        option
                      )
                    }
                  >
                    <span>{option}</span>

                    <span className="option-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* STEP 5 */}

          {step === 5 && (
            <div className="onboarding-step">

              <p className="onboarding-eyebrow">
                ONE LAST THING
              </p>

              <h1>
                What's getting
                <span>in your way?</span>
              </h1>

              <p className="onboarding-description">
                This helps De Zéro understand how to
                actually help you.
              </p>

              <div className="onboarding-options">

                {[
                  "I don't know what to learn",
                  "I understand theory but can't build",
                  "I struggle with consistency",
                  "I don't know what projects to make",
                  "I'm preparing for interviews",
                ].map((option) => (
                  <button
                    key={option}
                    className={
                      data.struggle === option
                        ? "onboarding-option selected"
                        : "onboarding-option"
                    }
                    onClick={() =>
                      updateAnswer(
                        "struggle",
                        option
                      )
                    }
                  >
                    <span>{option}</span>

                    <span className="option-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* ACTIONS */}

          <div className="onboarding-actions">

            {step > 1 ? (
              <button
                className="onboarding-back"
                onClick={previousStep}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              className="onboarding-next"
              onClick={nextStep}
              disabled={
                !Object.values(data)[step - 1]
              }
            >
              {step === 5
                ? "Build my journey"
                : "Continue"}

              <span>→</span>
            </button>

          </div>

        </section>

        <p className="onboarding-footer">
          Your journey starts from zero.
        </p>

      </main>

    </div>
  );
}

export default Onboarding;