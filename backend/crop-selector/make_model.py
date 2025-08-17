import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Step 1: Load and prepare the data
data = pd.read_csv("backend/crop-selector/datasets/crop_yield_by_rainfall.csv")

# Optional: Normalize rainfall (keep consistent with backend)
data['rainfall'] = data['rainfall'] / 100

# Step 2: Define features (NO humidity) and target
X = data[['N', 'P', 'K', 'temperature', 'ph', 'rainfall']]
y = data['crop']

# Step 3: Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 4: Train the model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Step 5: Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy * 100:.2f}%")

# Step 6: Save the model
joblib.dump(model, 'backend/crop-selector/crop_prediction_model.pkl')
print("Model saved as 'crop_prediction_model.pkl'")
