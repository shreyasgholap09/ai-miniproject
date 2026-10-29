from datetime import date
from typing import Optional
import numpy as np

# Color relationship taxonomy (synonyms and visually adjacent tones)
COLOR_FAMILIES = {
    "black": {"black", "dark grey", "dark gray", "charcoal", "jet black"},
    "blue": {"blue", "navy", "navy blue", "cyan", "sky blue", "teal", "indigo", "cobalt"},
    "grey": {"grey", "gray", "silver", "ash", "charcoal", "metallic"},
    "red": {"red", "maroon", "burgundy", "crimson", "ruby", "scarlet"},
    "brown": {"brown", "tan", "beige", "khaki", "chocolate", "coffee", "camel"},
    "white": {"white", "ivory", "cream", "off-white"},
    "green": {"green", "olive", "forest green", "emerald", "mint", "lime"},
    "yellow": {"yellow", "gold", "mustard", "amber"},
    "pink": {"pink", "rose", "magenta", "blush", "salmon"},
    "purple": {"purple", "violet", "lavender", "plum"},
    "orange": {"orange", "peach", "coral", "tangerine"}
}

def cosine_similarity(vec_a: list[float] | np.ndarray, vec_b: list[float] | np.ndarray) -> float:
    """Computes cosine similarity between two dense vectors."""
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    dot = np.dot(a, b)
    sim = dot / (norm_a * norm_b)
    # Clamp to [0.0, 1.0] for safety
    return float(max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim)))

def calculate_color_score(color1: str, color2: str) -> float:
    """Computes similarity between two color labels."""
    c1 = color1.strip().lower()
    c2 = color2.strip().lower()

    if c1 == c2:
        return 1.0

    # Substring match (e.g. "navy blue" contains "blue")
    if c1 in c2 or c2 in c1:
        return 0.9

    # Check color family membership
    for _, family in COLOR_FAMILIES.items():
        if (c1 in family or any(f in c1 for f in family)) and (c2 in family or any(f in c2 for f in family)):
            return 0.8

    return 0.15

def calculate_date_score(lost_date: date, found_date: date) -> float:
    """
    Computes chronological feasibility score between lost and found dates.
    Lost items must occur prior to or on the date found (with a 1-day margin for timezone/uncertainty).
    """
    delta_days = (found_date - lost_date).days

    if delta_days < -1:
        # Found item dated more than 1 day BEFORE it was lost: highly improbable
        return 0.05
    elif delta_days == -1:
        # Minor margin error
        return 0.6
    elif delta_days <= 3:
        # Found within 3 days of being lost: optimal
        return 1.0
    elif delta_days <= 7:
        return 0.9
    elif delta_days <= 14:
        return 0.8
    elif delta_days <= 30:
        return 0.6
    elif delta_days <= 60:
        return 0.4
    else:
        return 0.2
