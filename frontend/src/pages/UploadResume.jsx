import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function UploadResume() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
      setError("Please upload a PDF or DOCX file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setFile(null);
      return;
    }

    console.log("Selected file:", selectedFile);

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get logged-in user
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        setError("Please login before analyzing your resume.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      console.log("Logged-in user:", user);

      const formData = new FormData();

      // Add resume
      formData.append("resume", file);

      // Add user ID
      formData.append("user_id", user.id);

      console.log("Uploading:", file.name);
      console.log("User ID:", user.id);

      const response = await api.post(
        "/analyze",
        formData
      );

      console.log(
        "Backend response:",
        response.data
      );

      if (response.data.status !== "success") {
        throw new Error(
          response.data.message ||
          "Resume analysis failed."
        );
      }

      // Save analysis result
      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify(response.data)
      );

      navigate("/analysis");

    } catch (err) {
      console.error(
        "Analysis error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Backend analysis failed."
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
    <div className="upload-page">

      <div className="upload-container">

        <h1>Upload Your Resume</h1>

        <p>
          Upload your resume to analyze its ATS compatibility,
          skills, structure and content.
        </p>

        <div className="upload-box">

          {/* FILE INPUT */}

          <label className="file-label">
            Choose Resume

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
          </label>


          {/* SELECTED FILE */}

          {file && (
            <div className="selected-file">

              <strong>
                Selected Resume
              </strong>

              <p>
                {file.name}
              </p>

              <small>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </small>

            </div>
          )}


          {!file && (
            <p className="upload-hint">
              Supported formats: PDF, DOCX
            </p>
          )}


          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          {/* ANALYZE BUTTON */}

          <button
            type="button"
            className="primary-button"
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default UploadResume;