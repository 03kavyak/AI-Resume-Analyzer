import re


TECHNICAL_SKILLS = [
    "python", "java", "javascript", "typescript", "c", "c++",
    "html", "css", "react", "react.js", "node.js", "node",
    "django", "flask", "fastapi",
    "sql", "mysql", "postgresql", "mongodb",
    "git", "github", "docker",
    "rest api", "api", "aws", "azure",
    "machine learning", "deep learning",
    "pandas", "numpy", "tensorflow", "pytorch",
    "scikit-learn", "power bi", "excel",
    "figma", "bootstrap", "tailwind"
]

SOFT_SKILLS = [
    "communication", "leadership", "teamwork",
    "problem solving", "problem-solving",
    "time management", "adaptability",
    "collaboration", "creativity",
    "critical thinking", "decision making",
    "decision-making"
]

COMMON_KEYWORDS = [
    "python", "java", "javascript", "react",
    "django", "flask", "sql", "mongodb",
    "git", "github", "api", "html", "css",
    "machine learning", "data analysis",
    "communication", "leadership", "teamwork"
]


def contains_keyword(text, keyword):
    return keyword.lower() in text.lower()


def find_skills(text, skill_list):
    found = []

    for skill in skill_list:
        if contains_keyword(text, skill):
            found.append(skill)

    return found


def extract_section(text, headings):
    """
    Extract text belonging to a resume section.
    """

    lines = text.splitlines()

    start_index = None

    for i, line in enumerate(lines):
        clean_line = line.strip().lower()

        if clean_line in headings:
            start_index = i + 1
            break

    if start_index is None:
        return ""

    section_lines = []

    possible_headings = {
        "summary",
        "professional summary",
        "profile",
        "objective",
        "skills",
        "technical skills",
        "experience",
        "work experience",
        "professional experience",
        "education",
        "projects",
        "certifications",
        "certificates",
        "achievements"
    }

    for line in lines[start_index:]:
        clean_line = line.strip().lower()

        if clean_line in possible_headings:
            break

        section_lines.append(line)

    return "\n".join(section_lines).strip()


def calculate_keyword_score(text):
    words = re.findall(r"\b\w+\b", text.lower())

    if not words:
        return 0

    unique_words = set(words)

    useful_keywords = 0

    for keyword in COMMON_KEYWORDS:
        keyword_words = keyword.lower().split()

        if all(word in unique_words for word in keyword_words):
            useful_keywords += 1

    score = min(100, useful_keywords * 8)

    return score


def calculate_achievement_score(text):
    """
    Checks whether resume contains measurable achievements.
    """

    patterns = [
        r"\d+%",
        r"\d+\+",
        r"\b\d+\s*(users|customers|projects|members|people)\b",
        r"\b(increased|decreased|improved|reduced|achieved|saved)\b",
        r"\b\d+\s*(days|months|years)\b"
    ]

    matches = 0

    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            matches += 1

    return min(100, matches * 20)


def calculate_structure_score(text):
    required_sections = {
        "summary": [
            "summary",
            "professional summary",
            "profile",
            "objective"
        ],
        "skills": [
            "skills",
            "technical skills"
        ],
        "experience": [
            "experience",
            "work experience",
            "professional experience"
        ],
        "education": [
            "education"
        ],
        "projects": [
            "projects"
        ]
    }

    found = 0

    lower_text = text.lower()

    for section_names in required_sections.values():
        if any(section in lower_text for section in section_names):
            found += 1

    return int((found / len(required_sections)) * 100)


def calculate_readability_score(text):
    words = re.findall(r"\b\w+\b", text)

    if len(words) < 100:
        return 60

    if len(words) > 1200:
        return 70

    return 85


def generate_strengths(
    text,
    technical_skills,
    soft_skills,
    structure_score,
    achievement_score
):

    strengths = []

    if technical_skills:
        strengths.append(
            f"Good technical skill coverage including {', '.join(technical_skills[:5])}."
        )

    if soft_skills:
        strengths.append(
            f"Soft skills identified: {', '.join(soft_skills[:4])}."
        )

    if structure_score >= 80:
        strengths.append(
            "Resume contains most of the important sections expected by recruiters."
        )

    if achievement_score >= 60:
        strengths.append(
            "Resume includes measurable achievements or action-oriented statements."
        )

    if len(text.split()) >= 250:
        strengths.append(
            "Resume contains sufficient content to evaluate the candidate."
        )

    if not strengths:
        strengths.append(
            "Resume provides basic information that can be further improved."
        )

    return strengths


def generate_weaknesses(
    text,
    structure_score,
    achievement_score,
    technical_skills
):

    weaknesses = []

    lower_text = text.lower()

    if structure_score < 80:
        weaknesses.append(
            "Some important resume sections are missing or not clearly identified."
        )

    if achievement_score < 60:
        weaknesses.append(
            "Resume could include more measurable achievements using numbers, percentages, or results."
        )

    if "summary" not in lower_text and "objective" not in lower_text:
        weaknesses.append(
            "A professional summary or objective is not clearly present."
        )

    if not technical_skills:
        weaknesses.append(
            "Technical skills are not clearly identified."
        )

    if len(text.split()) < 200:
        weaknesses.append(
            "Resume content appears relatively short and could provide more relevant details."
        )

    if not weaknesses:
        weaknesses.append(
            "Minor improvements can be made to wording and keyword optimization."
        )

    return weaknesses


def generate_missing_keywords(technical_skills, text):

    missing = []

    lower_text = text.lower()

    recommended = [
        "python",
        "sql",
        "git",
        "github",
        "rest api",
        "problem solving",
        "communication",
        "teamwork"
    ]

    for keyword in recommended:
        if keyword not in lower_text:
            missing.append(keyword)

    return missing[:8]


def generate_ats_issues(text, structure_score):

    issues = []

    lower_text = text.lower()

    if structure_score < 80:
        issues.append(
            "Some standard resume sections may not be clearly recognizable."
        )

    if not any(word in lower_text for word in ["experience", "work experience"]):
        issues.append(
            "Experience section is not clearly identified."
        )

    if "skills" not in lower_text:
        issues.append(
            "Skills section is not clearly identified."
        )

    if len(text.split()) < 150:
        issues.append(
            "Resume contains limited text, which may reduce keyword coverage."
        )

    if not issues:
        issues.append(
            "No major text-based ATS issues detected."
        )

    return issues


def generate_ats_suggestions(missing_keywords):

    suggestions = [
        "Use clear standard headings such as Summary, Skills, Experience, Projects and Education.",
        "Use simple text formatting and avoid excessive graphics or decorative elements.",
        "Include relevant keywords naturally throughout the resume.",
        "Use action verbs when describing experience and projects."
    ]

    if missing_keywords:
        suggestions.append(
            "Consider adding relevant missing keywords when they genuinely match your experience."
        )

    return suggestions


def generate_improvements(
    achievement_score,
    structure_score,
    missing_keywords,
    technical_skills
):

    improvements = []

    if achievement_score < 60:
        improvements.append({
            "priority": "High",
            "area": "Achievements",
            "suggestion": (
                "Rewrite experience and project bullets to describe results "
                "using measurable numbers when the real information is available."
            )
        })

    if structure_score < 80:
        improvements.append({
            "priority": "High",
            "area": "Structure",
            "suggestion": (
                "Organize the resume using clear sections such as Summary, "
                "Skills, Experience, Projects and Education."
            )
        })

    if not technical_skills:
        improvements.append({
            "priority": "High",
            "area": "Skills",
            "suggestion": (
                "Add a clearly labeled technical skills section containing "
                "technologies you actually know."
            )
        })

    if missing_keywords:
        improvements.append({
            "priority": "Medium",
            "area": "Keywords",
            "suggestion": (
                "Add relevant keywords from your target roles only when "
                "they accurately represent your skills and experience."
            )
        })

    improvements.append({
        "priority": "Medium",
        "area": "Readability",
        "suggestion": (
            "Keep bullet points concise and start them with strong action verbs."
        )
    })

    return improvements


def generate_section_feedback(text):

    summary = extract_section(
        text,
        ["summary", "professional summary", "profile", "objective"]
    )

    experience = extract_section(
        text,
        ["experience", "work experience", "professional experience"]
    )

    projects = extract_section(
        text,
        ["projects"]
    )

    skills = extract_section(
        text,
        ["skills", "technical skills"]
    )

    education = extract_section(
        text,
        ["education"]
    )

    certifications = extract_section(
        text,
        ["certifications", "certificates"]
    )

    return {
        "summary": (
            "Summary section detected. Keep it concise and focused on "
            "your strongest skills and career direction."
            if summary
            else
            "Add a concise professional summary describing your skills, "
            "experience and career direction."
        ),

        "experience": (
            "Experience section detected. Focus each bullet on actions, "
            "technologies used and measurable results."
            if experience
            else
            "Add a clearly labeled experience section if you have relevant experience."
        ),

        "projects": (
            "Projects section detected. Explain your contribution, technologies "
            "used and the outcome of each project."
            if projects
            else
            "Add relevant projects that demonstrate your technical abilities."
        ),

        "skills": (
            "Skills section detected. Keep skills relevant to your target roles "
            "and organize them clearly."
            if skills
            else
            "Add a clearly labeled skills section."
        ),

        "education": (
            "Education section detected. Keep the most relevant qualification "
            "details concise."
            if education
            else
            "Add your relevant educational qualifications."
        ),

        "certifications": (
            "Certification section detected. Include certifications that are "
            "relevant to the roles you are targeting."
            if certifications
            else
            "Add relevant certifications if you have completed any."
        )
    }


def analyze_resume(resume_text):

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty.")

    text = resume_text.strip()

    technical_skills = find_skills(text, TECHNICAL_SKILLS)
    soft_skills = find_skills(text, SOFT_SKILLS)

    structure_score = calculate_structure_score(text)
    achievement_score = calculate_achievement_score(text)
    readability_score = calculate_readability_score(text)
    keyword_score = calculate_keyword_score(text)

    content_score = int(
        (keyword_score + achievement_score + 70) / 3
    )

    content_score = min(100, max(0, content_score))

    ats_issues = generate_ats_issues(
        text,
        structure_score
    )

    ats_score = int(
        (structure_score + keyword_score + readability_score) / 3
    )

    ats_score = min(100, max(0, ats_score))

    overall_score = int(
        (
            content_score
            + structure_score
            + readability_score
            + ats_score
        ) / 4
    )

    missing_keywords = generate_missing_keywords(
        technical_skills,
        text
    )

    strengths = generate_strengths(
        text,
        technical_skills,
        soft_skills,
        structure_score,
        achievement_score
    )

    weaknesses = generate_weaknesses(
        text,
        structure_score,
        achievement_score,
        technical_skills
    )

    improvements = generate_improvements(
        achievement_score,
        structure_score,
        missing_keywords,
        technical_skills
    )

    section_feedback = generate_section_feedback(text)

    return {
        "overall_score": overall_score,
        "ats_score": ats_score,
        "content_score": content_score,
        "structure_score": structure_score,
        "readability_score": readability_score,
        "quantifiable_score": achievement_score,

        "summary": (
            "The resume was analyzed using content, structure, "
            "keyword, readability and ATS-oriented checks."
        ),

        "strengths": strengths,

        "weaknesses": weaknesses,

        "missing_keywords": missing_keywords,

        "technical_skills": technical_skills,

        "soft_skills": soft_skills,

        "unsupported_skills": [],

        "section_feedback": section_feedback,

        "improvements": improvements,

        "ats_issues": ats_issues,

        "ats_suggestions": generate_ats_suggestions(
            missing_keywords
        )
    }