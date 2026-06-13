import numpy as np
import joblib

model = joblib.load("risk_model.pkl")
encoder = joblib.load("label_encoder.pkl")
scaler = joblib.load("scaler.pkl")  # FIX: load the scaler that was saved during training


def predict_risk_proba(temperature, wind_speed, humidity, wave_height):

    X = np.array([[temperature, wind_speed, humidity, wave_height]])
    X_scaled = scaler.transform(X)  # FIX: scale input before prediction

    proba = model.predict_proba(X_scaled)[0]

    # FIX: model.classes_ are already encoded ints; inverse_transform them correctly
    classes = encoder.inverse_transform(model.classes_)

    return dict(zip(classes, [round(float(p), 4) for p in proba]))


def predict_risk_label(temperature, wind_speed, humidity, wave_height):

    X = np.array([[temperature, wind_speed, humidity, wave_height]])
    X_scaled = scaler.transform(X)  # FIX: scale input before prediction

    pred = model.predict(X_scaled)[0]

    return encoder.inverse_transform([pred])[0]
