import os
import json
import math
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
import joblib

def load_sites(file_path: str) -> list:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    resolved = file_path if os.path.isabs(file_path) else os.path.join(base_dir, file_path)
    if not os.path.exists(resolved) and os.path.exists(file_path):
        resolved = file_path
    with open(resolved, "r", encoding="utf-8") as f:
        return json.load(f)

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
    if dist_km > 80:
        # High-speed inter-city express transit connection
        return int(45 + (dist_km / 400.0) * 60)
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

_ml_model = None

def get_ml_model():
    global _ml_model
    if _ml_model is None:
        _ml_model = get_or_train_ml_model()
    return _ml_model

def predict_crowd(arrival_time_str: str, base_pop: float, weather: dict) -> float:
    hour = int(arrival_time_str.split(":")[0])
    df = pd.DataFrame([{"hour": hour, "is_weekend": weather.get("is_weekend", 0), "is_holiday": 0, "temp_c": weather.get("temperature_c", 30), "rain_prob": weather.get("rain_prob", 0), "base_pop": base_pop}])
    model = get_ml_model()
    return round(float(np.clip(model.predict(df)[0], 0.05, 1.0)), 2)

# ==========================================
# 4. CORE OPTIMIZER ENGINE
# ==========================================
def add_mins(time_str, minutes):
    return (datetime.strptime(time_str, "%H:%M") + timedelta(minutes=minutes)).strftime("%H:%M")

def generate_itinerary(user: dict, sites: list) -> dict:
    start_coords = user.get("starting_coords", {"lat": 28.6562, "lng": 77.2410})
    start_site_id = user.get("starting_site_id")
    dest_site_id = user.get("destination_site_id")
    dest_coords = user.get("destination_coords")

    time_curr = user.get("start_time", "06:00")
    t_left = user.get("available_time_minutes", 480)
    b_left = user.get("budget", 20000)
    tol = user.get("crowd_tolerance", 0.5)
    interests = set(user.get("interests", []))
    weather = user.get("weather", {"temperature_c": 30.0, "rain_prob": 0.0, "is_weekend": 1})

    # Resolve starting site and destination site
    start_site = None
    if start_site_id:
        start_site = next((s for s in sites if s["site_id"] == start_site_id), None)
    if not start_site and start_coords:
        start_site = min(sites, key=lambda s: haversine_distance_km(start_coords["lat"], start_coords["lng"], s["coords"]["lat"], s["coords"]["lng"]))

    dest_site = None
    if dest_site_id:
        dest_site = next((s for s in sites if s["site_id"] == dest_site_id), None)
    if not dest_site and dest_coords:
        dest_site = min(sites, key=lambda s: haversine_distance_km(dest_coords["lat"], dest_coords["lng"], s["coords"]["lat"], s["coords"]["lng"]))

    itinerary = []
    visited = set()
    reasons = ["Matching user preferences."]
    skipped_pressure = False

    coords = start_site["coords"] if start_site else start_coords

    # 1. First Stop: Starting Site
    if start_site:
        itinerary.append({
            "site_id": start_site["site_id"],
            "arrival": time_curr,
            "duration_minutes": start_site["duration_minutes"]
        })
        visited.add(start_site["site_id"])
        t_left -= start_site["duration_minutes"]
        b_left -= start_site["entry_fee"]
        coords = start_site["coords"]
        time_curr = add_mins(time_curr, start_site["duration_minutes"])

    start_city = start_site.get("city") if start_site else None
    dest_city = dest_site.get("city") if dest_site else None

    # 2. Intermediate & Destination Stops Loop
    while t_left > 0:
        # Check if we must force destination site now
        if dest_site and dest_site["site_id"] not in visited:
            t_to_dest = calculate_travel_time_minutes(coords, dest_site["coords"])
            t_needed_dest = t_to_dest + dest_site["duration_minutes"]
            
            # If remaining time is just enough for destination or budget is tight
            if t_left <= t_needed_dest + 15:
                arr_dest = add_mins(time_curr, t_to_dest)
                itinerary.append({
                    "site_id": dest_site["site_id"],
                    "arrival": arr_dest,
                    "duration_minutes": dest_site["duration_minutes"]
                })
                visited.add(dest_site["site_id"])
                t_left -= (t_to_dest + dest_site["duration_minutes"])
                break

        best_site, best_score, best_travel, best_arr = None, -9999, 0, time_curr

        for site in sites:
            s_id = site["site_id"]
            if s_id in visited:
                continue

            # Don't pick destination site prematurely if other candidates exist
            if dest_site and s_id == dest_site["site_id"]:
                continue

            travel_m = calculate_travel_time_minutes(coords, site["coords"])

            # Ensure visiting site allows reaching destination within total time
            if dest_site and dest_site["site_id"] not in visited:
                travel_dest_after = calculate_travel_time_minutes(site["coords"], dest_site["coords"])
                if travel_m + site["duration_minutes"] + travel_dest_after + dest_site["duration_minutes"] > t_left:
                    continue

            if travel_m + site["duration_minutes"] > t_left or site["entry_fee"] > b_left:
                continue

            arr_est = add_mins(time_curr, travel_m)
            pred_crowd = predict_crowd(arr_est, site["heritage_pressure"], weather)

            if pred_crowd > 0.95:
                skipped_pressure = True
                continue

            # Base score: proximity is heavily favored so nearby intermediate stops are selected
            score = 100.0 - (travel_m * 1.2)
            score += len(interests.intersection(site.get("tags", []))) * 10.0
            score -= site["heritage_pressure"] * 8.0
            score -= pred_crowd * 12.0 * (1.2 - tol)

            # Preference logic for inter-city vs same-city
            curr_city = site.get("city")
            if start_city and dest_city and start_city != dest_city:
                # Count visited in start_city
                visited_in_start = sum(1 for s in itinerary if next((opt.get("city") for opt in sites if opt["site_id"] == s["site_id"]), None) == start_city)
                if visited_in_start < 2 and curr_city == start_city:
                    score += 35.0
                elif visited_in_start >= 2 and curr_city == dest_city:
                    score += 45.0
            elif start_city and curr_city == start_city:
                score += 25.0

            if weather["rain_prob"] > 0.4:
                score += 10.0 if any(t in site["tags"] for t in ["museum", "indoor"]) else -15.0
            elif weather["temperature_c"] > 36.0:
                score += 8.0 if any(t in site["tags"] for t in ["museum", "lake"]) else -10.0

            if score > best_score:
                best_score, best_site, best_travel, best_arr = score, site, travel_m, arr_est

        if not best_site:
            # Force add destination site if not visited yet
            if dest_site and dest_site["site_id"] not in visited:
                t_to_dest = calculate_travel_time_minutes(coords, dest_site["coords"])
                arr_dest = add_mins(time_curr, t_to_dest)
                itinerary.append({
                    "site_id": dest_site["site_id"],
                    "arrival": arr_dest,
                    "duration_minutes": dest_site["duration_minutes"]
                })
                visited.add(dest_site["site_id"])
            break

        itinerary.append({
            "site_id": best_site["site_id"],
            "arrival": best_arr,
            "duration_minutes": best_site["duration_minutes"]
        })

        visited.add(best_site["site_id"])
        t_left -= (best_travel + best_site["duration_minutes"])
        b_left -= best_site["entry_fee"]
        coords, time_curr = best_site["coords"], add_mins(best_arr, best_site["duration_minutes"])

    # Double check final destination requirement
    if dest_site and dest_site["site_id"] not in visited:
        t_to_dest = calculate_travel_time_minutes(coords, dest_site["coords"])
        arr_dest = add_mins(time_curr, t_to_dest)
        itinerary.append({
            "site_id": dest_site["site_id"],
            "arrival": arr_dest,
            "duration_minutes": dest_site["duration_minutes"]
        })
        visited.add(dest_site["site_id"])

    if dest_site and start_site:
        if start_site.get("city") != dest_site.get("city"):
            reasons.append(f"Sequenced inter-city route from {start_site['name']} ({start_site.get('city')}) to {dest_site['name']} ({dest_site.get('city')}).")
        else:
            reasons.append(f"Sequenced circuit from {start_site['name']} to {dest_site['name']}.")
    
    if skipped_pressure: reasons.append("Skipped highly congested sites to reduce heritage pressure.")
    if weather["rain_prob"] > 0.4: reasons.append("Prioritized sheltered locations due to rain forecast.")
    elif weather["temperature_c"] > 36.0: reasons.append("Adjusted for extreme heat.")

    return {"itinerary": itinerary, "reason": " ".join(reasons)}