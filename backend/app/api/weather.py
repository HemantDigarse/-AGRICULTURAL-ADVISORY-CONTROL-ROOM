"""Weather API routes."""

import logging
from fastapi import APIRouter, HTTPException

from app.orchestration.blackboard import blackboard

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/{request_id}")
async def get_weather_report(request_id: str):
    """Get weather report for an advisory request."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    weather_data = state.weather_data
    if weather_data is None:
        return {
            "request_id": request_id,
            "status": "pending",
            "message": "Weather data not yet available. Agent may still be processing.",
        }

    return {
        "request_id": request_id,
        "status": "available",
        "weather": weather_data,
    }

