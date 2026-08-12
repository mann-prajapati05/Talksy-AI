"""
FastAPI interview endpoints.

POST /api/v1/interview/start  — Generate first question
POST /api/v1/interview/answer — Process candidate answer
GET  /api/v1/health           — Health check
"""

import logging
import traceback

from fastapi import APIRouter, HTTPException

from app.schemas.requests import StartInterviewRequest, AnswerRequest
from app.schemas.responses import (
    StartInterviewResponse,
    AnswerInterviewResponse,
    QuestionResponse,
    EvaluationResponse,
    StrategyResponse,
)
from app.graph.start_workflow import start_workflow
from app.graph.answer_workflow import answer_workflow
from app.graph.state import InterviewState

logger = logging.getLogger("agentic")

router = APIRouter(prefix="/api/v1")


# ==================================================
# Experience / Mode mapping helpers
# ==================================================

EXPERIENCE_MAP = {
    "fresher": "fresher",
    "junior": "junior",
    "mid": "mid",
    "senior": "senior",
    # Map existing DB values
    "1-3 years": "junior",
    "3+ years": "senior",
}

MODE_MAP = {
    "technical": "technical",
    "hr": "hr",
    "mixed": "mixed",
}


def normalize_experience(raw: str) -> str:
    return EXPERIENCE_MAP.get(raw.strip().lower(), "fresher")


def normalize_mode(raw: str) -> str:
    return MODE_MAP.get(raw.strip().lower(), "mixed")


def select_initial_question_type(mode: str) -> str:
    if mode == "technical":
        return "technical"
    elif mode == "hr":
        return "hr"
    else:
        return "technical"


# ==================================================
# Health
# ==================================================

@router.get("/health")
async def health():
    return {"status": "ok"}


# ==================================================
# Start Interview
# ==================================================

@router.post("/interview/start", response_model=StartInterviewResponse)
async def start_interview(request: StartInterviewRequest):

    logger.info("[Agentic] start_workflow requested")

    try:
        experience = normalize_experience(request.experience)
        mode = normalize_mode(request.mode)

        initial_state: InterviewState = {

            # Interview Configuration
            "role": request.role,
            "experience": experience,
            "mode": mode,

            # Candidate Context
            "skills": request.skills or "",
            "projects": request.projects or "",
            "exp": request.exp or "",
            "resumeText": request.resumeText or "",

            # Interview Memory
            "prev_summary": None,

            # Current Q/A
            "cur_question": None,
            "cur_answer": None,
            "cur_feedback": None,

            # Follow-up / Strategy
            "follow_up_allowed": False,
            "follow_up_context": "",
            "follow_up_cnt": 0,
            "follow_up_score": 0.0,

            "recent_topic": "",
            "topic_coverage": "",

            # Question Strategy
            "next_focus": "initial_assessment",
            "next_topic": "core fundamentals",
            "next_difficulty": "easy",
            "next_question_type": select_initial_question_type(mode),

            # Next Question
            "next_question": None,

            # Current 3C Evaluation
            "confidence_feedback": None,
            "communication_feedback": None,
            "correctness_feedback": None,

            "confidence_score": None,
            "communication_score": None,
            "correctness_score": None,

            # Overall Evaluation
            "overall_feedback": None,
            "overall_score": None,

            # Updated Memory
            "summary": None,
        }

        result = start_workflow.invoke(initial_state)

        next_q = result.get("next_question")
        if not next_q:
            raise ValueError("start_workflow did not produce a next_question")

        logger.info("[Agentic] start_workflow completed successfully")

        return StartInterviewResponse(
            success=True,
            next_question=QuestionResponse(
                question=next_q["question"],
                difficulty=next_q["difficulty"],
                questionType=next_q["questionType"],
                timeLimit=next_q["timeLimit"],
            ),
        )

    except Exception as e:
        logger.error(
            f"[Agentic] start_workflow failed: {e}\n{traceback.format_exc()}"
        )
        raise HTTPException(
            status_code=500,
            detail=f"Agentic workflow failed: {str(e)}"
        )


# ==================================================
# Process Answer
# ==================================================

@router.post("/interview/answer", response_model=AnswerInterviewResponse)
async def process_answer(request: AnswerRequest):

    logger.info("[Agentic] answer_workflow requested")

    try:
        experience = normalize_experience(request.candidate.experience)
        mode = normalize_mode(request.candidate.mode)

        # Normalize question type for internal use
        q_type = request.cur_question.questionType.lower()
        # Map existing DB types to agentic types
        type_map = {
            "technical": "technical",
            "behavioral": "behavioral",
            "project": "technical",
            "scenario": "situational",
            "situational": "situational",
            "hr": "hr",
        }
        normalized_q_type = type_map.get(q_type, "technical")

        state: InterviewState = {

            # Interview Configuration
            "role": request.candidate.role,
            "experience": experience,
            "mode": mode,

            # Candidate Context
            "skills": request.candidate.skills or "",
            "projects": request.candidate.projects or "",
            "exp": request.candidate.exp or "",
            "resumeText": request.candidate.resumeText or "",

            # Interview Memory
            "prev_summary": request.prev_summary,

            # Current Q/A
            "cur_question": {
                "question": request.cur_question.question,
                "difficulty": request.cur_question.difficulty.lower(),
                "questionType": normalized_q_type,
                "timeLimit": request.cur_question.timeLimit,
            },
            "cur_answer": request.cur_answer,
            "cur_feedback": None,

            # Follow-up / Strategy
            "follow_up_allowed": request.follow_up_allowed,
            "follow_up_context": request.follow_up_context,
            "follow_up_cnt": request.follow_up_cnt,
            "follow_up_score": request.follow_up_score,

            "recent_topic": request.recent_topic,
            "topic_coverage": request.topic_coverage,

            # Question Strategy
            "next_focus": request.next_focus,
            "next_topic": request.next_topic,
            "next_difficulty": request.next_difficulty.lower(),
            "next_question_type": type_map.get(
                request.next_question_type.lower(), "technical"
            ),

            # Next Question (will be generated)
            "next_question": None,

            # Current 3C Evaluation (will be generated)
            "confidence_feedback": None,
            "communication_feedback": None,
            "correctness_feedback": None,

            "confidence_score": None,
            "communication_score": None,
            "correctness_score": None,

            # Overall Evaluation (will be generated)
            "overall_feedback": None,
            "overall_score": None,

            # Updated Memory (will be generated)
            "summary": None,
        }

        result = answer_workflow.invoke(state)

        next_q = result.get("next_question")
        if not next_q:
            raise ValueError("answer_workflow did not produce a next_question")

        # Determine follow_up_cnt for response
        follow_up_cnt = request.follow_up_cnt
        if result.get("follow_up_allowed"):
            follow_up_cnt += 1
        else:
            follow_up_cnt = 0

        logger.info("[Agentic] answer_workflow completed successfully")

        return AnswerInterviewResponse(
            success=True,
            next_question=QuestionResponse(
                question=next_q["question"],
                difficulty=next_q["difficulty"],
                questionType=next_q["questionType"],
                timeLimit=next_q["timeLimit"],
            ),
            evaluation=EvaluationResponse(
                confidence_feedback=result.get("confidence_feedback", ""),
                confidence_score=result.get("confidence_score", 0),
                communication_feedback=result.get("communication_feedback", ""),
                communication_score=result.get("communication_score", 0),
                correctness_feedback=result.get("correctness_feedback", ""),
                correctness_score=result.get("correctness_score", 0),
                overall_feedback=result.get("overall_feedback", ""),
                overall_score=result.get("overall_score", 0),
            ),
            strategy=StrategyResponse(
                follow_up_allowed=result.get("follow_up_allowed", False),
                follow_up_context=result.get("follow_up_context", ""),
                follow_up_cnt=follow_up_cnt,
                follow_up_score=result.get("follow_up_score", 0),
                recent_topic=result.get("recent_topic", ""),
                topic_coverage=result.get("topic_coverage", ""),
                next_focus=result.get("next_focus", ""),
                next_topic=result.get("next_topic", ""),
                next_difficulty=result.get("next_difficulty", "easy"),
                next_question_type=result.get("next_question_type", "technical"),
            ),
            summary=result.get("summary"),
        )

    except Exception as e:
        logger.error(
            f"[Agentic] answer_workflow failed: {e}\n{traceback.format_exc()}"
        )
        raise HTTPException(
            status_code=500,
            detail=f"Agentic workflow failed: {str(e)}"
        )
