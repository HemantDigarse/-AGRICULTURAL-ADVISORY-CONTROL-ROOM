"""Farmer and location schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class LocationInput(BaseModel):
    """Location input for a farmer query."""
    city: str = Field(..., min_length=1, description="City name")
    district: Optional[str] = Field(None, description="District name")
    state: str = Field(..., min_length=1, description="State name")


class FarmerInput(BaseModel):
    """Input data for creating an advisory request."""
    crop: str = Field(..., min_length=1, description="Crop name (e.g. Wheat, Rice, Cotton)")
    location: LocationInput
    growth_stage: str = Field(..., description="Current growth stage (e.g. seedling, vegetative, flowering, harvesting)")
    farmer_name: Optional[str] = Field(None, description="Name of the farmer")
    farm_size: Optional[float] = Field(None, gt=0, description="Farm size in acres")
    query: Optional[str] = Field(None, description="Specific question or concern from the farmer")


class FarmerResponse(BaseModel):
    """Farmer record response."""
    id: str
    name: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    farm_size_acres: Optional[float] = None
    primary_crop: Optional[str] = None

    model_config = {"from_attributes": True}
