import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import Inquiry
from tests.factories import create_user


@pytest.mark.asyncio
async def test_create_inquiry_requires_login(client: AsyncClient):
    response = await client.post(
        "/inquiries",
        json={
            "title": "contact title",
            "content": "contact content",
        },
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_inquiry_saves_pending_inquiry(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(
        db_session,
        username="tester",
        email="tester@example.com",
    )
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.post(
        "/inquiries",
        json={
            "title": "contact title",
            "content": "contact content",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["user_id"] == user.user_id
    assert payload["name"] == "tester"
    assert payload["email"] == "tester@example.com"
    assert payload["title"] == "contact title"
    assert payload["content"] == "contact content"
    assert payload["status"] == "pending"
    assert payload["inquiry_id"] is not None

    result = await db_session.execute(select(Inquiry))
    inquiry = result.scalar_one()
    assert inquiry.user_id == user.user_id
    assert inquiry.status == "pending"
    assert inquiry.email == "tester@example.com"


@pytest.mark.asyncio
async def test_create_inquiry_rejects_missing_required_fields(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.post(
        "/inquiries",
        json={
            "title": "",
            "content": "",
        },
    )

    assert response.status_code == 422
