"""Market service - mandi price data with demo fallback."""

import logging
import random
from datetime import datetime, timezone
from typing import Dict, Any, List

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Realistic Indian mandi prices (INR/quintal) for major crops
DEMO_MANDI_PRICES: Dict[str, Dict[str, Any]] = {
    "wheat": {
        "min_price": 2200,
        "max_price": 2500,
        "modal_price": 2350,
        "msp": 2275,
        "mandis": [
            {"name": "Azadpur Mandi, Delhi", "min": 2250, "max": 2480, "modal": 2370},
            {"name": "Indore Mandi, MP", "min": 2200, "max": 2450, "modal": 2330},
            {"name": "Ludhiana Mandi, Punjab", "min": 2280, "max": 2500, "modal": 2400},
        ],
    },
    "rice": {
        "min_price": 1800,
        "max_price": 2100,
        "modal_price": 1950,
        "msp": 2183,
        "mandis": [
            {"name": "Karnal Mandi, Haryana", "min": 1850, "max": 2100, "modal": 1980},
            {"name": "Burdwan Mandi, West Bengal", "min": 1800, "max": 2050, "modal": 1920},
            {"name": "Warangal Mandi, Telangana", "min": 1820, "max": 2080, "modal": 1950},
        ],
    },
    "cotton": {
        "min_price": 6000,
        "max_price": 6500,
        "modal_price": 6250,
        "msp": 6620,
        "mandis": [
            {"name": "Rajkot Mandi, Gujarat", "min": 6100, "max": 6500, "modal": 6300},
            {"name": "Adilabad Mandi, Telangana", "min": 6000, "max": 6400, "modal": 6200},
            {"name": "Nagpur Mandi, Maharashtra", "min": 6050, "max": 6450, "modal": 6250},
        ],
    },
    "soybean": {
        "min_price": 4200,
        "max_price": 4800,
        "modal_price": 4500,
        "msp": 4600,
        "mandis": [
            {"name": "Indore Mandi, MP", "min": 4300, "max": 4800, "modal": 4550},
            {"name": "Latur Mandi, Maharashtra", "min": 4200, "max": 4700, "modal": 4450},
        ],
    },
    "maize": {
        "min_price": 1800,
        "max_price": 2200,
        "modal_price": 2000,
        "msp": 2090,
        "mandis": [
            {"name": "Davangere Mandi, Karnataka", "min": 1850, "max": 2200, "modal": 2020},
            {"name": "Gulbarga Mandi, Karnataka", "min": 1800, "max": 2150, "modal": 1980},
        ],
    },
    "sugarcane": {
        "min_price": 300,
        "max_price": 380,
        "modal_price": 350,
        "msp": 315,
        "mandis": [
            {"name": "Muzaffarnagar, UP", "min": 310, "max": 380, "modal": 355},
            {"name": "Kolhapur, Maharashtra", "min": 300, "max": 370, "modal": 340},
        ],
    },
    "mustard": {
        "min_price": 4800,
        "max_price": 5500,
        "modal_price": 5150,
        "msp": 5450,
        "mandis": [
            {"name": "Alwar Mandi, Rajasthan", "min": 4900, "max": 5500, "modal": 5200},
            {"name": "Jaipur Mandi, Rajasthan", "min": 4800, "max": 5400, "modal": 5100},
        ],
    },
    "groundnut": {
        "min_price": 5200,
        "max_price": 5800,
        "modal_price": 5500,
        "msp": 5850,
        "mandis": [
            {"name": "Junagadh Mandi, Gujarat", "min": 5250, "max": 5800, "modal": 5520},
            {"name": "Anantapur Mandi, AP", "min": 5200, "max": 5750, "modal": 5480},
        ],
    },
}


def _get_price_trend() -> str:
    """Return a random but realistic price trend."""
    return random.choice(["rising", "stable", "stable", "falling"])


async def get_market_price(crop: str, state: str) -> Dict[str, Any]:
    """
    Fetch market price data for the given crop.

    In DEMO_MODE, returns realistic mock mandi prices.
    """
    crop_lower = crop.lower().strip()

    if settings.DEMO_MODE:
        logger.info("[DEMO] Generating market data for %s in %s", crop, state)

        price_info = DEMO_MANDI_PRICES.get(crop_lower)

        if price_info is None:
            # Generate generic prices for unknown crops
            base_price = random.randint(1500, 5000)
            price_info = {
                "min_price": base_price,
                "max_price": base_price + random.randint(200, 600),
                "modal_price": base_price + random.randint(100, 300),
                "msp": base_price + random.randint(50, 400),
                "mandis": [
                    {
                        "name": f"Local Mandi, {state}",
                        "min": base_price,
                        "max": base_price + random.randint(200, 500),
                        "modal": base_price + random.randint(100, 250),
                    }
                ],
            }

        # Add random variations
        variation = random.uniform(-50, 50)
        mandis = []
        for m in price_info["mandis"]:
            mandis.append({
                "mandi_name": m["name"],
                "min_price": round(m["min"] + variation, 0),
                "max_price": round(m["max"] + variation, 0),
                "modal_price": round(m["modal"] + variation, 0),
                "unit": "INR/quintal",
            })

        trend = _get_price_trend()
        avg_price = round(sum(m["modal_price"] for m in mandis) / len(mandis), 0)

        # Generate recommendation based on price vs MSP
        msp = price_info.get("msp", avg_price)
        if avg_price >= msp * 1.05:
            recommendation = "SELL"
            recommendation_reason = (
                f"Current market price (₹{avg_price}/quintal) is above MSP (₹{msp}/quintal). "
                f"Favorable time to sell."
            )
        elif avg_price >= msp * 0.95:
            recommendation = "HOLD"
            recommendation_reason = (
                f"Current market price (₹{avg_price}/quintal) is near MSP (₹{msp}/quintal). "
                f"Consider holding for better prices or sell at MSP through government centres."
            )
        else:
            recommendation = "HOLD"
            recommendation_reason = (
                f"Current market price (₹{avg_price}/quintal) is below MSP (₹{msp}/quintal). "
                f"Recommend selling through government procurement centres at MSP."
            )

        return {
            "crop": crop,
            "state": state,
            "prices": mandis,
            "avg_price": avg_price,
            "msp": msp,
            "price_trend": trend,
            "recommendation": recommendation,
            "recommendation_reason": recommendation_reason,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": True,
            "source": "demo",
        }

    if not settings.DATA_GOV_API_KEY:
        raise RuntimeError(
            "Live mandi prices require DATA_GOV_API_KEY. Create a free data.gov.in "
            "API key and add it to backend/.env."
        )

    commodity = {"rice": "Paddy(Dhan)(Common)"}.get(crop_lower, crop.title())
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
            params={
                "api-key": settings.DATA_GOV_API_KEY,
                "format": "json",
                "limit": 100,
                "filters[State]": state,
                "filters[Commodity]": commodity,
            },
        )
        response.raise_for_status()
        records = response.json().get("records", [])

    if not records:
        raise RuntimeError(
            f"No live mandi price records found for {crop} in {state}. "
            "Try a crop name used by AGMARKNET."
        )

    prices = []
    dated_prices: Dict[str, List[float]] = {}
    for record in records:
        try:
            modal_price = float(record["modal_price"])
            min_price = float(record["min_price"])
            max_price = float(record["max_price"])
        except (KeyError, TypeError, ValueError):
            continue
        prices.append(
            {
                "mandi_name": record.get("market", "Unknown Mandi"),
                "min_price": min_price,
                "max_price": max_price,
                "modal_price": modal_price,
                "unit": "INR/quintal",
                "arrival_date": record.get("arrival_date"),
            }
        )
        arrival_date = record.get("arrival_date")
        if arrival_date:
            dated_prices.setdefault(arrival_date, []).append(modal_price)

    if not prices:
        raise RuntimeError("The live mandi response did not contain valid price values.")

    average_price = round(sum(item["modal_price"] for item in prices) / len(prices), 2)
    daily_averages = [
        sum(values) / len(values)
        for _, values in sorted(dated_prices.items())
        if values
    ]
    trend = "stable"
    if len(daily_averages) >= 2:
        change = (daily_averages[-1] - daily_averages[0]) / daily_averages[0]
        if change >= 0.03:
            trend = "rising"
        elif change <= -0.03:
            trend = "falling"

    recommendation = "HOLD" if trend == "falling" else "SELL"
    return {
        "crop": crop,
        "state": state,
        "prices": prices,
        "avg_price": average_price,
        "msp": None,
        "price_trend": trend,
        "recommendation": recommendation,
        "recommendation_reason": (
            "Recommendation is based on the latest AGMARKNET mandi records and "
            "the available price trend; verify local quality and transport costs before selling."
        ),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "is_demo": False,
        "source": "data.gov.in/AGMARKNET",
    }

