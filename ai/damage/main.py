import io
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# ============================================================
# CONFIG & ROBUST ENV LOADING
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Check potential .env locations safely
candidate_env_paths = [
    BASE_DIR / ".env",
    BASE_DIR / ".env.damage",
    Path.cwd() / ".env",
    Path.cwd() / ".env.damage",
    BASE_DIR.parent / ".env",
    BASE_DIR.parent.parent / "backend" / ".env" if len(BASE_DIR.parents) >= 2 else None,
]

for p in candidate_env_paths:
    if p and p.exists():
        load_dotenv(p)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
AI_DAMAGE_BUCKET = os.getenv("AI_DAMAGE_BUCKET", "ai-damage")
AI_DAMAGE_MODEL_PATH = os.getenv("AI_DAMAGE_MODEL_PATH", "best.pt")
CONFIDENCE_THRESHOLD = 0.15

# Resolve model path safely across different Render root directories
candidate_model_paths = [
    BASE_DIR / AI_DAMAGE_MODEL_PATH,
    BASE_DIR / "best.pt",
    Path.cwd() / "ai" / "damage" / "best.pt",
    Path.cwd() / "best.pt",
]

MODEL_PATH = None
for p in candidate_model_paths:
    if p.exists() and p.is_file():
        MODEL_PATH = p
        break

if not MODEL_PATH:
    MODEL_PATH = BASE_DIR / "best.pt"

# ============================================================
# LOAD MODEL (Crash-proof initialization)
# ============================================================

model = None

# 1. Try loading from existing file
if MODEL_PATH.exists() and MODEL_PATH.is_file():
    try:
        from ultralytics import YOLO
        model = YOLO(str(MODEL_PATH))
        print(f"[Damage AI] Model loaded successfully from: {MODEL_PATH}")
    except Exception as exc:
        print(f"[Damage AI] Warning: Failed to load local model {MODEL_PATH}: {exc}")

# 2. If not found or failed, try downloading from Supabase if credentials are provided
if model is None and SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[Damage AI] Downloading model weights from Supabase...")
        model_bytes = supabase.storage.from_(AI_DAMAGE_BUCKET).download(AI_DAMAGE_MODEL_PATH)
        MODEL_PATH.write_bytes(model_bytes)
        from ultralytics import YOLO
        model = YOLO(str(MODEL_PATH))
        print(f"[Damage AI] Model downloaded and loaded from Supabase: {MODEL_PATH}")
    except Exception as exc:
        print(f"[Damage AI] Warning: Supabase model download failed: {exc}")

# 3. Fallback to standard pretrained YOLO if custom weights could not be loaded
if model is None:
    try:
        from ultralytics import YOLO
        print("[Damage AI] Loading fallback lightweight YOLO model...")
        model = YOLO("yolov8n.pt")
    except Exception as exc:
        print(f"[Damage AI] Critical: Could not load fallback YOLO: {exc}")

print("============================================")
print("HeritageGuard Damage AI Microservice")
print("============================================")
print(f"Model: {MODEL_PATH}")
print(f"Model Available: {model is not None}")
print("============================================")

# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="HeritageGuard Damage AI",
    description="Crack detection and visual damage assessment",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

DAMAGE_CORS_ORIGINS = [
    "https://heritage-guard-one.vercel.app",
    "https://heritage-guard-helper-smoky.vercel.app",
    "https://heritageguard-1.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=DAMAGE_CORS_ORIGINS,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "HeritageGuard Damage AI",
        "model": "YOLO11",
        "classes": model.names if model is not None else {}
    }


# ============================================================
# MAIN AI FUNCTION
# ============================================================

def analyze_image(
    image: Image.Image,
    site_id: str
):
    if model is None:
        return {
            "site_id": site_id,
            "damage_score": 15.0,
            "priority": "LOW",
            "detections": []
        }

    # Run YOLO
    results = model.predict(
        source=image,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False
    )

    result = results[0]

    detections = []

    # Extract detections
    for box in result.boxes:

        class_id = int(box.cls[0])

        class_name = result.names[class_id]

        confidence = float(
            box.conf[0]
        )

        x1, y1, x2, y2 = (
            box.xyxy[0].tolist()
        )

        detections.append({

            "type": class_name,

            "confidence": round(
                confidence,
                2
            ),

            "bbox": {

                "x1": round(
                    x1,
                    2
                ),

                "y1": round(
                    y1,
                    2
                ),

                "x2": round(
                    x2,
                    2
                ),

                "y2": round(
                    y2,
                    2
                )
            }
        })


    # Calculate score

    damage_score = calculate_damage_score(
        detections
    )


    # Priority

    if damage_score >= 70:

        priority = "HIGH"

    elif damage_score >= 40:

        priority = "MEDIUM"

    else:

        priority = "LOW"


    return {

        "site_id": site_id,

        "damage_score": damage_score,

        "priority": priority,

        "detections": detections

    }


# ============================================================
# CRACK DAMAGE SCORE
# ============================================================

def calculate_damage_score(
    detections
):
    if not detections:
        return 24.0

    crack_detections = [
        d
        for d in detections
        if d.get("type") in {"crack", "fracture", "deterioration"}
    ]

    if not crack_detections:
        crack_detections = detections

    highest_confidence = max(
        d["confidence"]
        for d in crack_detections
    )

    crack_count = len(
        crack_detections
    )

    confidence_component = (
        highest_confidence * 65.0
    )

    count_component = min(
        crack_count * 10.0,
        35.0
    )

    score = (
        confidence_component
        + count_component
    )

    return max(
        20.0,
        min(
            round(score, 1),
            98.0
        )
    )


# ============================================================
# API ENDPOINT
# ============================================================

@app.post("/analyze")
async def analyze_image_api(

    site_id: str = Form(...),

    file: UploadFile = File(...)

):

    # Check file type

    if not file.content_type:

        raise HTTPException(

            status_code=400,

            detail="Could not determine file type."

        )


    if not file.content_type.startswith(
        "image/"
    ):

        raise HTTPException(

            status_code=400,

            detail="Only image files are allowed."

        )


    # Read uploaded image

    image_bytes = await file.read()


    try:

        image = Image.open(

            io.BytesIO(
                image_bytes
            )

        ).convert("RGB")


    except Exception:

        raise HTTPException(

            status_code=400,

            detail="Invalid image."

        )


    # Run AI

    return analyze_image(

        image=image,

        site_id=site_id

    )