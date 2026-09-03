import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Analysis() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {
    console.log("Analysis page loaded.");

    const storedResult = sessionStorage.getItem("analysisResult");

    console.log("Session storage result:", storedResult);

    if (!storedResult) {
      console.log("No analysis found in sessionStorage.");

      navigate("/upload");
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult);

      console.log("Parsed analysis result:", parsedResult);

      setResult(parsedResult);
    } catch (error) {
      console.error("JSON parsing failed:", error);

      sessionStorage.removeItem("analysisResult");

      navigate("/upload");
    }
  }, [navigate]);

  const handleDownloadReport = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        alert("Please login first.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!result?.analysis_id) {
        alert("This analysis cannot be downloaded.");
        return;
      }

      console.log("Downloading report for analysis:", result.analysis_id);

      const response = await api.get(
        `/analysis/${result.analysis_id}/report?user_id=${user.id}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${result.filename || "resume"}_Analysis.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download report error:", error);

      alert("Could not download the report.");
    }
  };
  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (!result) {
    return (
      <div className="analysis-page">
        <div className="analysis-container">
          <div className="analysis-loading">
            <h2>Loading Analysis...</h2>
            <p>Please wait while we prepare your resume report.</p>
          </div>
        </div>
      </div>
    );
  }

  const analysis = result.analysis || {};

  // ---------------------------------------
  // Helper
  // ---------------------------------------

  const scoreClass = (score) => {
    if (score >= 80) return "score-good";
    if (score >= 60) return "score-average";
    return "score-low";
  };

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}

        <div className="analysis-header">
          <div>
            <button
              className="back-button"
              onClick={() => navigate("/history")}
            >
              ← Back to History
            </button>

            <h1>Resume Analysis</h1>

            <p className="analysis-subtitle">
              Detailed analysis of your resume
            </p>
          </div>

          <div className="analysis-actions">
            <button
              className="secondary-button"
              onClick={() => navigate("/job-match")}
            >
              Match With Job
            </button>

            <button
              className="primary-button"
              onClick={() => navigate("/upload")}
            >
              Analyze New Resume
            </button>
          </div>
        </div>

        {/* ================================= */}
        {/* Resume Information */}
        {/* ================================= */}

        <div className="resume-info-card">
          <div>
            <span className="info-label">Resume</span>

            <h2>{result.filename || result.resume_name || "Resume"}</h2>
          </div>

          {result.created_at && (
            <div>
              <span className="info-label">Analyzed On</span>

              <p>{result.created_at}</p>
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* Overall Score */}
        {/* ================================= */}

        <div className="overall-score-card">
          <div className="overall-score-content">
            <span className="score-label">Overall Resume Score</span>

            <div
              className={`overall-score ${scoreClass(
                analysis.overall_score || 0,
              )}`}
            >
              {analysis.overall_score || 0}
            </div>

            <span className="score-out-of">out of 100</span>
          </div>

          <div className="score-summary">
            <h3>
              {analysis.summary ||
                "Your resume has been analyzed successfully."}
            </h3>
          </div>
        </div>

        {/* ================================= */}
        {/* Score Cards */}
        {/* ================================= */}

        <section>
          <h2 className="section-heading">Score Breakdown</h2>

          <div className="analysis-score-grid">
            <div className="analysis-score-card">
              <span>ATS Score</span>

              <strong>{analysis.ats_score || 0}%</strong>

              <div className="score-bar">
                <div
                  style={{
                    width: `${analysis.ats_score || 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="analysis-score-card">
              <span>Content Score</span>

              <strong>{analysis.content_score || 0}%</strong>

              <div className="score-bar">
                <div
                  style={{
                    width: `${analysis.content_score || 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="analysis-score-card">
              <span>Structure Score</span>

              <strong>{analysis.structure_score || 0}%</strong>

              <div className="score-bar">
                <div
                  style={{
                    width: `${analysis.structure_score || 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="analysis-score-card">
              <span>Readability</span>

              <strong>{analysis.readability_score || 0}%</strong>

              <div className="score-bar">
                <div
                  style={{
                    width: `${analysis.readability_score || 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="analysis-score-card">
              <span>Quantifiable Achievements</span>

              <strong>{analysis.quantifiable_score || 0}%</strong>

              <div className="score-bar">
                <div
                  style={{
                    width: `${analysis.quantifiable_score || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* Strengths & Weaknesses */}
        {/* ================================= */}

        <div className="analysis-two-column">
          <section className="analysis-section">
            <h2 className="section-heading">Strengths</h2>

            <div className="analysis-list-card">
              {analysis.strengths?.length > 0 ? (
                <ul>
                  {analysis.strengths.map((strength, index) => (
                    <li key={index}>✓ {strength}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific strengths identified.</p>
              )}
            </div>
          </section>

          <section className="analysis-section">
            <h2 className="section-heading">Weaknesses</h2>

            <div className="analysis-list-card">
              {analysis.weaknesses?.length > 0 ? (
                <ul>
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              ) : (
                <p>No major weaknesses identified.</p>
              )}
            </div>
          </section>
        </div>

        {/* ================================= */}
        {/* Skills */}
        {/* ================================= */}

        <section>
          <h2 className="section-heading">Skills Analysis</h2>

          <div className="analysis-two-column">
            <div className="analysis-list-card">
              <h3>Technical Skills</h3>

              <div className="skill-tags">
                {analysis.technical_skills?.length > 0 ? (
                  analysis.technical_skills.map((skill, index) => (
                    <span className="skill-tag" key={index}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No technical skills detected.</p>
                )}
              </div>
            </div>

            <div className="analysis-list-card">
              <h3>Soft Skills</h3>

              <div className="skill-tags">
                {analysis.soft_skills?.length > 0 ? (
                  analysis.soft_skills.map((skill, index) => (
                    <span className="skill-tag soft-skill" key={index}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No soft skills detected.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* Missing Keywords */}
        {/* ================================= */}

        <section>
          <h2 className="section-heading">Missing Keywords</h2>

          <div className="analysis-list-card">
            {analysis.missing_keywords?.length > 0 ? (
              <div className="keyword-tags">
                {analysis.missing_keywords.map((keyword, index) => (
                  <span className="keyword-tag" key={index}>
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p>No important missing keywords detected.</p>
            )}
          </div>
        </section>

        {/* ================================= */}
        {/* ATS Analysis */}
        {/* ================================= */}

        <section>
          <h2 className="section-heading">ATS Analysis</h2>

          <div className="analysis-two-column">
            <div className="analysis-list-card">
              <h3>ATS Issues</h3>

              {analysis.ats_issues?.length > 0 ? (
                <ul>
                  {analysis.ats_issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              ) : (
                <p>No major ATS issues detected.</p>
              )}
            </div>

            <div className="analysis-list-card">
              <h3>ATS Suggestions</h3>

              {analysis.ats_suggestions?.length > 0 ? (
                <ul>
                  {analysis.ats_suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <p>Your resume has good ATS compatibility.</p>
              )}
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* Section Feedback */}
        {/* ================================= */}

        {analysis.section_feedback && (
          <section>
            <h2 className="section-heading">Section-wise Feedback</h2>

            <div className="section-feedback-grid">
              {Object.entries(analysis.section_feedback).map(
                ([section, feedback]) => (
                  <div className="feedback-card" key={section}>
                    <h3>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </h3>

                    <p>{feedback}</p>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* Improvements */}
        {/* ================================= */}

        <section>
          <h2 className="section-heading">Recommended Improvements</h2>

          <div className="improvements-list">
            {analysis.improvements?.length > 0 ? (
              analysis.improvements.map((item, index) => (
                <div className="improvement-card" key={index}>
                  <div className="improvement-header">
                    <span className="priority-badge">{item.priority}</span>

                    <strong>{item.area}</strong>
                  </div>

                  <p>{item.suggestion}</p>
                </div>
              ))
            ) : (
              <p>No additional improvements available.</p>
            )}
          </div>
        </section>

        {/* ================================= */}
        {/* Action Buttons */}
        {/* ================================= */}

        <div className="analysis-bottom-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/history")}
          >
            ← View History
          </button>

          <button className="secondary-button" onClick={handleDownloadReport}>
            Download Report
          </button>

          <button
            className="primary-button"
            onClick={() => navigate("/job-match")}
          >
            Match With Job →
          </button>

          <button
            className="primary-button"
            onClick={() => navigate("/upload")}
          >
            Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
