import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      // Save logged-in user
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
    <div className="auth-page">

      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue improving your resume.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>


          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="primary-button auth-button"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>

        </form>


        <p className="auth-footer">

          Don't have an account?{" "}

          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;