import os
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from google import genai
from google.genai import types

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client()

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Process local text translation from user PDF
    try:
        with pdfplumber.open(file.file) as pdf:
            resume_text = "".join([page.extract_text() or "" for page in pdf.pages])
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="The PDF appears to be empty or unreadable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Parsing Error: {str(e)}")

    system_instruction = (
        "You are an expert recruiter and Applicant Tracking System (ATS) optimization expert. "
        "Analyze the provided resume against the job description. Your output must be valid JSON "
        "matching the requested structure perfectly."
    )
    
    user_prompt = f"""
    Target Job Description:
    {job_description}

    Candidate Resume Text:
    {resume_text}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "match_score": {"type": "INTEGER"},
                        "summary": {"type": "STRING"},
                        "missing_keywords": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "formatting_tips": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "strong_points": {"type": "ARRAY", "items": {"type": "STRING"}}
                    },
                    "required": ["match_score", "summary", "missing_keywords", "formatting_tips", "strong_points"]
                }
            )
        )
        
        return json.loads(response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")