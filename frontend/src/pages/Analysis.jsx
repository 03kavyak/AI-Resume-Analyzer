import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ScoreCard({ title, score, description }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));

  return (
    <div className="analysis-score-card">
      <div className="score-card-top">
        <span>{title}</span>
        <div className="mini-score">
          {safeScore}
        </div>
      </div>

      <div className="score-progress">
        <div
          className="score-progress-fill"
          style={{ width: `${safeScore}%` }}
        ></div>
      </div>

      <p>{description}</p>
    </div>
  );
}

function Analysis() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("analysisResult");

    if (!storedResult) {
      navigate("/upload");
      return;
    }

    try {
      setResult(JSON.parse(storedResult));
    } catch (error) {
      console.error("Failed to load analysis:", error);
      navigate("/upload");
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="analysis-loading">
        <div className="analysis-loader"></div>
        <p>Loading your resume analysis...</p>
      </div>
    );
  }

  const analysis = result.analysis || {};

  const overallScore = Number(analysis.overall_score) || 0;
  const atsScore = Number(analysis.ats_score) || 0;

  const technicalSkills = analysis.technical_skills || [];
  const softSkills = analysis.soft_skills || [];
  const missingKeywords = analysis.missing_keywords || [];
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const atsIssues = analysis.ats_issues || [];
  const atsSuggestions = analysis.ats_suggestions || [];
  const improvements = analysis.improvements || [];

  const handleJobMatch = () => {
    navigate("/job-match");
  };

  const handleNewAnalysis = () => {
    sessionStorage.removeItem("analysisResult");
    navigate("/upload");
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "Needs Attention";
  };

  return (
    <div className="analysis-page">

      {/* Header */}
      <header className="analysis-header">

        <div
          className="analysis-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="analysis-brand-icon">
            ✦
          </div>

          <div>
            <h2>ResumeAI</h2>
            <span>AI Resume Intelligence</span>
          </div>
        </div>

        <div className="analysis-header-actions">

          <button
            className="analysis-secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            className="analysis-primary-btn"
            onClick={handleNewAnalysis}
          >
            + Analyze New Resume
          </button>

        </div>

      </header>

      {/* Main */}
      <main className="analysis-container">

        {/* Page Intro */}
        <section className="analysis-intro">

          <div>
            <span className="analysis-eyebrow">
              AI RESUME ANALYSIS
            </span>

            <h1>
              Your Resume Analysis
            </h1>

            <p>
              Here's how your resume performs across ATS compatibility,
              content quality, structure and readability.
            </p>

            <div className="analysis-file">
              <span className="file-icon">PDF</span>
              <div>
                <strong>{result.filename || "Resume"}</strong>
                <small>Analysis completed successfully</small>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="overall-score-card">

            <div className="overall-score-ring">
              <svg viewBox="0 0 120 120">

                <circle
                  className="score-ring-bg"
                  cx="60"
                  cy="60"
                  r="50"
                />

                <circle
                  className="score-ring-progress"
                  cx="60"
                  cy="60"
                  r="50"
                  style={{
                    strokeDasharray: `${overallScore * 3.14} 314`,
                  }}
                />

              </svg>

              <div className="overall-score-value">
                <strong>{overallScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="overall-score-info">
              <span>Overall Score</span>
              <strong>{getScoreLabel(overallScore)}</strong>
              <small>
                Based on multiple resume quality factors
              </small>
            </div>

          </div>

        </section>

        {/* Score Cards */}
        <section className="analysis-score-grid">

          <ScoreCard
            title="ATS Compatibility"
            score={atsScore}
            description="How easily applicant tracking systems can read your resume."
          />

          <ScoreCard
            title="Content Quality"
            score={analysis.content_score}
            description="Strength and relevance of the resume content."
          />

          <ScoreCard
            title="Structure"
            score={analysis.structure_score}
            description="Organization and clarity of your resume sections."
          />

          <ScoreCard
            title="Readability"
            score={analysis.readability_score}
            description="How clear and easy your resume is to read."
          />

        </section>

        {/* Summary */}
        {analysis.summary && (
          <section className="analysis-section summary-section">

            <div className="section-heading">
              <div className="section-icon purple">
                ✦
              </div>

              <div>
                <h2>AI Summary</h2>
                <p>Quick overview of your resume performance</p>
              </div>
            </div>

            <div className="summary-content">
              {analysis.summary}
            </div>

          </section>
        )}

        {/* Strengths / Weaknesses */}
        <section className="analysis-two-column">

          <div className="analysis-section">

            <div className="section-heading">
              <div className="section-icon green">
                ✓
              </div>

              <div>
                <h2>Strengths</h2>
                <p>What your resume is doing well</p>
              </div>
            </div>

            <div className="analysis-list">

              {strengths.length > 0 ? (
                strengths.map((item, index) => (
                  <div className="analysis-list-item success" key={index}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <div className="empty-analysis">
                  No strengths identified.
                </div>
              )}

            </div>

          </div>


          <div className="analysis-section">

            <div className="section-heading">
              <div className="section-icon orange">
                !
              </div>

              <div>
                <h2>Weaknesses</h2>
                <p>Areas that could be improved</p>
              </div>
            </div>

            <div className="analysis-list">

              {weaknesses.length > 0 ? (
                weaknesses.map((item, index) => (
                  <div className="analysis-list-item warning" key={index}>
                    <span>!</span>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <div className="empty-analysis">
                  No major weaknesses identified.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* Skills */}
        <section className="analysis-section">

          <div className="section-heading">
            <div className="section-icon blue">
              ⚡
            </div>

            <div>
              <h2>Skills Analysis</h2>
              <p>Skills detected from your resume</p>
            </div>
          </div>

          <div className="skills-analysis-grid">

            <div className="skills-column">

              <h3>Technical Skills</h3>

              <div className="skill-tags">

                {technicalSkills.length > 0 ? (
                  technicalSkills.map((skill, index) => (
                    <span className="skill-tag technical" key={index}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-data">
                    No technical skills detected
                  </span>
                )}

              </div>

            </div>


            <div className="skills-column">

              <h3>Soft Skills</h3>

              <div className="skill-tags">

                {softSkills.length > 0 ? (
                  softSkills.map((skill, index) => (
                    <span className="skill-tag soft" key={index}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-data">
                    No soft skills detected
                  </span>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* Missing Keywords */}
        <section className="analysis-section">

          <div className="section-heading">
            <div className="section-icon red">
              #
            </div>

            <div>
              <h2>Missing Keywords</h2>
              <p>
                Keywords that could improve your ATS visibility
              </p>
            </div>
          </div>

          <div className="keyword-container">

            {missingKeywords.length > 0 ? (
              missingKeywords.map((keyword, index) => (
                <span className="keyword-tag" key={index}>
                  {keyword}
                </span>
              ))
            ) : (
              <div className="empty-analysis">
                No major missing keywords detected.
              </div>
            )}

          </div>

        </section>

        {/* ATS */}
        <section className="analysis-section ats-section">

          <div className="section-heading">

            <div className="section-icon purple">
              ATS
            </div>

            <div>
              <h2>ATS Compatibility</h2>
              <p>
                Applicant Tracking System compatibility analysis
              </p>
            </div>

            <div className="ats-score-badge">
              {atsScore}/100
            </div>

          </div>


          <div className="ats-content">

            <div>

              <h3>Detected Issues</h3>

              <div className="analysis-list">

                {atsIssues.length > 0 ? (
                  atsIssues.map((issue, index) => (
                    <div className="analysis-list-item danger" key={index}>
                      <span>!</span>
                      <p>{issue}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-analysis">
                    No major ATS issues detected.
                  </div>
                )}

              </div>

            </div>


            <div>

              <h3>ATS Suggestions</h3>

              <div className="analysis-list">

                {atsSuggestions.length > 0 ? (
                  atsSuggestions.map((suggestion, index) => (
                    <div className="analysis-list-item success" key={index}>
                      <span>✓</span>
                      <p>{suggestion}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-analysis">
                    No additional suggestions.
                  </div>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* Improvements */}
        <section className="analysis-section">

          <div className="section-heading">

            <div className="section-icon purple">
              ✦
            </div>

            <div>
              <h2>AI Improvement Plan</h2>
              <p>
                Prioritized recommendations to strengthen your resume
              </p>
            </div>

          </div>


          <div className="improvement-list">

            {improvements.length > 0 ? (
              improvements.map((item, index) => (

                <div className="improvement-card" key={index}>

                  <div className="improvement-number">
                    {index + 1}
                  </div>

                  <div className="improvement-content">

                    <div className="improvement-top">

                      <h3>
                        {item.area || "Resume Improvement"}
                      </h3>

                      {item.priority && (
                        <span
                          className={`priority-badge ${String(
                            item.priority
                          ).toLowerCase()}`}
                        >
                          {item.priority}
                        </span>
                      )}

                    </div>

                    <p>
                      {item.suggestion || item}
                    </p>

                  </div>

                </div>

              ))
            ) : (
              <div className="empty-analysis">
                No improvement recommendations available.
              </div>
            )}

          </div>

        </section>

        {/* Bottom CTA */}
        <section className="analysis-bottom-cta">

          <div>

            <span className="cta-label">
              NEXT STEP
            </span>

            <h2>
              Want to see how your resume matches a job?
            </h2>

            <p>
              Compare your resume against a job description and
              discover matched skills, missing keywords and gaps.
            </p>

          </div>

          <div className="cta-actions">

            <button
              className="analysis-secondary-btn large"
              onClick={handleNewAnalysis}
            >
              Analyze Another
            </button>

            <button
              className="analysis-primary-btn large"
              onClick={handleJobMatch}
            >
              Match With Job →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Analysis;