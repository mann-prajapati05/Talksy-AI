# Talksy AI — Agentic Interview Service

LangGraph-based agentic interview workflow service for Talksy AI.

## Setup

```bash
cd agentic

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

## Run

```bash
cd agentic
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/interview/start` | Generate first question |
| POST | `/api/v1/interview/answer` | Process answer, return evaluation + next question |

## Architecture

```
app/
├── main.py                    # FastAPI entry point
├── api/
│   └── interview.py           # API endpoints
├── graph/
│   ├── state.py               # InterviewState TypedDict
│   ├── utils.py               # Helpers
│   ├── start_workflow.py       # START → generate_question → END
│   ├── answer_workflow.py      # Full answer evaluation workflow
│   └── nodes/
│       ├── generate_question.py
│       ├── check_follow_up.py
│       ├── confidence_feedback.py
│       ├── communication_feedback.py
│       ├── correctness_feedback.py
│       ├── overall_feedback.py
│       └── summary_generation.py
├── schemas/
│   ├── requests.py             # Pydantic request models
│   └── responses.py            # Pydantic response models
├── prompts/
│   ├── templates.py            # All prompt templates
│   └── output_models.py        # Pydantic structured output models
└── llm/
    └── model.py                # LLM configuration
```
