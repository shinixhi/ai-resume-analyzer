from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import pypdf
import os
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSION = ".pdf"

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.lower().endswith(ALLOWED_EXTENSION):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF files are supported."
        )
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum allowed size is 5MB."
        )

    try:
        pdf_reader = pypdf.PdfReader(file.file)
        resume_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                resume_text += text + "\n"
                
        if not resume_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract text from the provided PDF file."
            )

        prompt = f"""
        You are an expert ATS (Applicant Tracking System) optimization algorithm.
        Analyze the following resume against the provided job description.
        
        Resume:
        {resume_text}
        
        Job Description:
        {job_description}
        
        Provide the analysis strictly in JSON format matching this schema exactly:
        {{
            "match_score": int (0 to 100),
            "summary": "string summarizing the fit overview",
            "missing_keywords": ["string", "string"]
        }}
        """

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        result_data = json.loads(response.text)
        return result_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal processing error: {str(e)}"
        )