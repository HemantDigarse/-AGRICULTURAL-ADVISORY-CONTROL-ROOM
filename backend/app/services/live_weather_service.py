"""Live weather and historical-weather data from Open-Meteo."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import httpx

from app.config.settings import settings

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"

WEATHER_CONDITIONS = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Heavy Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
}


def _condition(code: int | None) -> str:
    return WEATHER_CONDITIONS.get(code, "Unknown")


def _mean(values: list[float | None]) -> float:
    present_values = [value for value in values if value is not None]
    return round(sum(present_values) / len(present_values), 1) if present_values else 0.0


async def get_live_weather(city: str, state: str) -> Dict[str, Any]:
    """Fetch current, forecast, and recent historical weather for an Indian city."""
    client_options: Dict[str, Any] = {"timeout": 15.0}
    if settings.HTTP_CA_BUNDLE:
        client_options["verify"] = settings.HTTP_CA_BUNDLE

    async with httpx.AsyncClient(**client_options) as client:
        geocoding_response = await client.get(
            GEOCODING_URL,
            params={"name": city, "count": 1, "language": "en", "format": "json"},
        )
        geocoding_response.raise_for_status()
        locations = geocoding_response.json().get("results", [])
        if not locations:
            raise ValueError(f"Could not find a location for '{city}'.")

        location = locations[0]
        latitude = location["latitude"]
        longitude = location["longitude"]
        forecast_response = await client.get(
            FORECAST_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
                "forecast_days": 5,
                "timezone": "auto",
            },
        )
        forecast_response.raise_for_status()

        end_date = datetime.now(timezone.utc).date() - timedelta(days=1)
        start_date = end_date - timedelta(days=13)
        history_response = await client.get(
            HISTORICAL_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "daily": "temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max",
                "timezone": "auto",
            },
        )
        history_response.raise_for_status()

    forecast_payload = forecast_response.json()
    current = forecast_payload.get("current", {})
    daily = forecast_payload.get("daily", {})
    history = history_response.json().get("daily", {})

    forecast = [
        {
            "date": date,
            "temperature_c": round(
                ((maximum or 0) + (minimum or 0)) / 2, 1
            ),
            "humidity": None,
            "rainfall_mm": rainfall or 0.0,
            "condition": _condition(code),
            "wind_speed_kmh": wind_speed or 0.0,
        }
        for date, code, maximum, minimum, rainfall, wind_speed in zip(
            daily.get("time", []),
            daily.get("weather_code", []),
            daily.get("temperature_2m_max", []),
            daily.get("temperature_2m_min", []),
            daily.get("precipitation_sum", []),
            daily.get("wind_speed_10m_max", []),
        )
    ]

    history_temperatures = history.get("temperature_2m_mean", [])
    history_rainfall = history.get("precipitation_sum", [])
    history_humidity = history.get("relative_humidity_2m_mean", [])
    history_wind = history.get("wind_speed_10m_max", [])
    historical_summary = {
        "period_start": start_date.isoformat(),
        "period_end": end_date.isoformat(),
        "days": len(history.get("time", [])),
        "average_temperature_c": _mean(history_temperatures),
        "total_rainfall_mm": round(sum(value or 0 for value in history_rainfall), 1),
        "average_humidity": _mean(history_humidity),
        "maximum_wind_speed_kmh": round(max(history_wind or [0]), 1),
    }

    return {
        "current": {
            "city": location.get("name", city),
            "state": state,
            "temperature_c": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "rainfall_mm": current.get("precipitation", 0.0),
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "condition": _condition(current.get("weather_code")),
            "is_demo": False,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        },
        "forecast": forecast,
        "historical_summary": historical_summary,
        "source": "open-meteo",
    }
