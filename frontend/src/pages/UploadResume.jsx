import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function UploadResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "Please select a resume.";
    }

    const fileName =
      selectedFile.name.toLowerCase();

    if (
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".docx")
    ) {
      return "Only PDF and DOCX files are supported.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size must be less than 10 MB.";
    }

    if (selectedFile.size === 0) {
      return "The selected file is empty.";
    }

    return "";
  };

  const selectFile = (selectedFile) => {
    setError("");

    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      selectFile(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFileType = (fileName) => {
    if (
      fileName
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      return "PDF";
    }

    return "DOCX";
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const storedUser =
        sessionStorage.getItem("user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const formData = new FormData();

      formData.append("resume", file);
      formData.append("user_id", user.id);

      console.log("Uploading:", file.name);
      console.log("User ID:", user.id);

      const response = await api.post(
        "/analyze",
        formData
      );

      console.log(
        "Analysis response:",
        response.data
      );

      if (
        response.data.status !==
        "success"
      ) {
        throw new Error(
          response.data.message ||
            "Resume analysis failed."
        );
      }

      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify(response.data)
      );

      navigate("/analysis");

    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Resume analysis failed."
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
    <div className="upload-pro-page">

      {/* ===============================
          HEADER
      =============================== */}

      <header className="upload-pro-header">

        <button
          className="upload-back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ←
        </button>

        <div className="upload-pro-brand">

          <div className="upload-brand-mark">
            R
          </div>

          <div>
            Resume<span>AI</span>

            <small>
              Resume Intelligence
            </small>
          </div>

        </div>

        <div className="upload-header-status">
          Secure analysis
        </div>

      </header>


      {/* ===============================
          MAIN
      =============================== */}

      <main className="upload-pro-main">

        <div className="upload-pro-intro">

          <div className="upload-pro-badge">
            RESUME ANALYSIS
          </div>

          <h1>
            Upload your resume
          </h1>

          <p>
            Get a detailed analysis of your
            resume's ATS compatibility, skills,
            structure and content.
          </p>

        </div>


        <div className="upload-pro-grid">

          {/* ==========================
              UPLOAD CARD
          ========================== */}

          <section className="upload-pro-card">

            {!file ? (

              <div
                className={`upload-drop-zone ${
                  dragActive
                    ? "drag-active"
                    : ""
                }`}
                onClick={handleBrowse}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  hidden
                />

                <div className="upload-cloud-icon">
                  ↑
                </div>

                <h2>
                  Drop your resume here
                </h2>

                <p>
                  or click to browse from your
                  computer
                </p>

                <div className="upload-format-row">

                  <span>
                    PDF
                  </span>

                  <span>
                    DOCX
                  </span>

                  <small>
                    Max 10 MB
                  </small>

                </div>

              </div>

            ) : (

              <div className="selected-resume-card">

                <div className="selected-resume-top">

                  <div className="selected-file-icon">
                    {getFileType(file.name)}
                  </div>

                  <div className="selected-file-info">

                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        file.size
                      )}{" "}
                      • Ready to analyze
                    </span>

                  </div>

                  <button
                    className="remove-file-button"
                    onClick={removeFile}
                    type="button"
                  >
                    ×
                  </button>

                </div>


                <div className="file-ready-message">

                  <span>
                    ✓
                  </span>

                  <div>
                    <strong>
                      Resume ready
                    </strong>

                    <p>
                      Your file passed the
                      format and size checks.
                    </p>
                  </div>

                </div>


                <button
                  className="change-file-button"
                  onClick={handleBrowse}
                  type="button"
                >
                  Choose a different file
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  hidden
                />

              </div>

            )}


            {/* ERROR */}

            {error && (

              <div className="upload-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>

            )}


            {/* ANALYZE */}

            <button
              className="upload-analyze-button"
              onClick={handleAnalyze}
              disabled={
                !file || loading
              }
            >

              {loading ? (

                <>
                  <span className="upload-spinner"></span>

                  Analyzing your resume...
                </>

              ) : (

                <>
                  Analyze Resume
                  <span>→</span>
                </>

              )}

            </button>


            <p className="upload-privacy-note">
              Your resume is processed to generate
              analysis and insights.
            </p>

          </section>


          {/* ==========================
              WHAT YOU GET
          ========================== */}

          <section className="upload-benefits-card">

            <div className="upload-benefits-heading">

              <span>
                WHAT YOU'LL GET
              </span>

              <h2>
                Understand your resume
              </h2>

              <p>
                Our analyzer checks the areas
                recruiters and ATS systems care
                about.
              </p>

            </div>


            <div className="upload-benefit-list">

              <div className="upload-benefit">

                <div className="benefit-icon purple">
                  %
                </div>

                <div>
                  <strong>
                    Overall Resume Score
                  </strong>

                  <span>
                    See how strong your resume is.
                  </span>
                </div>

              </div>


              <div className="upload-benefit">

                <div className="benefit-icon blue">
                  ✓
                </div>

                <div>
                  <strong>
                    ATS Compatibility
                  </strong>

                  <span>
                    Find formatting and keyword issues.
                  </span>
                </div>

              </div>


              <div className="upload-benefit">

                <div className="benefit-icon green">
                  ◆
                </div>

                <div>
                  <strong>
                    Skills Analysis
                  </strong>

                  <span>
                    Identify strong and missing skills.
                  </span>
                </div>

              </div>


              <div className="upload-benefit">

                <div className="benefit-icon orange">
                  ↗
                </div>

                <div>
                  <strong>
                    Improvement Suggestions
                  </strong>

                  <span>
                    Get actionable recommendations.
                  </span>
                </div>

              </div>

            </div>


            <div className="upload-tip-card">

              <div>
                ✦
              </div>

              <p>
                <strong>
                  Tip
                </strong>

                Use your most recent resume
                version for the most useful
                analysis.
              </p>

            </div>

          </section>

        </div>


        {/* PROCESS */}

        <div className="upload-process">

          <div className="process-step active">
            <span>1</span>
            Upload
          </div>

          <div className="process-line"></div>

          <div className="process-step">
            <span>2</span>
            Analyze
          </div>

          <div className="process-line"></div>

          <div className="process-step">
            <span>3</span>
            Improve
          </div>

        </div>

      </main>

    </div>
  );
}

export default UploadResume;