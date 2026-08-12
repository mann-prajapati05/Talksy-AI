"""
Pydantic request models for the FastAPI interview endpoints.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class QuestionSchema(BaseModel):
    question: str
    difficulty: str
    questionType: str
    timeLimit: int = Field(ge=15, le=300)


class CandidateContext(BaseModel):
    role: str
    experience: str
    mode: str
    skills: str = ""
    projects: str = ""
    exp: str = ""
    resumeText: str = ""


class StartInterviewRequest(BaseModel):
    """Request body for POST /api/v1/interview/start"""

    role: str
    experience: str
    mode: str
    skills: str = ""
    projects: str = ""
    exp: str = ""
    resumeText: str = ""


class AnswerRequest(BaseModel):
    """Request body for POST /api/v1/interview/answer"""

    interviewId: str = ""

    cur_question: QuestionSchema
    cur_answer: str

    prev_summary: Optional[str] = None

    follow_up_allowed: bool = False
    follow_up_context: str = ""
    follow_up_cnt: int = Field(ge=0, default=0)
    follow_up_score: float = Field(ge=0, le=1, default=0.0)

    recent_topic: str = ""
    topic_coverage: str = ""

    next_focus: str = "initial_assessment"
    next_topic: str = ""
    next_difficulty: str = "easy"
    next_question_type: str = "technical"

    candidate: CandidateContext
