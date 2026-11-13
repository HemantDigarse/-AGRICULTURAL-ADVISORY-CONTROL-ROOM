"""Risk alert schemas."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class RiskAlertData(BaseModel):
    """Single risk alert."""
    risk_type: str  # weather | pest | market | disease
    severity: str  # low | medium | high | critical
    title: str
    description: Optional[str] = None
    mitigation_steps: Optional[List[str]] = None


class RiskAssessment(BaseModel):
    """Aggregated risk assessment."""
    overall_risk_level: str = "low"
    alerts: List[RiskAlertData] = []
    summary: Optional[str] = None


class RiskResponse(BaseModel):
    """Risk API response."""
    success: bool
    data: Optional[RiskAssessment] = None
    error: Optional[str] = None
