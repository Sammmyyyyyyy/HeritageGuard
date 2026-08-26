import os
import json
import math
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
import joblib

# ==========================================
# 1. LIVE WEATHER API (Open-Meteo)
# ==========================================
def get_live_weather(lat: float, lng: float) -> dict:
    """Fetches real-time weather using free Open-Meteo API (No API Key)."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current_weather": True,
        "hourly": "precipitation_probability", 
        "timezone": "auto"
    }
    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        current_temp = data["current_weather"]["temperature"]
        rain_probs = data["hourly"]["precipitation_probability"][:6] 
        max_rain_prob = max(rain_probs) / 100.0  
        is_weekend = 1 if datetime.today().weekday() >= 5 else 0
        
        print(f"[Weather] Live Data: {current_temp}°C, Rain Prob: {max_rain_prob}")
        return {
            "temperature_c": current_temp,
            "rain_prob": max_rain_prob,
            "is_weekend": is_weekend,
            "is_holiday": 0
        }
    except Exception as e:
        print(f"[Weather] API failed, using fallback. Error: {e}")
        return {"temperature_c": 30.0, "rain_prob": 0.0, "is_weekend": 1, "is_holiday": 0}

# ==========================================
# 2. GEOLOCATION (HAVERSINE)
# ==========================================
def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def calculate_travel_time_minutes(coords_a: dict, coords_b: dict) -> int:
    if coords_a["lat"] == coords_b["lat"] and coords_a["lng"] == coords_b["lng"]: return 0
    dist_km = haversine_distance_km(coords_a["lat"], coords_a["lng"], coords_b["lat"], coords_b["lng"])
    return int((dist_km / 25.0) * 60) + 5  # 25km/h avg speed + 5 min walking buffer

# ==========================================
# 3. ML CROWD PREDICTOR
# ==========================================
MODEL_PATH = "crowd_model.pkl"

def get_or_train_ml_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    
    print("[ML] Training predictive crowd model...")
    np.random.seed(42)
    n = 3000
    hours, weekend, holiday = np.random.randint(6, 21, n), np.random.randint(0, 2, n), np.random.randint(0, 2, n)
    temp, rain, base = np.random.uniform(18, 42, n), np.random.uniform(0, 1, n), np.random.uniform(0.2, 1.0, n)
    
    crowd_ratio = (base * 0.45 + (1.0 - np.abs(hours - 14) / 9.0) * 0.35 + weekend * 0.15 + holiday * 0.20 - rain * 0.25 - (temp > 38).astype(int) * 0.15)
    
    X = pd.DataFrame({"hour": hours, "is_weekend": weekend, "is_holiday": holiday, "temp_c": temp, "rain_prob": rain, "base_pop": base})
    y = np.clip(crowd_ratio, 0.05, 1.0)
    
    model = RandomForestRegressor(n_estimators=60, max_depth=6, random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    return model

ML_MODEL = get_or_train_ml_model()

def predict_crowd(arrival_time_str: str, base_pop: float, weather: dict) -> float:
    hour = int(arrival_time_str.split(":")[0])
    df = pd.DataFrame([{"hour": hour, "is_weekend": weather.get("is_weekend", 0), "is_holiday": 0, "temp_c": weather.get("temperature_c", 30), "rain_prob": weather.get("rain_prob", 0), "base_pop": base_pop}])
    return round(float(np.clip(ML_MODEL.predict(df)[0], 0.05, 1.0)), 2)

# ==========================================
# 4. CORE OPTIMIZER ENGINE
# ==========================================
def add_mins(time_str, minutes):
    return (datetime.strptime(time_str, "%H:%M") + timedelta(minutes=minutes)).strftime("%H:%M")

def generate_itinerary(user: dict, sites: list) -> dict:
    coords = user.get("starting_coords", {"lat": 24.5854, "lng": 73.6828})
    time_curr = user.get("start_time", "09:00")
    t_left = user.get("available_time_minutes", 360)
    b_left = user.get("budget", 1000)
    tol = user.get("crowd_tolerance", 0.5)
    interests = set(user.get("interests", []))
    weather = user.get("weather", {"temperature_c": 30.0, "rain_prob": 0.0, "is_weekend": 1})

    itinerary = []
    visited = set()
    reasons = ["Matching user preferences."]
    skipped_pressure = False

    while t_left > 0:
        best_site, best_score, best_travel, best_arr = None, -9999, 0, time_curr
        
        for site in sites:
            if site["site_id"] in visited: continue
            
            travel_m = calculate_travel_time_minutes(coords, site["coords"])
            if travel_m + site["duration_minutes"] > t_left or site["entry_fee"] > b_left:
                continue
                
            arr_est = add_mins(time_curr, travel_m)
            pred_crowd = predict_crowd(arr_est, site["heritage_pressure"], weather)
            
            # Heritage Protection Hard Cutoff
            if pred_crowd > 0.90:
                skipped_pressure = True
                continue
                
            # Scoring
            score = len(interests.intersection(site.get("tags", []))) * 15.0
            score -= site["heritage_pressure"] * 12.0
            score -= pred_crowd * 18.0 * (1.2 - tol)
            score -= travel_m * 0.4
            
            # Weather logic
            if weather["rain_prob"] > 0.4:
                score += 15.0 if any(t in site["tags"] for t in ["museum", "indoor"]) else -20.0
            elif weather["temperature_c"] > 36.0:
                score += 10.0 if any(t in site["tags"] for t in ["museum", "lake"]) else -15.0

            if score > best_score:
                best_score, best_site, best_travel, best_arr = score, site, travel_m, arr_est

        if not best_site: break

        itinerary.append({
            "site_id": best_site["site_id"],
            "arrival": best_arr,
            "duration_minutes": best_site["duration_minutes"]
        })
        
        visited.add(best_site["site_id"])
        t_left -= (best_travel + best_site["duration_minutes"])
        b_left -= best_site["entry_fee"]
        coords, time_curr = best_site["coords"], add_mins(best_arr, best_site["duration_minutes"])

    if skipped_pressure: reasons.append("Skipped highly vulnerable/congested sites to reduce heritage pressure.")
    if weather["rain_prob"] > 0.4: reasons.append("Prioritized sheltered locations due to rain forecast.")
    elif weather["temperature_c"] > 36.0: reasons.append("Adjusted for extreme heat.")

    return {"itinerary": itinerary, "reason": " ".join(reasons)}