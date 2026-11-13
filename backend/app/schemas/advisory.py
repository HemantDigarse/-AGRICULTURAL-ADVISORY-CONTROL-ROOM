"""Advisory-related schemas."""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class AdvisoryCreateResponse(BaseModel):
    """Response when a new advisory request is created."""
    request_id: str
    status: str
    message: str


class AdvisoryStatusResponse(BaseModel):
    """Status of an advisory request."""
    request_id: str
    status: str
    crop: str
    location: Dict[str, Optional[str]]
    growth_stage: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class AdvisoryResultResponse(BaseModel):
    """Final advisory result."""
    request_id: str
    status: str
    summary: Optional[str] = None
    detailed_advisory: Optional[str] = None
    immediate_actions: Optional[List[str]] = None
    weekly_plan: Optional[List[Dict[str, Any]]] = None
    risk_summary: Optional[List[Dict[str, Any]]] = None
    market_summary: Optional[Dict[str, Any]] = None
    scheme_recommendations: Optional[List[Dict[str, Any]]] = None
    confidence_score: Optional[float] = None
