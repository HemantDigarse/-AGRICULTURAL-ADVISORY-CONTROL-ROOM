"""Government Scheme Agent - finds relevant schemes using RAG/keyword matching."""

import logging
from typing import Any, Dict, List

from app.agents import BaseAgent
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Keyword mapping for scheme relevance
SCHEME_KEYWORDS: Dict[str, List[str]] = {
    "PM-KISAN": [
        "income", "support", "cash", "money", "financial", "small farmer",
        "marginal", "kisan", "pm-kisan", "land", "all crops",
    ],
    "PMFBY": [
        "insurance", "crop loss", "flood", "drought", "hail", "natural disaster",
        "cyclone", "risk", "premium", "fasal bima", "protection", "weather damage",
    ],
    "Soil Health Card Scheme": [
        "soil", "fertility", "nutrient", "testing", "health card",
        "fertilizer recommendation", "soil test", "npk", "organic matter",
    ],
    "PM Krishi Sinchayee Yojana": [
        "irrigation", "water", "drip", "sprinkler", "micro irrigation",
        "per drop more crop", "water harvesting", "borewell", "sinchayee", "drought",
    ],
}


class GovernmentSchemeAgent(BaseAgent):
    """Finds relevant government schemes for the farmer using keyword matching / RAG."""

    def __init__(self) -> None:
        super().__init__(
            name="scheme",
            description="Uses RAG/keyword matching to find government schemes relevant to the farmer's situation.",
        )

    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Find relevant schemes and publish to blackboard."""
        state = await blackboard.get_state(request_id)
        if state is None:
            raise ValueError(f"No blackboard state for {request_id}")

        farmer_info = state.farmer_info or {}
        weather_data = state.weather_data or {}
        crop = farmer_info.get("crop", "").lower()
        farm_size = farmer_info.get("farm_size")
        query = farmer_info.get("query", "")
        weather_risk = weather_data.get("risk_level", "LOW")

        # Build context for matching
        context_words = set()
        context_words.add(crop)
        if query:
            context_words.update(query.lower().split())
        if farm_size and farm_size < 5:
            context_words.update(["small farmer", "marginal"])
        if weather_risk in ("HIGH", "CRITICAL"):
            context_words.update(["risk", "insurance", "crop loss", "weather damage"])

        # Try RAG retrieval first, fall back to keyword matching
        try:
            from app.rag import retrieval_service
            rag_results = await retrieval_service.search_schemes(
                " ".join(context_words), top_k=4
            )
            if rag_results:
                relevant_schemes = rag_results
            else:
                relevant_schemes = self._keyword_match(context_words)
        except Exception:
            self.logger.info("RAG not available, using keyword matching")
            relevant_schemes = self._keyword_match(context_words)

        scheme_result = {
            "relevant_schemes": relevant_schemes,
            "total_found": len(relevant_schemes),
            "matching_context": list(context_words)[:10],
            "is_demo": settings.DEMO_MODE,
        }

        await blackboard.update_section(request_id, "scheme_data", scheme_result)

        self.logger.info("Found %d relevant schemes for %s", len(relevant_schemes), crop)
        return scheme_result

    def _keyword_match(self, context_words: set) -> List[Dict[str, Any]]:
        """Match schemes based on keyword overlap."""
        results = []
        for scheme_name, keywords in SCHEME_KEYWORDS.items():
            score = 0
            matched_keywords = []
            for keyword in keywords:
                for word in context_words:
                    if keyword in word or word in keyword:
                        score += 1
                        matched_keywords.append(keyword)
                        break

            # PM-KISAN is always somewhat relevant (universal scheme)
            if scheme_name == "PM-KISAN":
                score = max(score, 1)

            if score > 0:
                results.append({
                    "scheme_name": scheme_name,
                    "relevance_score": min(score / len(keywords), 1.0),
                    "matched_keywords": matched_keywords[:5],
                    "reason": self._get_relevance_reason(scheme_name, matched_keywords),
                })

        # Sort by relevance
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results

    def _get_relevance_reason(self, scheme_name: str, matched: List[str]) -> str:
        """Generate a human-readable reason for scheme relevance."""
        reasons = {
            "PM-KISAN": "Provides direct income support of ₹6,000/year to all land-holding farmers.",
            "PMFBY": "Provides crop insurance coverage against natural calamities and weather events.",
            "Soil Health Card Scheme": "Free soil testing and nutrient recommendations to optimize fertilizer use.",
            "PM Krishi Sinchayee Yojana": "Subsidies for micro-irrigation systems (drip/sprinkler) to improve water efficiency.",
        }
        return reasons.get(scheme_name, f"Matched on: {', '.join(matched)}")

