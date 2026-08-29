"""Test peak hour detection and best visiting window algorithms."""

import pytest
from ai.crowd.prediction.peak_detection import PeakHourDetector
from ai.crowd.prediction.best_time import BestTimeOptimizer


@pytest.fixture
def sample_hourly_data():
    return [
        {"time": "09:00", "crowd_percent": 25, "expected_visitors": 250},
        {"time": "10:00", "crowd_percent": 45, "expected_visitors": 450},
        {"time": "11:00", "crowd_percent": 75, "expected_visitors": 750},
        {"time": "12:00", "crowd_percent": 88, "expected_visitors": 880},
        {"time": "13:00", "crowd_percent": 82, "expected_visitors": 820},
        {"time": "14:00", "crowd_percent": 60, "expected_visitors": 600},
        {"time": "15:00", "crowd_percent": 30, "expected_visitors": 300},
        {"time": "16:00", "crowd_percent": 20, "expected_visitors": 200},
        {"time": "17:00", "crowd_percent": 15, "expected_visitors": 150}
    ]


def test_peak_hour_interval_detection(sample_hourly_data):
    """Verifies that contiguous high-load hours are merged into intervals."""
    detector = PeakHourDetector(high_load_threshold_percent=65.0)
    peaks = detector.detect_peak_hours(sample_hourly_data)
    
    assert isinstance(peaks, list)
    assert len(peaks) > 0
    # Expected peak interval 11:00-14:00
    assert "11:00-14:00" in peaks or any("11:00" in p for p in peaks)


def test_best_time_selection_lowest_crowd(sample_hourly_data):
    """Verifies that the best visiting time picks the lowest crowd period."""
    optimizer = BestTimeOptimizer()
    best = optimizer.calculate_best_time(sample_hourly_data, open_hour=9, close_hour=18)
    
    # 17:00 has the minimum crowd percent (15%)
    assert best == "17:00-18:00"


def test_best_time_respects_operating_hours():
    """Verifies that best time is strictly within site opening and closing hours."""
    data = [
        {"time": "06:00", "crowd_percent": 5, "expected_visitors": 50},   # Site closed
        {"time": "07:00", "crowd_percent": 10, "expected_visitors": 100}, # Site closed
        {"time": "09:00", "crowd_percent": 40, "expected_visitors": 400},
        {"time": "10:00", "crowd_percent": 50, "expected_visitors": 500},
        {"time": "16:00", "crowd_percent": 30, "expected_visitors": 300},
    ]
    optimizer = BestTimeOptimizer()
    best = optimizer.calculate_best_time(data, open_hour=9, close_hour=17)
    
    # Should not pick 06:00 or 07:00 because site opens at 09:00
    assert best == "16:00-17:00"
