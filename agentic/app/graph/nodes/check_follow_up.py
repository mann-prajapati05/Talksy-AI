"""
Check follow-up node for the answer workflow.

Determines the strategy for the next interview question.
"""

from app.graph.state import InterviewState
from app.graph.utils import format_question
from app.llm.model import llm
from app.prompts.templates import CHECK_FOLLOW_UP_PROMPT
from app.prompts.output_models import FollowUpDecision


MAX_CONSECUTIVE_FOLLOW_UPS = 2


def check_follow_up(
    state: InterviewState,
) -> dict:

    strategy_llm = llm.with_structured_output(
        FollowUpDecision
    )

    prompt = CHECK_FOLLOW_UP_PROMPT.format(
        role=state["role"],
        experience=state["experience"],
        mode=state["mode"],

        skills=state["skills"],
        projects=state["projects"],
        exp=state["exp"],
        resumeText=state["resumeText"],

        prev_summary=state["prev_summary"],

        cur_question=format_question(
            state["cur_question"]
        ),

        cur_answer=state["cur_answer"],

        follow_up_allowed=state["follow_up_allowed"],
        follow_up_context=state["follow_up_context"],
        follow_up_cnt=state["follow_up_cnt"],
        follow_up_score=state["follow_up_score"],

        recent_topic=state["recent_topic"],
        topic_coverage=state["topic_coverage"],
    )

    result: FollowUpDecision = strategy_llm.invoke(
        prompt
    )

    follow_up_allowed = result.follow_up_allowed

    # Hard application-level constraint.
    # Do not let the LLM create an endless chain
    # of follow-up questions.
    if state["follow_up_cnt"] >= MAX_CONSECUTIVE_FOLLOW_UPS:
        follow_up_allowed = False

    return {

        "follow_up_allowed": follow_up_allowed,

        "follow_up_context": (
            result.follow_up_context
            if follow_up_allowed
            else ""
        ),

        "follow_up_score": result.follow_up_score,

        "recent_topic": result.detected_topic,

        "next_focus": (
            result.next_focus
            if follow_up_allowed
            else "new_topic"
        ),

        "next_topic": result.next_topic,

        "next_difficulty": result.difficulty,

        "next_question_type": result.question_type,
    }
