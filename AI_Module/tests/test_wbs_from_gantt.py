import pytest
import json
from unittest.mock import patch

from app.generators import generate_gantt, generate_wbs, generate_user_stories

prompt = "Build an e-commerce website with checkout and user accounts"
def test_generate_wbs_after_gantt_context(sample_prompt):
    
    gantt_result = generate_gantt(prompt)
    assert "gantt" in gantt_result
    assert isinstance(gantt_result["gantt"], dict)

    print("Gantt Result:", gantt_result)
    wbs_result = generate_wbs(prompt, gantt_result)
    print(wbs_result)
def test_generate_gantt_after_wbs_context():
    
    wbs_result = generate_wbs(prompt)

    print("WBS Result:", wbs_result)
    gantt_result = generate_gantt(prompt, wbs_result)
    print(gantt_result)
    
def test_generate_gantt_after_wbs_and_user_stories_context():
    user_stories = generate_user_stories(prompt)
    print("User Stories Result:", user_stories)
    wbs_result = generate_wbs(prompt,user_stories)

    print("WBS Result:", wbs_result)
    cont = json.dumps([wbs_result, user_stories])
    gantt_result = generate_gantt(prompt, cont)
    print(gantt_result)
