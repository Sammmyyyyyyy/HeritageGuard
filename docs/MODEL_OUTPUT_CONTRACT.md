# HeritageGuard Model Output Contract

## 1. Overview
To ensure smooth collaboration across the **AI Engine**, **Backend API**, and **Frontend Client**, this document defines the **stable output contract** for the Crowd Prediction & Heritage Pressure Score model.

> [!IMPORTANT]
> **Decoupled Architecture**: 
> The backend and frontend are built against this exact JSON contract. As the internal machine learning algorithms evolve, the response structure remains unchanged. Internal model features (e.g., historical footfall weights, intermediate factors, raw capacities, decay coefficients) are kept private and **never exposed** in the client-facing response.

---

## 2. JSON Schema Specification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "HeritageModelOutput",
  "type": "object",
  "required": [
    "site_id",
    "predictions",
    "best_time",
    "pressure_score",
    "risk"
  ],
  "properties": {
    "site_id": {
      "type": "string",
      "description": "Unique identifier for the heritage site (e.g., 'SITE_001')."
    },
    "predictions": {
      "type": "array",
      "description": "Hourly time and crowd density percentage predictions.",
      "items": {
        "type": "object",
        "required": ["time", "crowd_percent"],
        "properties": {
          "time": {
            "type": "string",
            "description": "Time slot / hour formatted as HH:MM."
          },
          "crowd_percent": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "Estimated crowd density / occupancy percentage."
          }
        }
      }
    },
    "best_time": {
      "type": "string",
      "description": "Recommended lower-crowd visiting time window."
    },
    "pressure_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Overall Heritage Pressure Score (0-100)."
    },
    "risk": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH"],
      "description": "Categorical risk classification based on pressure score."
    }
  }
}
```

---

## 3. Field Definitions & Types

| Field Name | Type | Allowed Values | Description |
| :--- | :--- | :--- | :--- |
| `site_id` | `string` | `SITE_001` - `SITE_090` | Identifies the heritage site. |
| `predictions` | `array[object]` | Array of prediction items | List of chronological time and crowd percentage objects. |
| `predictions[].time` | `string` | `HH:MM` (e.g., `"11:00"`) | The specific hourly time point. |
| `predictions[].crowd_percent`| `integer` | `0` to `100` | Predicted crowd occupancy relative to safe comfortable flow. |
| `best_time` | `string` | Time window (e.g., `"15:00-16:00"`) | Recommends optimal visiting slot with lowest expected crowding. |
| `pressure_score` | `number` (int/float) | `0` to `100` | Composite conservation pressure index. |
| `risk` | `string` | `"LOW"`, `"MEDIUM"`, `"HIGH"` | Risk tier indicating urgent crowd throttling / conservation attention. |

---

## 4. Sample Response (`SITE_001` - Taj Mahal)

```json
{
  "site_id": "SITE_001",
  "predictions": [
    {
      "time": "06:00",
      "crowd_percent": 15
    },
    {
      "time": "07:00",
      "crowd_percent": 28
    },
    {
      "time": "08:00",
      "crowd_percent": 42
    },
    {
      "time": "09:00",
      "crowd_percent": 58
    },
    {
      "time": "10:00",
      "crowd_percent": 76
    },
    {
      "time": "11:00",
      "crowd_percent": 88
    },
    {
      "time": "12:00",
      "crowd_percent": 74
    },
    {
      "time": "13:00",
      "crowd_percent": 48
    },
    {
      "time": "14:00",
      "crowd_percent": 54
    },
    {
      "time": "15:00",
      "crowd_percent": 78
    },
    {
      "time": "16:00",
      "crowd_percent": 70
    },
    {
      "time": "17:00",
      "crowd_percent": 35
    }
  ],
  "best_time": "06:00-08:00",
  "pressure_score": 91,
  "risk": "HIGH"
}
```

---

## 5. Python Implementation Reference

The schema is defined in [`ai/crowd/schemas.py`](file:///Users/shagungarg/HeritageGuard/ai/crowd/schemas.py) and can be directly imported in backend routes:

```python
from ai.crowd.schemas import HeritageModelOutput, CrowdPrediction, RiskCategory
```
