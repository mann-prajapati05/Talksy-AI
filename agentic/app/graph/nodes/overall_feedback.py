"""
Overall feedback synthesis node.

Calculates deterministic overall score and generates synthesized feedback.
"""

from app.graph.state import InterviewState
from app.graph.utils import format_question
from app.llm.model import llm
from app.prompts.templates import OVERALL_FEEDBACK_PROMPT
from app.prompts.output_models import OverallEvaluation


def overall_feedback(
    state: InterviewState,
) -> dict:

    # -----------------------------------------------
    # 1. Calculate deterministic overall score
    # -----------------------------------------------

    overall_score = round(
        (
            state["correctness_score"] * 0.50
            + state["communication_score"] * 0.30
            + state["confidence_score"] * 0.20
        ),
        2,
    )


    # -----------------------------------------------
    # 2. Generate overall feedback
    # -----------------------------------------------

    overall_llm = llm.with_structured_output(
        OverallEvaluation
    )

    prompt = OVERALL_FEEDBACK_PROMPT.format(

        role=state["role"],

        experience=state["experience"],

        question=format_question(
            state["cur_question"]
        ),

        answer=state["cur_answer"],

        # Confidence
        confidence_score=state["confidence_score"],
        confidence_feedback=state["confidence_feedback"],

        # Communication
        communication_score=state["communication_score"],
        communication_feedback=(
            state["communication_feedback"]
        ),

        # Correctness
        correctness_score=state["correctness_score"],
        correctness_feedback=(
            state["correctness_feedback"]
        ),

        # Deterministic score
        overall_score=overall_score,
    )


    result: OverallEvaluation = (
        overall_llm.invoke(prompt)
    )


    # -----------------------------------------------
    # 3. Update state
    # -----------------------------------------------

    return {
        "overall_feedback": result.feedback,
        "overall_score": overall_score,
    }
