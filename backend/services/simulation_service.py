import random

def simulate_wave_forecast(base_wave, days=7):

    forecast = []

    for i in range(days):
        wave = base_wave + random.uniform(-0.3, 0.3)
        forecast.append(round(wave, 2))

    return forecast