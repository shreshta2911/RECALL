from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.services.reasoning import analyze_incident
from backend.services.memory import store_memory


app = FastAPI(
    title="RECALL",
    description="Engineering Organizational Memory",
    version="1.0.0"
)


# Allow the Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Request Models
# -------------------------

class AnalyzeRequest(BaseModel):
    problem: str
    current_context: str = ""


class LessonRequest(BaseModel):
    lesson: str
    context: str = ""


# -------------------------
# Health Check
# -------------------------

@app.get("/")
def root():
    return {
        "name": "RECALL",
        "status": "running",
        "description": "Engineering Organizational Memory"
    }


# -------------------------
# Incident Analysis
# -------------------------

@app.post("/analyze")
def analyze(request: AnalyzeRequest):

    result = analyze_incident(
        problem=request.problem,
        current_context=request.current_context
    )

    return {
        "problem": result["problem"],
        "current_context": result["current_context"],
        "recommendation": result["recommendation"],
        "historical_evidence": result["evidence"]
    }


# -------------------------
# Save New Lesson
# -------------------------

@app.post("/lessons")
def save_lesson(request: LessonRequest):

    store_memory(
        content=request.lesson,
        context=request.context
    )

    return {
        "status": "saved",
        "message": "Lesson retained in Hindsight.",
        "lesson": request.lesson
    }