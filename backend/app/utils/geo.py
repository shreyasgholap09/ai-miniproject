import math
from typing import Optional

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in meters."""
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def calculate_location_score(
    lat1: Optional[float], 
    lon1: Optional[float], 
    lat2: Optional[float], 
    lon2: Optional[float],
    max_radius_meters: float = 3000.0
) -> tuple[float, Optional[float]]:
    """
    Computes a normalized location compatibility score between 0.0 and 1.0.
    Returns (score, distance_in_meters).
    If either point lacks coordinates, returns a default neutral score of 0.5.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.5, None

    distance = haversine_distance_meters(lat1, lon1, lat2, lon2)
    
    if distance <= 100:  # Within 100 meters = virtually identical spot
        score = 1.0
    elif distance >= max_radius_meters:
        score = 0.0
    else:
        # Linear decay from 100m to max_radius_meters
        score = max(0.0, 1.0 - ((distance - 100) / (max_radius_meters - 100)))

    return round(score, 3), round(distance, 1)
