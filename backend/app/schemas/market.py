"""Market schemas."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class MandiPrice(BaseModel):
    """Price data from a single mandi."""
    mandi_name: str
    min_price: float
    max_price: float
    modal_price: float
    unit: str = "INR/quintal"


class MarketData(BaseModel):
    """Market data for a crop."""
    crop: str
    prices: List[MandiPrice] = []
    price_trend: str = "stable"  # rising | stable | falling
    avg_price: Optional[float] = None
    recommendation: Optional[str] = None


class MarketResponse(BaseModel):
    """Market API response."""
    success: bool
    data: Optional[MarketData] = None
    error: Optional[str] = None
