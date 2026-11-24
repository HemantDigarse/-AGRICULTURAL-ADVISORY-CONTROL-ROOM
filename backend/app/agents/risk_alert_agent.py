"""Risk Alert Agent - evaluates threats and assigns severity levels."""

import logging
from typing import Any, Dict, List

from app.agents import BaseAgent
from app.config.settings import settings

logger = logging.getLogger(__name__)


class RiskAlertAgent(BaseAgent):
    """Reads weather and market data, evaluates threats, assigns severity."""

    def __init__(self) -> None:
        super().__init__(
            name="risk",
            description="Evaluates weather, pest, market, and disease risks and assigns severity levels.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Evaluate risks and publish to blackboard."""
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}
        weather_data = state.weather_data or {}
        market_data = state.market_data or {}

        crop = farmer_info.get("crop", "Unknown")
        growth_stage = farmer_info.get("growth_stage", "Vegetative")
        current_weather = weather_data.get("current", {})

        alerts: List[Dict[str, Any]] = []

        # Weather risks
        weather_alerts = self._assess_weather_risks(current_weather, crop, growth_stage)
        alerts.extend(weather_alerts)

        # Market risks
        market_alerts = self._assess_market_risks(market_data)
        alerts.extend(market_alerts)

        # Pest/disease risks (based on weather conditions)
        pest_alerts = self._assess_pest_risks(current_weather, crop, growth_stage)
        alerts.extend(pest_alerts)

        # Overall risk level
        if any(a["severity"] == "CRITICAL" for a in alerts):
            overall = "CRITICAL"
        elif any(a["severity"] == "HIGH" for a in alerts):
            overall = "HIGH"
        elif any(a["severity"] == "MEDIUM" for a in alerts):
            overall = "MEDIUM"
        else:
            overall = "LOW"

        risk_result = {
            "overall_risk_level": overall,
            "alerts": alerts,
            "total_alerts": len(alerts),
            "summary": self._generate_summary(overall, alerts),
            "is_demo": settings.DEMO_MODE,
        }

        await blackboard.update_section(request_id, "risk_assessment", risk_result)

        self.logger.info("Risk assessment: %s (%d alerts) for %s", overall, len(alerts), crop)
        return risk_result

    def _assess_weather_risks(
        self, weather: Dict[str, Any], crop: str, stage: str
    ) -> List[Dict[str, Any]]:
        """Assess weather-based risks."""
        alerts = []
        temp = weather.get("temperature_c", 30)
        humidity = weather.get("humidity", 50)
        rainfall = weather.get("rainfall_mm", 0)
        wind = weather.get("wind_speed_kmh", 10)

        if temp > 42:
            alerts.append({
                "risk_type": "weather",
                "severity": "CRITICAL",
                "title": "Extreme Heat Wave",
                "description": (
                    f"Temperature of {temp}°C is dangerously high. "
                    f"Can cause severe heat stress to {crop}, leading to wilting and yield loss."
                ),
                "mitigation_steps": [
                    "Provide emergency irrigation immediately",
                    "Apply mulch to reduce soil temperature",
                    "Avoid field operations during peak heat (11 AM - 3 PM)",
                    "Consider shade nets for sensitive crops",
                ],
            })
        elif temp > 38:
            alerts.append({
                "risk_type": "weather",
                "severity": "HIGH",
                "title": "Heat Stress Warning",
                "description": (
                    f"Temperature of {temp}°C is high. {crop} at {stage} stage "
                    f"may experience heat stress affecting growth."
                ),
                "mitigation_steps": [
                    "Increase irrigation frequency",
                    "Apply mulching to conserve soil moisture",
                    "Schedule field work during cooler hours",
                ],
            })

        if temp < 5:
            alerts.append({
                "risk_type": "weather",
                "severity": "CRITICAL",
                "title": "Frost Risk",
                "description": f"Temperature of {temp}°C may cause frost damage to {crop}.",
                "mitigation_steps": [
                    "Cover crops with protective material",
                    "Light irrigation in the evening to release heat",
                    "Use smoke pots in orchards if applicable",
                ],
            })

        if rainfall > 50:
            alerts.append({
                "risk_type": "weather",
                "severity": "CRITICAL",
                "title": "Flood / Waterlogging Risk",
                "description": f"Expected rainfall of {rainfall}mm may cause waterlogging and crop damage.",
                "mitigation_steps": [
                    "Clear drainage channels immediately",
                    "Create ridges/furrows for water flow",
                    "Avoid low-lying field areas",
                    "Document damage for insurance claims under PMFBY",
                ],
            })
        elif rainfall > 20:
            alerts.append({
                "risk_type": "weather",
                "severity": "MEDIUM",
                "title": "Heavy Rainfall Advisory",
                "description": f"Expected rainfall of {rainfall}mm. Ensure proper drainage.",
                "mitigation_steps": [
                    "Check and clear field drainage",
                    "Postpone fertilizer/pesticide application",
                    "Monitor for waterlogging signs",
                ],
            })

        if wind > 50:
            alerts.append({
                "risk_type": "weather",
                "severity": "HIGH",
                "title": "Strong Wind / Storm Warning",
                "description": f"Wind speed of {wind} km/h can cause lodging and physical damage.",
                "mitigation_steps": [
                    "Provide support stakes for tall crops",
                    "Secure farm structures and equipment",
                    "Avoid spraying operations",
                ],
            })

        return alerts

    def _assess_market_risks(self, market_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Assess market-based risks."""
        alerts = []
        avg_price = market_data.get("avg_price")
        msp = market_data.get("msp")
        trend = market_data.get("price_trend", "stable")

        if avg_price and msp and avg_price < msp * 0.85:
            alerts.append({
                "risk_type": "market",
                "severity": "HIGH",
                "title": "Market Price Below MSP",
                "description": (
                    f"Current market price (₹{avg_price}/quintal) is significantly below "
                    f"MSP (₹{msp}/quintal). Risk of financial loss if sold at market price."
                ),
                "mitigation_steps": [
                    "Sell through government procurement centres at MSP",
                    "Consider storage if quality can be maintained",
                    "Check for procurement centres in your district",
                    "Register on e-NAM for wider market access",
                ],
            })
        elif trend == "falling":
            alerts.append({
                "risk_type": "market",
                "severity": "MEDIUM",
                "title": "Falling Market Prices",
                "description": "Market prices show a declining trend. Plan sales carefully.",
                "mitigation_steps": [
                    "Consider selling in phases (not all at once)",
                    "Check government procurement options",
                    "Explore value-added processing if applicable",
                ],
            })

        return alerts

    def _assess_pest_risks(
        self, weather: Dict[str, Any], crop: str, stage: str
    ) -> List[Dict[str, Any]]:
        """Assess pest/disease risks based on weather conditions."""
        alerts = []
        humidity = weather.get("humidity", 50)
        temp = weather.get("temperature_c", 30)
        rainfall = weather.get("rainfall_mm", 0)

        # High humidity + warm = fungal disease risk
        if humidity > 80 and temp > 25:
            alerts.append({
                "risk_type": "disease",
                "severity": "MEDIUM",
                "title": "Fungal Disease Risk",
                "description": (
                    f"High humidity ({humidity}%) combined with warm temperature ({temp}°C) "
                    f"creates favorable conditions for fungal diseases in {crop}."
                ),
                "mitigation_steps": [
                    "Apply preventive fungicide spray",
                    "Ensure proper plant spacing for air circulation",
                    "Remove and destroy infected plant parts",
                    "Avoid overhead irrigation",
                ],
            })

        # Post-rain + warm = pest outbreak risk
        if rainfall > 10 and temp > 25 and stage in ("Vegetative", "Flowering"):
            alerts.append({
                "risk_type": "pest",
                "severity": "MEDIUM",
                "title": "Pest Activity Alert",
                "description": (
                    "Post-rain warm conditions may trigger increased pest activity. "
                    "Regular field scouting is essential."
                ),
                "mitigation_steps": [
                    "Scout fields twice a week for pest symptoms",
                    "Install pheromone traps for major pests",
                    "Use IPM practices - biological control first",
                    "Spray pesticides only when Economic Threshold Level (ETL) is reached",
                ],
            })

        return alerts

    def _generate_summary(self, overall: str, alerts: List[Dict[str, Any]]) -> str:
        """Generate a human-readable risk summary."""
        if not alerts:
            return "No significant risks identified. Conditions are generally favorable for farming operations."

        severity_counts = {}
        for a in alerts:
            s = a["severity"]
            severity_counts[s] = severity_counts.get(s, 0) + 1

        parts = [f"Overall risk level: {overall}."]
        for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
            count = severity_counts.get(severity, 0)
            if count:
                parts.append(f"{count} {severity} alert(s).")

        alert_titles = [a["title"] for a in alerts[:3]]
        parts.append(f"Key concerns: {', '.join(alert_titles)}.")

        return " ".join(parts)

