import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-page-single">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="landing-navbar-single">

        <Link to="/" className="landing-brand-single">
          <span className="brand-mark-single">R</span>

          <span>
            Resume<span>AI</span>
          </span>
        </Link>

        <div className="landing-nav-single">

          <a href="#features">
            Features
          </a>

          <Link to="/login">
            Login
          </Link>

          <Link
            to="/signup"
            className="nav-signup-single"
          >
            Get Started
          </Link>

        </div>

      </nav>


      {/* =========================
          MAIN SCREEN
      ========================= */}

      <main className="landing-main-single">

        {/* LEFT SIDE */}

        <section className="landing-content-single">

          <div className="landing-badge-single">
            <span></span>
            AI-POWERED RESUME ANALYZER
          </div>

          <h1>
            Build a resume
            <br />
            <span>that gets noticed.</span>
          </h1>

          <p className="landing-description-single">
            Analyze your resume, improve ATS compatibility,
            discover missing skills, and match your resume
            with the right job.
          </p>

          <div className="landing-actions-single">

            <Link
              to="/signup"
              className="landing-primary-single"
            >
              Analyze My Resume
              <span>→</span>
            </Link>

            <Link
              to="/login"
              className="landing-secondary-single"
            >
              Login
            </Link>

          </div>

          <div className="landing-trust-single">

            <span>
              ✓ PDF & DOCX
            </span>

            <span>
              ✓ ATS Analysis
            </span>

            <span>
              ✓ Job Matching
            </span>

          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="landing-preview-single">

          <div className="preview-background-glow"></div>

          <div className="resume-preview-single">

            {/* Preview Header */}

            <div className="resume-preview-header">

              <div>
                <strong>
                  Resume Analysis
                </strong>

                <small>
                  Latest resume version
                </small>
              </div>

              <div className="analysis-status-single">
                <span></span>
                Analyzed
              </div>

            </div>


            {/* Score */}

            <div className="main-score-single">

              <div className="score-circle-single">

                <div>
                  <strong>82</strong>
                  <small>/100</small>
                </div>

              </div>

              <div className="score-description-single">

                <small>
                  OVERALL SCORE
                </small>

                <h3>
                  Strong Resume
                </h3>

                <p>
                  Your resume has a strong foundation
                  with opportunities for improvement.
                </p>

              </div>

            </div>


            {/* Metrics */}

            <div className="preview-metrics-single">

              <div>

                <div className="metric-top-single">
                  <span>ATS Compatibility</span>
                  <strong>78%</strong>
                </div>

                <div className="metric-line-single">
                  <span style={{ width: "78%" }}></span>
                </div>

              </div>


              <div>

                <div className="metric-top-single">
                  <span>Content Quality</span>
                  <strong>85%</strong>
                </div>

                <div className="metric-line-single">
                  <span style={{ width: "85%" }}></span>
                </div>

              </div>


              <div>

                <div className="metric-top-single">
                  <span>Job Match</span>
                  <strong>91%</strong>
                </div>

                <div className="metric-line-single">
                  <span style={{ width: "91%" }}></span>
                </div>

              </div>

            </div>


            {/* Insight */}

            <div className="preview-insight-single">

              <div className="insight-symbol-single">
                ✦
              </div>

              <div>
                <strong>
                  Improvement opportunity
                </strong>

                <p>
                  Add measurable achievements to
                  strengthen your resume.
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =========================
          FEATURES
      ========================= */}

      <section
        id="features"
        className="landing-features-single"
      >

        <div className="feature-single">

          <div className="feature-icon-single">
            ↗
          </div>

          <div>
            <strong>
              Resume Analysis
            </strong>

            <span>
              Detailed resume insights
            </span>
          </div>

        </div>


        <div className="feature-single">

          <div className="feature-icon-single">
            ✓
          </div>

          <div>
            <strong>
              ATS Optimization
            </strong>

            <span>
              Find missing keywords
            </span>
          </div>

        </div>


        <div className="feature-single">

          <div className="feature-icon-single">
            ◇
          </div>

          <div>
            <strong>
              Job Matching
            </strong>

            <span>
              Match resume to jobs
            </span>
          </div>

        </div>


        <div className="feature-single">

          <div className="feature-icon-single">
            ↗
          </div>

          <div>
            <strong>
              Track Progress
            </strong>

            <span>
              Compare resume versions
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Landing;