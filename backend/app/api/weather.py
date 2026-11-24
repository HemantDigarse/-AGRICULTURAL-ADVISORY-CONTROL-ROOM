"""Weather API routes."""

import logging
from fastapi import APIRouter, HTTPException, Query

from app.orchestration.blackboard import blackboard

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/current")
async def get_current_weather(
    city: str = Query(..., min_length=2, max_length=100),
    state: str = Query("", max_length=100),
):
    """Fetch current conditions and forecast for a searched location."""
    from app.services.weather_service import get_weather

    try:
        return await get_weather(city.strip(), state.strip())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Live weather lookup failed for %s, %s", city, state)
        raise HTTPException(status_code=502, detail="Live weather is temporarily unavailable.") from exc


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

