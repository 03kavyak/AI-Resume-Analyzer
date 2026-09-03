import re
from ai_analyzer import TECHNICAL_SKILLS, SOFT_SKILLS


def find_skills(text, skill_list):
    text_lower = text.lower()
    found = []

    for skill in skill_list:
        if skill.lower() in text_lower:
            found.append(skill)

    return list(dict.fromkeys(found))


def extract_keywords(text):
    text_lower = text.lower()

    important_terms = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "angular",
        "node.js",
        "django",
        "flask",
        "fastapi",
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "git",
        "github",
        "docker",
        "aws",
        "azure",
        "rest api",
        "machine learning",
        "data analysis",
        "pandas",
        "numpy",
        "tensorflow",
        "pytorch",
        "html",
        "css",
        "communication",
        "leadership",
        "teamwork",
        "problem solving",
        "collaboration",
        "agile",
        "scrum",
        "testing",
        "debugging"
    ]

    keywords = []

    for keyword in important_terms:
        if keyword in text_lower:
            keywords.append(keyword)

    return list(dict.fromkeys(keywords))


def calculate_match_score(resume_skills, job_skills):
    if not job_skills:
        return 0

    matched = set(resume_skills).intersection(set(job_skills))

    return round(
        (len(matched) / len(set(job_skills))) * 100
    )


def experience_gap(resume_text, job_description):

    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()

    gaps = []

    experience_patterns = [
        r"(\d+)\+?\s*years",
        r"(\d+)\+?\s*year"
    ]

    jd_years = []

    for pattern in experience_patterns:
        matches = re.findall(pattern, jd_lower)

        for match in matches:
            try:
                jd_years.append(int(match))
            except ValueError:
                pass

    if jd_years:

        required_years = max(jd_years)

        resume_years = []

        for pattern in experience_patterns:
            matches = re.findall(pattern, resume_lower)

            for match in matches:
                try:
                    resume_years.append(int(match))
                except ValueError:
                    pass

        if resume_years:

            candidate_years = max(resume_years)

            if candidate_years < required_years:
                gaps.append(
                    f"Job description asks for approximately "
                    f"{required_years}+ years of experience."
                )

        else:

            gaps.append(
                f"Job description mentions approximately "
                f"{required_years}+ years of experience."
            )

    return gaps


def generate_recommendations(
    missing_skills,
    missing_keywords,
    experience_gaps
):

    recommendations = []

    if missing_skills:

        recommendations.append({
            "priority": "High",
            "area": "Skills",
            "suggestion":
                "Consider adding missing skills only if you genuinely "
                "have experience with them."
        })

    if missing_keywords:

        recommendations.append({
            "priority": "Medium",
            "area": "Keywords",
            "suggestion":
                "Use relevant job-description keywords naturally in "
                "your resume where they accurately describe your experience."
        })

    if experience_gaps:

        recommendations.append({
            "priority": "High",
            "area": "Experience",
            "suggestion":
                "Review the experience requirements and clearly "
                "highlight relevant experience you already have."
        })

    if not recommendations:

        recommendations.append({
            "priority": "Low",
            "area": "Overall",
            "suggestion":
                "Your resume has good alignment with this job description. "
                "Continue tailoring the resume to the specific role."
        })

    return recommendations


def match_resume_to_job(resume_text, job_description):

    if not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    if not job_description.strip():
        raise ValueError("Job description cannot be empty.")

    resume_skills = find_skills(
        resume_text,
        TECHNICAL_SKILLS + SOFT_SKILLS
    )

    job_skills = find_skills(
        job_description,
        TECHNICAL_SKILLS + SOFT_SKILLS
    )

    matched_skills = list(
        set(resume_skills).intersection(set(job_skills))
    )

    missing_skills = list(
        set(job_skills) - set(resume_skills)
    )

    job_keywords = extract_keywords(job_description)

    resume_lower = resume_text.lower()

    matched_keywords = [
        keyword
        for keyword in job_keywords
        if keyword in resume_lower
    ]

    missing_keywords = [
        keyword
        for keyword in job_keywords
        if keyword not in resume_lower
    ]

    score = calculate_match_score(
        resume_skills,
        job_skills
    )

    gaps = experience_gap(
        resume_text,
        job_description
    )

    recommendations = generate_recommendations(
        missing_skills,
        missing_keywords,
        gaps
    )

    return {
        "match_score": score,
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "matched_keywords": sorted(matched_keywords),
        "missing_keywords": sorted(missing_keywords),
        "experience_gaps": gaps,
        "recommendations": recommendations
    }