import joblib
import pandas as pd

model = joblib.load("model.pkl")
sample = pd.DataFrame([{
    "wind_speed":12,
    "wave_height": 1.2
}])
prediction = model.predict(sample)
print("Prediction:", prediction[0])