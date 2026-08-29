# AI Crowd Prediction & Heritage Pressure System

A production-ready, ML-driven **Crowd Prediction** and **Heritage Pressure** engine built for all 20 heritage monuments in India.

---

## 1. System Overview

The system consists of two decoupled yet integrated engines:
1. **Crowd Prediction Engine**: Forecasts hourly visitor footfall, crowd percentages, peak visiting intervals, and optimal visiting windows using time-aware LightGBM regression.
2. **Heritage Pressure Engine**: Computes multi-factor risk scores ($0-100$) and risk tiers (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) based on structural vulnerability, recent deterioration, maintenance backlogs, and dynamic visitor surges.

---

## 2. Supported Heritage Sites (20 Sites)

| Site ID | Monument Name | City | State | Safe Hourly Capacity | Operating Hours |
|---|---|---|---|---|---|
| `DEL001` | Red Fort | Delhi | Delhi | 30,000 | 09:00 - 21:00 |
| `DEL002` | Qutub Minar | Delhi | Delhi | 25,000 | 07:00 - 21:00 |
| `DEL003` | India Gate | Delhi | Delhi | 50,000 | 06:00 - 23:00 |
| `DEL004` | Humayun's Tomb | Delhi | Delhi | 8,000 | 06:00 - 18:00 |
| `DEL005` | Lotus Temple | Delhi | Delhi | 15,000 | 09:00 - 18:00 |
| `JAI001` | Amer Fort | Jaipur | Rajasthan | 18,000 | 08:00 - 18:00 |
| `JAI002` | Hawa Mahal | Jaipur | Rajasthan | 10,000 | 09:00 - 17:00 |
| `JAI003` | City Palace | Jaipur | Rajasthan | 12,000 | 09:00 - 17:00 |
| `JAI004` | Jantar Mantar | Jaipur | Rajasthan | 10,000 | 09:00 - 17:00 |
| `JAI005` | Albert Hall Museum | Jaipur | Rajasthan | 8,000 | 09:00 - 17:00 |
| `BOM001` | Gateway of India | Mumbai | Maharashtra | 45,000 | 06:00 - 23:00 |
| `BOM002` | Elephanta Caves | Mumbai | Maharashtra | 6,000 | 09:00 - 17:00 |
| `BOM003` | CSMT | Mumbai | Maharashtra | 35,000 | 06:00 - 23:00 |
| `BOM004` | Haji Ali Dargah | Mumbai | Maharashtra | 20,000 | 06:00 - 22:00 |
| `BOM005` | Siddhivinayak Temple | Mumbai | Maharashtra | 25,000 | 06:00 - 22:00 |
| `PRA001` | Triveni Sangam | Prayagraj | Uttar Pradesh | 30,000 | 05:00 - 20:00 |
| `PRA002` | Allahabad Fort | Prayagraj | Uttar Pradesh | 12,000 | 09:00 - 17:00 |
| `PRA003` | Khusro Bagh | Prayagraj | Uttar Pradesh | 8,000 | 06:00 - 19:00 |
| `PRA004` | Anand Bhavan | Prayagraj | Uttar Pradesh | 7,000 | 09:00 - 17:00 |
| `PRA005` | Chandrashekhar Azad Park | Prayagraj | Uttar Pradesh | 15,000 | 05:00 - 20:00 |

---

## 3. Mathematical Formulations & Methodology

### 3.1 Crowd Percentage Calculation
Crowd percentage represents physical capacity utilization:
$$\text{Crowd Percent} = \operatorname{clip}\left(\left\lfloor \frac{\text{Predicted Hourly Visitors}}{\text{Safe Physical Capacity}} \times 100 \right\rceil, 0, 100\right)$$

### 3.2 Dynamic Peak Hours Detection
Peak hours are contiguous time intervals where visitor density satisfies either:
- $\text{Crowd Percent} \ge 65\%$, OR
- $\text{Expected Visitors} \ge 70\text{th percentile of the daily forecast}$.

### 3.3 Dynamic Best Visiting Time
Optimal visiting windows are calculated by finding the minimum-density continuous slot strictly within valid site opening and closing hours:
$$\text{Best Window} = \arg\min_{h \in [\text{open\_hour}, \text{close\_hour})} \text{CrowdPercent}(h)$$

### 3.4 Heritage Pressure Score Formula
The explainable Heritage Pressure Score $P \in [0, 100]$:
$$P = w_v \cdot V + w_p \cdot P_{vuln} + w_d \cdot D + w_m \cdot M + w_h \cdot H$$
where:
- $V = \min(100, \frac{\text{Peak Visitors}}{\text{Safe Capacity}} \times 100)$ (Visitor Pressure, $w_v = 0.35$)
- $P_{vuln}$ = Intrinsic Structural Vulnerability ($w_p = 0.25$)
- $D$ = Recent Material Deterioration / AI Damage Score ($w_d = 0.20$)
- $M = \min(100, \frac{\text{Maintenance Delay Days}}{60} \times 100)$ (Maintenance Backlog, $w_m = 0.10$)
- $H$ = Historical Significance / Conservation Priority ($w_h = 0.10$)

**Risk Categorization**:
- $P \ge 85 \implies \text{CRITICAL}$
- $70 \le P < 85 \implies \text{HIGH}$
- $50 \le P < 70 \implies \text{MODERATE}$
- $P < 50 \implies \text{LOW}$

---

## 4. Directory Structure

```
ai/crowd/
├── data/
│   └── site_metadata.json          # Complete 20 sites metadata & capacities
├── models/
│   ├── best_model.joblib           # Trained LightGBM model artifact
│   ├── preprocessor.joblib         # Fitted FeatureEngineer prior stats
│   ├── metadata.json               # Model training metadata
│   └── metrics.json                # Test set evaluation breakdown
├── preprocessing/
│   ├── cleaner.py                  # Ingestion & cleaning
│   └── feature_engineering.py      # Cyclical & temporal feature pipeline
├── training/
│   ├── train_pipeline.py           # Chronological 70/15/15 training pipeline
│   └── evaluate.py                 # Multi-dimensional evaluation reporting
├── prediction/
│   ├── inference.py                # Fast sub-millisecond inference engine
│   ├── peak_detection.py           # Dynamic contiguous peak hour detector
│   └── best_time.py                # Operating-hour bounded best time optimizer
├── pressure/
│   ├── calculator.py               # Heritage pressure calculator
│   └── factors.py                  # Pressure factors & Pydantic models
├── tests/
│   ├── test_all_sites.py           # Validates all 20 site predictions
│   ├── test_site_isolation.py      # Anti-bleeding & cross-site isolation tests
│   ├── test_validation.py          # Invalid ID / date error checks
│   ├── test_pressure_score.py      # Pressure math & risk tier tests
│   ├── test_peak_and_best_time.py  # Peak and best window unit tests
│   └── test_api_endpoints.py       # FastAPI integration tests
├── train.py                        # CLI training runner
├── predict.py                      # CLI prediction runner
├── crowd_service.py                # High-level Crowd Service
├── pressure_service.py             # High-level Pressure Service
└── README.md                       # Complete technical documentation
```

---

## 5. Usage & CLI

### Retrain Model
```bash
python ai/crowd/train.py
```

### Run Prediction via CLI
```bash
python ai/crowd/predict.py --site_id DEL001 --date 2026-09-15 --with_pressure
```

### Python SDK Example
```python
from ai.crowd.crowd_service import CrowdService
from ai.crowd.pressure_service import PressureService

# Crowd Prediction
crowd_service = CrowdService()
prediction = crowd_service.predict_crowd(site_id="DEL001", date="2026-09-15")
print(prediction["peak_hours"])
print(prediction["best_time"])

# Heritage Pressure
pressure_service = PressureService()
pressure = pressure_service.calculate_pressure(site_id="DEL001", predicted_visitors=12000)
print(pressure["pressure_score"], pressure["risk"])
```

### API Endpoints
- `POST /api/crowd/predict`: Body `{"site_id": "DEL001", "date": "2026-09-15"}`
- `GET /api/crowd/{site_id}?date=2026-09-15`: Site forecast
- `GET /api/pressure/{site_id}`: Heritage pressure analysis
