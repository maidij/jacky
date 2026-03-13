import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app, get_db
from app.models import Base


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


SAMPLE_PET = {
    "name": "测试宠物",
    "species": "dog",
    "category": "pet",
    "age": 1,
    "description": "测试描述",
    "price": 500,
    "image_url": "https://example.com/pet.jpg"
}

SAMPLE_USER = {
    "username": "testuser",
    "password": "testpass123"
}

SAMPLE_ORDER = {
    "receiver_name": "张三",
    "phone": "13800138000",
    "address": "测试地址"
}


def create_pet(client: TestClient, pet_data: dict = None):
    default_pet = SAMPLE_PET.copy()
    if pet_data:
        default_pet.update(pet_data)
    response = client.post("/api/pets", json=default_pet)
    return response.json()


def create_user(client: TestClient, username: str = "testuser", password: str = "testpass123"):
    response = client.post(
        "/api/auth/register",
        json={"username": username, "password": password}
    )
    return response.json()


def login_user(client: TestClient, username: str = "testuser", password: str = "testpass123"):
    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": password}
    )
    return response.json()


def add_to_cart(client: TestClient, pet_id: int, quantity: int = 1, user_id: int = 1):
    response = client.post(
        f"/api/cart?user_id={user_id}",
        json={"pet_id": pet_id, "quantity": quantity}
    )
    return response


def create_review(client: TestClient, pet_id: int, rating: int = 5, comment: str = "好评"):
    response = client.post(
        "/api/reviews",
        json={"pet_id": pet_id, "rating": rating, "comment": comment}
    )
    return response
