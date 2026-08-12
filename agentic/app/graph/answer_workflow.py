"""
Answer workflow: processes each candidate answer.

Graph with parallel branches:
  START → check_follow_up → generate_question ──┐
  START → confidence_feedback ──┐                │
  START → communication_feedback → overall_feedback → summary_generation → END
  START → correctness_feedback ──┘               │
                                generate_question ┘→ summary_generation
"""

from langgraph.graph import StateGraph, START, END
from app.graph.state import InterviewState
from app.graph.nodes.check_follow_up import check_follow_up
from app.graph.nodes.generate_question import generate_question
from app.graph.nodes.confidence_feedback import confidence_feedback
from app.graph.nodes.communication_feedback import communication_feedback
from app.graph.nodes.correctness_feedback import correctness_feedback
from app.graph.nodes.overall_feedback import overall_feedback
from app.graph.nodes.summary_generation import summary_generation


answer_graph = StateGraph(InterviewState)


answer_graph.add_node(
    "check_follow_up",
    check_follow_up
)

answer_graph.add_node(
    "generate_question",
    generate_question
)

answer_graph.add_node(
    "confidence_feedback",
    confidence_feedback
)

answer_graph.add_node(
    "communication_feedback",
    communication_feedback
)

answer_graph.add_node(
    "correctness_feedback",
    correctness_feedback
)

answer_graph.add_node(
    "overall_feedback",
    overall_feedback
)

answer_graph.add_node(
    "summary_generation",
    summary_generation
)


# ============================================
# Parallel Strategy + Evaluation
# ============================================

answer_graph.add_edge(
    START,
    "check_follow_up"
)

answer_graph.add_edge(
    START,
    "confidence_feedback"
)

answer_graph.add_edge(
    START,
    "communication_feedback"
)

answer_graph.add_edge(
    START,
    "correctness_feedback"
)


# ============================================
# Question
# ============================================

answer_graph.add_edge(
    "check_follow_up",
    "generate_question"
)


# ============================================
# 3C
# ============================================

answer_graph.add_edge(
    "confidence_feedback",
    "overall_feedback"
)

answer_graph.add_edge(
    "communication_feedback",
    "overall_feedback"
)

answer_graph.add_edge(
    "correctness_feedback",
    "overall_feedback"
)


# ============================================
# Summary synchronization
# ============================================

answer_graph.add_edge(
    "generate_question",
    "summary_generation"
)

answer_graph.add_edge(
    "overall_feedback",
    "summary_generation"
)


# ============================================
# End
# ============================================

answer_graph.add_edge(
    "summary_generation",
    END
)


answer_workflow = answer_graph.compile()
