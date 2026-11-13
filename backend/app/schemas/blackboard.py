"""Blackboard state schemas."""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class AgentStatus(BaseModel):
    """Status of a single agent."""
    name: str
    status: str = "pending"  # pending | running | completed | failed
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class BlackboardState(BaseModel):
    """Full state of the blackboard for a request."""
    request_id: str
    status: str = "pending"

    # Farmer & request info (set by intake agent)
    farmer_info: Optional[Dict[str, Any]] = None

    # Weather section (set by weather agent)
    weather_data: Optional[Dict[str, Any]] = None

    # Market section (set by market agent)
    market_data: Optional[Dict[str, Any]] = None

    # Government schemes section (set by scheme agent)
    scheme_data: Optional[Dict[str, Any]] = None

    # Crop advisory section (set by crop agent)
    crop_advisory: Optional[Dict[str, Any]] = None

    # Risk assessment section (set by risk agent)
    risk_assessment: Optional[Dict[str, Any]] = None

    # Final advisory (set by coordinator agent)
    final_advisory: Optional[Dict[str, Any]] = None

    # Agent statuses
    agents: Dict[str, AgentStatus] = Field(default_factory=dict)

    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Events
    events: List[Dict[str, Any]] = Field(default_factory=list)
