"""Advisory Orchestrator - manages agent execution pipeline."""

import asyncio
import logging
import time
from typing import Any, Dict

from app.orchestration.blackboard import blackboard
from app.agents.intake_agent import IntakeAgent, generate_request_id
from app.agents.weather_agent import WeatherAgent
from app.agents.crop_agent import CropAdvisoryAgent
from app.agents.market_agent import MarketIntelligenceAgent
from app.agents.scheme_agent import GovernmentSchemeAgent
from app.agents.risk_alert_agent import RiskAlertAgent
from app.agents.coordinator_agent import CoordinatorAgent

logger = logging.getLogger(__name__)


class AdvisoryOrchestrator:
    """
    Runs the multi-agent advisory pipeline in the correct dependency order:

    1. IntakeAgent (first, validates input)
    2. WeatherAgent + MarketAgent + SchemeAgent (parallel)
    3. CropAdvisoryAgent + RiskAlertAgent (after weather completes)
    4. CoordinatorAgent (after all above complete)
    """

    def __init__(self) -> None:
        self.intake = IntakeAgent()
        self.weather = WeatherAgent()
        self.crop = CropAdvisoryAgent()
        self.market = MarketIntelligenceAgent()
        self.scheme = GovernmentSchemeAgent()
        self.risk = RiskAlertAgent()
        self.coordinator = CoordinatorAgent()

    async def run(self, farmer_input: Dict[str, Any]) -> str:
        """
        Execute the full advisory pipeline.

        Args:
            farmer_input: The validated farmer input dict.

        Returns:
            The request_id for tracking.
        """
        request_id = generate_request_id()
        start = time.time()
        logger.info("Starting advisory pipeline for %s", request_id)

        # Create blackboard with initial farmer info
        await blackboard.create(request_id, farmer_info=farmer_input)

        try:
            # Phase 1: Intake validation
            logger.info("[%s] Phase 1: Intake validation", request_id)
            await self.intake._safe_execute(blackboard, request_id)

            # Phase 2: Weather + Market in parallel
            logger.info("[%s] Phase 2: Weather + Market (parallel)", request_id)
            phase2_results = await asyncio.gather(
                self.weather._safe_execute(blackboard, request_id),
                self.market._safe_execute(blackboard, request_id),
                return_exceptions=True,
            )

            # Log any Phase 2 failures
            for i, result in enumerate(phase2_results):
                if isinstance(result, Exception):
                    agent_name = ["weather", "market"][i]
                    logger.error("[%s] Phase 2 agent %s failed: %s", request_id, agent_name, result)

            # Phase 3: Crop, risk, and scheme matching (after weather data is available)
            logger.info("[%s] Phase 3: Crop Advisory + Risk Assessment + Scheme Matching (parallel)", request_id)
            phase3_results = await asyncio.gather(
                self.crop._safe_execute(blackboard, request_id),
                self.risk._safe_execute(blackboard, request_id),
                self.scheme._safe_execute(blackboard, request_id),
                return_exceptions=True,
            )

            for i, result in enumerate(phase3_results):
                if isinstance(result, Exception):
                    agent_name = ["crop", "risk", "scheme"][i]
                    logger.error("[%s] Phase 3 agent %s failed: %s", request_id, agent_name, result)

            # Phase 4: Coordinator (after all agents complete)
            logger.info("[%s] Phase 4: Coordinator consolidation", request_id)
            result = await self.coordinator._safe_execute(blackboard, request_id)
            if "error" in result:
                await blackboard.mark_failed(request_id, result["error"])

        except Exception as exc:
            logger.exception("[%s] Pipeline failed: %s", request_id, exc)
            try:
                await blackboard.mark_failed(request_id, str(exc))
            except Exception:
                logger.exception("[%s] Could not record pipeline failure", request_id)

        elapsed = round(time.time() - start, 3)
        logger.info("[%s] Pipeline completed in %.3fs", request_id, elapsed)

        return request_id


# Singleton orchestrator
orchestrator = AdvisoryOrchestrator()
