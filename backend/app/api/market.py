"""Market API routes."""

import logging
from fastapi import APIRouter, HTTPException

from app.orchestration.blackboard import blackboard

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/{request_id}")
async def get_market_report(request_id: str):
    """Get market price report for an advisory request."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    market_data = state.market_data
    if market_data is None:
        return {
            "request_id": request_id,
            "status": "pending",
            "message": "Market data not yet available. Agent may still be processing.",
        }

    return {
        "request_id": request_id,
        "status": "available",
        "market": market_data,
    }

