import sys

def log(msg: str):
    print(msg, flush=True)

log("[Damage AI] Importing dependencies...")
import io
import os
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

os.environ["YOLO_VERBOSE"] = "False"
os.environ["ULTRALYTICS_AUTOINSTALL"] = "0"
os.environ["PYTHONUNBUFFERED"] = "1"

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

log("[Damage AI] Dependencies loaded")

# ============================================================
# CONFIG & ROBUST ENV LOADING
# ============================================================

log("[Damage AI] Resolving configuration and model paths...")
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

# Global model state
model = None
model_loading = False
model_error = None


def resolve_model_path() -> Path:
    """Find local model weights file across Render, root, and subfolder locations."""
    candidate_paths = [
        Path("/opt/render/project/src/ai/damage/best.pt"),
        Path("/opt/render/project/src/best.pt"),
        BASE_DIR / AI_DAMAGE_MODEL_PATH,
        BASE_DIR / "best.pt",
        Path.cwd() / "ai" / "damage" / "best.pt",
        Path.cwd() / "best.pt",
    ]
    for p in candidate_paths:
        try:
            if p.exists() and p.is_file() and p.stat().st_size > 1000:
                return p
        except Exception:
            pass
    return BASE_DIR / "best.pt"


def load_yolo_weights(path: Path):
    """Load YOLO weights synchronously on CPU inside a worker thread."""
    log(f"[Damage AI] Loading YOLO model from: {path}")
    from ultralytics import YOLO
    loaded = YOLO(str(path))
    return loaded


def download_from_supabase_sync(target_path: Path) -> bool:
    """Download model weights from Supabase storage into local target_path."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        log("[Damage AI] Supabase credentials not provided. Skipping download.")
        return False

    log("[Damage AI] Downloading model weights from Supabase...")
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    model_bytes = supabase.storage.from_(AI_DAMAGE_BUCKET).download(AI_DAMAGE_MODEL_PATH)
    if not model_bytes or len(model_bytes) < 1000:
        raise ValueError(f"Downloaded model is too small ({len(model_bytes) if model_bytes else 0} bytes)")
    target_path.write_bytes(model_bytes)
    log(f"[Damage AI] Model downloaded and saved to: {target_path} ({len(model_bytes)/(1024*1024):.2f} MB)")
    return True


async def initialize_model():
    """
    Asynchronously initializes the YOLO model without stalling FastAPI startup.
    Allows Uvicorn to bind immediately to $PORT and pass Render deployment checks.
    """
    global model, model_loading, model_error
    if model is not None:
        return

    model_loading = True
    model_error = None
    log("[Damage AI] Starting model initialization...")

    try:
        target_path = resolve_model_path()
        log(f"[Damage AI] Target model path resolved: {target_path}")

        # 1. Prefer local file if already available (avoids re-downloading)
        if target_path.exists() and target_path.is_file() and target_path.stat().st_size > 1000:
            log(f"[Damage AI] Local model weights found ({target_path.stat().st_size / (1024*1024):.2f} MB)")
        else:
            # 2. If not found locally, try downloading with strict timeout
            if SUPABASE_URL and SUPABASE_KEY:
                try:
                    log("[Damage AI] Downloading model...")
                    await asyncio.wait_for(
                        asyncio.to_thread(download_from_supabase_sync, target_path),
                        timeout=25.0
                    )
                except asyncio.TimeoutError:
                    log("[Damage AI] ERROR: Supabase model download timed out after 25s.")
                    model_error = "Supabase model download timed out"
                except Exception as dl_err:
                    log(f"[Damage AI] ERROR: Supabase download failed: {dl_err}")
                    model_error = str(dl_err)
            else:
                log("[Damage AI] Model file not found locally and no Supabase credentials configured.")
                model_error = "Model file not found locally"

        # 3. Load YOLO weights from resolved target_path
        if target_path.exists() and target_path.is_file() and target_path.stat().st_size > 1000:
            log("[Damage AI] Loading YOLO model...")
            model = await asyncio.to_thread(load_yolo_weights, target_path)
            class_names = list(model.names.values()) if hasattr(model, "names") else []
            log(f"[Damage AI] Model loaded successfully. Detected classes: {class_names}")
            log("[Damage AI] Application ready")
            model_error = None
        else:
            if not model_error:
                model_error = f"Model file {target_path} not found or corrupted"
            log(f"[Damage AI] Warning: Model unavailable: {model_error}")
            log("[Damage AI] Application ready (model unavailable, will return HTTP 503 from /analyze)")
    except Exception as exc:
        log(f"[Damage AI] Critical error during model initialization: {exc}")
        model = None
        model_error = str(exc)
        log("[Damage AI] Application ready (model unavailable, will return HTTP 503 from /analyze)")
    finally:
        model_loading = False


# ============================================================
# FASTAPI LIFESPAN & APP
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    log("[Damage AI] Starting application...")
    # Launch background task to load model so Uvicorn binds to $PORT immediately
    asyncio.create_task(initialize_model())
    yield
    log("[Damage AI] Application shutting down...")


app = FastAPI(
    title="HeritageGuard Damage AI",
    description="Crack detection and visual damage assessment",
    version="1.0.0",
    lifespan=lifespan
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
@app.get("/health")
async def root():
    return {
        "status": "running",
        "service": "HeritageGuard Damage AI",
        "model": "best.pt",
        "model_available": model is not None,
        "model_loading": model_loading,
        "model_error": model_error,
        "classes": model.names if model is not None else {}
    }


# ============================================================
# MAIN AI FUNCTION
# ============================================================

# ============================================================
# MAIN AI FUNCTION & SCORE CALCULATION
# ============================================================

def calculate_damage_score(
    detections: list,
    image_width: int,
    image_height: int
) -> float:
    """
    Calculate a genuine, deterministic damage score (0-100) from YOLO detections.
    Considers:
    - Number of detected damage regions
    - Bounding box area relative to image area
    - Model confidence of detections
    - Class severity weight
    """
    if not detections:
        return 0.0

    # 1. Class severity weighting
    class_weights = {
        "crack": 1.0,
        "fracture": 1.2,
        "deterioration": 1.1,
        "erosion": 0.9,
        "spalling": 1.2,
        "vegetation": 0.8,
        "stain": 0.6,
        "discoloration": 0.5,
    }

    # 2. Confidences
    confidences = [d["confidence"] for d in detections]
    max_conf = max(confidences)
    avg_conf = sum(confidences) / len(confidences)

    # 3. Damaged area coverage relative to image area
    total_area_ratio = min(1.0, sum(d.get("area_ratio", 0.0) for d in detections))

    # 4. Count factor (saturating up to 5 detections)
    count = len(detections)
    count_factor = min(1.0, count / 5.0)

    # 5. Composite score:
    # - Confidence component (up to 35 pts)
    # - Area coverage component (up to 40 pts: 15% surface damage gives full 40 pts)
    # - Count / spread component (up to 25 pts)
    conf_component = (0.6 * max_conf + 0.4 * avg_conf) * 35.0
    area_component = min(1.0, total_area_ratio / 0.15) * 40.0
    count_component = count_factor * 25.0

    severity_weight = max(class_weights.get(d.get("type", "").lower(), 1.0) for d in detections)
    raw_score = (conf_component + area_component + count_component) * severity_weight

    return max(1.0, min(100.0, round(raw_score, 1)))


def analyze_image(
    image: Image.Image,
    site_id: str
):
    if model is None:
        log("[Damage AI] ERROR: Inference requested but model is not loaded.")
        raise HTTPException(
            status_code=503,
            detail="Damage AI model is currently unavailable."
        )

    log(f"[Damage AI] Image received: {image.width}x{image.height} for site: {site_id}")
    log("[Damage AI] Running inference...")

    # Preprocessing: constrain dimensions to avoid memory/CPU spikes on constrained servers
    inference_image = image
    if max(image.width, image.height) > 1024:
        inference_image = image.copy()
        inference_image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)

    img_w, img_h = inference_image.width, inference_image.height
    img_area = float(img_w * img_h)

    # Run YOLO inference
    results = model.predict(
        source=inference_image,
        conf=CONFIDENCE_THRESHOLD,
        imgsz=640,
        verbose=False,
        device="cpu"
    )

    result = results[0]
    detections = []

    # Extract detections
    for box in result.boxes:
        class_id = int(box.cls[0])
        class_name = result.names[class_id]
        confidence = float(box.conf[0])
        x1, y1, x2, y2 = box.xyxy[0].tolist()

        box_w = max(0.0, x2 - x1)
        box_h = max(0.0, y2 - y1)
        area_ratio = (box_w * box_h) / max(1.0, img_area)

        # Map severity based on class & confidence
        if confidence >= 0.70:
            det_severity = "HIGH"
        elif confidence >= 0.40:
            det_severity = "MEDIUM"
        else:
            det_severity = "LOW"

        detections.append({
            "id": f"det-{len(detections) + 1}",
            "type": class_name,
            "confidence": round(confidence, 2),
            "severity": det_severity,
            "area_ratio": round(area_ratio, 4),
            "description": f"Detected {class_name} on monument surface.",
            "bbox": {
                "x1": round(x1, 2),
                "y1": round(y1, 2),
                "x2": round(x2, 2),
                "y2": round(y2, 2),
                "x": round(x1, 2),
                "y": round(y1, 2),
                "width": round(box_w, 2),
                "height": round(box_h, 2),
            }
        })

    # Calculate image-dependent score
    damage_score = calculate_damage_score(detections, img_w, img_h)

    # Model confidence & damage status
    if detections:
        model_confidence = round(max(d["confidence"] for d in detections), 2)
        if damage_score >= 70:
            priority = "HIGH"
            damage_status = "severe"
        elif damage_score >= 40:
            priority = "MEDIUM"
            damage_status = "moderate"
        else:
            priority = "LOW"
            damage_status = "low"

        log(f"[Damage AI] Detections: {len(detections)}")
        log(f"[Damage AI] Classes: {list({d['type'] for d in detections})}")
        log(f"[Damage AI] Max confidence: {model_confidence}")
        log(f"[Damage AI] Damage score: {damage_score} ({damage_status})")
    else:
        model_confidence = None
        priority = "LOW"
        damage_status = "no_damage"
        log("[Damage AI] No damage detected")

    return {
        "success": True,
        "site_id": site_id,
        "damage_score": damage_score,
        "confidence": model_confidence,
        "priority": priority,
        "damage_status": damage_status,
        "detections_count": len(detections),
        "detections": detections,
    }


# ============================================================
# API ENDPOINT
# ============================================================

@app.post("/analyze")
async def analyze_image_api(
    site_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Model readiness check
    if model is None:
        detail_msg = (
            "Damage AI model is currently initializing. Please try again in a moment."
            if model_loading
            else f"Damage AI model is currently unavailable ({model_error or 'Weights not loaded'})."
        )
        log(f"[Damage AI] Rejecting /analyze: {detail_msg}")
        raise HTTPException(
            status_code=503,
            detail=detail_msg
        )

    # Check file type
    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="Could not determine file type."
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    # Read uploaded image
    image_bytes = await file.read()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        log(f"[Damage AI] ERROR: Invalid image: {exc}")
        raise HTTPException(
            status_code=400,
            detail="Invalid image format."
        )

    # Run AI off the event loop thread to keep FastAPI responsive
    try:
        return await asyncio.to_thread(
            analyze_image,
            image=image,
            site_id=site_id
        )
    except HTTPException:
        raise
    except Exception as exc:
        log(f"[Damage AI] ERROR: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Damage analysis execution failed: {str(exc)}"
        )