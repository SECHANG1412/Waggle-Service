import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import Inquiry


@pytest.mark.asyncio
async def test_create_inquiry_saves_pending_inquiry(client: AsyncClient, db_session):
    response = await client.post(
        "/inquiries",
        json={
            "name": "tester",
            "email": "tester@example.com",
            "title": "contact title",
            "content": "contact content",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["name"] == "tester"
    assert payload["email"] == "tester@example.com"
    assert payload["title"] == "contact title"
    assert payload["content"] == "contact content"
    assert payload["status"] == "pending"
    assert payload["inquiry_id"] is not None

    result = await db_session.execute(select(Inquiry))
    inquiry = result.scalar_one()
    assert inquiry.status == "pending"
    assert inquiry.email == "tester@example.com"


@pytest.mark.asyncio
async def test_create_inquiry_rejects_missing_required_fields(client: AsyncClient):
    response = await client.post(
        "/inquiries",
        json={
            "name": "",
            "email": "not-email",
            "title": "",
            "content": "",
        },
    )

    assert response.status_code == 422
