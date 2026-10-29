import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.session import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User

# In-memory SQLite for isolated, instantaneous test runs
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Provides a clean in-memory database session for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test admin & test user
    test_user = User(
        name="Alice Smith",
        email="alice@test.com",
        phone="555-1111",
        password_hash=get_password_hash("Secret123"),
        role="user",
        is_active=True
    )
    test_admin = User(
        name="Admin User",
        email="admin@test.com",
        phone="555-9999",
        password_hash=get_password_hash("Admin123"),
        role="admin",
        is_active=True
    )
    db.add(test_user)
    db.add(test_admin)
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Provides a TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
