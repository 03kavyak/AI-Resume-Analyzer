from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


class ResumeAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Connect analysis to a user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    resume_name = db.Column(
        db.String(255),
        nullable=False
    )
    resume_text = db.Column(db.Text, nullable=True)
    analysis_data = db.Column(db.Text, nullable=True)

    overall_score = db.Column(
        db.Integer,
        default=0
    )

    ats_score = db.Column(
        db.Integer,
        default=0
    )

    content_score = db.Column(
        db.Integer,
        default=0
    )

    structure_score = db.Column(
        db.Integer,
        default=0
    )

    readability_score = db.Column(
        db.Integer,
        default=0
    )

    quantifiable_score = db.Column(
        db.Integer,
        default=0
    )

    job_match_score = db.Column(
        db.Integer,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )