import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

function Progress() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      // Get logged-in user
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      console.log("Logged-in user:", user);

      // Get only this user's history
      const response = await api.get(
        `/history?user_id=${user.id}`
      );

      console.log("Progress response:", response.data);

      if (response.data.status === "success") {
        // Oldest → newest for the chart
        const data = [...response.data.history].reverse();

        setHistory(data);
      } else {
        setError(
          response.data.message ||
          "Could not load progress data."
        );
      }

    } catch (err) {
      console.error("Progress error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Could not load progress data."
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


  // Get latest analysis
  const getLatest = () => {
    if (history.length === 0) {
      return null;
    }

    return history[history.length - 1];
  };


  // Get best score
  const getBest = (field) => {
    if (history.length === 0) {
      return 0;
    }

    return Math.max(
      ...history.map(
        (item) => item[field] || 0
      )
    );
  };


  // Calculate improvement
  const getImprovement = (field) => {
    if (history.length < 2) {
      return 0;
    }

    const first = history[0][field] || 0;

    const latest =
      history[history.length - 1][field] || 0;

    return latest - first;
  };


  const latest = getLatest();


  // Chart data
  const chartData = history.map(
    (item, index) => ({
      version: `Resume ${index + 1}`,
      overall: item.overall_score,
      ats: item.ats_score,
      content: item.content_score,
      structure: item.structure_score,
    })
  );


  return (
    <div className="progress-page">

      <div className="progress-container">

        {/* HEADER */}

        <div className="progress-header">

          <div>

            <h1>
              Progress Tracking
            </h1>

            <p>
              Track how your resume improves
              across different versions.
            </p>

          </div>


          <button
            className="primary-button"
            onClick={() => navigate("/upload")}
          >
            Analyze New Resume
          </button>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="progress-message">
            Loading your progress...
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          history.length === 0 && (

          <div className="empty-progress">

            <h2>
              No Progress Data Yet
            </h2>

            <p>
              Analyze your resume at least once
              to start tracking your progress.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/upload")}
            >
              Upload Resume
            </button>

          </div>

        )}


        {/* PROGRESS DATA */}

        {!loading &&
          !error &&
          history.length > 0 && (

          <>

            {/* SCORE CARDS */}

            <div className="progress-stats">

              <div className="progress-stat-card">

                <span>
                  Latest Score
                </span>

                <strong>
                  {latest.overall_score}%
                </strong>

              </div>


              <div className="progress-stat-card">

                <span>
                  Best Score
                </span>

                <strong>
                  {getBest("overall_score")}%
                </strong>

              </div>


              <div className="progress-stat-card">

                <span>
                  ATS Score
                </span>

                <strong>
                  {latest.ats_score}%
                </strong>

              </div>


              <div className="progress-stat-card">

                <span>
                  Total Versions
                </span>

                <strong>
                  {history.length}
                </strong>

              </div>

            </div>


            {/* SCORE CHART */}

            <div className="progress-chart-card">

              <div className="section-heading">

                <h2>
                  Resume Score Trend
                </h2>

                <p>
                  See how your resume scores
                  change between versions.
                </p>

              </div>


              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <LineChart
                    data={chartData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="version"
                    />

                    <YAxis
                      domain={[0, 100]}
                    />

                    <Tooltip />

                    <Legend />


                    <Line
                      type="monotone"
                      dataKey="overall"
                      name="Overall"
                      strokeWidth={3}
                    />


                    <Line
                      type="monotone"
                      dataKey="ats"
                      name="ATS"
                      strokeWidth={2}
                    />


                    <Line
                      type="monotone"
                      dataKey="content"
                      name="Content"
                      strokeWidth={2}
                    />


                    <Line
                      type="monotone"
                      dataKey="structure"
                      name="Structure"
                      strokeWidth={2}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* IMPROVEMENT SUMMARY */}

            <div className="improvement-section">

              <h2>
                Improvement Summary
              </h2>


              <div className="improvement-grid">


                <div className="improvement-card">

                  <span>
                    Overall
                  </span>

                  <strong>

                    {getImprovement(
                      "overall_score"
                    ) >= 0
                      ? "+"
                      : ""}

                    {getImprovement(
                      "overall_score"
                    )}%

                  </strong>

                  <p>
                    Change from first to
                    latest analysis
                  </p>

                </div>


                <div className="improvement-card">

                  <span>
                    ATS
                  </span>

                  <strong>

                    {getImprovement(
                      "ats_score"
                    ) >= 0
                      ? "+"
                      : ""}

                    {getImprovement(
                      "ats_score"
                    )}%

                  </strong>

                  <p>
                    ATS score improvement
                  </p>

                </div>


                <div className="improvement-card">

                  <span>
                    Content
                  </span>

                  <strong>

                    {getImprovement(
                      "content_score"
                    ) >= 0
                      ? "+"
                      : ""}

                    {getImprovement(
                      "content_score"
                    )}%

                  </strong>

                  <p>
                    Content score improvement
                  </p>

                </div>


                <div className="improvement-card">

                  <span>
                    Structure
                  </span>

                  <strong>

                    {getImprovement(
                      "structure_score"
                    ) >= 0
                      ? "+"
                      : ""}

                    {getImprovement(
                      "structure_score"
                    )}%

                  </strong>

                  <p>
                    Structure score improvement
                  </p>

                </div>

              </div>

            </div>


            {/* VERSION HISTORY */}

            <div className="progress-history-card">

              <h2>
                Version History
              </h2>


              <div className="history-table-wrapper">

                <table className="history-table">

                  <thead>

                    <tr>

                      <th>
                        Version
                      </th>

                      <th>
                        Resume
                      </th>

                      <th>
                        Overall
                      </th>

                      <th>
                        ATS
                      </th>

                      <th>
                        Content
                      </th>

                      <th>
                        Structure
                      </th>

                      <th>
                        Date
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {history.map(
                      (item, index) => (

                      <tr key={item.id}>

                        <td>
                          Resume {index + 1}
                        </td>

                        <td>
                          <strong>
                            {item.resume_name}
                          </strong>
                        </td>

                        <td>
                          {item.overall_score}%
                        </td>

                        <td>
                          {item.ats_score}%
                        </td>

                        <td>
                          {item.content_score}%
                        </td>

                        <td>
                          {item.structure_score}%
                        </td>

                        <td>
                          {item.created_at}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default Progress;