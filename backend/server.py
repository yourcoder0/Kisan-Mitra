from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import cohere
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Cohere Setup ---
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
co = cohere.Client(COHERE_API_KEY) if COHERE_API_KEY else None

# --- Schemas ---
class Query(BaseModel):
    query: str

class ROIRequest(BaseModel):
    crop: str
    investment: float
    expected_yield: float
    market_price: float

# --- Health ---
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend running ✅"}

# --- Chatbot ---
@app.post("/api/ask")
async def ask_ai(query: Query):
    try:
        if co is None:
            return {"answer": "⚠️ Cohere API key not set."}

        response = co.chat(
            model="command-r",
            message=f"Answer this farmer's question in simple terms: {query.query}"
        )
        return {"answer": response.text.strip()}
    except Exception as e:
        return {"answer": f"⚠️ Chatbot failed: {str(e)}"}

# --- Crop Prediction ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "crop-selector", "crop_prediction_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "crop-selector", "datasets", "crop_yield_by_rainfall.csv")

try:
    model = joblib.load(MODEL_PATH)
    crop_data = pd.read_csv(DATASET_PATH)
except Exception as e:
    print("⚠️ Could not load model/dataset:", e)
    model, crop_data = None, None

@app.post("/api/predict_crop")
async def predict_crop(request: Request):
    if model is None:
        return {"error": "Model not loaded."}

    body = await request.json()
    try:
        N = float(body.get("N") or body.get("n"))
        P = float(body.get("P") or body.get("p"))
        K = float(body.get("K") or body.get("k"))
        temperature = float(body.get("temperature") or body.get("temp"))
        humidity = float(body.get("humidity"))
        ph = float(body.get("ph"))
        rainfall = float(body.get("rainfall")) / 100

        input_data = pd.DataFrame([{
            "N": N, "P": P, "K": K,
            "temperature": temperature,
            "humidity": humidity,
            "ph": ph,
            "rainfall": rainfall
        }])

        probabilities = model.predict_proba(input_data)[0]
        classes = model.classes_
        top_3 = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)[:3]

        return {
            "predicted_crop": top_3[0][0],
            "top_3_predictions": [
                {"crop": crop, "probability": round(prob * 100, 2)}
                for crop, prob in top_3
            ]
        }
    except Exception as e:
        return {"error": str(e)}

# --- Crop Input Recommendations ---
@app.get("/api/recommend_inputs/{crop_name}")
def recommend_inputs(crop_name: str):
    if crop_data is None:
        return {"error": "Dataset not loaded."}

    crop_name = crop_name.lower()
    filtered = crop_data[crop_data["crop"].str.lower() == crop_name]
    if filtered.empty:
        return {"error": f"No data found for crop: {crop_name}"}

    avg = filtered[["N","P","K","temperature","humidity","ph","rainfall"]].mean()
    return {
        "crop": crop_name,
        "recommended_inputs": {
            "N": round(avg["N"],2),
            "P": round(avg["P"],2),
            "K": round(avg["K"],2),
            "temperature": round(avg["temperature"],2),
            "humidity": round(avg["humidity"],2),
            "ph": round(avg["ph"],2),
            "rainfall": round(avg["rainfall"]*100,2),
        }
    }

# --- ROI Calculator ---
@app.post("/api/calculate_roi")
async def calculate_roi(request: Request):
    try:
        body = await request.json()
        crop = body.get("crop")
        investment = float(body.get("investment"))
        expected_yield = float(body.get("expected_yield") or body.get("expectedYield"))
        market_price = float(body.get("market_price") or body.get("marketPrice"))

        revenue = expected_yield * market_price
        roi = ((revenue - investment) / investment) * 100

        return {
            "crop": crop,
            "investment": investment,
            "expected_yield": expected_yield,
            "market_price": market_price,
            "revenue": revenue,
            "roi_percent": round(roi, 2)
        }
    except Exception as e:
        return {"error": f"ROI calc failed: {str(e)}"}

# --- Water Advisor ---
# --- Baseline Crop Data ---
CROP_DATA = {
    "rice": {
        "water_use": "2500–5000 liters per kg (~2.5–5 m³/kg)",
        "temperature": "20–35 °C",
        "rainfall": "1000–2000 mm/year",
        "cycle_days": "100–150",
        "yield_estimate": "4000–6000 kg/ha"
    },
    "wheat": {
        "water_use": "1500–2500 liters per kg (~1.5–2.5 m³/kg)",
        "temperature": "15–25 °C",
        "rainfall": "500–1200 mm/year",
        "cycle_days": "90–120",
        "yield_estimate": "3000–5000 kg/ha"
    },
    "maize": {
        "water_use": "900–1200 liters per kg (~0.9–1.2 m³/kg)",
        "temperature": "18–27 °C",
        "rainfall": "500–800 mm/year",
        "cycle_days": "90–120",
        "yield_estimate": "2500–5000 kg/ha"
    },
    "sugarcane": {
        "water_use": "1500–3000 liters per kg (~1.5–3 m³/kg)",
        "temperature": "20–30 °C",
        "rainfall": "1200–1500 mm/year",
        "cycle_days": "300–365",
        "yield_estimate": "60000–80000 kg/ha"
    },
    "cotton": {
        "water_use": "7000–29000 liters per kg (~7–29 m³/kg)",
        "temperature": "21–30 °C",
        "rainfall": "700–1300 mm/year",
        "cycle_days": "150–180",
        "yield_estimate": "1500–3000 kg/ha"
    },
    "millet": {
        "water_use": "400–600 liters per kg (~0.4–0.6 m³/kg)",
        "temperature": "26–33 °C",
        "rainfall": "400–750 mm/year",
        "cycle_days": "70–100",
        "yield_estimate": "1000–2500 kg/ha"
    },
    "barley": {
        "water_use": "1300–1800 liters per kg (~1.3–1.8 m³/kg)",
        "temperature": "12–25 °C",
        "rainfall": "400–800 mm/year",
        "cycle_days": "80–110",
        "yield_estimate": "2000–4000 kg/ha"
    },
    "pulses": {
        "water_use": "1500–2000 liters per kg (~1.5–2 m³/kg)",
        "temperature": "20–30 °C",
        "rainfall": "400–800 mm/year",
        "cycle_days": "90–120",
        "yield_estimate": "800–1500 kg/ha"
    },
    "soybean": {
        "water_use": "1800–2200 liters per kg (~1.8–2.2 m³/kg)",
        "temperature": "20–30 °C",
        "rainfall": "600–1000 mm/year",
        "cycle_days": "90–120",
        "yield_estimate": "2000–3000 kg/ha"
    },
    "groundnut": {
        "water_use": "2000–3000 liters per kg (~2–3 m³/kg)",
        "temperature": "22–28 °C",
        "rainfall": "500–1250 mm/year",
        "cycle_days": "120–150",
        "yield_estimate": "2000–3500 kg/ha"
    }
}



@app.post("/api/water_advisor")
async def water_advisor(request: Request):
    body = await request.json()
    crop_name = body.get("Crop_Name", "").lower()
    rainfall = float(body.get("Rainfall_Requirement", 0))
    temperature = float(body.get("Temperature_Requirement", 0))
    yield_estimate = float(body.get("Yield", 0))
    cycle_duration = int(body.get("Crop_Cycle_Duration", 0))
    soil_type = body.get("Soil_Type", "Unknown")
    irrigation_type = body.get("Irrigation_Type", "Unknown")
    scarcity = body.get("Water_Scarcity", "Unknown")

    crop_info = CROP_DATA.get(crop_name, None)
    if not crop_info:
        return {"error": f"No reference data found for crop '{crop_name}'."}

    # --- Advice generation ---
    advice = []
    if temperature < int(crop_info["temperature"].split("–")[0].replace("°C", "").strip()):
        advice.append("🌡️ Temperature is too low, crop may not grow well.")
    elif temperature > int(crop_info["temperature"].split("–")[1].replace("°C", "").strip()):
        advice.append("🌡️ Temperature is too high, heat stress likely.")
    else:
        advice.append("🌡️ Temperature is suitable.")

    if rainfall < int(crop_info["rainfall"].split("–")[0].replace("mm/year", "").strip()):
        advice.append("🌧️ Rainfall insufficient, irrigation required.")
    elif rainfall > int(crop_info["rainfall"].split("–")[1].replace("mm/year", "").strip()):
        advice.append("🌧️ Excess rainfall, ensure drainage to prevent flooding.")
    else:
        advice.append("🌧️ Rainfall conditions are adequate.")

    if cycle_duration > 365:
        advice.append("⚠️ Crop cycle duration is unrealistic, check inputs.")

    if scarcity.lower() == "high":
        advice.append("💧 Water scarcity is high — use drip irrigation if possible.")

    if not advice:
        advice.append("✅ Conditions are stable. Monitor regularly.")

    return {
        "crop": crop_name,
        "soil_type": soil_type,
        "irrigation_type": irrigation_type,
        "water_scarcity": scarcity,
        "predicted_water_use": crop_info["water_use"],
        "predicted_temperature_requirement": crop_info["temperature"],
        "predicted_rainfall_requirement": crop_info["rainfall"],
        "cycle_duration_days": crop_info["cycle_days"],
        "yield_estimate": crop_info["yield_estimate"],
        "advice": " ".join(advice)
    }

# --- Govt Schemes ---
@app.get("/api/schemes")
async def get_schemes():
    schemes = [
        {"name": "PM-KISAN", "benefit": "₹6000/year income support", "link": "https://pmkisan.gov.in"},
        {"name": "PMFBY", "benefit": "Crop insurance for losses", "link": "https://pmfby.gov.in"},
        {"name": "Soil Health Card", "benefit": "Free soil testing & fertilizer advice", "link": "https://soilhealth.dac.gov.in"},
        {"name": "eNAM", "benefit": "Online crop marketplace for better prices", "link": "https://enam.gov.in"},
        {"name": "KCC Loan", "benefit": "Low interest credit for farmers", "link": "https://www.myscheme.gov.in/schemes/kcc"}
    ]
    return {"schemes": schemes}


# --- Crop Prediction ---
@app.post("/api/select_crop")
async def select_crop(request: Request):
    """
    Suggests suitable crops based on soil nutrients, pH, temperature, and rainfall.
    """
    data = await request.json()
    try:
        N = float(data.get("N", 0))
        P = float(data.get("P", 0))
        K = float(data.get("K", 0))
        ph = float(data.get("ph", 0))
        temperature = float(data.get("temperature", 0))
        rainfall = float(data.get("rainfall", 0))  # mm/year

        suitable_crops = []

        for crop, info in CROP_DATA.items():
            # --- Parse temp ---
            temp_range = info["temperature"].replace("°C", "").strip()
            temp_min, temp_max = [float(x.strip()) for x in temp_range.replace("–", "-").split("-")]

            # --- Parse rainfall ---
            rain_range = info["rainfall"].replace("mm/year", "").strip()
            rain_min, rain_max = [float(x.strip()) for x in rain_range.replace("–", "-").split("-")]

            # --- Scoring instead of strict filter ---
            score = 0

            # Temp match
            if temp_min <= temperature <= temp_max:
                score += 2  

            # Rainfall match
            if rain_min <= rainfall <= rain_max:
                score += 2  

            # Soil nutrient + pH check (basic logic, can refine with dataset)
            if 5.5 <= ph <= 7.5:
                score += 1  

            if N > 0 and P > 0 and K > 0:
                score += 1  

            if score >= 3:  # ✅ only crops with decent match
                suitable_crops.append((crop, score))

        if not suitable_crops:
            return {"recommended_crops": []}

        # Sort crops by score first, then yield
        suitable_crops_sorted = sorted(
            suitable_crops,
            key=lambda c: (
                c[1],  # score
                int(CROP_DATA[c[0]]["yield_estimate"].split("–")[1].replace("kg/ha", "").strip())
            ),
            reverse=True
        )

        return {"recommended_crops": [c[0] for c in suitable_crops_sorted[:5]]}

    except Exception as e:
        return {"error": str(e)}
