"""CLI script to generate site-specific crowd predictions."""

import os
import sys
import argparse
import json

# Ensure project root is in python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai.crowd.crowd_service import CrowdService
from ai.crowd.pressure_service import PressureService


def main():
    parser = argparse.ArgumentParser(description="Generate Crowd Prediction & Heritage Pressure")
    parser.add_argument("--site_id", type=str, required=True, help="Site ID (e.g. DEL001, BOM001, JAI001, PRA001)")
    parser.add_argument("--date", type=str, default=None, help="Date in YYYY-MM-DD (defaults to today)")
    parser.add_argument("--weather", type=str, default=None, help="Weather ('Clear', 'Sunny', 'Rainy', 'Cloudy')")
    parser.add_argument("--temp", type=float, default=None, help="Temperature in °C")
    parser.add_argument("--with_pressure", action="store_true", help="Include Heritage Pressure score")

    args = parser.parse_args()

    crowd_service = CrowdService()
    prediction = crowd_service.predict_crowd(
        site_id=args.site_id,
        date=args.date,
        weather=args.weather,
        temperature=args.temp
    )

    if args.with_pressure:
        pressure_service = PressureService()
        peak_visitors = max([p["expected_visitors"] for p in prediction["predictions"]]) if prediction["predictions"] else None
        pressure = pressure_service.calculate_pressure(
            site_id=args.site_id,
            predicted_visitors=peak_visitors
        )
        prediction["heritage_pressure"] = pressure

    print(json.dumps(prediction, indent=2))


if __name__ == "__main__":
    main()
