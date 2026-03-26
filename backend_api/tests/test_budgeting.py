from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.budgeting import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_generate_budget_for_known_btu():
    response = client.get("/generate/proj-123", params={"equipment_btu": 12000})
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "proj-123"
    assert "items" in data
    assert data["total_cost"] > 0
    names = [i["name"] for i in data["items"]]
    assert any("12.000 BTU/h" in n for n in names)


def test_scaling_quantity():
    r9 = client.get("/generate/p1", params={"equipment_btu": 9000}).json()
    r30 = client.get("/generate/p2", params={"equipment_btu": 30000}).json()

    t9 = next((i for i in r9["items"] if "Tubo" in i["name"]), None)
    t30 = next((i for i in r30["items"] if "Tubo" in i["name"]), None)

    assert t9 is not None
    assert t30 is not None
    assert t9["quantity"] == 3.0
    assert t30["quantity"] == 10.0


def test_return_structure():
    response = client.get("/generate/test", params={"equipment_btu": 18000})
    data = response.json()

    assert "project_id" in data
    assert "items" in data
    assert "total_cost" in data

    for item in data["items"]:
        assert "name" in item
        assert "quantity" in item
        assert "unit_price" in item
        assert "total" in item
        assert item["total"] == round(item["unit_price"] * item["quantity"], 2)
