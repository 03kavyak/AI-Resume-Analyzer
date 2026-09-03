import { useState } from "react";
import api from "../services/api";

function JobMatch() {
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

    const storedResult = sessionStorage.getItem("analysisResult");

    if (!storedResult) {
      setError("Please analyze your resume first.");
      return;
    }

    let resumeData;

    try {
      resumeData = JSON.parse(storedResult);
    } catch (err) {
      console.error("Session storage error:", err);
      setError("Could not read your resume analysis.");
      return;
    }

    const resumeText = resumeData.resume_text;

    console.log("Resume data:", resumeData);
    console.log("Resume text:", resumeText);
    console.log("Job description:", jobDescription);

    if (!resumeText || !resumeText.trim()) {
      setError(
        "Resume text is missing. Please upload and analyze your resume again."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/match-job", {
        resume_text: resumeText,
        job_description: jobDescription,
      });

      console.log("Job Match API response:", response.data);

      if (response.data.status !== "success") {
        throw new Error(
          response.data.message || "Job matching failed."
        );
      }

      setResult(response.data.result);

    } catch (err) {
      console.error("Job Match Error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Backend job matching failed."
        );
      } else {
        setError(
          err.message ||
          "Could not connect to backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-match-page">
      <div className="job-match-container">

        <h1>Job Description Match</h1>

        <p>
          Compare your resume with a job description and
          identify matching skills, missing keywords and
          improvement areas.
        </p>

        <div className="job-match-card">

          <label>
            Job Description
          </label>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows="12"
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={handleMatch}
            disabled={loading}
          >
            {loading ? "Matching..." : "Match My Resume"}
          </button>

        </div>


        {result && (
          <div className="job-result">

            <div className="match-score-card">
              <h2>Job Match Score</h2>

              <div className="match-score">
                {result.match_score}%
              </div>
            </div>


            <div className="result-section">

              <h2>Matched Skills</h2>

              {result.matched_skills?.length > 0 ? (
                <div className="skill-list">
                  {result.matched_skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No matching skills found.</p>
              )}

            </div>


            <div className="result-section">

              <h2>Missing Skills</h2>

              {result.missing_skills?.length > 0 ? (
                <div className="skill-list">
                  {result.missing_skills.map((skill, index) => (
                    <span key={index} className="missing-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No major missing skills found.</p>
              )}

            </div>


            <div className="result-section">

              <h2>Matched Keywords</h2>

              {result.matched_keywords?.length > 0 ? (
                <ul>
                  {result.matched_keywords.map((keyword, index) => (
                    <li key={index}>{keyword}</li>
                  ))}
                </ul>
              ) : (
                <p>No matching keywords found.</p>
              )}

            </div>


            <div className="result-section">

              <h2>Missing Keywords</h2>

              {result.missing_keywords?.length > 0 ? (
                <ul>
                  {result.missing_keywords.map((keyword, index) => (
                    <li key={index}>{keyword}</li>
                  ))}
                </ul>
              ) : (
                <p>No major missing keywords found.</p>
              )}

            </div>


            <div className="result-section">

              <h2>Experience Gaps</h2>

              {result.experience_gaps?.length > 0 ? (
                <ul>
                  {result.experience_gaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              ) : (
                <p>No major experience gaps detected.</p>
              )}

            </div>


            <div className="result-section">

              <h2>Recommendations</h2>

              {result.recommendations?.map((item, index) => (
                <div
                  className="recommendation-card"
                  key={index}
                >
                  <strong>
                    {item.priority} — {item.area}
                  </strong>

                  <p>
                    {item.suggestion}
                  </p>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default JobMatch;