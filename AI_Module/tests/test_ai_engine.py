from unittest.mock import patch
from app.ai_engine import call_llm


def test_call_llm_parsing():
    fake_openrouter_response = {
        "choices": [
            {
                "message": {
                    "content": '{"priority": "Low", "score": 0.3, "recommendation": "Delay task"}'
                }
            }
        ]
    }

    with patch("requests.post") as mock_post:
        mock_post.return_value.json.return_value = fake_openrouter_response

        result = call_llm("test task", "Low")

        assert result["priority"] == "Low"
        assert result["score"] == 0.3
        assert "recommendation" in result