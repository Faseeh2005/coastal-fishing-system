import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_weather(lat=24.86, lon=67.01):
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    # rest stays the same...

    res = requests.get(url)
    data = res.json()

    if "main" not in data or "wind" not in data:
        return None

    return {
        "temperature": data["main"]["temp"],
        "wind_speed": data["wind"]["speed"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "visibility": data["visibility"] / 1000
    }