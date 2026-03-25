import pytest
from unittest.mock import patch

from app.generators import (
    generate_wbs,
    generate_tasks,
    generate_risks,
)


# =========================
# 🧱 WBS TESTS
# =========================
def test_generate_wbs_valid(sample_prompt):
    fake_llm_output = {
        "wbs": [
            {"id": "1", "name": "Backend", "children": []}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_wbs(sample_prompt)

        assert "wbs" in result
        assert len(result["wbs"]) > 0

        node = result["wbs"][0]
        assert "id" in node
        assert "name" in node
        assert isinstance(node["children"], list)


def test_generate_wbs_duplicate_ids_fixed(sample_prompt):
    fake_llm_output = {
        "wbs": [
            {"id": "1", "name": "A", "children": []},
            {"id": "1", "name": "B", "children": []}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_wbs(sample_prompt)

        ids = [node["id"] for node in result["wbs"]]
        assert len(ids) == len(set(ids))  # no duplicates


# =========================
# 📋 TASKS TESTS
# =========================
def test_generate_tasks_valid(sample_prompt):
    fake_llm_output = {
        "tasks": [
            {"id": "1", "name": "Setup API", "durationDays": 3}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_tasks(sample_prompt)
        assert "tasks" in result
        assert result["tasks"][0]["durationDays"] > 0


def test_generate_tasks_fix_invalid_duration(sample_prompt):
    fake_llm_output = {
        "tasks": [
            {"id": "1", "name": "Bad Task", "durationDays": 0}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_tasks(sample_prompt)

        assert result["tasks"][0]["durationDays"] == 1


def test_generate_tasks_missing_fields(sample_prompt):
    fake_llm_output = {
        "tasks": [
            {"durationDays": 2}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_tasks(sample_prompt)

        task = result["tasks"][0]
        assert "id" in task
        assert "name" in task


# =========================
# ⚠️ RISKS TESTS
# =========================
def test_generate_risks_valid(sample_prompt):
    fake_llm_output = {
        "risks": [
            {"id": "1", "name": "API failure", "probability": 0.7}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_risks(sample_prompt)

        assert "risks" in result
        assert 0 <= result["risks"][0]["probability"] <= 1


def test_generate_risks_probability_clamped(sample_prompt):
    fake_llm_output = {
        "risks": [
            {"id": "1", "name": "Bad risk", "probability": 5}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_risks(sample_prompt)

        assert result["risks"][0]["probability"] == 1


def test_generate_risks_missing_fields(sample_prompt):
    fake_llm_output = {
        "risks": [
            {}
        ]
    }

    with patch("app.generators.call_llm", return_value=fake_llm_output):
        result = generate_risks(sample_prompt)

        risk = result["risks"][0]
        assert "id" in risk
        assert "name" in risk
        assert 0 <= risk["probability"] <= 1


# =========================
# 🧨 EDGE CASE TEST
# =========================
def test_llm_returns_invalid_json(sample_prompt):
    with patch("app.generators.call_llm", return_value={}):
        result = generate_tasks(sample_prompt)

        assert "tasks" in result
        assert isinstance(result["tasks"], list)