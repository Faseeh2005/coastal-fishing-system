def get_fishing_recommendation(risk_label, wave_height, wind_speed):

    risk_label = str(risk_label).upper()

    # VERY HIGH RISK
    if risk_label == "HIGH" or wave_height > 2.5 or wind_speed > 20:
        return {
            "status": "NOT SAFE",
            "message": "Dangerous sea conditions. Avoid fishing."
        }

    # MODERATE RISK
    if risk_label == "MODERATE" or wave_height > 1.8 or wind_speed > 15:
        return {
            "status": "LIMITED",
            "message": "Only fish near shore and with caution."
        }

    # SAFE
    return {
        "status": "GOOD",
        "message": "Good conditions for fishing."
    }