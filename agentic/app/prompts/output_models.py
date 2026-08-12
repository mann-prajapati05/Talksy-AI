"""
Pydantic structured output models for LLM responses.

These are used with llm.with_structured_output() to ensure
the LLM returns data in the expected format.
"""

from typing import Literal
from pydantic import BaseModel, Field


class QuestionOutput(BaseModel):

    question: str = Field(
        min_length=10,
        description="The single interview question."
    )

    difficulty: Literal[
        "easy",
        "medium",
        "hard"
    ]

    questionType: Literal[
        "technical",
        "behavioral",
        "situational",
        "hr"
    ]

    timeLimit: int = Field(
        ge=15,
        le=300,
        description="Recommended answer time in seconds."
    )


class ConfidenceEvaluation(BaseModel):

    feedback: str = Field(
        description=(
            "Concise and actionable feedback about the candidate's "
            "confidence while answering."
        )
    )

    score: float = Field(
        ge=0,
        le=10,
        description="Confidence score from 0 to 10."
    )


class CommunicationEvaluation(BaseModel):

    feedback: str = Field(
        description=(
            "Concise and actionable feedback about the candidate's "
            "communication quality."
        )
    )

    score: float = Field(
        ge=0,
        le=10,
        description="Communication score from 0 to 10."
    )


class CorrectnessEvaluation(BaseModel):

    feedback: str = Field(
        description=(
            "Concise, technically accurate, and actionable feedback "
            "about the correctness of the candidate's answer."
        )
    )

    score: float = Field(
        ge=0,
        le=10,
        description="Technical correctness score from 0 to 10."
    )


class OverallEvaluation(BaseModel):

    feedback: str = Field(
        description=(
            "Concise, actionable synthesis of the candidate's "
            "confidence, communication, and correctness evaluation."
        )
    )


class FollowUpDecision(BaseModel):

    follow_up_allowed: bool = Field(
        description=(
            "Whether the next question should directly follow up "
            "on the candidate's current answer."
        )
    )

    follow_up_score: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Strength of the follow-up opportunity. "
            "0 means strongly prefer a new topic, "
            "1 means a very strong follow-up opportunity."
        )
    )

    follow_up_context: str = Field(
        description=(
            "Specific topic, concept, claim, technology, project, "
            "or weakness from the candidate's answer that justifies "
            "a follow-up."
        )
    )

    detected_topic: str = Field(
        description=(
            "The primary topic or concept detected in the "
            "candidate's current answer."
        )
    )

    next_topic: str = Field(
        description=(
            "The topic that the next question should focus on."
        )
    )

    next_focus: Literal[
        "follow_up",
        "new_topic",
        "candidate_weakness",
        "candidate_strength",
        "mixed"
    ] = Field(
        description=(
            "The primary strategic purpose of the next question."
        )
    )

    difficulty: Literal[
        "easy",
        "medium",
        "hard"
    ] = Field(
        description="Difficulty of the next question."
    )

    question_type: Literal[
        "technical",
        "behavioral",
        "project",
        "scenario",
        "hr"
    ] = Field(
        description="Type of the next interview question."
    )

    reasoning: str = Field(
        description=(
            "Concise explanation of why this strategy was selected, "
            "including follow-up relevance, topic diversity, and "
            "difficulty considerations."
        )
    )


class SummaryOutput(BaseModel):

    summary: str = Field(
        min_length=50,
        description=(
            "A compact, structured interview memory containing "
            "candidate strengths, weaknesses, topics covered, recent "
            "topics, performance trends, difficulty behavior, and "
            "future assessment opportunities."
        )
    )
