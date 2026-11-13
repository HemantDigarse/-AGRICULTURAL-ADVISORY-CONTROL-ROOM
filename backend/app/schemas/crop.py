"""Crop advisory schemas."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class CropAdvisoryData(BaseModel):
    """Crop-specific advisory data."""
    crop: str
    growth_stage: Optional[str] = None
    advisory_text: Optional[str] = None
    irrigation_advice: Optional[str] = None
    fertilizer_advice: Optional[str] = None
    pest_management: Optional[str] = None
    recommendations: Optional[List[Dict[str, Any]]] = None


class CropAdvisoryResponse(BaseModel):
    """Crop advisory API response."""
    success: bool
    data: Optional[CropAdvisoryData] = None
    error: Optional[str] = None
