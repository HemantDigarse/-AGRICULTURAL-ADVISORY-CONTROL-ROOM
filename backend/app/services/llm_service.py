"""LLM service - OpenAI integration with demo template fallback."""

import logging
from typing import Optional

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Lazy-loaded OpenAI client
_client = None


def _get_openai_client():
    global _client
    if _client is None:
        try:
            from openai import AsyncOpenAI
            _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        except Exception as exc:
            logger.warning("Could not create OpenAI client: %s", exc)
    return _client


async def generate(prompt: str, system_prompt: Optional[str] = None) -> str:
    """
    Generate text using OpenAI or return a demo template response.

    In DEMO_MODE, returns template-based responses. Live mode never falls back
    to generated demo content.
    """
    if settings.DEMO_MODE:
        logger.info("[DEMO] Generating template response for prompt (first 80 chars): %s", prompt[:80])
        return _demo_generate(prompt)
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is required for AI-generated live advisories.")

    try:
        client = _get_openai_client()
        if client is None:
            raise RuntimeError("Unable to initialize the configured OpenAI client.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1500,
        )
        return response.choices[0].message.content or ""

    except Exception as exc:
        logger.error("OpenAI API call failed: %s", exc)
        raise RuntimeError("The AI advisory service is unavailable.") from exc


def _demo_generate(prompt: str) -> str:
    """Generate a realistic demo template response based on prompt keywords."""
    prompt_lower = prompt.lower()

    if "crop advisory" in prompt_lower or "crop recommendation" in prompt_lower:
        return (
            "[DEMO Advisory]\n\n"
            "Based on the current weather conditions and growth stage, here are your recommendations:\n\n"
            "1. **Irrigation**: Maintain regular irrigation schedule. Monitor soil moisture levels daily.\n"
            "2. **Fertilizer**: Apply recommended dose of NPK fertilizer as per soil health card recommendations.\n"
            "3. **Pest Management**: Scout fields regularly for early pest detection. Use integrated pest management (IPM) practices.\n"
            "4. **General Care**: Ensure proper drainage to prevent waterlogging. Remove weeds manually or with approved herbicides.\n\n"
            "Note: This is demo-generated advisory. In production, this would be personalized using AI analysis."
        )

    if "coordinator" in prompt_lower or "consolidated" in prompt_lower or "final advisory" in prompt_lower:
        return (
            "[DEMO Consolidated Advisory]\n\n"
            "Dear Farmer,\n\n"
            "Here is your comprehensive agricultural advisory based on analysis of weather, market, "
            "crop health, and government scheme data:\n\n"
            "**Immediate Actions (Next 48 Hours):**\n"
            "- Monitor weather forecasts for any sudden changes\n"
            "- Check soil moisture and irrigate if needed\n"
            "- Scout for pest/disease symptoms\n\n"
            "**This Week:**\n"
            "- Apply recommended fertilizer dose based on growth stage\n"
            "- Review market prices before planning harvest\n"
            "- Check eligibility for applicable government schemes\n\n"
            "**Market Outlook:**\n"
            "- Current prices are within normal range\n"
            "- Consult your local mandi for latest rates\n\n"
            "Note: This is a demo advisory. In production, this would be a fully personalized recommendation."
        )

    if "risk" in prompt_lower or "alert" in prompt_lower:
        return (
            "[DEMO Risk Assessment]\n\n"
            "Based on current conditions, the following risks have been identified:\n"
            "- Weather-related: Monitor for temperature fluctuations\n"
            "- Pest risk: Seasonal pest activity expected; maintain vigilance\n"
            "- Market risk: Price volatility possible; consider phased selling\n\n"
            "Overall risk level: MODERATE\n"
            "Note: This is demo-generated. Production uses real-time data analysis."
        )

    if "scheme" in prompt_lower or "government" in prompt_lower:
        return (
            "[DEMO Scheme Analysis]\n\n"
            "Based on your profile, you may be eligible for the following government schemes. "
            "Please verify eligibility at your nearest Common Service Centre (CSC).\n\n"
            "Note: This is demo-generated scheme matching."
        )

    # Generic fallback
    return (
        "[DEMO Response]\n\n"
        "This is a demo-generated response. In production mode with a valid OpenAI API key, "
        "this would contain AI-generated personalized content.\n\n"
        "The system has processed your request and generated this placeholder response."
    )

