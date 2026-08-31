import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import ai_interface

app = FastAPI(
    title="HeritageGuard API - Hackathon Edition",
    description="Multi-city AI Heritage Tourism & RAG Assistance Engine"
)

# 1. Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Self-healing check on startup
@app.on_event("startup")
def startup_event():
    """Auto-ingests documents if vector database is not present."""
    db_dir = "./chroma_db"
    if not os.path.exists(db_dir) or not os.listdir(db_dir):
        raise RuntimeError(
            "ChromaDB not found. Please deploy the pre-built chroma_db directory."
        )

# 3. Payload schemas (Structured for clean Swagger UI documentation)
class Coordinates(BaseModel):
    lat: float = Field(..., example=28.6139, description="Latitude coordinate")
    lng: float = Field(..., example=77.2090, description="Longitude coordinate")

class RecommendationRequest(BaseModel):
    starting_coords: Coordinates
    starting_site_id: Optional[str] = Field(default=None, example="DEL001", description="Starting site ID")
    destination_coords: Optional[Coordinates] = Field(default=None, description="Destination coordinates")
    destination_site_id: Optional[str] = Field(default=None, example="PRA005", description="Destination site ID")
    start_time: str = Field(default="10:00", example="10:00", description="Start time (HH:MM)")
    available_time_minutes: int = Field(default=240, example=240, description="Available duration in minutes")
    budget: int = Field(default=500, example=500, description="Budget in INR")
    interests: List[str] = Field(default=["history", "architecture"], example=["history", "architecture"])
    crowd_tolerance: float = Field(default=0.3, example=0.3, description="Crowd tolerance scale (0.0 to 1.0)")

class QueryRequest(BaseModel):
    site_id: str = Field(..., example="DEL001", description="Monument ID (e.g., DEL001, BOM001, JAI001, PRA001)")
    question: str = Field(..., example="Who built this monument and why?", description="Tourist question")
    language: str = Field(default="English", example="English", description="Response language")

# 4. API Endpoints
@app.post("/api/recommend")
def recommend_endpoint(req: RecommendationRequest):
    """Computes optimized itinerary with live weather and ML crowd predictions."""
    try:
        payload = req.model_dump() if hasattr(req, "model_dump") else req.dict()
        result = ai_interface.get_recommendations_for_user(payload)
        return result
    except ValueError as val_err:
        # Returns 400 if user coordinates are outside supported cities
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/rag/query")
def query_endpoint(req: QueryRequest):
    """Queries the strict vector database for historical monument data."""
    if not req.question or not req.site_id:
        raise HTTPException(status_code=400, detail="Missing question or site_id")
        
    response = ai_interface.answer_tourist_query(
        site_id=req.site_id, 
        question=req.question, 
        language=req.language
    )
    return response

# To run: uvicorn app:app --reload