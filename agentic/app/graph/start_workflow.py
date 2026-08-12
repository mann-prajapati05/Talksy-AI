"""
Start workflow: generates the first interview question.

Graph: START → generate_question → END
"""

from langgraph.graph import StateGraph, START, END
from app.graph.state import InterviewState
from app.graph.nodes.generate_question import generate_question


start_graph = StateGraph(InterviewState)

start_graph.add_node(
    "generate_question",
    generate_question
)

start_graph.add_edge(
    START,
    "generate_question"
)

start_graph.add_edge(
    "generate_question",
    END
)

start_workflow = start_graph.compile()
