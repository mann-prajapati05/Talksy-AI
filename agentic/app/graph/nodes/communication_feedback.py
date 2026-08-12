"""
Communication feedback evaluator node.
"""

from app.graph.state import InterviewState
from app.graph.utils import format_question
from app.llm.model import llm
from app.prompts.templates import COMMUNICATION_FEEDBACK_PROMPT
from app.prompts.output_models import CommunicationEvaluation


def communication_feedback(
    state: InterviewState,
) -> dict:

    communication_llm = llm.with_structured_output(
        CommunicationEvaluation
    )

    prompt = COMMUNICATION_FEEDBACK_PROMPT.format(
        role=state["role"],
        experience=state["experience"],
        question=format_question(
            state["cur_question"]
        ),
        answer=state["cur_answer"],
    )

    result: CommunicationEvaluation = (
        communication_llm.invoke(prompt)
    )

    return {
        "communication_feedback": result.feedback,
        "communication_score": result.score,
    }
