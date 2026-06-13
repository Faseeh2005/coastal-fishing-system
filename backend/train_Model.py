import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

# Load dataset
df = pd.read_csv("coastal_risk_dataset.csv")

# Features (MUST match API)
X = df[["temperature", "wind_speed", "humidity", "wave_height"]]
y = df["risk"]

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# Scale features (IMPORTANT FIX)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Model (balanced + controlled complexity)
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=8,
    min_samples_leaf=10,
    class_weight="balanced",
    random_state=42
)

model.fit(X_scaled, y_encoded)

# Save everything
joblib.dump(model, "risk_model.pkl")
joblib.dump(encoder, "label_encoder.pkl")
joblib.dump(list(encoder.classes_), "classes.pkl")
joblib.dump(scaler, "scaler.pkl")

print("Model trained successfully!")
print("Classes:", encoder.classes_)