def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Bob Jones",
            "email": "bob@test.com",
            "password": "Password123",
            "phone": "555-2222"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "bob@test.com"
    assert data["name"] == "Bob Jones"
    assert "password" not in data

def test_register_duplicate_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Alice Duplicate",
            "email": "alice@test.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "alice@test.com",
            "password": "Secret123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alice@test.com"

def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "alice@test.com",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_current_user_profile(client):
    # Login first
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@test.com", "password": "Secret123"}
    )
    token = login_resp.json()["access_token"]
    
    # Request profile
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Alice Smith"
