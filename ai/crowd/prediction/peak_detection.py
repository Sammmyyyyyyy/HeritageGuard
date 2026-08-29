"""Dynamic peak hour interval detection based on predicted crowd loads."""

from typing import List, Dict, Any
import numpy as np


class PeakHourDetector:
    """Detects peak visiting hours dynamically from model forecasts."""

    def __init__(self, high_load_threshold_percent: float = 65.0, top_quantile: float = 0.70):
        self.high_load_threshold_percent = high_load_threshold_percent
        self.top_quantile = top_quantile

    def detect_peak_hours(self, hourly_predictions: List[Dict[str, Any]]) -> List[str]:
        """Identifies contiguous peak hours from a day's hourly forecasts.
        
        Args:
            hourly_predictions: List of dicts containing 'time', 'expected_visitors', 'crowd_percent'.
            
        Returns:
            List of formatted interval strings, e.g. ["11:00-13:00"].
        """
        if not hourly_predictions:
            return []

        # Sort by hour
        sorted_preds = sorted(hourly_predictions, key=lambda x: int(x["time"].split(":")[0]))
        
        percents = np.array([p["crowd_percent"] for p in sorted_preds], dtype=float)
        visitors = np.array([p["expected_visitors"] for p in sorted_preds], dtype=float)
        
        # Dynamic threshold: either absolute high percent (>= 65%) or top quantile of the day
        dynamic_visitor_thresh = np.quantile(visitors, self.top_quantile)
        
        peak_indices = []
        for i, p in enumerate(sorted_preds):
            if p["crowd_percent"] >= self.high_load_threshold_percent or visitors[i] >= dynamic_visitor_thresh:
                peak_indices.append(i)

        if not peak_indices:
            # Fallback to the single highest load hour
            max_idx = int(np.argmax(visitors))
            peak_indices = [max_idx]

        # Group contiguous indices into time windows
        windows: List[str] = []
        start_idx = peak_indices[0]
        prev_idx = peak_indices[0]

        for idx in peak_indices[1:]:
            if idx == prev_idx + 1:
                prev_idx = idx
            else:
                start_time = sorted_preds[start_idx]["time"]
                end_hour = int(sorted_preds[prev_idx]["time"].split(":")[0]) + 1
                end_time = f"{end_hour:02d}:00"
                windows.append(f"{start_time}-{end_time}")
                start_idx = idx
                prev_idx = idx

        # Close the last interval
        start_time = sorted_preds[start_idx]["time"]
        end_hour = int(sorted_preds[prev_idx]["time"].split(":")[0]) + 1
        end_time = f"{end_hour:02d}:00"
        windows.append(f"{start_time}-{end_time}")

        return windows
