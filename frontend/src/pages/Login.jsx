import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      if (response.data.status !== "success") {
        throw new Error(
          response.data.message || "Login failed."
        );
      }

      sessionStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Invalid email or password."
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
    <div className="auth-screen">

      {/* ==============================
          LEFT BRAND PANEL
      ============================== */}

      <div className="auth-brand-panel">

        <div className="auth-brand-content">

          <Link
            to="/"
            className="auth-logo"
          >
            <span className="auth-logo-mark">
              R
            </span>

            <span>
              Resume<span>AI</span>
            </span>
          </Link>


          <div className="auth-brand-message">

            <div className="auth-brand-badge">
              AI-POWERED RESUME INTELLIGENCE
            </div>

            <h1>
              Your resume
              <br />
              <span>deserves attention.</span>
            </h1>

            <p>
              Analyze your resume, improve ATS
              compatibility, discover missing skills,
              and match your profile with the right
              opportunities.
            </p>

          </div>


          <div className="auth-benefits">

            <div>
              <span>✓</span>
              Smart resume analysis
            </div>

            <div>
              <span>✓</span>
              ATS compatibility insights
            </div>

            <div>
              <span>✓</span>
              Job description matching
            </div>

          </div>

        </div>

      </div>


      {/* ==============================
          LOGIN PANEL
      ============================== */}

      <div className="auth-form-panel">

        <div className="auth-form-wrapper">

          <Link
            to="/"
            className="auth-back-home"
          >
            ← Back to home
          </Link>


          <div className="auth-mobile-logo">

            <span className="auth-logo-mark">
              R
            </span>

            <span>
              Resume<span>AI</span>
            </span>

          </div>


          <div className="auth-heading">

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to continue improving
              your resume.
            </p>

          </div>


          <form
            onSubmit={handleLogin}
            className="professional-auth-form"
          >

            {/* EMAIL */}

            <div className="professional-form-group">

              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>


            {/* PASSWORD */}

            <div className="professional-form-group">

              <div className="form-label-row">

                <label htmlFor="login-password">
                  Password
                </label>

              </div>

              <div className="password-input-wrapper">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="auth-alert auth-error">

                <span>!</span>

                <p>{error}</p>

              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="professional-auth-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          <div className="auth-divider">
            <span></span>
            <p>New to ResumeAI?</p>
            <span></span>
          </div>


          <Link
            to="/signup"
            className="auth-outline-button"
          >
            Create an account
          </Link>


          <p className="auth-security-note">
            Your resume data is used only to
            generate your analysis and insights.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;