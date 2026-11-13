"""Intake Agent - validates farmer input and generates request ID."""

import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict

from app.agents import BaseAgent

logger = logging.getLogger(__name__)

_request_counter = 0

VALID_GROWTH_STAGES = [
    "Germination",
    "Seedling",
    "Vegetative",
    "Flowering",
    "Fruiting",
    "Maturity",
    "Harvest",
]


def generate_request_id() -> str:
    """Generate a unique request ID like ADV-YYYYMMDD-NNN."""
    global _request_counter
    _request_counter += 1
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"ADV-{date_str}-{_request_counter:03d}"


class IntakeAgent(BaseAgent):
    """Validates farmer input and generates a unique advisory request ID."""

    def __init__(self) -> None:
        super().__init__(
            name="intake",
            description="Validates farmer input, normalizes data, and generates a unique request ID.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Validate farmer input from blackboard and publish cleaned data."""
        start = time.time()
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}

        # Validate crop
        crop = farmer_info.get("crop", "").strip()
        if not crop:
            raise ValueError("Crop name is required and cannot be empty")

        # Validate location
        location = farmer_info.get("location", {})
        city = location.get("city", "").strip() if isinstance(location, dict) else ""
        state_name = location.get("state", "").strip() if isinstance(location, dict) else ""
        if not city:
            raise ValueError("City is required in location")
        if not state_name:
            raise ValueError("State is required in location")
        district = (location.get("district", "").strip() if isinstance(location, dict) else "") or city

        # Validate growth stage
        growth_stage = farmer_info.get("growth_stage", "").strip()
        if growth_stage:
            matched = None
            for valid_stage in VALID_GROWTH_STAGES:
                if growth_stage.lower() == valid_stage.lower():
                    matched = valid_stage
                    break
            if matched:
                growth_stage = matched
            else:
                self.logger.warning("Growth stage '%s' not in standard list, using as-is", growth_stage)
        else:
            growth_stage = "Vegetative"

        validated = {
            "request_id": request_id,
            "crop": crop.title(),
            "location": {
                "city": city.title(),
                "district": district.title(),
                "state": state_name.title(),
            },
            "growth_stage": growth_stage,
            "farmer_name": farmer_info.get("farmer_name", "Anonymous Farmer"),
            "farm_size": farmer_info.get("farm_size"),
            "query": farmer_info.get("query", ""),
            "validated_at": datetime.now(timezone.utc).isoformat(),
        }

        await blackboard.update_section(request_id, "farmer_info", validated)

        elapsed = round(time.time() - start, 3)
        self.logger.info(
            "Intake validated: crop=%s, location=%s/%s, stage=%s (%.3fs)",
            validated["crop"], validated["location"]["city"],
            validated["location"]["state"], validated["growth_stage"], elapsed,
        )

        return validated
