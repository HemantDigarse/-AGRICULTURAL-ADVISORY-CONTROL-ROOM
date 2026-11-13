"""Coordinator Agent - consolidates all agent outputs into a farmer-friendly advisory."""

import logging
from typing import Any, Dict

from app.agents import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)


class CoordinatorAgent(BaseAgent):
    """Reads the entire blackboard and generates ONE consolidated farmer-friendly advisory."""

    def __init__(self) -> None:
        super().__init__(
            name="coordinator",
            description="Reads all agent results from the blackboard and generates a consolidated advisory.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Read entire blackboard and produce the final advisory."""
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}
        weather_data = state.weather_data or {}
        crop_advisory = state.crop_advisory or {}
        market_data = state.market_data or {}
        scheme_data = state.scheme_data or {}
        risk_assessment = state.risk_assessment or {}

        crop = farmer_info.get("crop", "Unknown")
        farmer_name = farmer_info.get("farmer_name", "Farmer")
        location = farmer_info.get("location", {})
        growth_stage = farmer_info.get("growth_stage", "Vegetative")

        # Build comprehensive prompt for LLM
        prompt = self._build_consolidation_prompt(
            farmer_info, weather_data, crop_advisory, market_data,
            scheme_data, risk_assessment,
        )

        # Generate consolidated advisory text
        system_prompt = (
            "You are an expert agricultural advisor in India. Generate a comprehensive, "
            "farmer-friendly advisory in simple language. Include specific actionable steps."
        )
        advisory_text = await llm_service.generate(prompt, system_prompt)

        # Build immediate actions
        immediate_actions = self._extract_immediate_actions(
            weather_data, crop_advisory, risk_assessment
        )

        # Build weekly plan
        weekly_plan = self._build_weekly_plan(crop, growth_stage, weather_data, crop_advisory)

        # Build risk summary
        risk_summary = []
        for alert in risk_assessment.get("alerts", []):
            risk_summary.append({
                "type": alert.get("risk_type", "unknown"),
                "severity": alert.get("severity", "LOW"),
                "title": alert.get("title", ""),
                "mitigation": alert.get("mitigation_steps", [])[:2],
            })

        # Build market summary
        market_summary = {
            "crop": crop,
            "avg_price": market_data.get("avg_price"),
            "msp": market_data.get("msp"),
            "trend": market_data.get("price_trend", "stable"),
            "recommendation": market_data.get("recommendation", "HOLD"),
            "reason": market_data.get("recommendation_reason", ""),
        }

        # Build scheme recommendations
        scheme_recs = []
        for scheme in scheme_data.get("relevant_schemes", []):
            scheme_recs.append({
                "name": scheme.get("scheme_name", ""),
                "reason": scheme.get("reason", ""),
                "relevance": scheme.get("relevance_score", 0),
            })

        # Calculate confidence score
        completed_agents = sum(
            1 for a in state.agents.values() if a.status == "completed"
        )
        total_agents = max(len(state.agents), 1)
        confidence = round(completed_agents / total_agents, 2)

        # Build summary
        summary = (
            f"Advisory for {farmer_name} - {crop.title()} ({growth_stage}) in "
            f"{location.get('city', 'Unknown')}, {location.get('state', 'Unknown')}. "
            f"Overall risk: {risk_assessment.get('overall_risk_level', 'LOW')}. "
            f"Market: {market_data.get('recommendation', 'HOLD')} at "
            f"₹{market_data.get('avg_price', 'N/A')}/quintal."
        )

        final = {
            "request_id": request_id,
            "summary": summary,
            "detailed_advisory": advisory_text,
            "immediate_actions": immediate_actions,
            "weekly_plan": weekly_plan,
            "risk_summary": risk_summary,
            "market_summary": market_summary,
            "scheme_recommendations": scheme_recs,
            "confidence_score": confidence,
            "is_demo": True,
        }

        # Set final advisory on blackboard
        await blackboard.set_final_advisory(request_id, final)

        self.logger.info(
            "Final advisory generated for %s: confidence=%.2f, risk=%s",
            request_id, confidence, risk_assessment.get("overall_risk_level", "LOW"),
        )

        return final

    def _build_consolidation_prompt(
        self, farmer_info, weather_data, crop_advisory, market_data,
        scheme_data, risk_assessment,
    ) -> str:
        """Build a comprehensive prompt for the LLM."""
        crop = farmer_info.get("crop", "Unknown")
        location = farmer_info.get("location", {})
        stage = farmer_info.get("growth_stage", "")
        current_weather = weather_data.get("current", {})

        return (
            f"Generate a consolidated farmer-friendly final advisory:\n\n"
            f"FARMER: {farmer_info.get('farmer_name', 'Farmer')}\n"
            f"CROP: {crop} at {stage} stage\n"
            f"LOCATION: {location.get('city', '')}, {location.get('state', '')}\n\n"
            f"WEATHER: {current_weather.get('condition', 'N/A')}, "
            f"Temp: {current_weather.get('temperature_c', 'N/A')}°C, "
            f"Humidity: {current_weather.get('humidity', 'N/A')}%, "
            f"Rainfall: {current_weather.get('rainfall_mm', 'N/A')}mm\n\n"
            f"CROP ADVISORY: {crop_advisory.get('advisory_text', 'N/A')}\n\n"
            f"MARKET: {market_data.get('recommendation', 'N/A')} - "
            f"₹{market_data.get('avg_price', 'N/A')}/quintal "
            f"(MSP: ₹{market_data.get('msp', 'N/A')})\n\n"
            f"RISK LEVEL: {risk_assessment.get('overall_risk_level', 'LOW')}\n"
            f"ALERTS: {len(risk_assessment.get('alerts', []))} active alerts\n\n"
            f"Generate ONE consolidated, actionable advisory covering all aspects."
        )

    def _extract_immediate_actions(
        self, weather_data, crop_advisory, risk_assessment,
    ) -> list:
        """Extract immediate actions from all agent outputs."""
        actions = []

        # From risk alerts
        for alert in risk_assessment.get("alerts", []):
            if alert.get("severity") in ("CRITICAL", "HIGH"):
                steps = alert.get("mitigation_steps", [])
                if steps:
                    actions.append(f"[{alert['severity']}] {steps[0]}")

        # From crop advisory
        irrigation = crop_advisory.get("irrigation_advice", "")
        if irrigation:
            actions.append(f"Irrigation: {irrigation[:100]}")

        # Weather-based
        risk_level = weather_data.get("risk_level", "LOW")
        if risk_level in ("HIGH", "CRITICAL"):
            actions.append("Monitor weather updates closely and take protective measures")

        if not actions:
            actions = [
                "Continue regular field monitoring",
                "Maintain irrigation schedule as recommended",
                "Scout for pest and disease symptoms",
            ]

        return actions[:5]

    def _build_weekly_plan(self, crop, stage, weather_data, crop_advisory) -> list:
        """Build a simple weekly action plan."""
        return [
            {
                "day": "Day 1-2",
                "actions": [
                    "Inspect field conditions and soil moisture",
                    "Apply any urgent pest/disease measures",
                ],
            },
            {
                "day": "Day 3-4",
                "actions": [
                    "Execute irrigation as per recommendation",
                    "Apply fertilizer if due for this stage",
                ],
            },
            {
                "day": "Day 5-6",
                "actions": [
                    "Monitor crop growth and health",
                    "Check weather forecast for coming week",
                ],
            },
            {
                "day": "Day 7",
                "actions": [
                    "Review market prices for selling decisions",
                    "Plan activities for the next week",
                ],
            },
        ]

