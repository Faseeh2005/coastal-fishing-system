import requests

def get_wave_data(lat=24.86, lon=67.01):

    url = (
        "https://marine-api.open-meteo.com/v1/marine"
        f"?latitude={lat}&longitude={lon}"
        "&daily=wave_height_max"
        "&forecast_days=7"
        "&timezone=auto"
    )

    data = requests.get(url).json()

    daily = data.get("daily", {})

    waves = daily.get("wave_height_max", [])
    dates = daily.get("time", [])

    if not waves:
        waves = [0.5] * 7

    return {
        "dates": dates,
        "wave_height": waves
    }


def get_sea_state(wave_height):

    wave_height = float(wave_height)

    # FIX: thresholds aligned with Beaufort sea state scale
    if wave_height < 1.25:
        return "Calm", "Low"
    elif wave_height < 2.5:
        return "Moderate", "Medium"
    else:
        return "Rough", "High"
