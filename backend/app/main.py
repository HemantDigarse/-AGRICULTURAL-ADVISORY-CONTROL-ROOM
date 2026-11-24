"""
Agricultural Advisory Control Room - FastAPI Application

Main entry point for the backend server.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.init_db import init_db
from app.api import advisory, auth, weather, market, schemes, alerts, dashboard
from app.security import require_current_user

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    logger.info("Starting %s v%s (DEMO_MODE=%s)", settings.APP_NAME, settings.APP_VERSION, settings.DEMO_MODE)
    await init_db()
    logger.info("Database initialized successfully")

    # Seed scheme data into RAG index
    try:
        from app.rag import retrieval_service
        from app.database.connection import async_session_factory
        from app.database.models import GovernmentScheme
        from sqlalchemy import select

        async with async_session_factory() as session:
            result = await session.execute(select(GovernmentScheme))
            schemes_list = result.scalars().all()
            for s in schemes_list:
                text = f"{s.name}: {s.description}. Eligibility: {s.eligibility}. Benefits: {s.benefits}."
                await retrieval_service.add_document(
                    text, metadata={"name": s.name, "category": s.category or "general"}
                )
        logger.info("Seeded %d schemes into RAG index", len(schemes_list))
    except Exception as exc:
        logger.warning("Could not seed RAG index: %s", exc)

    yield

    # Shutdown
    logger.info("Shutting down %s", settings.APP_NAME)


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Multi-agent AI system for comprehensive agricultural advisory services. "
        "Provides weather analysis, crop recommendations, market intelligence, "
        "government scheme matching, and risk assessments for Indian farmers."
    ),
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
protected_routes = [
    advisory.router,
    weather.router,
    market.router,
    schemes.router,
    alerts.router,
    dashboard.router,
]
for router in protected_routes:
    app.include_router(router, dependencies=[Depends(require_current_user)])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "demo_mode": settings.DEMO_MODE,
    }

