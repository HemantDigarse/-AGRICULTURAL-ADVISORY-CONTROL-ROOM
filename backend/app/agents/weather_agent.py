"""Weather Agent - fetches weather data and determines risk level."""

import logging
import time
from typing import Any, Dict

from app.agents import BaseAgent
from app.services import weather_service

logger = logging.getLogger(__name__)


class WeatherAgent(BaseAgent):
    """Fetches weather data for the farmer's location and assesses weather risk."""

    def __init__(self) -> None:
        super().__init__(
            name="weather",
            description="Fetches current and forecast weather data, determines weather-based risk level.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Fetch weather and publish to blackboard."""
        start = time.time()
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}
        location = farmer_info.get("location", {})
        city = location.get("city", "Delhi")
        state_name = location.get("state", "Delhi")

        weather_data = await weather_service.get_weather(city, state_name)

        current = weather_data.get("current", {})
        risk_level = self._assess_risk(current)

        weather_result = {
            "current": current,
            "forecast": weather_data.get("forecast", []),
            "risk_level": risk_level,
            "source": weather_data.get("source", "unknown"),
            "city": city,
            "state": state_name,
        }

        await blackboard.update_section(request_id, "weather_data", weather_result)

        elapsed = round(time.time() - start, 3)
        self.logger.info(
            "Weather fetched for %s, %s: %.1f°C, %s, risk=%s (%.3fs)",
            city, state_name,
            current.get("temperature_c", 0),
            current.get("condition", "Unknown"),
            risk_level, elapsed,
        )

        return weather_result

    def _assess_risk(self, current: Dict[str, Any]) -> str:
        """Assess weather risk based on current conditions."""
        temp = current.get("temperature_c", 30)
        humidity = current.get("humidity", 50)
        rainfall = current.get("rainfall_mm", 0)
        wind = current.get("wind_speed_kmh", 10)

        risk_score = 0

        if temp > 42:
            risk_score += 3
        elif temp > 38:
            risk_score += 2
        elif temp < 5:
            risk_score += 3
        elif temp < 10:
            risk_score += 2

        if rainfall > 50:
            risk_score += 3
        elif rainfall > 20:
            risk_score += 2
        elif rainfall > 10:
            risk_score += 1

        if humidity > 90:
            risk_score += 2
        elif humidity > 80:
            risk_score += 1

        if wind > 50:
            risk_score += 3
        elif wind > 30:
            risk_score += 2
        elif wind > 20:
            risk_score += 1

        if risk_score >= 6:
            return "CRITICAL"
        elif risk_score >= 4:
            return "HIGH"
        elif risk_score >= 2:
            return "MEDIUM"
        else:
            return "LOW"
