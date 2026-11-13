"""Crop Advisory Agent - generates crop and stage-specific recommendations."""

import logging
import time
from typing import Any, Dict, List, Tuple

from app.agents import BaseAgent
from app.services import llm_service
from app.config.settings import settings

logger = logging.getLogger(__name__)

# ── Detailed demo crop advisory templates ──────────────────────────────────
CROP_TEMPLATES: Dict[str, Dict[str, Dict[str, Any]]] = {
    "Wheat": {
        "Germination": {
            "recommendations": [
                "Ensure seed bed has adequate moisture (field capacity) for uniform germination.",
                "Treat seeds with Thiram/Carbendazim (2g/kg seed) to prevent seed-borne diseases.",
                "Maintain soil temperature between 20-25°C for optimal germination in 5-7 days.",
                "If soil is dry, apply pre-sowing irrigation and wait 2-3 days before drilling seeds.",
            ],
            "irrigation": "Apply light irrigation immediately after sowing if soil is dry. Avoid waterlogging.",
            "fertilizer": "Apply basal dose: DAP 100 kg/ha + MOP 40 kg/ha at sowing.",
            "pest_management": "Treat seeds with Chlorpyrifos 20 EC @ 4ml/kg seed to prevent termite attack.",
        },
        "Vegetative": {
            "recommendations": [
                "Apply first top-dressing of Urea (50 kg/ha) at 21 DAS (Crown Root Initiation).",
                "Scout for aphids and armyworm — apply Imidacloprid 17.8 SL if threshold crossed.",
                "Remove broadleaf weeds by hand or apply 2,4-D at 20-25 DAS.",
                "If yellow rust patches appear, spray Propiconazole 25 EC (0.1%).",
            ],
            "irrigation": "CRI irrigation at 21 DAS is critical for tillering. Second irrigation at 40-45 DAS.",
            "fertilizer": "Apply remaining 50% Nitrogen (60 kg/ha) as top dressing in two splits.",
            "pest_management": "Watch for aphids and brown rust. Apply Imidacloprid 17.8 SL @ 0.5ml/L if ETL crossed.",
        },
        "Flowering": {
            "recommendations": [
                "Apply second top-dressing of Urea (25 kg/ha) at boot leaf stage.",
                "Avoid any water stress — flowering is most sensitive stage for wheat yield.",
                "Scout for Karnal bunt and loose smut symptoms; apply fungicide if needed.",
                "Do not apply herbicides at this stage — risk of yield loss.",
            ],
            "irrigation": "Critical irrigation at flowering (60-65 DAS). Water stress reduces yield by 20-30%.",
            "fertilizer": "Foliar spray of 2% Urea for enhanced grain filling if plants show yellowing.",
            "pest_management": "Monitor for Karnal bunt if humidity is high. Spray Propiconazole 25 EC @ 1ml/L.",
        },
        "Maturity": {
            "recommendations": [
                "Plan harvest when grain moisture reaches 14%.",
                "Monitor for lodging if strong winds expected.",
                "Prepare storage facilities — clean and fumigate before storing grain.",
            ],
            "irrigation": "Stop irrigation 15-20 days before expected harvest.",
            "fertilizer": "No fertilizer application needed at this stage.",
            "pest_management": "Watch for stored grain pests. Fumigate storage bins before use.",
        },
    },
    "Rice": {
        "Seedling": {
            "recommendations": [
                "Soak seeds in water for 24 hours, then incubate for 48 hours for sprouting.",
                "Treat seeds with Carbendazim 50 WP (2g/kg) before soaking.",
                "Prepare nursery bed with well-puddled, leveled soil.",
                "Sow pre-germinated seeds at 40-50 g/m² in nursery.",
            ],
            "irrigation": "Maintain 2-3 cm standing water in nursery beds for uniform establishment.",
            "fertilizer": "Apply 10 kg N, 5 kg P2O5 per 1000 sq.m nursery area.",
            "pest_management": "Treat seeds with Carbendazim @ 2g/kg against blast. Monitor for BPH in nursery.",
        },
        "Vegetative": {
            "recommendations": [
                "Apply first top-dressing of Urea (40 kg/ha) at 14 DAT.",
                "Maintain 5 cm standing water for effective weed suppression.",
                "Monitor for stem borer (dead hearts) — apply Cartap hydrochloride if >5%.",
                "If iron deficiency observed (yellowing between veins), spray 0.5% FeSO₄.",
            ],
            "irrigation": "Maintain 5 cm standing water. Follow AWD (Alternate Wetting and Drying) to save 20-30% water.",
            "fertilizer": "Apply 40% N as basal + full P&K. Top dress 30% N at active tillering.",
            "pest_management": "Monitor for stem borer, leaf folder. Install pheromone traps @ 5/acre.",
        },
        "Flowering": {
            "recommendations": [
                "Maintain continuous flooding (5 cm) from panicle initiation to flowering.",
                "Apply third Urea split (30 kg/ha) at panicle initiation.",
                "Watch for blast disease — spray Tricyclazole 75 WP (0.06%) if neck blast appears.",
                "Do not drain the field during flowering — severe yield penalty.",
            ],
            "irrigation": "Critical: maintain 5 cm standing water throughout flowering. No drainage.",
            "fertilizer": "Apply remaining nitrogen at panicle initiation. Foliar spray of 2% KCl for grain filling.",
            "pest_management": "Watch for neck blast, false smut. Spray Tricyclazole 75% WP @ 0.6g/L.",
        },
    },
    "Cotton": {
        "Vegetative": {
            "recommendations": [
                "Apply Neem oil (5 ml/L) spray to manage sucking pests (jassids, whiteflies).",
                "Thin plants to maintain 60×30 cm or 90×45 cm spacing.",
                "Apply second dose of nitrogen (40 kg/ha Urea) at 30-35 DAS.",
                "Monitor for early-season bollworm eggs on terminal shoots.",
            ],
            "irrigation": "Light irrigation every 10-12 days during vegetative growth. Avoid waterlogging.",
            "fertilizer": "Apply 50 kg N/ha at 30 DAS, 50 kg N/ha at 60 DAS. Full dose P&K as basal.",
            "pest_management": "Install yellow sticky traps for whitefly monitoring. Neem oil spray fortnightly.",
        },
        "Flowering": {
            "recommendations": [
                "Critical period for bollworm management — install pheromone traps (5/ha).",
                "Apply Emamectin Benzoate 5 SG (0.4 g/L) if bollworm larvae exceed 1/plant.",
                "Spray Profenophos 50 EC for American bollworm if ETL crossed.",
                "Avoid water stress — significantly reduces boll retention.",
            ],
            "irrigation": "Increase irrigation frequency to every 7-8 days during flowering and boll formation.",
            "fertilizer": "Foliar spray of MgSO4 @ 1% + DAP @ 2% for enhanced boll development.",
            "pest_management": "Peak bollworm season. Spray Emamectin Benzoate @ 0.2g/L if ETL crossed.",
        },
    },
}

DEFAULT_TEMPLATE = {
    "recommendations": [
        "Apply balanced fertilization based on soil test recommendations.",
        "Monitor for region-specific pests and diseases — consult local extension services.",
        "Practice crop rotation to maintain soil health.",
        "Use mulching to conserve soil moisture and suppress weeds.",
    ],
    "irrigation": "Irrigate based on soil moisture readings and crop evapotranspiration demand.",
    "fertilizer": "Follow soil test-based fertilizer recommendations. Ensure balanced NPK application.",
    "pest_management": "Regular scouting for pest and disease symptoms. Use IPM practices.",
}


def _adjust_for_weather(recs: List[str], irrigation: str, weather: Dict[str, Any]) -> Tuple[List[str], str]:
    """Add weather-driven warnings to recommendations."""
    current = weather.get("current", {})
    temp = current.get("temperature_c", 30)
    humidity = current.get("humidity", 60)
    rainfall = current.get("rainfall_mm", 0)

    adjusted = list(recs)
    adj_irr = irrigation

    if rainfall > 20:
        adjusted.append(
            f"⚠️ Heavy rainfall ({rainfall}mm) — postpone all spray operations "
            "and ensure field drainage is clear."
        )
        adj_irr += f" Note: With {rainfall}mm rainfall, skip scheduled irrigation today."
    if humidity > 80:
        adjusted.append(
            f"🦠 High humidity ({humidity}%) increases fungal disease pressure. "
            "Apply preventive fungicide if symptoms appear."
        )
    if temp > 38:
        adjusted.append(
            f"🌡️ Extreme heat ({temp}°C) — irrigate during early morning or late evening. "
            "Consider light sprinkler irrigation for cooling effect."
        )
    if temp < 10:
        adjusted.append(f"❄️ Cold conditions ({temp}°C) — protect seedlings with row covers or mulch.")

    return adjusted, adj_irr


class CropAdvisoryAgent(BaseAgent):
    """Generates crop + growth-stage + weather specific recommendations."""

    def __init__(self) -> None:
        super().__init__(
            name="crop",
            description="Reads weather from blackboard and generates detailed crop advisory.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        start = time.time()
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}
        weather_data = state.weather_data or {}

        crop = farmer_info.get("crop", "Unknown")
        growth_stage = farmer_info.get("growth_stage", "Vegetative")

        if settings.DEMO_MODE:
            advisory = self._generate_demo_advisory(crop, growth_stage, weather_data)
        else:
            advisory = await self._generate_llm_advisory(
                crop, growth_stage, farmer_info, weather_data,
            )

        await blackboard.update_section(request_id, "crop_advisory", advisory)

        elapsed = round(time.time() - start, 3)
        self.logger.info("Crop advisory generated for %s at %s stage (%.3fs)", crop, growth_stage, elapsed)
        return advisory

    def _generate_demo_advisory(self, crop: str, stage: str, weather: Dict) -> Dict[str, Any]:
        crop_data = CROP_TEMPLATES.get(crop, {})
        stage_data = crop_data.get(stage, DEFAULT_TEMPLATE)

        recs = list(stage_data.get("recommendations", DEFAULT_TEMPLATE["recommendations"]))
        irrigation = stage_data.get("irrigation", DEFAULT_TEMPLATE["irrigation"])
        recs, irrigation = _adjust_for_weather(recs, irrigation, weather)

        return {
            "crop": crop,
            "growth_stage": stage,
            "advisory_text": "\n".join(f"• {r}" for r in recs),
            "irrigation_advice": irrigation,
            "fertilizer_advice": stage_data.get("fertilizer", DEFAULT_TEMPLATE["fertilizer"]),
            "pest_management": stage_data.get("pest_management", DEFAULT_TEMPLATE["pest_management"]),
            "recommendations": [
                {"category": "Irrigation", "priority": "HIGH", "action": irrigation},
                {"category": "Fertilizer", "priority": "MEDIUM",
                 "action": stage_data.get("fertilizer", DEFAULT_TEMPLATE["fertilizer"])},
                {"category": "Pest Control", "priority": "MEDIUM",
                 "action": stage_data.get("pest_management", DEFAULT_TEMPLATE["pest_management"])},
            ],
            "data_source": "demo_template",
            "is_demo": True,
        }

    async def _generate_llm_advisory(
        self, crop: str, stage: str, farmer_info: Dict, weather: Dict,
    ) -> Dict[str, Any]:
        current = weather.get("current", {})
        prompt = (
            f"Generate a detailed crop advisory for {crop} at {stage} stage. "
            f"Weather: {current.get('condition', 'N/A')}, Temp: {current.get('temperature_c', 'N/A')}°C, "
            f"Humidity: {current.get('humidity', 'N/A')}%, Rainfall: {current.get('rainfall_mm', 'N/A')}mm. "
            "Provide crop advisory, irrigation, fertilizer, and pest management advice."
        )
        text = await llm_service.generate(prompt)
        return {
            "crop": crop,
            "growth_stage": stage,
            "advisory_text": text,
            "irrigation_advice": "See detailed advisory above.",
            "fertilizer_advice": "See detailed advisory above.",
            "pest_management": "See detailed advisory above.",
            "recommendations": [],
            "data_source": "llm",
            "is_demo": False,
        }
