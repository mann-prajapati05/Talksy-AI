"""
Pydantic response models for the FastAPI interview endpoints.
"""

from typing import Optional
from pydantic import BaseModel


class QuestionResponse(BaseModel):
    question: str
    difficulty: str
    questionType: str
    timeLimit: int


class EvaluationResponse(BaseModel):
    confidence_feedback: str
    confidence_score: float
    communication_feedback: str
    communication_score: float
    correctness_feedback: str
    correctness_score: float
    overall_feedback: str
    overall_score: float


class StrategyResponse(BaseModel):
    follow_up_allowed: bool
    follow_up_context: str
    follow_up_cnt: int
    follow_up_score: float
    recent_topic: str
    topic_coverage: str
    next_focus: str
    next_topic: str
    next_difficulty: str
    next_question_type: str


class StartInterviewResponse(BaseModel):
    success: bool
    next_question: QuestionResponse


class AnswerInterviewResponse(BaseModel):
    success: bool
    next_question: QuestionResponse
    evaluation: EvaluationResponse
    strategy: StrategyResponse
    summary: Optional[str] = None
