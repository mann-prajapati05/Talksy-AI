"""
Correctness feedback evaluator node.
"""

from app.graph.state import InterviewState
from app.graph.utils import format_question
from app.llm.model import llm
from app.prompts.templates import CORRECTNESS_FEEDBACK_PROMPT
from app.prompts.output_models import CorrectnessEvaluation


def correctness_feedback(
    state: InterviewState,
) -> dict:

    correctness_llm = llm.with_structured_output(
        CorrectnessEvaluation
    )

    prompt = CORRECTNESS_FEEDBACK_PROMPT.format(

        # Interview
        role=state["role"],
        experience=state["experience"],
        mode=state["mode"],

        # Candidate context
        skills=state["skills"],
        projects=state["projects"],
        exp=state["exp"],
        resumeText=state["resumeText"],

        # Current interaction
        question=format_question(
            state["cur_question"]
        ),
        answer=state["cur_answer"],
    )

    result: CorrectnessEvaluation = (
        correctness_llm.invoke(prompt)
    )

    return {
        "correctness_feedback": result.feedback,
        "correctness_score": result.score,
    }
