"""Pytest configuration and environment fixtures."""

import os
import sys

# Add project root and backend root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")

for path in [PROJECT_ROOT, BACKEND_ROOT]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Default test env variables if not set
os.environ.setdefault("SUPABASE_URL", "https://oyrlwuketlaxoxievfld.supabase.co")
os.environ.setdefault("SUPABASE_KEY", os.getenv("SUPABASE_KEY", ""))
