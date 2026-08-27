# Dataset Metadata & Data Dictionary

## 1. Overview
The datasets in `data/` support the AI-driven Heritage Conservation & Intelligent Tourism features of **HeritageGuard**, specifically the **Crowd Prediction Engine** and the **Heritage Pressure Score**.

> [!NOTE]
> **Prototype Data Disclaimer**: 
> All data in `data/heritage_sites.csv` and `data/visitor_data.csv` are **synthetic prototype datasets** created specifically for software development, algorithm prototyping, simulation, and academic/demonstration purposes. They do **NOT** represent official assessments, visitor records, or carrying capacities published by the Archaeological Survey of India (ASI), UNESCO, or any government authority.

---

## 2. Heritage Sites Schema (`data/heritage_sites.csv`)

Stores the conservation and daily carrying capacity profile for all 90 heritage sites.

| Column Name | Type | Allowed Range | Description & Scoring Scale |
| :--- | :--- | :--- | :--- |
| `site_id` | String | `SITE_001` - `SITE_090` | Unique identifier for each heritage site. |
| `monument_name` | String | Text | Common / official name of the heritage site. |
| `location` | String | City, State | Geographical location in India. |
| `capacity` | Integer | Positive Integer | Estimated prototype daily visitor carrying capacity / reference threshold. |
| `historical_importance` | Integer | 1 to 5 | **1**: Lower significance<br>**2**: Moderate/local significance<br>**3**: Significant regional/state heritage<br>**4**: Major national heritage importance<br>**5**: UNESCO or exceptional national/global significance |
| `vulnerability` | Integer | 1 to 5 | **1**: Low vulnerability<br>**2**: Relatively resilient<br>**3**: Moderate vulnerability<br>**4**: High vulnerability<br>**5**: Extremely vulnerable |
| `damage_severity` | Integer | 1 to 5 | **1**: Little/no known damage<br>**2**: Minor damage<br>**3**: Moderate damage<br>**4**: Significant damage<br>**5**: Severe damage |
| `recent_deterioration` | Integer | 1 to 5 | **1**: Stable/minimal deterioration<br>**2**: Limited deterioration<br>**3**: Moderate deterioration<br>**4**: Significant recent deterioration<br>**5**: Rapid/reported deterioration |
| `maintenance_delay_days` | Integer | $\ge 0$ | Synthetic prototype days maintenance/restoration is overdue. |

---

## 3. Visitor Dataset Schema (`data/visitor_data.csv`)

Contains 194,400 hourly records spanning 90 days (2026-01-01 to 2026-03-31) across all 90 heritage sites ($90 \text{ sites} \times 90 \text{ days} \times 24 \text{ hours}$).

| Column Name | Type | Allowed Range | Description |
| :--- | :--- | :--- | :--- |
| `site_id` | String | `SITE_001` - `SITE_090` | Foreign key linking to `data/heritage_sites.csv`. |
| `date` | String | `2026-01-01` to `2026-03-31` | Observation date (`YYYY-MM-DD`). |
| `hour` | Integer | 0 to 23 | Hour of day (24-hour clock). |
| `visitor_count` | Integer | $\ge 0$ | Number of visitors recorded in that hour. |
| `day_of_week` | String | `Monday` - `Sunday` | Full day name. |
| `is_weekend` | Integer | `0` or `1` | Binary flag: `1` for Saturday/Sunday, `0` for weekdays. |
| `is_holiday` | Integer | `0` or `1` | Binary flag: `1` for gazetted public holidays/festivals, `0` otherwise. |

---

## 4. Synthetic Visitor Data Generation Methodology

The dataset is programmatically generated via `data/generate_visitor_data.py` (using `random_seed = 42` for 100% reproducibility) using a **two-stage process**:

### Stage 1: Daily Expected Visitor Demand
For each site $s$ and date $d$:

$$\text{daily\_expected\_visitors}(s, d) = \text{capacity}(s) \times \text{popularity\_factor}(s) \times F_{\text{weekend}}(d) \times F_{\text{holiday}}(d) \times F_{\text{season}}(d) \times \epsilon_{\text{daily}}(s, d)$$

- **Popularity Factor**: Categorized into International ($0.85$), Domestic ($0.70$), Pilgrimage ($0.80$), Regional ($0.50$), and Remote ($0.30$).
- **Weekend Factor**: $1.40$ on weekends, $1.00$ on weekdays.
- **Holiday Factor**: $1.50$ on major Q1 2026 holidays (New Year, Pongal/Makar Sankranti, Republic Day, Maha Shivratri, Holi, Eid-ul-Fitr, Ram Navami), $1.00$ otherwise.
- **Seasonal Factor**: January ($1.08$), February ($1.00$), March ($0.92$).
- **Daily Noise ($\epsilon_{\text{daily}}$)**: Sampled from $\mathcal{N}(1.0, 0.04)$, clipped to $[0.92, 1.08]$.

### Stage 2: Hourly Distribution with Exact Remainder Resolution
- Daily demand is mapped across 24 hours using **normalized weights** ($\sum_{h=0}^{23} w_h = 1.000$) tailored to three site profiles:
  1. **Standard Ticketed Heritage Sites**: Open daytime (06:00–17:00), peaks at 10:00–12:00 and 15:00–17:00, 0 at night.
  2. **Active Temples / Spiritual Sites**: Extended hours with dawn/morning Aarti and evening Aarti peaks.
  3. **Urban Landmarks / Memorials**: Open spaces with pronounced late-afternoon/evening leisure crowds.
- **Integer Remainder Distribution**: Any difference between the sum of independently rounded hourly counts and the daily total is systematically distributed to the peak operating hour(s), guaranteeing that the 24 hourly values for each site-day sum **exactly** to the daily visitor total.
