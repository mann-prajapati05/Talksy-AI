"""
LLM model configuration for the Agentic interview service.

Uses ChatOpenRouter to connect to OpenRouter API.
"""

import os
from dotenv import load_dotenv
from langchain_openrouter import ChatOpenRouter

load_dotenv()


def get_llm():
    """
    Returns a configured ChatOpenRouter LLM instance.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY environment variable is not set."
        )

    return ChatOpenRouter(
        model="google/gemini-2.5-flash",
        api_key=api_key,
        max_tokens=2048,
    )


# Singleton LLM instance
llm = get_llm()
