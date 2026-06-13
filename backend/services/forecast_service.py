import requests


def get_forecast(lat=24.86, lon=67.01):

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&daily=temperature_2m_max,wind_speed_10m_max,relative_humidity_2m_max"
        "&forecast_days=7"
        "&timezone=auto"
    )

    data = requests.get(url).json()

    daily = data.get("daily", {})

    raw_wind = daily.get("wind_speed_10m_max", [])
    wind_in_ms = [round(w / 3.6, 2) for w in raw_wind]

    return {
        "dates": daily.get("time", []),
        "temperature": daily.get("temperature_2m_max", []),
        "wind_speed": wind_in_ms,
        "humidity": daily.get("relative_humidity_2m_max", [])  # FIX: real forecast humidity
    }
