"""Weather service - OpenWeatherMap integration with demo fallback."""

import logging
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Realistic Indian weather data by region
DEMO_WEATHER: Dict[str, Dict[str, Any]] = {
    "default": {
        "temperature_c": 32.5,
        "humidity": 65.0,
        "rainfall_mm": 2.5,
        "wind_speed_kmh": 12.0,
        "condition": "Partly Cloudy",
    },
    "punjab": {
        "temperature_c": 28.0,
        "humidity": 55.0,
        "rainfall_mm": 0.0,
        "wind_speed_kmh": 10.0,
        "condition": "Clear Sky",
    },
    "maharashtra": {
        "temperature_c": 34.0,
        "humidity": 70.0,
        "rainfall_mm": 5.0,
        "wind_speed_kmh": 15.0,
        "condition": "Scattered Clouds",
    },
    "uttar pradesh": {
        "temperature_c": 30.0,
        "humidity": 60.0,
        "rainfall_mm": 1.0,
        "wind_speed_kmh": 8.0,
        "condition": "Haze",
    },
    "karnataka": {
        "temperature_c": 29.0,
        "humidity": 75.0,
        "rainfall_mm": 8.0,
        "wind_speed_kmh": 14.0,
        "condition": "Light Rain",
    },
    "tamil nadu": {
        "temperature_c": 33.0,
        "humidity": 80.0,
        "rainfall_mm": 3.0,
        "wind_speed_kmh": 18.0,
        "condition": "Humid & Warm",
    },
    "rajasthan": {
        "temperature_c": 38.0,
        "humidity": 25.0,
        "rainfall_mm": 0.0,
        "wind_speed_kmh": 20.0,
        "condition": "Hot & Dry",
    },
    "west bengal": {
        "temperature_c": 31.0,
        "humidity": 82.0,
        "rainfall_mm": 12.0,
        "wind_speed_kmh": 16.0,
        "condition": "Heavy Rain",
    },
    "madhya pradesh": {
        "temperature_c": 33.0,
        "humidity": 58.0,
        "rainfall_mm": 1.5,
        "wind_speed_kmh": 11.0,
        "condition": "Partly Cloudy",
    },
    "andhra pradesh": {
        "temperature_c": 35.0,
        "humidity": 72.0,
        "rainfall_mm": 4.0,
        "wind_speed_kmh": 13.0,
        "condition": "Warm & Humid",
    },
}


def _get_demo_weather(city: str, state: str) -> Dict[str, Any]:
    """Return realistic demo weather data for an Indian location."""
    state_lower = state.lower() if state else ""
    base = DEMO_WEATHER.get(state_lower, DEMO_WEATHER["default"]).copy()

    # Add small random variations to make it feel realistic
    base["temperature_c"] = round(base["temperature_c"] + random.uniform(-2, 2), 1)
    base["humidity"] = round(min(100, max(10, base["humidity"] + random.uniform(-5, 5))), 1)
    base["rainfall_mm"] = round(max(0, base["rainfall_mm"] + random.uniform(-1, 3)), 1)
    base["wind_speed_kmh"] = round(max(0, base["wind_speed_kmh"] + random.uniform(-3, 3)), 1)
    base["city"] = city
    base["state"] = state
    base["is_demo"] = True
    base["fetched_at"] = datetime.now(timezone.utc).isoformat()

    return base


def _generate_demo_forecast(base: Dict[str, Any]) -> list:
    """Generate a 5-day demo forecast."""
    forecast = []
    for i in range(1, 6):
        day = {
            "date": (datetime.now(timezone.utc) + timedelta(days=i)).strftime("%Y-%m-%d"),
            "temperature_c": round(base["temperature_c"] + random.uniform(-3, 3), 1),
            "humidity": round(min(100, max(10, base["humidity"] + random.uniform(-10, 10))), 1),
            "rainfall_mm": round(max(0, base["rainfall_mm"] + random.uniform(-2, 5)), 1),
            "condition": random.choice([
                "Clear Sky", "Partly Cloudy", "Scattered Clouds",
                "Light Rain", "Moderate Rain", "Overcast",
            ]),
        }
        forecast.append(day)
    return forecast


async def get_weather(city: str, state: str) -> Dict[str, Any]:
    """
    Fetch weather data for the given location.

    In DEMO_MODE, returns realistic mock data.
    Otherwise, calls OpenWeatherMap API.
    """
    if settings.DEMO_MODE:
        logger.info("[DEMO] Generating weather data for %s, %s", city, state)
        base = _get_demo_weather(city, state)
        forecast = _generate_demo_forecast(base)
        return {
            "current": base,
            "forecast": forecast,
            "source": "demo",
        }

    # Live mode: call OpenWeatherMap
    if not settings.WEATHER_API_KEY:
        logger.warning("No WEATHER_API_KEY set; falling back to demo data")
        base = _get_demo_weather(city, state)
        base["is_demo"] = True
        base["warning"] = "No API key configured - using demo data"
        return {"current": base, "forecast": _generate_demo_forecast(base), "source": "demo_fallback"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            query = f"{city},{state},IN"
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": query, "appid": settings.WEATHER_API_KEY, "units": "metric"},
            )
            resp.raise_for_status()
            data = resp.json()

            current = {
                "city": city,
                "state": state,
                "temperature_c": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "rainfall_mm": data.get("rain", {}).get("1h", 0.0),
                "wind_speed_kmh": round(data["wind"]["speed"] * 3.6, 1),
                "condition": data["weather"][0]["description"].title(),
                "is_demo": False,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }

            # Forecast
            forecast_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={"q": query, "appid": settings.WEATHER_API_KEY, "units": "metric", "cnt": 5},
            )
            forecast_data = []
            if forecast_resp.status_code == 200:
                for item in forecast_resp.json().get("list", []):
                    forecast_data.append({
                        "date": item["dt_txt"],
                        "temperature_c": item["main"]["temp"],
                        "humidity": item["main"]["humidity"],
                        "rainfall_mm": item.get("rain", {}).get("3h", 0.0),
                        "condition": item["weather"][0]["description"].title(),
                    })

            return {"current": current, "forecast": forecast_data, "source": "openweathermap"}

    except Exception as exc:
        logger.error("Weather API call failed: %s. Falling back to demo.", exc)
        base = _get_demo_weather(city, state)
        base["warning"] = f"API error: {exc} - using demo fallback"
        return {"current": base, "forecast": _generate_demo_forecast(base), "source": "demo_fallback"}

