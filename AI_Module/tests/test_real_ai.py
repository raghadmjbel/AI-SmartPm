import pytest
from app.generators import generate_tasks, generate_wbs, generate_risks, generate_gantt


@pytest.mark.integration
def test_real_ai_tasks():
    prompt = "Build a booking system with login and payment"

    result = generate_tasks(prompt)
    print(result)
    assert "tasks" in result
    assert isinstance(result["tasks"], list)
    assert len(result["tasks"]) > 0

    for task in result["tasks"]:
        assert "id" in task
        assert "name" in task
        assert "durationDays" in task
        assert task["durationDays"] > 0
@pytest.mark.integration
def test_real_ai_wbs():
    prompt = "Build an e-commerce website"

    result = generate_wbs(prompt)
    print(result)
   
    assert "wbs" in result
    assert len(result["wbs"]) > 0

    def validate(node):
        assert "id" in node
        assert "name" in node
        assert "children" in node

        for child in node["children"]:
            validate(child)

    for root in result["wbs"]:
        validate(root)
@pytest.mark.integration
def test_real_ai_gantt():
    prompt = "Build an e-commerce website"

    result = generate_gantt(prompt)
    print(result)

    assert "tasks" in result
    assert isinstance(result["tasks"], list)
    assert len(result["tasks"]) > 0

    ids = set()

    for task in result["tasks"]:
        assert "id" in task
        assert "name" in task
        assert "durationDays" in task
        assert "startDay" in task
        assert "endDay" in task
        assert "dependencies" in task

        assert task["id"] not in ids
        ids.add(task["id"])

        assert task["durationDays"] > 0
        assert task["startDay"] >= 0
        assert task["endDay"] == task["startDay"] + task["durationDays"]

        assert isinstance(task["dependencies"], list)
@pytest.mark.integration
def test_real_ai_risks():
    prompt = "AI-based platform with external APIs"

    result = generate_risks(prompt)
    print(result)
   
    assert "risks" in result
    assert len(result["risks"]) > 0

    for risk in result["risks"]:
        assert "id" in risk
        assert "name" in risk
        assert 0 <= risk["probability"] <= 1