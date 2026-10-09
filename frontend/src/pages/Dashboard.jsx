import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================

  const fetchDashboard = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await api.get(`/dashboard?user_id=${user.id}`);

      if (response.data.status === "success") {
        setDashboardData(response.data);
      } else {
        setError(response.data.message || "Could not load dashboard.");
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response) {
        setError(err.response.data?.message || "Could not load dashboard.");
      } else {
        setError("Could not connect to backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW HISTORICAL ANALYSIS
  // ==========================================

  const handleViewAnalysis = async (analysisId) => {
    try {
      const response = await api.get(`/analysis/${analysisId}`, {
        params: {
          user_id: user.id,
        },
      });

      if (response.data.status === "success") {
        sessionStorage.setItem(
          "analysisResult",
          JSON.stringify({
            analysis_id: response.data.analysis_id,
            filename: response.data.filename,
            resume_text: response.data.resume_text,
            analysis: response.data.analysis,
          }),
        );

        navigate("/analysis");
      } else {
        alert(response.data.message || "Unable to load analysis.");
      }
    } catch (error) {
      console.error("Failed to load analysis:", error);

      alert(error.response?.data?.message || "Unable to load this analysis.");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("analysisResult");

    navigate("/");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="professional-dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>

          <h2>Preparing your dashboard</h2>

          <p>Loading your resume insights...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !dashboardData) {
    return (
      <div className="professional-dashboard">
        <div className="dashboard-error">
          <div className="error-icon">!</div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button className="dashboard-primary-button" onClick={fetchDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  const user = dashboardData?.user || {};

  const recentAnalyses = dashboardData?.recent_analyses || [];

  // ==========================================
  // USER INITIALS
  // ==========================================

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 0) {
      return "U";
    }

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(user.name);

  // ==========================================
  // CHART DATA
  // ==========================================

  const chartData = [...recentAnalyses].reverse().map((item, index) => ({
    name: `V${index + 1}`,
    score: item.overall_score || 0,
    ats: item.ats_score || 0,
  }));

  // ==========================================
  // IMPROVEMENT
  // ==========================================

  let improvement = 0;

  if (chartData.length >= 2) {
    improvement = chartData[chartData.length - 1].score - chartData[0].score;
  }

  const latestScore = stats.latest_score || 0;

  const bestScore = stats.best_score || 0;

  const atsScore = stats.ats_score || 0;

  const totalAnalyses = stats.total_analyses || 0;

  return (
    <div className="professional-dashboard">
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="pro-dashboard-sidebar">
        {/* Logo */}

        <div className="pro-dashboard-logo">
          <div className="pro-logo-mark">R</div>

          <div>
            Resume<span>AI</span>
            <small>Resume Intelligence</small>
          </div>
        </div>

        {/* Navigation */}

        <nav className="pro-sidebar-nav">
          <p className="sidebar-label">WORKSPACE</p>

          <button className="pro-nav-item active">
            <span className="pro-nav-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            Dashboard
          </button>

          <button className="pro-nav-item" onClick={() => navigate("/upload")}>
            <span className="pro-nav-icon">↑</span>
            Analyze Resume
          </button>

          <button
            className="pro-nav-item"
            onClick={() => navigate("/job-match")}
          >
            <span className="pro-nav-icon">✦</span>
            Job Match
          </button>

          <button className="pro-nav-item" onClick={() => navigate("/history")}>
            <span className="pro-nav-icon">◷</span>
            History
          </button>

          <button
            className="pro-nav-item"
            onClick={() => navigate("/progress")}
          >
            <span className="pro-nav-icon">↗</span>
            Progress
          </button>
        </nav>

        {/* Sidebar bottom */}

        <div className="pro-sidebar-bottom">
          <div className="sidebar-help-card">
            <div className="help-icon">?</div>

            <div>
              <strong>Improve your resume</strong>

              <span>Analyze a new version</span>
            </div>
          </div>

          <button className="pro-nav-item logout-item" onClick={handleLogout}>
            <span className="pro-nav-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="pro-dashboard-main">
        {/* ================================================
            TOP BAR
        ================================================= */}

        <header className="pro-dashboard-header">
          <div>
            <p className="dashboard-breadcrumb">Workspace / Dashboard</p>

            <h1>Good to see you, {user.name?.split(" ")[0] || "there"}.</h1>

            <p>Here's how your resume is performing.</p>
          </div>

          <div className="dashboard-user-area">
            <button
              className="dashboard-header-action"
              onClick={() => navigate("/upload")}
            >
              <span>+</span>
              Analyze Resume
            </button>

            <div className="dashboard-user">
              <div className="dashboard-avatar">{initials}</div>

              <div>
                <strong>{user.name || "User"}</strong>

                <span>{user.email || ""}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================
            ERROR ALERT
        ================================================= */}

        {error && dashboardData && (
          <div className="dashboard-inline-error">{error}</div>
        )}

        {/* ================================================
            HERO / SCORE
        ================================================= */}

        <section className="dashboard-welcome">
          <div className="dashboard-welcome-content">
            <span className="dashboard-overline">RESUME PERFORMANCE</span>

            <h2>Your latest resume score</h2>

            <p>
              {totalAnalyses > 0
                ? "Keep refining your resume using the insights from your latest analysis."
                : "Upload your first resume to start receiving personalized insights."}
            </p>

            <button
              className="dashboard-primary-button"
              onClick={() => navigate("/upload")}
            >
              {totalAnalyses > 0 ? "Improve My Resume" : "Analyze My Resume"}

              <span>→</span>
            </button>
          </div>

          <div className="dashboard-score-display">
            <div
              className="dashboard-score-ring"
              style={{
                "--score": `${latestScore * 3.6}deg`,
              }}
            >
              <div>
                <strong>{latestScore}</strong>

                <span>/100</span>
              </div>
            </div>

            <div className="score-display-label">Overall Score</div>
          </div>
        </section>

        {/* ================================================
            STATS
        ================================================= */}

        <section className="pro-stat-grid">
          <div className="pro-stat-card">
            <div className="pro-stat-icon purple">★</div>

            <div>
              <span>Best Score</span>

              <strong>
                {bestScore}
                <small>/100</small>
              </strong>
            </div>

            <div className="stat-description">Your highest score</div>
          </div>

          <div className="pro-stat-card">
            <div className="pro-stat-icon blue">✓</div>

            <div>
              <span>Resumes Analyzed</span>

              <strong>{totalAnalyses}</strong>
            </div>

            <div className="stat-description">Total versions</div>
          </div>

          <div className="pro-stat-card">
            <div className="pro-stat-icon green">◉</div>

            <div>
              <span>ATS Score</span>

              <strong>
                {atsScore}
                <small>/100</small>
              </strong>
            </div>

            <div className="stat-description">Latest compatibility</div>
          </div>

          <div className="pro-stat-card">
            <div className="pro-stat-icon orange">↗</div>

            <div>
              <span>Improvement</span>

              <strong className={improvement < 0 ? "negative-score" : ""}>
                {improvement >= 0 ? `+${improvement}` : improvement}

                <small> pts</small>
              </strong>
            </div>

            <div className="stat-description">Since first version</div>
          </div>
        </section>

        {/* ================================================
            ANALYTICS GRID
        ================================================= */}

        <section className="dashboard-analytics-grid">
          {/* Chart */}

          <div className="pro-dashboard-card chart-dashboard-card">
            <div className="pro-card-header">
              <div>
                <span>PERFORMANCE</span>

                <h2>Resume score trend</h2>

                <p>Track how your resume improves across versions.</p>
              </div>

              {chartData.length >= 2 && (
                <div
                  className={
                    improvement >= 0 ? "trend-positive" : "trend-negative"
                  }
                >
                  {improvement >= 0 ? "↗" : "↘"} {Math.abs(improvement)} pts
                </div>
              )}
            </div>

            <div className="pro-chart-wrapper">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#eef0f4" />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#98a2b3",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#98a2b3",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e4e7ec",
                        boxShadow: "0 8px 25px rgba(16,24,40,0.08)",
                      }}
                      formatter={(value) => [`${value}/100`, "Score"]}
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#635bff"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#635bff",
                        strokeWidth: 2,
                        stroke: "#ffffff",
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty-chart">
                  <div>↗</div>

                  <h3>No score history yet</h3>

                  <p>Analyze your resume to start tracking your progress.</p>

                  <button onClick={() => navigate("/upload")}>
                    Analyze Resume →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}

          <div className="pro-dashboard-card quick-dashboard-card">
            <div className="pro-card-header">
              <div>
                <span>QUICK ACTIONS</span>

                <h2>What would you like to do?</h2>
              </div>
            </div>

            <div className="pro-quick-actions">
              <button onClick={() => navigate("/upload")}>
                <div className="quick-icon purple">↑</div>

                <div>
                  <strong>Analyze Resume</strong>

                  <span>Get a detailed resume report</span>
                </div>

                <b>→</b>
              </button>

              <button onClick={() => navigate("/job-match")}>
                <div className="quick-icon blue">✦</div>

                <div>
                  <strong>Match a Job</strong>

                  <span>Compare your resume with a JD</span>
                </div>

                <b>→</b>
              </button>

              <button onClick={() => navigate("/history")}>
                <div className="quick-icon green">◷</div>

                <div>
                  <strong>View History</strong>

                  <span>Review previous resume versions</span>
                </div>

                <b>→</b>
              </button>

              <button onClick={() => navigate("/progress")}>
                <div className="quick-icon orange">↗</div>

                <div>
                  <strong>Track Progress</strong>

                  <span>See your improvement over time</span>
                </div>

                <b>→</b>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================
            RECENT ANALYSES
        ================================================= */}

        <section className="pro-dashboard-card recent-analysis-card">
          <div className="pro-card-header">
            <div>
              <span>HISTORY</span>

              <h2>Recent analyses</h2>

              <p>Your latest resume versions and scores.</p>
            </div>

            <button
              className="dashboard-text-button"
              onClick={() => navigate("/history")}
            >
              View all →
            </button>
          </div>

          {recentAnalyses.length > 0 ? (
            <div className="pro-analysis-table">
              <div className="pro-table-header">
                <span>RESUME</span>

                <span>DATE</span>

                <span>SCORE</span>

                <span>ATS</span>

                <span>ACTION</span>
              </div>

              {recentAnalyses.map((resume) => (
                <div className="pro-table-row" key={resume.id}>
                  <div className="table-resume-cell">
                    <div className="resume-file-icon">PDF</div>

                    <div>
                      <strong>{resume.resume_name}</strong>

                      <span>Resume analysis</span>
                    </div>
                  </div>

                  <span className="table-date">{resume.created_at}</span>

                  <div className="table-score">
                    <strong>{resume.overall_score}</strong>

                    <span>/100</span>
                  </div>

                  <span className="table-ats">{resume.ats_score}%</span>

                  <button
                    className="table-view-button"
                    onClick={() => handleViewAnalysis(resume.id)}
                    disabled={viewLoading}
                  >
                    {viewLoading ? "Loading..." : "View →"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-history">
              <div className="empty-history-icon">📄</div>

              <h3>No analyses yet</h3>

              <p>Upload your resume to create your first analysis.</p>

              <button onClick={() => navigate("/upload")}>
                Analyze Resume →
              </button>
            </div>
          )}
        </section>

        {/* ================================================
            JOB MATCH CTA
        ================================================= */}

        <section className="dashboard-job-banner">
          <div className="job-banner-icon">✦</div>

          <div>
            <span>JOB MATCHING</span>

            <h2>Tailoring your resume for a specific job?</h2>

            <p>
              Compare your skills, keywords and experience with any job
              description.
            </p>
          </div>

          <button onClick={() => navigate("/job-match")}>
            Match My Resume
            <span>→</span>
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
