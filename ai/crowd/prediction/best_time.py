"""Dynamic optimization for best visiting time window within valid operating hours."""

from typing import List, Dict, Any, Optional


class BestTimeOptimizer:
    """Calculates optimal visiting time window based on minimum predicted crowd density."""

    def __init__(self, window_hours: int = 2):
        self.window_hours = window_hours

    def calculate_best_time(
        self,
        hourly_predictions: List[Dict[str, Any]],
        open_hour: int = 8,
        close_hour: int = 18
    ) -> str:
        """Finds the lowest-density continuous visiting window within operating hours.
        
        Args:
            hourly_predictions: List of hourly predictions.
            open_hour: Site opening hour (inclusive).
            close_hour: Site closing hour (exclusive).
            
        Returns:
            Best visit window string, e.g. "15:00-16:00" or "08:00-10:00".
        """
        if not hourly_predictions:
            return f"{open_hour:02d}:00-{(open_hour + 1):02d}:00"

        # Filter strictly to operating hours
        valid_slots = []
        for p in hourly_predictions:
            hour = int(p["time"].split(":")[0])
            if open_hour <= hour < close_hour:
                valid_slots.append(p)

        if not valid_slots:
            valid_slots = hourly_predictions

        # Sort chronologically
        valid_slots = sorted(valid_slots, key=lambda x: int(x["time"].split(":")[0]))

        # Find best 1-hour or 2-hour window with lowest average crowd percentage
        best_window = ""
        min_crowd = float("inf")

        for i in range(len(valid_slots)):
            hour_i = int(valid_slots[i]["time"].split(":")[0])
            crowd_i = valid_slots[i]["crowd_percent"]

            # Check single hour
            if crowd_i < min_crowd:
                min_crowd = crowd_i
                best_window = f"{hour_i:02d}:00-{(hour_i + 1):02d}:00"

        return best_window
