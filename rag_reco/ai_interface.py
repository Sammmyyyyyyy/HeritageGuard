import json
from itineary_engine import generate_itinerary, load_sites, get_live_weather
from rag_engine import ask_heritage_question
from ingest import ingest_documents

# Define operational boundaries and link them to their JSON files
SUPPORTED_CITIES = {
    "delhi": {
        "bounds": {"lat_min": 28.2, "lat_max": 29.0, "lng_min": 76.7, "lng_max": 77.6},
        "file": "databases/delhi_sites.json"
    },
    "mumbai": {
        "bounds": {"lat_min": 18.8, "lat_max": 19.4, "lng_min": 72.7, "lng_max": 73.1},
        "file": "databases/mumbai_sites.json"
    },
    "jaipur": {
        "bounds": {"lat_min": 26.7, "lat_max": 27.0, "lng_min": 75.7, "lng_max": 76.0},
        "file": "databases/jaipur_sites.json"
    },
    "prayagraj": {
        "bounds": {"lat_min": 25.3, "lat_max": 25.6, "lng_min": 81.7, "lng_max": 82.0},
        "file": "databases/prayagraj_sites.json"
    }
}

# Preload ALL cities into memory on server startup for instant access
CITY_DATABASES = {}
for city, data in SUPPORTED_CITIES.items():
    CITY_DATABASES[city] = load_sites(data["file"])

def identify_city(lat: float, lng: float) -> str:
    """Returns the city name if coords match, otherwise raises an error."""
    for city, data in SUPPORTED_CITIES.items():
        b = data["bounds"]
        if b["lat_min"] <= lat <= b["lat_max"] and b["lng_min"] <= lng <= b["lng_max"]:
            return city
    raise ValueError("Location is outside our supported cities (Delhi, Mumbai, Jaipur, Prayagraj).")

def get_recommendations_for_user(user_payload: dict) -> dict:
    coords = user_payload.get("starting_coords", {})
    lat = float(coords.get("lat", 28.6139))
    lng = float(coords.get("lng", 77.2090))

    # 1. Detect which city the tourist is in
    city_key = identify_city(lat, lng)
    
    # 2. Grab the correct JSON database from RAM
    active_database = CITY_DATABASES[city_key]
    
    # 3. Fetch weather and generate itinerary
    user_payload["weather"] = get_live_weather(lat, lng)
    return generate_itinerary(user_payload, active_database)

def answer_tourist_query(site_id: str, question: str, language: str = "English") -> dict:
    """
    Called by FastAPI route: POST /ask-guide
    Returns strict JSON with factual answer + verified PDF page citations.
    """
    # Matches the exact signature defined in rag_engine.py[cite: 8]
    return ask_heritage_question(
        site_id=site_id,
        question=question,
        language=language
    )

def run_pdf_ingestion():
    """Triggers the document vectorization pipeline."""
    ingest_documents()