import io
from fastapi import FastAPI, File, UploadFile, Form
from PIL import Image
from ultralytics import YOLO

app = FastAPI()

# Load your custom AI model
model = YOLO("best.pt")

# Scoring weights based on your project requirements
weights = {
    "crack": 0.9,
    "damaged_element": 0.8,
    "vegetation": 0.6,
    "moisture": 0.6,
    "erosion": 0.4,
    "graffiti": 0.3,
    "discoloration": 0.2
}

@app.post("/analyze")
async def analyze_image(site_id: str = Form(...), file: UploadFile = File(...)):
    # 1. Convert uploaded file to a PIL Image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # 2. Run the image through the YOLO model
    results = model.predict(source=image, conf=0.25)
    
    # 3. Extract detections
    detections = []
    result = results[0] 
    for box in result.boxes:
        cls_id = int(box.cls[0])
        class_name = result.names[cls_id]
        confidence = round(float(box.conf[0]), 2)
        detections.append({"type": class_name, "confidence": confidence})
        
    # 4. Calculate severity and priority
    final_score = 0
    priority = "LOW"
    
    if detections:
        total_score = sum(det['confidence'] * weights.get(det['type'], 0.1) * 100 for det in detections)
        final_score = min(int(total_score / max(1, len(detections) * 0.8)), 100)
        
        if final_score >= 70:
            priority = "HIGH"
        elif final_score >= 40:
            priority = "MEDIUM"
            
    # 5. Return the strict JSON output
    return {
        "site_id": site_id,
        "damage_score": final_score,
        "priority": priority,
        "detections": detections
    }