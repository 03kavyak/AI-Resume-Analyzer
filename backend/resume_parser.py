import os
from PyPDF2 import PdfReader
from docx import Document


ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def extract_text(file_path):
    """
    Extract text from PDF or DOCX resume.
    """

    extension = os.path.splitext(file_path)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Please upload a PDF or DOCX file.")

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)


def extract_pdf_text(file_path):
    try:
        reader = PdfReader(file_path)

        if not reader.pages:
            raise ValueError("The PDF contains no pages.")

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        text = text.strip()

        if not text:
            raise ValueError(
                "Could not extract text from this PDF. "
                "The file may be empty, scanned, or unreadable."
            )

        return text

    except Exception as e:
        if isinstance(e, ValueError):
            raise

        raise ValueError("Failed to read the PDF file.")


def extract_docx_text(file_path):
    try:
        document = Document(file_path)

        paragraphs = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        text = "\n".join(paragraphs).strip()

        if not text:
            raise ValueError(
                "Could not extract text from this DOCX file. "
                "The document may be empty."
            )

        return text

    except Exception as e:
        if isinstance(e, ValueError):
            raise

        raise ValueError("Failed to read the DOCX file.")