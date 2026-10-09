import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  // ---------------------------------------
  // Get user's analysis history
  // ---------------------------------------

  const fetchHistory = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await api.get(`/history?user_id=${user.id}`);

      if (response.data.status === "success") {
        setHistory(response.data.history || []);
      } else {
        setError(response.data.message || "Could not load history.");
      }
    } catch (err) {
      console.error("History error:", err);

      if (err.response) {
        setError(err.response.data?.message || "Could not load history.");
      } else {
        setError("Could not connect to backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // View a specific historical analysis
  // ---------------------------------------

const handleViewAnalysis = async (analysisId) => {
  try {
    const storedUser = sessionStorage.getItem("user");

    if (!storedUser) {
      setError("Please login first.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    const response = await api.get(
      `/analysis/${analysisId}`,
      {
        params: {
          user_id: user.id,
        },
      }
    );

    if (response.data.status !== "success") {
      throw new Error(
        response.data.message || "Unable to load analysis."
      );
    }

    sessionStorage.setItem(
      "analysisResult",
      JSON.stringify({
        analysis_id: response.data.analysis_id,
        filename: response.data.filename,
        resume_text: response.data.resume_text,
        analysis: response.data.analysis,
      })
    );

    navigate("/analysis");

  } catch (error) {
    console.error("History View error:", error);
    console.error(
      "Backend response:",
      error.response?.data
    );

    alert(
      error.response?.data?.message ||
      error.message ||
      "Unable to open this analysis."
    );
  }
};

  return (
    <div className="history-page">
      <div className="history-container">
        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="history-header">
          <div>
            <h1>Resume History</h1>

            <p>
              View your previous resume analyses and track how your scores
              improve over time.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => navigate("/upload")}
          >
            Analyze New Resume
          </button>
        </div>

        {/* -------------------------------- */}
        {/* Loading */}
        {/* -------------------------------- */}

        {loading && (
          <div className="history-message">Loading your resume history...</div>
        )}

        {/* -------------------------------- */}
        {/* Error */}
        {/* -------------------------------- */}

        {error && <div className="error-message">{error}</div>}

        {/* -------------------------------- */}
        {/* Empty History */}
        {/* -------------------------------- */}

        {!loading && !error && history.length === 0 && (
          <div className="empty-history">
            <h2>No Resume Analyses Yet</h2>

            <p>Upload your resume to start building your analysis history.</p>

            <button
              className="primary-button"
              onClick={() => navigate("/upload")}
            >
              Upload Resume
            </button>
          </div>
        )}

        {/* -------------------------------- */}
        {/* History Table */}
        {/* -------------------------------- */}

        {!loading && !error && history.length > 0 && (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Resume</th>
                  <th>Date</th>
                  <th>Overall</th>
                  <th>ATS</th>
                  <th>Content</th>
                  <th>Structure</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.resume_name}</strong>
                    </td>

                    <td>{item.created_at}</td>

                    <td>
                      <span className="score-badge">{item.overall_score}%</span>
                    </td>

                    <td>{item.ats_score}%</td>

                    <td>{item.content_score}%</td>

                    <td>{item.structure_score}%</td>

                    <td>
                      <button
                        className="view-button"
                        onClick={() => handleViewAnalysis(item.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
