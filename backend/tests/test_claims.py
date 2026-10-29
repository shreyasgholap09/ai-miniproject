def get_auth_token(client, email, password):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]

def test_claim_workflow(client):
    alice_token = get_auth_token(client, "alice@test.com", "Secret123")
    
    # Register second user (Bob)
    client.post("/api/v1/auth/register", json={
        "name": "Bob Claimer",
        "email": "bob.claimer@test.com",
        "password": "Password123"
    })
    bob_token = get_auth_token(client, "bob.claimer@test.com", "Password123")

    # Alice creates a found report
    report_resp = client.post(
        "/api/v1/reports/",
        data={
            "report_type": "found",
            "title": "Smart Watch",
            "category": "Electronics",
            "color": "Black",
            "description": "Found a black smart watch with leather strap.",
            "location_name": "Gym Locker Room",
            "incident_date": "2026-10-20"
        },
        headers={"Authorization": f"Bearer {alice_token}"}
    )
    report_id = report_resp.json()["id"]

    # Alice cannot claim her own report
    self_claim = client.post(
        "/api/v1/claims/",
        json={
            "report_id": report_id,
            "proof_details": "This is mine because I found it",
            "contact_info": "alice@test.com"
        },
        headers={"Authorization": f"Bearer {alice_token}"}
    )
    assert self_claim.status_code == 400

    # Bob submits claim with proof
    claim_resp = client.post(
        "/api/v1/claims/",
        json={
            "report_id": report_id,
            "proof_details": "Serial number ending in 8841, engraved initials 'BJ' on back",
            "contact_info": "bob@test.com / 555-4321"
        },
        headers={"Authorization": f"Bearer {bob_token}"}
    )
    assert claim_resp.status_code == 201
    claim_id = claim_resp.json()["id"]
    assert claim_resp.json()["status"] == "pending"

    # Alice reviews and approves the claim
    review_resp = client.patch(
        f"/api/v1/claims/{claim_id}/review",
        json={"status": "approved", "admin_notes": "Serial verified in person."},
        headers={"Authorization": f"Bearer {alice_token}"}
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "approved"

    # Verify report status is now marked as resolved
    rep_detail = client.get(f"/api/v1/reports/{report_id}")
    assert rep_detail.json()["status"] == "resolved"
