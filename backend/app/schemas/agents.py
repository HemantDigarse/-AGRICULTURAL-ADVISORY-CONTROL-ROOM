"""Agent-related schemas."""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel


class AgentExecutionInfo(BaseModel):
    """Info about a single agent execution."""
    agent_name: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None

    model_config = {"from_attributes": True}


class AgentListResponse(BaseModel):
    """List of agent executions for a request."""
    request_id: str
    agents: List[AgentExecutionInfo] = []


class SSEEvent(BaseModel):
    """Server-Sent Event payload."""
    event: str  # agent_started | agent_completed | agent_failed | advisory_complete
    agent_name: Optional[str] = None
    data: Dict[str, Any] = {}
    timestamp: Optional[datetime] = None
