import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

from resume_parser import extract_text
from ai_analyzer import analyze_resume
from jd_matcher import match_resume_to_job
from database import db, ResumeAnalysis
from database import db, ResumeAnalysis, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask import send_file
from report_generator import generate_report
import json

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///resume_analyzer.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Upload configuration

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Home

@app.route("/")
def home():
    return jsonify({
        "message": "AI Resume Analyzer Backend is running!"
    })

# Health check

@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "message": "Backend connected successfully"
    })

# Resume Analysis

@app.route("/api/analyze", methods=["POST"])
def analyze():

    # Check if resume was provided

    if "resume" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No resume file provided."
        }), 400

    file = request.files["resume"]
    user_id = request.form.get("user_id")

    # Validate user ID

    if not user_id:
        return jsonify({
            "status": "error",
            "message": "User ID is required."
        }), 401

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid user ID."
        }), 400

    # Check that user actually exists
    
    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    # Check filename

    if file.filename == "":
        return jsonify({
            "status": "error",
            "message": "No file selected."
        }), 400

    # Secure filename

    filename = secure_filename(file.filename)

    # Check file extension

    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({
            "status": "error",
            "message": "Invalid file type. Please upload a PDF or DOCX file."
        }), 400

    # Save uploaded file

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )
    try:

        file.save(file_path)

        print(f"Resume saved: {file_path}")

        # Extract resume text

        resume_text = extract_text(file_path)

        if not resume_text or not resume_text.strip():
            return jsonify({
                "status": "error",
                "message": "Could not extract readable text from the resume."
            }), 400

        print("Resume text extracted successfully.")
        print(f"Extracted characters: {len(resume_text)}")

        # Analyze resume

        print("Sending resume to AI analyzer...")

        analysis = analyze_resume(resume_text)

        print("AI analysis completed successfully.")

        # Save complete analysis to database

        saved_analysis = ResumeAnalysis(
    user_id=user_id,
    resume_name=filename,
    overall_score=analysis.get("overall_score", 0),
    ats_score=analysis.get("ats_score", 0),
    content_score=analysis.get("content_score", 0),
    structure_score=analysis.get("structure_score", 0),
    readability_score=analysis.get("readability_score", 0),
    quantifiable_score=analysis.get("quantifiable_score", 0),
    analysis_json=json.dumps({
        "filename": filename,
        "resume_text": resume_text,
        "analysis": analysis
    })
)

        db.session.add(saved_analysis)
        db.session.commit()

        print(
            f"Analysis saved successfully. ID: {saved_analysis.id}"
        )

        # Return result

        return jsonify({
            "status": "success",
            "message": "Resume analyzed successfully.",

            "analysis_id": saved_analysis.id,

            "filename": filename,

            "resume_text": resume_text,

            "analysis": analysis
        }), 200

    except Exception as e:

        db.session.rollback()

        print("ANALYZE ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Resume analysis failed.",
            "error": str(e)
        }), 500

@app.route("/api/analysis/<int:analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({
                "status": "error",
                "message": "User ID is required."
            }), 401

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Invalid user ID."
            }), 400

        # Fetch only this user's requested analysis
        record = ResumeAnalysis.query.filter_by(
            id=analysis_id,
            user_id=user_id
        ).first()

        if not record:
            return jsonify({
                "status": "error",
                "message": "Analysis not found."
            }), 404

        # The analyze route currently saves the full report here
        saved_data = {}

        if record.analysis_json:
            saved_data = json.loads(record.analysis_json)
        elif record.analysis_data:
            # Backward compatibility with older records
            saved_data = json.loads(record.analysis_data)

        # Support both the new and older storage formats
        if isinstance(saved_data.get("analysis"), dict):
            analysis_result = saved_data["analysis"]
        else:
            analysis_result = saved_data

        return jsonify({
            "status": "success",
            "analysis_id": record.id,
            "filename": saved_data.get(
                "filename",
                record.resume_name
            ),
            "resume_text": saved_data.get(
                "resume_text",
                record.resume_text or ""
            ),
            "analysis": analysis_result,
            "created_at": (
                record.created_at.strftime("%Y-%m-%d %H:%M")
                if record.created_at else ""
            )
        }), 200

    except Exception as e:
        print("GET ANALYSIS ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Could not load analysis.",
            "error": str(e)
        }), 500
        
@app.route("/api/analysis/<int:analysis_id>/report", methods=["GET"])
def download_report(analysis_id):

    try:
        # Get user ID

        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({
                "status": "error",
                "message": "User ID is required."
            }), 401

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Invalid user ID."
            }), 400

        # Find analysis belonging to user

        analysis_record = ResumeAnalysis.query.filter_by(
            id=analysis_id,
            user_id=user_id
        ).first()

        if not analysis_record:

            return jsonify({
                "status": "error",
                "message": "Analysis not found."
            }), 404

        # Load analysis JSON

        import json

        if not analysis_record.analysis_data:

            return jsonify({
                "status": "error",
                "message": "Analysis report data is not available."
            }), 404

        analysis_data = json.loads(
            analysis_record.analysis_data
        )

        # Create report filename

        safe_name = os.path.splitext(
            analysis_record.resume_name
        )[0]

        report_filename = (
            f"{safe_name}_Resume_Analysis.pdf"
        )

        report_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            report_filename
        )

        # Generate PDF

        generate_report(
            output_path=report_path,
            filename=analysis_record.resume_name,
            analysis=analysis_data,
            created_at=(
                analysis_record.created_at.strftime(
                    "%Y-%m-%d %H:%M"
                )
                if analysis_record.created_at
                else None
            )
        )

        print(
            f"PDF report generated: {report_path}"
        )

        # Send PDF

        return send_file(
            report_path,
            as_attachment=True,
            download_name=report_filename,
            mimetype="application/pdf"
        )

    except Exception as e:

        print(
            "DOWNLOAD REPORT ERROR:",
            str(e)
        )

        return jsonify({
            "status": "error",
            "message": "Could not generate report.",
            "error": str(e)
        }), 500
             
@app.route("/api/match-job", methods=["POST"])
def match_job():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided."
            }), 400

        resume_text = data.get("resume_text", "")
        job_description = data.get("job_description", "")

        if not resume_text.strip():
            return jsonify({
                "status": "error",
                "message": "Resume text is missing."
            }), 400

        if not job_description.strip():
            return jsonify({
                "status": "error",
                "message": "Job description is missing."
            }), 400

        print("Starting job matching...")

        result = match_resume_to_job(
            resume_text,
            job_description
        )

        print("Job matching completed.")

        return jsonify({
            "status": "success",
            "message": "Job match completed successfully.",
            "result": result
        })

    except Exception as e:

        print("JOB MATCH ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Job matching failed.",
            "error": str(e)
        }), 500
        
@app.route("/api/history", methods=["GET"])
def history():

    user_id = request.args.get("user_id")

    if not user_id:
                return jsonify({
        "status": "error",
        "message": "User ID is required."
    }), 401

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({
        "status": "error",
        "message": "Invalid user ID."
    }), 400

    analyses = ResumeAnalysis.query.filter_by(
    user_id=user_id
).order_by(
    ResumeAnalysis.created_at.desc()
).all()

    history_data = []

    for item in analyses:

        history_data.append({
            "id": item.id,
            "resume_name": item.resume_name,
            "overall_score": item.overall_score,
            "ats_score": item.ats_score,
            "content_score": item.content_score,
            "structure_score": item.structure_score,
            "readability_score": item.readability_score,
            "quantifiable_score": item.quantifiable_score,
            "job_match_score": item.job_match_score,
            "created_at": item.created_at.strftime(
                "%Y-%m-%d %H:%M"
            )
        })

    return jsonify({
        "status": "success",
        "history": history_data
    })

@app.route("/api/signup", methods=["POST"])
def signup():

    try:
        data = request.get_json()

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({
                "status": "error",
                "message": "All fields are required."
            }), 400

        if len(password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must contain at least 6 characters."
            }), 400

        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:
            return jsonify({
                "status": "error",
                "message": "An account with this email already exists."
            }), 409

        hashed_password = generate_password_hash(password)

        user = User(
            name=name,
            email=email,
            password=hashed_password
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Account created successfully."
        }), 201

    except Exception as e:

        db.session.rollback()

        print("SIGNUP ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Signup failed."
        }), 500
        
@app.route("/api/login", methods=["POST"])
def login():

    try:
        data = request.get_json()

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required."
            }), 400

        user = User.query.filter_by(
            email=email
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 401

        if not check_password_hash(
            user.password,
            password
        ):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 401

        return jsonify({
            "status": "success",
            "message": "Login successful.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        })

    except Exception as e:

        print("LOGIN ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Login failed."
        }), 500
         
@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        # -----------------------------
        # Get user ID
        # -----------------------------
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({
                "status": "error",
                "message": "User ID is required."
            }), 401

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Invalid user ID."
            }), 400

        # -----------------------------
        # Find user
        # -----------------------------
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            }), 404

        # -----------------------------
        # Get user's resume analyses
        # -----------------------------
        analyses = (
            ResumeAnalysis.query
            .filter_by(user_id=user_id)
            .order_by(ResumeAnalysis.created_at.desc())
            .all()
        )

        # -----------------------------
        # User has no analyses
        # -----------------------------
        if not analyses:
            return jsonify({
                "status": "success",

                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                },

                "stats": {
                    "latest_score": 0,
                    "best_score": 0,
                    "total_analyses": 0,
                    "ats_score": 0
                },

                "recent_analyses": []
            }), 200

        # -----------------------------
        # Latest analysis
        # -----------------------------
        latest = analyses[0]

        # -----------------------------
        # Best overall score
        # -----------------------------
        best_score = max(
            (item.overall_score or 0)
            for item in analyses
        )

        # -----------------------------
        # Recent 5 analyses
        # -----------------------------
        recent_analyses = []

        for item in analyses[:5]:

            recent_analyses.append({
                "id": item.id,
                "resume_name": item.resume_name,

                "overall_score": item.overall_score or 0,
                "ats_score": item.ats_score or 0,
                "content_score": item.content_score or 0,
                "structure_score": item.structure_score or 0,

                "created_at": (
                    item.created_at.strftime("%Y-%m-%d %H:%M")
                    if item.created_at
                    else ""
                )
            })

        # -----------------------------
        # Dashboard response
        # -----------------------------
        return jsonify({
            "status": "success",

            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            },

            "stats": {
                "latest_score": latest.overall_score or 0,
                "best_score": best_score,
                "total_analyses": len(analyses),
                "ats_score": latest.ats_score or 0
            },

            "recent_analyses": recent_analyses
        }), 200

    except Exception as e:

        print("DASHBOARD ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Could not load dashboard.",
            "error": str(e)
        }), 500


# Run Flask

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )