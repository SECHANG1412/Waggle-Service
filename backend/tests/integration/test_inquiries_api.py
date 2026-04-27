import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import AdminActionLog
from app.db.models import Inquiry
from tests.factories import create_inquiry, create_user


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


@pytest.mark.asyncio
async def test_get_my_inquiries_requires_login(client: AsyncClient):
    response = await client.get("/inquiries/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_my_inquiries_returns_only_current_user_inquiries(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(
        db_session,
        username="owner",
        email="owner@example.com",
    )
    other_user = await create_user(
        db_session,
        username="other",
        email="other@example.com",
    )
    my_inquiry = await create_inquiry(
        db_session,
        user_id=user.user_id,
        name=user.username,
        email=user.email,
        title="my inquiry",
    )
    await create_inquiry(
        db_session,
        user_id=other_user.user_id,
        name=other_user.username,
        email=other_user.email,
        title="other inquiry",
    )
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.get("/inquiries/me")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["inquiry_id"] == my_inquiry.inquiry_id
    assert payload[0]["title"] == "my inquiry"
    assert payload[0]["user_id"] == user.user_id


@pytest.mark.asyncio
async def test_get_my_inquiries_includes_latest_status_reason(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    admin = await create_user(
        db_session,
        username="admin",
        email="admin@example.com",
        is_admin=True,
    )
    inquiry = await create_inquiry(
        db_session,
        user_id=user.user_id,
        name=user.username,
        email=user.email,
        status="resolved",
    )
    db_session.add(
        AdminActionLog(
            admin_user_id=admin.user_id,
            action="UPDATE_INQUIRY_STATUS",
            target_type="Inquiry",
            target_id=inquiry.inquiry_id,
            before_value={"status": "pending"},
            after_value={"status": "resolved"},
            reason="login issue resolved",
        )
    )
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.get("/inquiries/me")

    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["inquiry_id"] == inquiry.inquiry_id
    assert payload[0]["latest_reason"] == "login issue resolved"
