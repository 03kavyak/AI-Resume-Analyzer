import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      console.log("Logged-in user:", user);

      const response = await api.get(
        `/dashboard?user_id=${user.id}`
      );

      console.log(
        "Dashboard response:",
        response.data
      );

      if (response.data.status === "success") {
        setDashboardData(response.data);
      } else {
        setError(
          response.data.message ||
          "Could not load dashboard."
        );
      }

    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Could not load dashboard."
        );
      } else {
        setError(
          "Could not connect to backend."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // -----------------------------------
  // LOADING
  // -----------------------------------

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="history-message">
            Loading your dashboard...
          </div>
        </main>
      </div>
    );
  }


  // -----------------------------------
  // ERROR
  // -----------------------------------

  if (error) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="error-message">
            {error}
          </div>
        </main>
      </div>
    );
  }


  const stats = dashboardData?.stats || {};

  const user = dashboardData?.user || {};

  const recentAnalyses =
    dashboardData?.recent_analyses || [];


  // -----------------------------------
  // CHART DATA
  // -----------------------------------

  const chartData = [...recentAnalyses]
    .reverse()
    .map((item, index) => ({
      name: `Version ${index + 1}`,
      score: item.overall_score || 0
    }));


  // -----------------------------------
  // IMPROVEMENT
  // -----------------------------------

  let improvement = 0;

  if (chartData.length >= 2) {
    improvement =
      chartData[chartData.length - 1].score -
      chartData[0].score;
  }


  return (
    <div className="dashboard-page">

      {/* Sidebar */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          Resume<span>AI</span>
        </div>


        <nav className="dashboard-nav">

          <button
            className="nav-item active"
          >
            <span>▦</span>
            Dashboard
          </button>


          <button
            className="nav-item"
            onClick={() => navigate("/upload")}
          >
            <span>↑</span>
            Analyze Resume
          </button>


          <button
            className="nav-item"
            onClick={() => navigate("/job-match")}
          >
            <span>⌕</span>
            Job Match
          </button>


          <button
            className="nav-item"
            onClick={() => navigate("/history")}
          >
            <span>◷</span>
            History
          </button>


          <button
            className="nav-item"
            onClick={() => navigate("/progress")}
          >
            <span>↗</span>
            Progress
          </button>

        </nav>


        <div className="sidebar-bottom">

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>


          <button
            className="nav-item"
            onClick={() => {
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("analysisResult");

              navigate("/");
            }}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* Main Dashboard */}

      <main className="dashboard-main">


        {/* Top bar */}

        <header className="dashboard-header">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Track your resume performance and
              improve your chances.
            </p>

          </div>


          <button
            className="primary-button"
            onClick={() => navigate("/upload")}
          >
            + Analyze New Resume
          </button>

        </header>


        {/* Welcome */}

        <section className="welcome-card">

          <div>

            <p className="welcome-label">
              Welcome back 👋
            </p>


            <h2>
              Keep improving your resume!
            </h2>


            <p>

              {stats.total_analyses > 0 ? (
                <>
                  Your latest resume scored{" "}

                  <strong>
                    {stats.latest_score}/100
                  </strong>.

                  {" "}Keep working towards a stronger resume.
                </>
              ) : (
                <>
                  You haven't analyzed a resume yet.
                  Upload your resume to get started.
                </>
              )}

            </p>

          </div>


          <div className="welcome-score">

            {stats.latest_score || 0}

            <span>
              /100
            </span>

          </div>

        </section>


        {/* Statistics */}

        <section className="dashboard-stats">


          <div className="stat-card">

            <div className="stat-icon">
              ★
            </div>

            <div>

              <p>
                Best Score
              </p>

              <h2>
                {stats.best_score || 0}
              </h2>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <p>
                Resumes Analyzed
              </p>

              <h2>
                {stats.total_analyses || 0}
              </h2>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ◉
            </div>

            <div>

              <p>
                Latest ATS Score
              </p>

              <h2>
                {stats.ats_score || 0}
              </h2>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ↗
            </div>

            <div>

              <p>
                Improvement
              </p>

              <h2>
                {improvement >= 0
                  ? `+${improvement}`
                  : improvement}
              </h2>

            </div>

          </div>

        </section>


        {/* Chart + Quick Actions */}

        <section className="dashboard-grid">


          {/* Chart */}

          <div className="dashboard-card chart-card">

            <div className="card-heading">

              <div>

                <h2>
                  Resume Improvement
                </h2>

                <p>
                  Your resume score over
                  different versions.
                </p>

              </div>


              <span className="trend-badge">

                {improvement >= 0
                  ? `+${improvement} points`
                  : `${improvement} points`}

              </span>

            </div>


            <div className="chart-container">

              {chartData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <LineChart
                    data={chartData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />


                    <XAxis
                      dataKey="name"
                    />


                    <YAxis
                      domain={[0, 100]}
                    />


                    <Tooltip />


                    <Line
                      type="monotone"
                      dataKey="score"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="history-message">
                  Analyze your resume to see your
                  improvement chart.
                </div>

              )}

            </div>

          </div>


          {/* Quick actions */}

          <div className="dashboard-card">

            <div className="card-heading">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  What would you like to do?
                </p>

              </div>

            </div>


            <div className="quick-actions">


              <button
                onClick={() =>
                  navigate("/upload")
                }
                className="quick-action"
              >

                <div className="quick-action-icon">
                  ↑
                </div>


                <div>

                  <strong>
                    Analyze Resume
                  </strong>

                  <span>
                    Get a complete resume analysis
                  </span>

                </div>


                <b>
                  →
                </b>

              </button>


              <button
                onClick={() =>
                  navigate("/job-match")
                }
                className="quick-action"
              >

                <div className="quick-action-icon">
                  ⌕
                </div>


                <div>

                  <strong>
                    Match Job Description
                  </strong>

                  <span>
                    Check your resume against a job
                  </span>

                </div>


                <b>
                  →
                </b>

              </button>


              <button
                className="quick-action"
                onClick={() =>
                  navigate("/history")
                }
              >

                <div className="quick-action-icon">
                  ◷
                </div>


                <div>

                  <strong>
                    View History
                  </strong>

                  <span>
                    See your previous analyses
                  </span>

                </div>


                <b>
                  →
                </b>

              </button>

            </div>

          </div>

        </section>


        {/* Recent Analyses */}

        <section className="dashboard-card recent-card">


          <div className="card-heading">

            <div>

              <h2>
                Recent Analyses
              </h2>

              <p>
                Your latest resume analysis results.
              </p>

            </div>


            <button
              className="view-all-button"
              onClick={() =>
                navigate("/history")
              }
            >
              View All
            </button>

          </div>


          <div className="analysis-table">


            <div className="table-header">

              <span>
                Resume
              </span>

              <span>
                Date
              </span>

              <span>
                Score
              </span>

              <span>
                ATS
              </span>

              <span>
                Action
              </span>

            </div>


            {recentAnalyses.length > 0 ? (

              recentAnalyses.map(
                (resume) => (

                  <div
                    className="table-row"
                    key={resume.id}
                  >

                    <span className="resume-name">

                      📄 {resume.resume_name}

                    </span>


                    <span>
                      {resume.created_at}
                    </span>


                    <span>

                      <strong>
                        {resume.overall_score}
                      </strong>

                      /100

                    </span>


                    <span>

                      <strong>
                        {resume.ats_score}
                      </strong>

                      /100

                    </span>


                    <button
                      className="view-button"
                      onClick={() =>
                        navigate("/analysis")
                      }
                    >
                      View →
                    </button>

                  </div>

                )
              )

            ) : (

              <div className="history-message">

                No resume analyses yet.

              </div>

            )}

          </div>

        </section>


        {/* Job Match Banner */}

        <section className="job-match-banner">


          <div>

            <p>
              🎯 Tailoring your resume
              for a specific job?
            </p>


            <h2>
              See how well your resume
              matches the job.
            </h2>


            <span>
              Compare skills, keywords and
              experience requirements.
            </span>

          </div>


          <button
            onClick={() =>
              navigate("/job-match")
            }
          >
            Match My Resume →
          </button>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;