"""
Generate synthetic visitor dataset for HeritageGuard.
90 sites x 90 days (2026-01-01 to 2026-03-31) x 24 hours = 194,400 records.
"""

import csv
import datetime
import numpy as np
import os

# Set fixed random seed for 100% reproducibility
np.random.seed(42)

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HERITAGE_SITES_CSV = os.path.join(BASE_DIR, "heritage_sites.csv")
VISITOR_DATA_CSV = os.path.join(BASE_DIR, "visitor_data.csv")

# Q1 2026 Gazetted Holidays / Major Festivals
HOLIDAYS_Q1_2026 = {
    datetime.date(2026, 1, 1),   # New Year's Day
    datetime.date(2026, 1, 14),  # Makar Sankranti / Pongal
    datetime.date(2026, 1, 26),  # Republic Day
    datetime.date(2026, 2, 15),  # Maha Shivratri
    datetime.date(2026, 3, 4),   # Holi
    datetime.date(2026, 3, 20),  # Eid-ul-Fitr / Festive
    datetime.date(2026, 3, 29),  # Ram Navami
}

# Popularity factor mapping
POPULARITY_FACTORS = {
    "international": 0.85,
    "domestic": 0.70,
    "pilgrimage": 0.80,
    "regional": 0.50,
    "remote": 0.30,
}

# Site category & profile classifications
SITE_METADATA = {
    "SITE_001": {"profile": "standard", "popularity": "international"},
    "SITE_002": {"profile": "standard", "popularity": "international"},
    "SITE_003": {"profile": "standard", "popularity": "domestic"},
    "SITE_004": {"profile": "standard", "popularity": "domestic"},
    "SITE_005": {"profile": "landmark", "popularity": "international"},
    "SITE_006": {"profile": "standard", "popularity": "domestic"},
    "SITE_007": {"profile": "standard", "popularity": "domestic"},
    "SITE_008": {"profile": "standard", "popularity": "international"},
    "SITE_009": {"profile": "standard", "popularity": "domestic"},
    "SITE_010": {"profile": "standard", "popularity": "domestic"},
    "SITE_011": {"profile": "standard", "popularity": "domestic"},
    "SITE_012": {"profile": "standard", "popularity": "domestic"},
    "SITE_013": {"profile": "standard", "popularity": "domestic"},
    "SITE_014": {"profile": "standard", "popularity": "domestic"},
    "SITE_015": {"profile": "standard", "popularity": "domestic"},
    "SITE_016": {"profile": "standard", "popularity": "regional"},
    "SITE_017": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_018": {"profile": "landmark", "popularity": "domestic"},
    "SITE_019": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_020": {"profile": "standard", "popularity": "regional"},
    "SITE_021": {"profile": "standard", "popularity": "regional"},
    "SITE_022": {"profile": "standard", "popularity": "regional"},
    "SITE_023": {"profile": "standard", "popularity": "regional"},
    "SITE_024": {"profile": "standard", "popularity": "remote"},
    "SITE_025": {"profile": "standard", "popularity": "remote"},
    "SITE_026": {"profile": "temple", "popularity": "remote"},
    "SITE_027": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_028": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_029": {"profile": "standard", "popularity": "regional"},
    "SITE_030": {"profile": "temple", "popularity": "remote"},
    "SITE_031": {"profile": "landmark", "popularity": "international"},
    "SITE_032": {"profile": "standard", "popularity": "domestic"},
    "SITE_033": {"profile": "standard", "popularity": "international"},
    "SITE_034": {"profile": "standard", "popularity": "international"},
    "SITE_035": {"profile": "standard", "popularity": "regional"},
    "SITE_036": {"profile": "standard", "popularity": "regional"},
    "SITE_037": {"profile": "standard", "popularity": "regional"},
    "SITE_038": {"profile": "standard", "popularity": "regional"},
    "SITE_039": {"profile": "standard", "popularity": "domestic"},
    "SITE_040": {"profile": "standard", "popularity": "regional"},
    "SITE_041": {"profile": "standard", "popularity": "regional"},
    "SITE_042": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_043": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_044": {"profile": "standard", "popularity": "remote"},
    "SITE_045": {"profile": "temple", "popularity": "international"},
    "SITE_046": {"profile": "temple", "popularity": "domestic"},
    "SITE_047": {"profile": "standard", "popularity": "domestic"},
    "SITE_048": {"profile": "standard", "popularity": "international"},
    "SITE_049": {"profile": "standard", "popularity": "domestic"},
    "SITE_050": {"profile": "standard", "popularity": "domestic"},
    "SITE_051": {"profile": "standard", "popularity": "regional"},
    "SITE_052": {"profile": "standard", "popularity": "regional"},
    "SITE_053": {"profile": "standard", "popularity": "regional"},
    "SITE_054": {"profile": "standard", "popularity": "remote"},
    "SITE_055": {"profile": "standard", "popularity": "international"},
    "SITE_056": {"profile": "standard", "popularity": "international"},
    "SITE_057": {"profile": "standard", "popularity": "regional"},
    "SITE_058": {"profile": "standard", "popularity": "regional"},
    "SITE_059": {"profile": "standard", "popularity": "regional"},
    "SITE_060": {"profile": "temple", "popularity": "domestic"},
    "SITE_061": {"profile": "temple", "popularity": "domestic"},
    "SITE_062": {"profile": "temple", "popularity": "international"},
    "SITE_063": {"profile": "standard", "popularity": "international"},
    "SITE_064": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_065": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_066": {"profile": "temple", "popularity": "regional"},
    "SITE_067": {"profile": "temple", "popularity": "regional"},
    "SITE_068": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_069": {"profile": "standard", "popularity": "regional"},
    "SITE_070": {"profile": "standard", "popularity": "regional"},
    "SITE_071": {"profile": "landmark", "popularity": "international"},
    "SITE_072": {"profile": "standard", "popularity": "domestic"},
    "SITE_073": {"profile": "temple", "popularity": "regional"},
    "SITE_074": {"profile": "temple", "popularity": "regional"},
    "SITE_075": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_076": {"profile": "standard", "popularity": "regional"},
    "SITE_077": {"profile": "standard", "popularity": "international"},
    "SITE_078": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_079": {"profile": "temple", "popularity": "domestic"},
    "SITE_080": {"profile": "standard", "popularity": "regional"},
    "SITE_081": {"profile": "landmark", "popularity": "domestic"},
    "SITE_082": {"profile": "standard", "popularity": "regional"},
    "SITE_083": {"profile": "standard", "popularity": "regional"},
    "SITE_084": {"profile": "standard", "popularity": "domestic"},
    "SITE_085": {"profile": "temple", "popularity": "international"},
    "SITE_086": {"profile": "temple", "popularity": "pilgrimage"},
    "SITE_087": {"profile": "standard", "popularity": "regional"},
    "SITE_088": {"profile": "temple", "popularity": "remote"},
    "SITE_089": {"profile": "standard", "popularity": "remote"},
    "SITE_090": {"profile": "temple", "popularity": "remote"},
}

# 24-hour normalized weights for each site profile (sum = 1.000)
HOURLY_WEIGHTS = {
    "standard": [
        0.000, 0.000, 0.000, 0.000, 0.000, 0.000,  # 00-05 (Closed)
        0.020, 0.040, 0.060, 0.090, 0.130, 0.140,  # 06-11
        0.110, 0.070, 0.080, 0.110, 0.100, 0.050,  # 12-17
        0.000, 0.000, 0.000, 0.000, 0.000, 0.000   # 18-23 (Closed)
    ],
    "temple": [
        0.010, 0.010, 0.010, 0.010, 0.010, 0.040,  # 00-05
        0.070, 0.080, 0.065, 0.055, 0.055, 0.050,  # 06-11
        0.040, 0.030, 0.030, 0.040, 0.050, 0.065,  # 12-17
        0.085, 0.085, 0.050, 0.030, 0.020, 0.010   # 18-23
    ],
    "landmark": [
        0.005, 0.005, 0.005, 0.005, 0.005, 0.015,  # 00-05
        0.030, 0.040, 0.045, 0.050, 0.055, 0.055,  # 06-11
        0.045, 0.035, 0.040, 0.055, 0.070, 0.090,  # 12-17
        0.110, 0.110, 0.070, 0.040, 0.015, 0.005   # 18-23
    ],
}

# Verify hourly weight sums
for prof, w in HOURLY_WEIGHTS.items():
    assert len(w) == 24, f"{prof} weights length is not 24"
    assert abs(sum(w) - 1.0) < 1e-6, f"{prof} weights sum is {sum(w)}"


def get_seasonal_factor(month: int) -> float:
    if month == 1:
        return 1.08  # January (Winter peak)
    elif month == 2:
        return 1.00  # February (Pleasant)
    elif month == 3:
        return 0.92  # March (Warming transition)
    return 1.00


def load_heritage_capacities():
    """Load site capacities from heritage_sites.csv without modifying it."""
    capacities = {}
    with open(HERITAGE_SITES_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            capacities[row["site_id"]] = int(row["capacity"])
    return capacities


def generate_dataset():
    capacities = load_heritage_capacities()
    assert len(capacities) == 90, f"Expected 90 sites, got {len(capacities)}"

    start_date = datetime.date(2026, 1, 1)
    end_date = datetime.date(2026, 3, 31)
    num_days = (end_date - start_date).days + 1
    assert num_days == 90, f"Expected 90 days, got {num_days}"

    days_list = [start_date + datetime.timedelta(days=i) for i in range(num_days)]
    sorted_site_ids = sorted(capacities.keys(), key=lambda x: int(x.split("_")[1]))

    all_rows = []

    for current_date in days_list:
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.strftime("%A")
        is_weekend = 1 if current_date.weekday() in (5, 6) else 0
        is_holiday = 1 if current_date in HOLIDAYS_Q1_2026 else 0

        weekend_factor = 1.40 if is_weekend else 1.00
        holiday_factor = 1.50 if is_holiday else 1.00
        seasonal_factor = get_seasonal_factor(current_date.month)

        for site_id in sorted_site_ids:
            capacity = capacities[site_id]
            meta = SITE_METADATA.get(site_id, {"profile": "standard", "popularity": "regional"})
            profile = meta["profile"]
            pop_cat = meta["popularity"]
            pop_factor = POPULARITY_FACTORS[pop_cat]

            # Stage 1: Daily expected visitors
            # Sample controlled daily variation per site
            daily_rand = np.clip(np.random.normal(1.0, 0.04), 0.92, 1.08)
            daily_expected = capacity * pop_factor * weekend_factor * holiday_factor * seasonal_factor * daily_rand
            daily_total = max(0, int(round(daily_expected)))

            # Stage 2: Hourly distribution with remainder resolution
            weights = HOURLY_WEIGHTS[profile]
            raw_hourly = [int(round(daily_total * w)) for w in weights]
            current_sum = sum(raw_hourly)
            remainder = daily_total - current_sum

            if remainder != 0:
                # Rank operating hours by weight descending
                ranked_indices = sorted(range(24), key=lambda i: (weights[i], raw_hourly[i]), reverse=True)
                # Filter to hours with non-zero weight if possible
                active_indices = [i for i in ranked_indices if weights[i] > 0]
                if not active_indices:
                    active_indices = ranked_indices

                if remainder > 0:
                    for k in range(remainder):
                        idx = active_indices[k % len(active_indices)]
                        raw_hourly[idx] += 1
                elif remainder < 0:
                    for k in range(abs(remainder)):
                        # Find highest active index with count > 0
                        decremented = False
                        for idx in active_indices:
                            if raw_hourly[idx] > 0:
                                raw_hourly[idx] -= 1
                                decremented = True
                                break
                        if not decremented:
                            break

            assert sum(raw_hourly) == daily_total, f"Sum mismatch for {site_id} on {date_str}: {sum(raw_hourly)} != {daily_total}"
            assert all(v >= 0 for v in raw_hourly), f"Negative hourly count found for {site_id} on {date_str}"

            for hour in range(24):
                all_rows.append([
                    site_id,
                    date_str,
                    hour,
                    raw_hourly[hour],
                    day_of_week,
                    is_weekend,
                    is_holiday
                ])

    # Write to visitor_data.csv
    with open(VISITOR_DATA_CSV, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["site_id", "date", "hour", "visitor_count", "day_of_week", "is_weekend", "is_holiday"])
        writer.writerows(all_rows)

    print(f"Successfully generated {len(all_rows)} rows in {VISITOR_DATA_CSV}")


if __name__ == "__main__":
    generate_dataset()
