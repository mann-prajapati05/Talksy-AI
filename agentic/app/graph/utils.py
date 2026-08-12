"""
Utility functions for the LangGraph interview workflow.
"""

from app.graph.state import Question


def format_question(question: Question | None) -> str:
    """Format a Question dict into a readable string for prompts."""

    if question is None:
        return "No previous question. This is the first interview question."

    return f"""Question: {question["question"]}
Difficulty: {question["difficulty"]}
Type: {question["questionType"]}
Time Limit: {question["timeLimit"]} seconds""".strip()
