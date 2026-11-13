"""Government Schemes API routes."""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from sqlalchemy import select

from app.orchestration.blackboard import blackboard
from app.database.connection import async_session_factory
from app.database.models import GovernmentScheme
from app.schemas.scheme import SchemeInfo, SchemeListResponse
from app.rag import retrieval_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/schemes", tags=["schemes"])


@router.get("/{request_id}")
async def get_scheme_recommendations(request_id: str):
    """Get government scheme recommendations for an advisory request."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    scheme_data = state.scheme_data
    if scheme_data is None:
        return {
            "request_id": request_id,
            "status": "pending",
            "message": "Scheme data not yet available. Agent may still be processing.",
        }

    return {
        "request_id": request_id,
        "status": "available",
        "schemes": scheme_data,
    }


@router.get("/")
async def list_all_schemes():
    """List all government schemes from the database."""
    try:
        async with async_session_factory() as session:
            result = await session.execute(
                select(GovernmentScheme).where(GovernmentScheme.is_active == True)
            )
            schemes = result.scalars().all()

            scheme_list = []
            for s in schemes:
                scheme_list.append(SchemeInfo(
                    id=s.id,
                    name=s.name,
                    description=s.description,
                    eligibility=s.eligibility,
                    benefits=s.benefits,
                    application_process=s.application_process,
                    category=s.category,
                    is_active=s.is_active,
                ))

            return SchemeListResponse(schemes=scheme_list, total=len(scheme_list))
    except Exception as exc:
        logger.exception("Failed to list schemes")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/upload")
async def upload_scheme(
    name: str = Form(...),
    description: str = Form(...),
    eligibility: Optional[str] = Form(None),
    benefits: Optional[str] = Form(None),
    application_process: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    document: Optional[UploadFile] = File(None),
):
    """Upload a new government scheme (optionally with a document for RAG)."""
    try:
        # Save scheme to database
        async with async_session_factory() as session:
            scheme = GovernmentScheme(
                name=name,
                description=description,
                eligibility=eligibility,
                benefits=benefits,
                application_process=application_process,
                category=category,
            )
            session.add(scheme)
            await session.commit()
            await session.refresh(scheme)

        # If a document was uploaded, add to RAG index
        if document:
            content = await document.read()
            text = content.decode("utf-8", errors="ignore")
            await retrieval_service.add_document(
                text,
                metadata={"name": name, "category": category or "general"},
            )

        # Also add scheme text to RAG index
        scheme_text = f"{name}: {description}. Eligibility: {eligibility or 'N/A'}. Benefits: {benefits or 'N/A'}."
        await retrieval_service.add_document(
            scheme_text,
            metadata={"name": name, "category": category or "general"},
        )

        return {
            "status": "success",
            "message": f"Scheme '{name}' uploaded successfully",
            "scheme_id": scheme.id,
        }
    except Exception as exc:
        logger.exception("Failed to upload scheme")
        raise HTTPException(status_code=500, detail=str(exc))

