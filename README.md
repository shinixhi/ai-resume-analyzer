# AI Resume & ATS Analyzer

A full-stack web application that analyzes resumes against target job descriptions using Gemini AI to provide an ATS fit score, executive overview, and missing keywords.

## 🚀 Features
* **PDF Parsing**: Upload your resume securely in PDF format.
* **Intelligent Analysis**: Compares resume text against custom job descriptions.
* **Instant Feedback**: Provides an overall ATS alignment percentage and keyword recommendations.

## 🛠️ Tech Stack
* **Frontend**: React, Vite, Tailwind CSS
* **Backend**: FastAPI (Python), Uvicorn
* **AI Engine**: Google Gemini API

## 💻 Local Setup

### 1. Backend Setup
```bash
cd ai-resume-analyzer
$env:GEMINI_API_KEY="YOUR_API_KEY"
py -m uvicorn main:app --reload
```
### 2. Frontend Setup
```bash
cd ai-resume-frontend
npm install
npm run dev
```
