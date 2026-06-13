def calculate_risk(wind_speed, wave_height, temperature=30, humidity=60):
    

    if wave_height < 0.5:
        wave_score = 0
    elif wave_height < 1.5:
        wave_score = 1
    elif wave_height < 2.5:
        wave_score = 2
    else:
        wave_score = 3

   
    if wind_speed < 3:
        wind_score = 0
    elif wind_speed < 8:
        wind_score = 1
    else:
        wind_score = 2

    # -------------------------
    # 3. HUMIDITY IMPACT (minor)
    # -------------------------
    humidity_score = 1 if humidity > 80 else 0

   
    total = wave_score + wind_score + humidity_score

    if total <= 1:
        return total, "SAFE"
    elif total <= 3:
        return total, "MODERATE"
    else:
        return total, "HIGH"