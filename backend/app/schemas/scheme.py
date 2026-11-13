"""Government scheme schemas."""

from typing import Optional, List
from pydantic import BaseModel


class SchemeInfo(BaseModel):
    """Government scheme information."""
    id: str
    name: str
    description: Optional[str] = None
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class SchemeListResponse(BaseModel):
    """List of government schemes."""
    schemes: List[SchemeInfo] = []
    total: int = 0


class SchemeUploadRequest(BaseModel):
    """Request to add a new scheme."""
    name: str
    description: str
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    category: Optional[str] = None
