from fastapi.testclient import TestClient
from app.main import app

import pytest


@pytest.fixture
def sample_prompt():
    return "Build a booking system with payment and chat"