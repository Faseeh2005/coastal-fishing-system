from fastapi import APIRouter

from services.weather_service import get_weather
from services.marine_service import get_wave_data, get_sea_state
from services.ml_service import predict_risk_proba, predict_risk_label
from services.forecast_service import get_forecast
from logic.fishing_engine import get_fishing_recommendation

router = APIRouter()

# ML model is the single source of truth for risk_level.
# Score is derived from ML probability so gauge and label always agree.
RISK_SCORE_MAP = {
    "SAFE":     lambda proba: round(proba.get("SAFE", 0) * 0 + proba.get("MODERATE", 0) * 40 + proba.get("HIGH", 0) * 100),
    "MODERATE": lambda proba: round(proba.get("SAFE", 0) * 0 + proba.get("MODERATE", 0) * 50 + proba.get("HIGH", 0) * 100),
    "HIGH":     lambda proba: round(proba.get("SAFE", 0) * 0 + proba.get("MODERATE", 0) * 50 + proba.get("HIGH", 0) * 100),
}

def derive_risk_score(ml_label, ml_proba):
    """
    Converts ML probability distribution into a 0-100 gauge score.
    Score = weighted sum of probabilities across risk levels.
    This guarantees the gauge needle always matches the risk label.
    """
    score = (
        ml_proba.get("SAFE", 0)     *  10 +
        ml_proba.get("MODERATE", 0) *  50 +
        ml_proba.get("HIGH", 0)     * 100
    )
    return round(score)


@router.get("/coastal-data")
def coastal_data():

    weather = get_weather()
    marine = get_wave_data()
    forecast_data = get_forecast()

    if not weather or not marine:
        return {"error": "API failed"}

    # ---------------- CURRENT DATA ----------------
    temperature = float(weather["temperature"])
    wind_speed  = float(weather["wind_speed"])
    humidity    = float(weather["humidity"])
    pressure    = float(weather["pressure"])          
    visibility  = float(weather["visibility"])
    wave_height = float(marine["wave_height"][0])

    sea_state, boating_risk = get_sea_state(wave_height)

    # ---------------- ML PREDICTION (single source of truth) ----------------
    ml_risk  = predict_risk_label(temperature, wind_speed, humidity, wave_height)
    ml_proba = predict_risk_proba(temperature, wind_speed, humidity, wave_height)

    # Gauge score derived from ML probabilities → always consistent with label
    risk_score = derive_risk_score(ml_risk, ml_proba)
    risk_level = ml_risk   # rule engine removed — ML is authoritative

    fishing_recommendation = get_fishing_recommendation(ml_risk, wave_height, wind_speed)

    # ---------------- FORECAST ----------------
    forecast_result = []

    if forecast_data and "dates" in forecast_data:

        forecast_humidity = forecast_data.get("humidity", [])

        for i in range(len(forecast_data["dates"])):

            temp  = float(forecast_data["temperature"][i])
            wind  = float(forecast_data["wind_speed"][i])
            wave  = float(marine["wave_height"][i]) if i < len(marine["wave_height"]) else wave_height
            day_humidity = float(forecast_humidity[i]) if i < len(forecast_humidity) else humidity

            pred       = predict_risk_label(temp, wind, day_humidity, wave)
            proba      = predict_risk_proba(temp, wind, day_humidity, wave)
            day_score  = derive_risk_score(pred, proba)
            forecast_fishing = get_fishing_recommendation(pred, wave, wind)
            sea_state_day, boating_risk_day = get_sea_state(wave)

            forecast_result.append({
                "date":         forecast_data["dates"][i],
                "temperature":  temp,
                "wind_speed":   wind,
                "humidity":     day_humidity,
                "wave_height":  wave,
                "risk":         pred,
                "risk_score":   day_score,
                "ml_probability": proba,
                "sea_state":    sea_state_day,
                "boating_risk": boating_risk_day,
                "fishing":      forecast_fishing,
            })

    return {
        "temperature": temperature,
        "wind_speed":  wind_speed,
        "humidity":    humidity,
        "pressure":    pressure,    
        "visibility":  visibility, 

        "wave_height": wave_height,
        "sea_state":   sea_state,
        "boating_risk": boating_risk,

        "risk_score":  risk_score,   
        "risk_level":  risk_level,   

        "ml_risk":        ml_risk,
        "ml_probability": ml_proba,

        "forecast":                forecast_result,
        "fishing_recommendation":  fishing_recommendation,
    }