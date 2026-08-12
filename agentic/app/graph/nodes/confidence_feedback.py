"""
Confidence feedback evaluator node.
"""

from app.graph.state import InterviewState
from app.graph.utils import format_question
from app.llm.model import llm
from app.prompts.templates import CONFIDENCE_FEEDBACK_PROMPT
from app.prompts.output_models import ConfidenceEvaluation


def confidence_feedback(
    state: InterviewState,
) -> dict:

    confidence_llm = llm.with_structured_output(
        ConfidenceEvaluation
    )

    prompt = CONFIDENCE_FEEDBACK_PROMPT.format(
        role=state["role"],
        experience=state["experience"],
        question=format_question(
            state["cur_question"]
        ),
        answer=state["cur_answer"],
    )

    result: ConfidenceEvaluation = (
        confidence_llm.invoke(prompt)
    )

    return {
        "confidence_feedback": result.feedback,
        "confidence_score": result.score,
    }
