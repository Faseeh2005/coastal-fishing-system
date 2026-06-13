import pandas as pd
import random

rows = []

for _ in range(10000):
    temperature = round(random.uniform(20,38), 1)
    wind_speed = round(random.uniform(0,20), 1)
    humidity = random.randint(40,100)
    wave_height = round(random.uniform(0, 5), 1)

    #risk rules 
    if wave_height > 3 or wind_speed > 15:
        risk = "HIGH"
    elif wave_height>1.5 or wind_speed>8:
        risk = "MODERATE"
    else:
        risk = "SAFE"

    rows.append([
        temperature,
        wind_speed,
        humidity,
        wave_height,
        risk
    ])

df = pd.DataFrame(rows, columns= [
    "temperature",
    "wind_speed",
    "humidity",
    "wave_height",
    "risk"
])
df.to_csv("coastal_risk_dataset.csv", index=False)

print("Dataset created")