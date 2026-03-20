from unittest.mock import patch


def test_predict_success(client):
    mock_response = {
        "priority": "High",
        "score": 0.9,
        "recommendation": "Start immediately"
    }

    with patch("app.ai_engine.call_llm", return_value=mock_response):
        response = client.post("/predict", json={
            "projectId": 1,
            "task_description": "Build login system",
            "priority_level": "Initial_Guess"
        })

        assert response.status_code == 200

        data = response.json()

        print(data)
        # assert data["status"] == "success"
        # assert data["result"]["projectId"] == 1
        # assert data["result"]["analysis"]["priority"] == "High"
        # assert data["result"]["analysis"]["score"] == 0.9