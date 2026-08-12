"""
LangGraph interview state definitions.

Copied directly from the talksy_v2.ipynb notebook.
"""

from typing import TypedDict, Literal


class Question(TypedDict):

    question: str

    difficulty: Literal[
        "easy",
        "medium",
        "hard"
    ]

    questionType: Literal[
        "technical",
        "behavioral",
        "project",
        "scenario",
        "situational",
        "hr"
    ]

    timeLimit: int


class InterviewState(TypedDict):

    # ==================================================
    # Interview Configuration
    # ==================================================

    role: str

    experience: Literal[
        "fresher",
        "junior",
        "mid",
        "senior"
    ]

    mode: Literal[
        "technical",
        "hr",
        "mixed"
    ]


    # ==================================================
    # Candidate Context
    # ==================================================

    skills: str
    projects: str
    exp: str
    resumeText: str


    # ==================================================
    # Interview Memory
    # ==================================================

    prev_summary: str | None


    # ==================================================
    # Current Q/A
    # ==================================================

    cur_question: Question | None
    cur_answer: str | None
    cur_feedback: str | None


    # ==================================================
    # Follow-up / Strategy
    # ==================================================

    follow_up_allowed: bool
    follow_up_context: str
    follow_up_cnt: int
    follow_up_score: float

    recent_topic: str
    topic_coverage: str


    # ==================================================
    # Question Strategy
    # ==================================================

    next_focus: str

    next_topic: str

    next_difficulty: Literal[
        "easy",
        "medium",
        "hard"
    ]

    next_question_type: Literal[
        "technical",
        "behavioral",
        "situational",
        "hr"
    ]


    # ==================================================
    # Next Question
    # ==================================================

    next_question: Question | None


    # ==================================================
    # Current 3C Evaluation
    # ==================================================

    confidence_feedback: str | None
    communication_feedback: str | None
    correctness_feedback: str | None

    confidence_score: float | None
    communication_score: float | None
    correctness_score: float | None


    # ==================================================
    # Overall Evaluation
    # ==================================================

    overall_feedback: str | None
    overall_score: float | None


    # ==================================================
    # Updated Memory
    # ==================================================

    summary: str | None
