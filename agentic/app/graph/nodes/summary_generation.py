"""
Summary generation node.

Updates the compact interview memory after each turn.
"""

from app.graph.state import InterviewState
from app.graph.utils import format_question
from app.llm.model import llm
from app.prompts.templates import SUMMARY_GENERATION_PROMPT
from app.prompts.output_models import SummaryOutput


def summary_generation(
    state: InterviewState,
) -> dict:

    summary_llm = llm.with_structured_output(
        SummaryOutput
    )

    prompt = SUMMARY_GENERATION_PROMPT.format(

        # Previous memory
        prev_summary=state["prev_summary"],

        # Current interaction
        cur_question=format_question(
            state["cur_question"]
        ),
        cur_answer=state["cur_answer"],

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

        # Overall
        overall_score=state["overall_score"],
        overall_feedback=state["overall_feedback"],

        # Strategy
        follow_up_allowed=state["follow_up_allowed"],
        follow_up_context=state["follow_up_context"],
        follow_up_cnt=state["follow_up_cnt"],
        follow_up_score=state["follow_up_score"],

        recent_topic=state["recent_topic"],
        topic_coverage=state["topic_coverage"],

        # Next question
        next_question=format_question(
            state["next_question"]
        ),
    )

    result: SummaryOutput = (
        summary_llm.invoke(prompt)
    )

    return {
        "summary": result.summary
    }
