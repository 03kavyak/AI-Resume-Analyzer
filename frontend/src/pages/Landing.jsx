import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <h2>ResumeAI</h2>

        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/signup" className="nav-button">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <p className="badge">AI-POWERED RESUME ANALYZER</p>

          <h1>
            Build a Resume That
            <span> Gets Noticed.</span>
          </h1>

          <p className="hero-description">
            Analyze your resume with AI, improve your ATS score,
            discover missing skills, and match your resume with
            your dream job.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="primary-button">
              Analyze My Resume →
            </Link>

            <Link to="/login" className="secondary-button">
              Login
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="score-circle">
            <strong>82</strong>
            <small>/100</small>
          </div>

          <h3>Resume Score</h3>

          <div className="mini-score">
            <span>ATS Compatibility</span>
            <strong>78%</strong>
          </div>

          <div className="mini-score">
            <span>Content Quality</span>
            <strong>85%</strong>
          </div>

          <div className="mini-score">
            <span>Job Match</span>
            <strong>91%</strong>
          </div>
        </div>
      </main>

      <section className="features">
        <div>
          <h3>📊 Resume Analysis</h3>
          <p>Get detailed AI-powered feedback.</p>
        </div>

        <div>
          <h3>🎯 ATS Analysis</h3>
          <p>Identify keywords and ATS issues.</p>
        </div>

        <div>
          <h3>💼 Job Matching</h3>
          <p>Compare your resume with a job description.</p>
        </div>

        <div>
          <h3>📈 Track Progress</h3>
          <p>See how your resume improves over time.</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;