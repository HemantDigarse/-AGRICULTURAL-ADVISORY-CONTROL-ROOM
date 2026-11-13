"""Weather schemas."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class WeatherData(BaseModel):
    """Current weather data."""
    city: str
    state: Optional[str] = None
    temperature_c: float
    humidity: float
    rainfall_mm: float
    wind_speed_kmh: float
    condition: str


class WeatherForecast(BaseModel):
    """Multi-day weather forecast."""
    city: str
    state: Optional[str] = None
    current: WeatherData
    forecast: List[Dict[str, Any]] = []


class WeatherResponse(BaseModel):
    """Weather API response."""
    success: bool
    data: Optional[WeatherForecast] = None
    error: Optional[str] = None
