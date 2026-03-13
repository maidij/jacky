from fastapi.testclient import TestClient

from tests.conftest import (
    create_pet, create_user, add_to_cart, create_review, 
    SAMPLE_PET, SAMPLE_USER, SAMPLE_ORDER
)


class TestRoot:
    def test_read_root(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()


class TestAuth:
    def test_register_success(self, client):
        response = client.post(
            "/api/auth/register",
            json=SAMPLE_USER
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert "id" in data

    def test_register_duplicate_username(self, client):
        client.post("/api/auth/register", json=SAMPLE_USER)
        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "testpass456"}
        )
        assert response.status_code == 400
        assert "用户名已存在" in response.json()["detail"]

    def test_login_success(self, client):
        client.post("/api/auth/register", json=SAMPLE_USER)
        response = client.post("/api/auth/login", json=SAMPLE_USER)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "登录成功"

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json=SAMPLE_USER)
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpass"}
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "testpass123"}
        )
        assert response.status_code == 401


class TestPets:
    def test_get_pets_empty(self, client):
        response = client.get("/api/pets")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_create_pet(self, client):
        response = client.post("/api/pets", json=SAMPLE_PET)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "测试宠物"
        assert data["species"] == "dog"
        assert "id" in data

    def test_get_pet_by_id(self, client):
        pet = create_pet(client)
        response = client.get(f"/api/pets/{pet['id']}")
        assert response.status_code == 200
        assert response.json()["name"] == "测试宠物"

    def test_get_pet_not_found(self, client):
        response = client.get("/api/pets/99999")
        assert response.status_code == 404

    def test_update_pet(self, client):
        pet = create_pet(client)
        response = client.put(
            f"/api/pets/{pet['id']}",
            json={"name": "新名称", "species": "cat", "category": "pet", "age": 2, "description": "更新描述", "price": 600, "image_url": "https://example.com/new.jpg"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "新名称"
        assert data["description"] == "更新描述"
        assert data["price"] == 600

    def test_delete_pet(self, client):
        pet = create_pet(client)
        response = client.delete(f"/api/pets/{pet['id']}")
        assert response.status_code == 200
        assert client.get(f"/api/pets/{pet['id']}").status_code == 404

    def test_get_pets_by_category(self, client):
        create_pet(client, {"category": "pet"})
        create_pet(client, {"category": "food", "name": "粮食1"})
        response = client.get("/api/pets?category=pet")
        assert len(response.json()["items"]) == 1

    def test_search_pets(self, client):
        create_pet(client, {"name": "小白", "description": "一只白猫"})
        create_pet(client, {"name": "旺财", "description": "一只黄狗"})
        response = client.get("/api/pets/search?q=白")
        assert response.json()["total"] == 1


class TestCart:
    def test_get_cart_empty(self, client):
        response = client.get("/api/cart?user_id=1")
        assert response.json() == []

    def test_add_to_cart(self, client):
        pet = create_pet(client)
        add_to_cart(client, pet["id"], 2)
        response = client.get("/api/cart?user_id=1")
        assert len(response.json()) == 1

    def test_remove_from_cart(self, client):
        pet = create_pet(client)
        add_to_cart(client, pet["id"], 1)
        cart = client.get("/api/cart?user_id=1").json()
        response = client.delete(f"/api/cart/{cart[0]['id']}")
        assert response.status_code == 200


class TestOrders:
    def test_create_order_empty_cart(self, client):
        response = client.post("/api/orders?user_id=1", json=SAMPLE_ORDER)
        assert response.status_code == 400

    def test_create_order_success(self, client):
        pet = create_pet(client)
        add_to_cart(client, pet["id"], 2)
        response = client.post("/api/orders?user_id=1", json=SAMPLE_ORDER)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "订单创建成功"


class TestReviews:
    def test_get_reviews_empty(self, client):
        pet = create_pet(client)
        response = client.get(f"/api/reviews/{pet['id']}")
        assert response.json() == []

    def test_create_review(self, client):
        pet = create_pet(client)
        response = create_review(client, pet["id"], 5, "很棒！")
        assert response.status_code == 200

    def test_get_review_stats(self, client):
        pet = create_pet(client)
        create_review(client, pet["id"], 5, "好")
        create_review(client, pet["id"], 4, "不错")
        response = client.get(f"/api/reviews/{pet['id']}/stats")
        data = response.json()
        assert data["count"] == 2
        assert data["average"] == 4.5
