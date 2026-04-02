import pytest
from app.generators import generate_tasks, generate_wbs, generate_risks, generate_gantt, generate_user_stories


@pytest.mark.integration
def test_real_ai_tasks():
    prompt = """
    Scope:
- Build a full-featured e-commerce platform.
- Users: Guest, Customer, Seller, Admin.
- Features include product catalog, search, cart, checkout, user registration, order history, reviews, seller product management, admin dashboards, and security.

Requirements:
1. Product Catalog:
   - Guests and Customers can browse products.
   - Display product images, title, price, stock status.
   - Filter products by category.
2. Search:
   - Search by keyword or product name.
   - Show “No products found” if zero results.
3. Shopping Cart:
   - Add/remove items.
   - Update quantity.
   - Display total price dynamically.
4. Customer Accounts:
   - Register, login, logout.
   - Secure password (minimum 8 characters).
   - Password recovery via email token.
5. Checkout:
   - Enter shipping address.
   - Validate payment info (credit/debit cards).
   - Show order summary with taxes and shipping.
6. Orders:
   - Customers can see order history.
   - View status, items, tracking number.
7. Reviews:
   - Customers can leave a rating (1–5 stars) and text comment.
   - Only allowed if purchased.
8. Seller Features:
   - Add/update product listings with images, description, price, stock.
9. Admin Features:
   - View sales dashboard: daily, weekly, monthly revenue.
   - Filter by date range.
   - List top 5 selling products.
10. Security & Compliance:
    - Protect user data.
    - Prevent unauthorized actions.
    - Validate all input.

Constraints:
- Tasks should be granular (1–3 days each).
- Dependencies must follow real workflow:
   1. Requirements & Planning
   2. UI/UX & Architecture Design
   3. Backend Development
   4. Frontend Development
   5. Integration
   6. QA & UAT
   7. Deployment
- IDs must be unique and hierarchical for WBS.
- All JSON must strictly follow the required format.
- Tasks or stories must have clear, measurable outcomes.
- Max depth 3 levels for WBS.
- Parallelize tasks only when independent.
- No vague tasks like “Do work” or “Setup system”.

Output Instructions:
1. Generate user stories for all features.
   - Include: id, title, description, acceptanceCriteria.
   - Acceptance criteria must be concrete, testable, and 3–5 per story.
2. Generate a WBS for all top-level deliverables.
   - Include: id, name, description, children (tasks).
3. Generate a Gantt chart schedule.
   - Include: id, name, durationDays, startDay, endDay, dependencies.
   - Use realistic sequencing and parallelism.
4. Return ONLY JSON. No explanations, no markdown.
    """
    

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
def test_real_ai_user_stories():
    prompt = "Build an e-commerce website"

    result = generate_user_stories(prompt)
    print(result)

    assert "stories" in result
    assert isinstance(result["stories"], list)
    assert len(result["stories"]) > 0

    for story in result["stories"]:
        assert "id" in story
        assert "title" in story
        assert "description" in story
        assert "acceptanceCriteria" in story

        assert isinstance(story["acceptanceCriteria"], list)
        assert len(story["acceptanceCriteria"]) > 0
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