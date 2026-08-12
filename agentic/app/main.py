"""
FastAPI application entry point for the Talksy AI Agentic Service.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.interview import router as interview_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("agentic")

# Create FastAPI app
app = FastAPI(
    title="Talksy AI Agentic Service",
    description="LangGraph-based agentic interview workflow service",
    version="1.0.0",
)

# CORS — allow the Node.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(interview_router)

logger.info("Talksy AI Agentic Service initialized")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
