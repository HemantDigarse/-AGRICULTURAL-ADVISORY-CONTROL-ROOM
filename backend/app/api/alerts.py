"""Risk Alerts API routes."""

import logging
from fastapi import APIRouter, HTTPException

from app.orchestration.blackboard import blackboard

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/{request_id}")
async def get_risk_alerts(request_id: str):
    """Get risk alerts for an advisory request."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    risk_data = state.risk_assessment
    if risk_data is None:
        return {
            "request_id": request_id,
            "status": "pending",
            "message": "Risk assessment not yet available. Agent may still be processing.",
        }

    return {
        "request_id": request_id,
        "status": "available",
        "risk_assessment": risk_data,
    }

