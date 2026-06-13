# coastal-fishing-system
## 🧩 System Design Deep Dive

The system is built using a modular pipeline architecture:

### 1. Data Layer
- Weather API (OpenWeatherMap)
- Marine API (Open-Meteo)
- Forecast API (7-day horizon)

### 2. Feature Engineering Layer
Transforms raw environmental data into ML-ready features:
- Temperature normalization
- Wind-speed scaling
- Wave impact weighting
- Humidity integration

### 3. Machine Learning Layer
A Random Forest model is used because:
- Handles nonlinear environmental interactions
- Works well with mixed numerical features
- Provides probability outputs for explainability

### 4. Decision Layer (Rule Engine)
Converts ML probabilities into real-world fishing decisions:
- Uses thresholds on wave height + wind speed
- Adds safety heuristics for marine conditions

### 5. API Layer
FastAPI exposes a unified endpoint:
- `/api/coastal-data`
- Returns structured JSON for frontend consumption

## 🌍 Real-World Use Case

Fishing in coastal regions is highly dependent on:
- sudden weather changes
- wave instability
- wind speed spikes

This system acts as a **decision-support tool** for fishermen by converting complex environmental data into simple actionable safety guidance.

## 🤖 Machine Learning Approach

A supervised classification model was trained on synthetic coastal data.

### Why Random Forest?
- Handles nonlinear relationships in environmental data
- Robust against noise in weather inputs
- Provides probability distribution for risk levels

### Input Features:
- Temperature
- Wind Speed
- Humidity
- Wave Height

### Output:
- SAFE
- MODERATE
- HIGH

The model outputs probabilities which are later used to generate a risk score between 0–100.

## 🔄 API Processing Flow

1. Fetch live weather data
2. Fetch marine wave data
3. Combine features into a unified vector
4. Run ML model inference
5. Generate probability distribution
6. Apply fishing rule engine
7. Return structured JSON response