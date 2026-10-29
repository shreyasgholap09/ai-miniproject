def get_auth_token(client, email="alice@test.com", password="Secret123"):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]

def test_create_and_get_report(client):
    token = get_auth_token(client)
    
    # Create lost report
    response = client.post(
        "/api/v1/reports/",
        data={
            "report_type": "lost",
            "title": "Blue Water Flask",
            "category": "Other",
            "color": "Blue",
            "description": "Stainless steel 1 liter hydro flask with stickers.",
            "location_name": "Student Center Lounge",
            "incident_date": "2026-10-25"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    report_data = response.json()
    assert report_data["title"] == "Blue Water Flask"
    assert report_data["status"] == "open"
    report_id = report_data["id"]

    # Retrieve report detail
    detail_resp = client.get(f"/api/v1/reports/{report_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == report_id

def test_list_reports_filter(client):
    token = get_auth_token(client)
    
    # Create a found report
    client.post(
        "/api/v1/reports/",
        data={
            "report_type": "found",
            "title": "Calculus Textbook",
            "category": "Books & Stationery",
            "color": "Green",
            "description": "Calculus 9th edition by Stewart found in room 101.",
            "location_name": "Math Building Room 101",
            "incident_date": "2026-10-26"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Filter by category
    resp = client.get("/api/v1/reports/?category=Books")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 1
    assert "Calculus" in items[0]["title"]
