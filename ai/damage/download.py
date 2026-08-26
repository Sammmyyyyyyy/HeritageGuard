import os
from dotenv import load_dotenv
from roboflow import Roboflow

# Load .env.damage
load_dotenv(".env.damage")

api_key = os.getenv("ROBOFLOW_API_KEY")

if not api_key:
    raise ValueError("ROBOFLOW_API_KEY not found in .env.damage")

rf = Roboflow(api_key=api_key)

project = rf.workspace("ishan-srivastava-qdcn4").project("tourism-project")
version = project.version(1)

dataset = version.download("yolov8")