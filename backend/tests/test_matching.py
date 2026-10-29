from datetime import date, timedelta
from app.utils.scoring import cosine_similarity, calculate_color_score, calculate_date_score
from app.utils.geo import haversine_distance_meters, calculate_location_score

def test_cosine_similarity_identical_and_orthogonal():
    vec1 = [1.0, 0.0, 0.0]
    vec2 = [1.0, 0.0, 0.0]
    vec3 = [0.0, 1.0, 0.0]
    
    assert abs(cosine_similarity(vec1, vec2) - 1.0) < 1e-4
    assert abs(cosine_similarity(vec1, vec3) - 0.0) < 1e-4

def test_color_matching_logic():
    # Exact match
    assert calculate_color_score("Black", "Black") == 1.0
    # Substring match
    assert calculate_color_score("Navy Blue", "Blue") == 0.9
    # Related shade in family
    assert calculate_color_score("Navy", "Cobalt") == 0.8
    # Conflicting colors
    assert calculate_color_score("Yellow", "Purple") == 0.15

def test_date_feasibility_logic():
    lost = date(2026, 10, 1)
    
    # Found 1 day after lost -> optimal
    assert calculate_date_score(lost, date(2026, 10, 2)) == 1.0
    
    # Found on same day
    assert calculate_date_score(lost, date(2026, 10, 1)) == 1.0
    
    # Found 5 days after
    assert calculate_date_score(lost, date(2026, 10, 6)) == 0.9
    
    # Found 40 days later -> lower feasibility
    assert calculate_date_score(lost, date(2026, 11, 10)) == 0.4
    
    # Found BEFORE being lost (physically improbable)
    assert calculate_date_score(lost, date(2026, 9, 20)) == 0.05

def test_location_proximity_logic():
    # Identical point
    score, dist = calculate_location_score(37.7749, -122.4194, 37.7749, -122.4194)
    assert score == 1.0
    assert dist == 0.0

    # Near point (~150m)
    score_near, dist_near = calculate_location_score(37.7749, -122.4194, 37.7758, -122.4194)
    assert score_near > 0.9
    assert dist_near < 200

    # Far point (> 3000m)
    score_far, dist_far = calculate_location_score(37.7749, -122.4194, 37.8100, -122.4194)
    assert score_far == 0.0
    assert dist_far > 3000
