import io
import os

from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image
from ultralytics import YOLO


# ============================================================
# CONFIG
# ============================================================

ENV_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend"
    / ".env"
)

load_dotenv(ENV_PATH)

BASE_DIR = Path(__file__).resolve().parent

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

AI_DAMAGE_BUCKET = os.getenv(
    "AI_DAMAGE_BUCKET",
    "ai-damage"
)

AI_DAMAGE_MODEL_PATH = os.getenv(
    "AI_DAMAGE_MODEL_PATH",
    "best.pt"
)

CONFIDENCE_THRESHOLD = 0.25

MODEL_PATH = BASE_DIR / AI_DAMAGE_MODEL_PATH


# ============================================================
# SUPABASE
# ============================================================

if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is missing from .env"
    )

if not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_KEY is missing from .env"
    )


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ============================================================
# LOAD MODEL
# ============================================================

if not MODEL_PATH.exists():

    print("Downloading damage AI model from Supabase...")

    try:

        model_bytes = supabase.storage.from_(
            AI_DAMAGE_BUCKET
        ).download(
            AI_DAMAGE_MODEL_PATH
        )

        MODEL_PATH.write_bytes(model_bytes)

        print(
            f"Model downloaded successfully: {MODEL_PATH}"
        )

    except Exception as exc:

        raise RuntimeError(
            "Failed to download damage AI model "
            f"from Supabase: {exc}"
        ) from exc


model = YOLO(
    str(MODEL_PATH)
)

print("============================================")
print("HeritageGuard Damage AI")
print("============================================")
print(f"Model loaded: {MODEL_PATH}")
print(f"Classes: {model.names}")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "classes": model.names
    }


# ============================================================
# MAIN AI FUNCTION
# ============================================================

def analyze_image(
    image: Image.Image,
    site_id: str
):

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
        return 0


    crack_detections = [

        d

        for d in detections

        if d["type"] == "crack"

    ]


    if not crack_detections:
        return 0


    # Highest confidence crack

    highest_confidence = max(

        d["confidence"]

        for d in crack_detections

    )


    # Number of cracks

    crack_count = len(
        crack_detections
    )


    # --------------------------------------------------------
    # Score:
    #
    # 70% based on confidence
    # 30% based on number of cracks
    # --------------------------------------------------------

    confidence_component = (
        highest_confidence * 70
    )


    count_component = min(

        crack_count * 5,

        30

    )


    score = (
        confidence_component
        + count_component
    )


    return min(
        round(score),
        100
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