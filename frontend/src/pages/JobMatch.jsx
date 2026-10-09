import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function JobMatch() {
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    setError("");
    setResult(null);

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    let resumeData;

    try {
      const storedResult = sessionStorage.getItem("analysisResult");

      if (!storedResult) {
        setError("Please analyze your resume before matching a job.");
        return;
      }

      resumeData = JSON.parse(storedResult);
    } catch (err) {
      console.error("Resume session error:", err);
      setError("Could not read your resume analysis. Please analyze your resume again.");
      return;
    }

    const resumeText = resumeData.resume_text;

    if (!resumeText || !resumeText.trim()) {
      setError("Resume text is missing. Please analyze your resume again.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/match-job", {
        resume_text: resumeText,
        job_description: jobDescription,
      });

      if (response.data.status !== "success") {
        throw new Error(
          response.data.message || "Job matching failed."
        );
      }

      setResult(response.data.result);
    } catch (err) {
      console.error("Job Match error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const matchScore = Math.min(
    100,
    Math.max(0, Number(result?.match_score) || 0)
  );

  const matchedSkills = result?.matched_skills || [];
  const missingSkills = result?.missing_skills || [];
  const matchedKeywords = result?.matched_keywords || [];
  const missingKeywords = result?.missing_keywords || [];
  const experienceGaps = result?.experience_gaps || [];
  const recommendations = result?.recommendations || [];

  return (
    <div className="jm-page">
      {/* Top navigation */}
      <header className="jm-header">
        <button
          className="jm-brand"
          onClick={() => navigate("/dashboard")}
          aria-label="Go to dashboard"
        >
          <span className="jm-brand-icon">✦</span>
          <span className="jm-brand-copy">
            <strong>ResumeAI</strong>
            <small>AI Resume Intelligence</small>
          </span>
        </button>

        <div className="jm-header-actions">
          <button
            className="jm-btn jm-btn-light"
            onClick={() => navigate("/analysis")}
          >
            ← Resume Analysis
          </button>

          <button
            className="jm-btn jm-btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="jm-container">
        {/* Page introduction */}
        <section className="jm-intro">
          <div>
            <span className="jm-eyebrow">CAREER INTELLIGENCE</span>
            <h1>Job Description Match</h1>
            <p>
              Discover how closely your resume aligns with a target role.
              Identify relevant skills, missing keywords, and areas to
              strengthen before applying.
            </p>
          </div>

          <div className="jm-intro-badge">
            <span>✦</span>
            <div>
              <strong>Resume + Job</strong>
              <small>Personalized comparison</small>
            </div>
          </div>
        </section>

        {/* Input panel */}
        <section className="jm-input-card">
          <div className="jm-section-heading">
            <div className="jm-step-icon">01</div>
            <div>
              <h2>Enter the job description</h2>
              <p>
                Paste the job requirements you want to compare against
                your analyzed resume.
              </p>
            </div>
          </div>

          <label className="jm-label" htmlFor="job-description">
            Job description
          </label>

          <textarea
            id="job-description"
            className="jm-textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={
              "Paste the job description here...\n\nInclude responsibilities, required skills, qualifications, and experience."
            }
            rows={9}
            disabled={loading}
          />

          <div className="jm-input-footer">
            <span>{jobDescription.length} characters</span>
            <span>Use the full job description for a more useful comparison.</span>
          </div>

          {error && (
            <div className="jm-error" role="alert">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <div className="jm-submit-row">
            <p>
              <span className="jm-status-dot" />
              Your previously analyzed resume will be used.
            </p>

            <button
              type="button"
              className="jm-btn jm-btn-primary jm-submit-btn"
              onClick={handleMatch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="jm-spinner" />
                  Comparing resume...
                </>
              ) : (
                <>✦ Match My Resume <span>→</span></>
              )}
            </button>
          </div>
        </section>

        {/* Loading feedback */}
        {loading && (
          <div className="jm-loading-panel">
            <span className="jm-spinner jm-spinner-large" />
            <div>
              <strong>Analyzing your job match</strong>
              <p>Comparing resume skills and job requirements...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="jm-results">
            <div className="jm-results-heading">
              <div>
                <span className="jm-eyebrow">YOUR RESULTS</span>
                <h2>Job Match Report</h2>
                <p>
                  Review your matching strengths and identify what to
                  improve for this role.
                </p>
              </div>

              <button
                className="jm-btn jm-btn-light"
                onClick={() => {
                  setResult(null);
                  setError("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                New Comparison
              </button>
            </div>

            {/* Score overview */}
            <div className="jm-overview-grid">
              <div className="jm-score-panel">
                <div
                  className="jm-score-ring"
                  style={{
                    background: `conic-gradient(#635bff ${matchScore * 3.6}deg, #eeedf8 0deg)`,
                  }}
                >
                  <div className="jm-score-ring-inner">
                    <strong>{matchScore}%</strong>
                    <span>Match score</span>
                  </div>
                </div>

                <div className="jm-score-copy">
                  <span className="jm-score-label">RESUME COMPATIBILITY</span>
                  <h3>
                    {matchScore >= 80
                      ? "Strong alignment"
                      : matchScore >= 60
                        ? "Good starting point"
                        : matchScore >= 40
                          ? "Room to improve"
                          : "Needs closer alignment"}
                  </h3>
                  <p>
                    Use the findings below to prioritize relevant
                    improvements. This score is an estimate, not a hiring
                    prediction.
                  </p>
                </div>
              </div>

              <div className="jm-stat-card">
                <span className="jm-stat-icon jm-stat-green">✓</span>
                <div>
                  <small>Matched skills</small>
                  <strong>{matchedSkills.length}</strong>
                  <span>Skills found in both</span>
                </div>
              </div>

              <div className="jm-stat-card">
                <span className="jm-stat-icon jm-stat-orange">＋</span>
                <div>
                  <small>Missing skills</small>
                  <strong>{missingSkills.length}</strong>
                  <span>Skills to review</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="jm-results-grid">
              <section className="jm-result-card">
                <div className="jm-card-heading">
                  <span className="jm-card-icon jm-green">✓</span>
                  <div>
                    <h3>Matched Skills</h3>
                    <p>Skills detected in your resume and the job.</p>
                  </div>
                  <span className="jm-count jm-count-green">
                    {matchedSkills.length}
                  </span>
                </div>

                {matchedSkills.length ? (
                  <div className="jm-tags">
                    {matchedSkills.map((skill, index) => (
                      <span className="jm-tag jm-tag-green" key={`${skill}-${index}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="jm-empty">No matching skills found.</p>
                )}
              </section>

              <section className="jm-result-card">
                <div className="jm-card-heading">
                  <span className="jm-card-icon jm-orange">＋</span>
                  <div>
                    <h3>Missing Skills</h3>
                    <p>Requirements not detected in your resume.</p>
                  </div>
                  <span className="jm-count jm-count-orange">
                    {missingSkills.length}
                  </span>
                </div>

                {missingSkills.length ? (
                  <div className="jm-tags">
                    {missingSkills.map((skill, index) => (
                      <span className="jm-tag jm-tag-orange" key={`${skill}-${index}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="jm-empty">No missing skills detected.</p>
                )}

                {missingSkills.length > 0 && (
                  <p className="jm-note">
                    Only add skills you genuinely possess.
                  </p>
                )}
              </section>
            </div>

            {/* Keywords */}
            <section className="jm-result-card jm-keyword-card">
              <div className="jm-card-heading">
                <span className="jm-card-icon jm-purple">#</span>
                <div>
                  <h3>Keyword Analysis</h3>
                  <p>
                    See which job-related terms appear in your resume.
                  </p>
                </div>
              </div>

              <div className="jm-keyword-columns">
                <div>
                  <h4>Matched keywords</h4>
                  {matchedKeywords.length ? (
                    <div className="jm-tags">
                      {matchedKeywords.map((keyword, index) => (
                        <span
                          className="jm-tag jm-tag-purple"
                          key={`${keyword}-${index}`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="jm-empty">No matching keywords found.</p>
                  )}
                </div>

                <div>
                  <h4>Missing keywords</h4>
                  {missingKeywords.length ? (
                    <div className="jm-tags">
                      {missingKeywords.map((keyword, index) => (
                        <span
                          className="jm-tag jm-tag-orange"
                          key={`${keyword}-${index}`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="jm-empty">No missing keywords detected.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Experience gaps */}
            <section className="jm-result-card">
              <div className="jm-card-heading">
                <span className="jm-card-icon jm-blue">↗</span>
                <div>
                  <h3>Experience Gaps</h3>
                  <p>Potential gaps between your resume and the role.</p>
                </div>
              </div>

              {experienceGaps.length ? (
                <div className="jm-list">
                  {experienceGaps.map((gap, index) => (
                    <div className="jm-list-item" key={index}>
                      <span>!</span>
                      <p>{gap}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="jm-empty">
                  No major experience gaps detected by the current analysis.
                </p>
              )}
            </section>

            {/* Recommendations */}
            <section className="jm-result-card">
              <div className="jm-card-heading">
                <span className="jm-card-icon jm-purple">✦</span>
                <div>
                  <h3>Recommended Actions</h3>
                  <p>Prioritize relevant changes to your resume.</p>
                </div>
              </div>

              {recommendations.length ? (
                <div className="jm-recommendations">
                  {recommendations.map((item, index) => (
                    <article className="jm-recommendation" key={index}>
                      <span className="jm-recommendation-number">
                        {index + 1}
                      </span>
                      <div>
                        <div className="jm-recommendation-top">
                          <h4>{item.area || "Resume improvement"}</h4>
                          {item.priority && (
                            <span
                              className={`jm-priority ${String(item.priority).toLowerCase()}`}
                            >
                              {item.priority}
                            </span>
                          )}
                        </div>
                        <p>
                          {item.suggestion || String(item)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="jm-empty">
                  No additional recommendations available.
                </p>
              )}
            </section>

            <div className="jm-final-note">
              <span>✦</span>
              <p>
                <strong>Make every change truthful.</strong> Tailor your
                resume to the role, but do not add skills, experience, or
                achievements you cannot support.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default JobMatch;