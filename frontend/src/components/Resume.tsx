import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import "./Resume.css";

type AnalysisState = "idle" | "ready" | "analyzing" | "results";

type Recommendation = {
  number?: string;
  title: string;
  description: string;
};

type ResumeAnalysis = {
  score: number;
  rating: string;
  ats: {
    compatibility: number;
    keywordMatch: number;
    formatting: number;
    readability: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: Recommendation[];
};

function Resume() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [analysisState, setAnalysisState] =
    useState<AnalysisState>("idle");

  const [dragging, setDragging] = useState(false);

  const [analysis, setAnalysis] =
    useState<ResumeAnalysis | null>(null);

  const [error, setError] = useState<string>("");

  const handleFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const isAllowed =
      allowedTypes.includes(file.type) ||
      /\.(pdf|docx|txt)$/i.test(file.name);

    if (!isAllowed) {
      setError("Please upload a PDF, DOCX or TXT resume.");
      return;
    }

    setError("");
    setAnalysis(null);
    setSelectedFile(file);
    setAnalysisState("ready");
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) return;

    setError("");
    setAnalysisState("analyzing");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      if (!token) {
        throw new Error(
          "You are not logged in. Please log in again."
        );
      }

      const formData = new FormData();

      formData.append("resume", selectedFile);

      const response = await fetch(
        "http://localhost:3000/api/ai/resume/analyze",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Resume analysis failed. Please try again."
        );
      }

      if (
        typeof data?.score !== "number" ||
        !data?.ats ||
        !Array.isArray(data?.strengths) ||
        !Array.isArray(data?.improvements) ||
        !Array.isArray(data?.recommendations)
      ) {
        throw new Error(
          "The AI returned an invalid resume analysis."
        );
      }

      setAnalysis(data);
      setAnalysisState("results");
    } catch (error) {
      console.error("Resume analysis error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not analyze your resume."
      );

      setAnalysisState("ready");
    }
  };

  const chooseAnotherFile = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setError("");
    setAnalysisState("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileType = (file: File) => {
    if (file.type === "application/pdf") {
      return "PDF";
    }

    if (file.name.toLowerCase().endsWith(".docx")) {
      return "DOCX";
    }

    return "TXT";
  };

  return (
    <div className="resume-page">
      <div className="resume-noise" />

      <div className="resume-orb resume-orb-one" />
      <div className="resume-orb resume-orb-two" />

      <div className="resume-grid" />

      <main className="resume-container">
        {/* HERO */}
        <section className="resume-hero">
          <div className="hero-copy">
            <span className="resume-eyebrow">
              AI CAREER LAB
            </span>

            <h1>
              Your resume.
              <br />
              <span>Made sharper.</span>
            </h1>

            <p className="hero-description">
              Upload your resume and let AI find what's
              holding you back — then turn it into something
              recruiters notice.
            </p>

            <div className="hero-meta">
              <span>01</span>
              <span className="meta-line" />
              <span>RESUME ANALYSIS</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <div className="art-ring ring-three" />

            <div className="art-star star-one">✦</div>
            <div className="art-star star-two">✦</div>
            <div className="art-star star-three">✧</div>

            <div className="art-square square-one" />
            <div className="art-square square-two" />

            <div className="art-center">
              <span>AI</span>
              <small>SCAN</small>
            </div>

            <div className="art-label">
              <span>INTELLIGENCE</span>
              <strong>01 / 04</strong>
            </div>
          </div>
        </section>

        {/* UPLOAD / ANALYZING */}
        {analysisState !== "results" && (
          <section className="resume-workspace">
            <div className="workspace-label">
              <span>01</span>
              <p>DROP YOUR RESUME</p>
            </div>

            {analysisState === "analyzing" ? (
              <div className="analyzing-panel">
                <div className="scanner">
                  <div className="scanner-line" />

                  <div className="scanner-document">
                    <span>CV</span>
                  </div>
                </div>

                <div className="analyzing-copy">
                  <span className="resume-eyebrow">
                    AI PROCESSING
                  </span>

                  <h2>
                    SCANNING YOUR
                    <br />
                    RESUME<span>...</span>
                  </h2>

                  <p>
                    Checking structure, keywords,
                    readability and recruiter impact.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`upload-zone ${
                    dragging ? "dragging" : ""
                  } ${selectedFile ? "has-file" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    hidden
                  />

                  {!selectedFile ? (
                    <>
                      <div className="upload-symbol">
                        ↑
                      </div>

                      <div>
                        <h2>DROP YOUR RESUME</h2>

                        <p>
                          Drag & drop your file here
                          <br />
                          or choose one from your device
                        </p>
                      </div>

                      <span className="file-types">
                        PDF / DOCX / TXT
                      </span>

                      <button
                        type="button"
                        className="choose-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        CHOOSE FILE
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="file-symbol">
                        CV
                      </div>

                      <div className="selected-file-info">
                        <span className="file-ready">
                          READY TO ANALYZE
                        </span>

                        <h2>{selectedFile.name}</h2>

                        <p>
                          {(
                            selectedFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB · {getFileType(selectedFile)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="change-file"
                        onClick={(event) => {
                          event.stopPropagation();
                          chooseAnotherFile();
                        }}
                      >
                        CHANGE
                      </button>
                    </>
                  )}
                </div>

                {error && (
                  <div className="resume-error">
                    {error}
                  </div>
                )}

                {selectedFile && (
                  <button
                    type="button"
                    className="analyze-button"
                    onClick={analyzeResume}
                  >
                    <span>ANALYZE RESUME</span>
                    <span className="button-arrow">↗</span>
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {/* RESULTS */}
        {analysisState === "results" && analysis && (
          <section className="results-section">
            <div className="results-heading">
              <div>
                <span className="resume-eyebrow">
                  ANALYSIS COMPLETE
                </span>

                <h2>
                  Here's what
                  <br />
                  we found<span>.</span>
                </h2>
              </div>

              <button
                className="scan-again"
                onClick={chooseAnotherFile}
                type="button"
              >
                ANALYZE ANOTHER ↗
              </button>
            </div>

            {/* SCORE + ATS */}
            <div className="analysis-grid">
              <article className="score-card">
                <span className="card-number">
                  01 / SCORE
                </span>

                <div
                  className="score-circle"
                  style={{
                    background: `conic-gradient(
                      #b36cff ${analysis.score * 3.6}deg,
                      rgba(255,255,255,0.06) ${analysis.score * 3.6}deg
                    )`,
                  }}
                >
                  <div>
                    <strong>{analysis.score}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="score-copy">
                  <span>{analysis.rating}</span>

                  <p>
                    Your score is based on the actual
                    content, structure and clarity of
                    the uploaded resume.
                  </p>
                </div>
              </article>

              <article className="ats-card">
                <span className="card-number">
                  02 / ATS CHECK
                </span>

                <div className="metrics">
                  {[
                    {
                      label: "ATS Compatibility",
                      value: analysis.ats.compatibility,
                    },
                    {
                      label: "Keyword Match",
                      value: analysis.ats.keywordMatch,
                    },
                    {
                      label: "Formatting",
                      value: analysis.ats.formatting,
                    },
                    {
                      label: "Readability",
                      value: analysis.ats.readability,
                    },
                  ].map((metric) => (
                    <div
                      className="metric"
                      key={metric.label}
                    >
                      <div className="metric-top">
                        <span>{metric.label}</span>

                        <strong>
                          {metric.value}%
                        </strong>
                      </div>

                      <div className="metric-track">
                        <div
                          className="metric-fill"
                          style={{
                            width: `${metric.value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* STRENGTHS / IMPROVEMENTS */}
            <div className="feedback-grid">
              <article className="feedback-card positive">
                <span className="card-number">
                  03 / WHAT'S WORKING
                </span>

                <h3>Keep these.</h3>

                <ul>
                  {analysis.strengths.map(
                    (strength, index) => (
                      <li key={`${strength}-${index}`}>
                        <span>✓</span>
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              </article>

              <article className="feedback-card improve">
                <span className="card-number">
                  04 / WHAT TO IMPROVE
                </span>

                <h3>Push further.</h3>

                <ul>
                  {analysis.improvements.map(
                    (improvement, index) => (
                      <li
                        key={`${improvement}-${index}`}
                      >
                        <span>!</span>
                        {improvement}
                      </li>
                    )
                  )}
                </ul>
              </article>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="recommendations">
              <div className="recommendations-heading">
                <div>
                  <span className="card-number">
                    05 / AI RECOMMENDATIONS
                  </span>

                  <h2>
                    Make your next
                    <br />
                    version{" "}
                    <span>stronger.</span>
                  </h2>
                </div>
              </div>

              <div className="recommendation-list">
                {analysis.recommendations.map(
                  (recommendation, index) => (
                    <article
                      className="recommendation"
                      key={`${recommendation.title}-${index}`}
                    >
                      <span className="recommendation-number">
                        {recommendation.number ||
                          String(index + 1).padStart(
                            2,
                            "0"
                          )}
                      </span>

                      <div>
                        <h3>
                          {recommendation.title}
                        </h3>

                        <p>
                          {recommendation.description}
                        </p>
                      </div>

                    </article>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="resume-footer">
          <span>DE ZÉRO / AI CAREER LAB</span>

          <span>
            BUILD · LEARN · BECOME
          </span>
        </footer>
      </main>
    </div>
  );
}

export default Resume;