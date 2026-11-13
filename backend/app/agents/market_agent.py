"""Market Intelligence Agent - fetches market prices and generates recommendations."""

import logging
from typing import Any, Dict

from app.agents import BaseAgent
from app.services import market_service

logger = logging.getLogger(__name__)


class MarketIntelligenceAgent(BaseAgent):
    """Fetches mandi prices and generates SELL/HOLD recommendation."""

    def __init__(self) -> None:
        super().__init__(
            name="market",
            description="Fetches current mandi prices and generates buy/sell/hold recommendations.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Fetch market prices and publish to blackboard."""
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}
        crop = farmer_info.get("crop", "Wheat")
        location = farmer_info.get("location", {})
        state_name = location.get("state", "Delhi")

        # Fetch market data
        market_data = await market_service.get_market_price(crop, state_name)

        # Build result
        market_result = {
            "crop": crop,
            "state": state_name,
            "prices": market_data.get("prices", []),
            "avg_price": market_data.get("avg_price"),
            "msp": market_data.get("msp"),
            "price_trend": market_data.get("price_trend", "stable"),
            "recommendation": market_data.get("recommendation", "HOLD"),
            "recommendation_reason": market_data.get("recommendation_reason", ""),
            "source": market_data.get("source", "demo"),
            "is_demo": market_data.get("is_demo", True),
        }

        # Publish to blackboard
        await blackboard.update_section(request_id, "market_data", market_result)

        self.logger.info(
            "Market data for %s: avg ₹%s/quintal, recommendation=%s",
            crop,
            market_result.get("avg_price"),
            market_result.get("recommendation"),
        )

        return market_result

