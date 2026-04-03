from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

from app.db.crud import UserCrud
from tests.factories import create_topic, create_user


@pytest.mark.asyncio
async def test_auth_required_endpoints_return_401_without_cookie(client: AsyncClient, db_session, auth_user):
    topic = await create_topic(db_session, user_id=auth_user.user_id, vote_options=["A", "B"])
    await db_session.commit()

    post_topic = await client.post(
        "/topics",
        json={
            "title": "new-topic",
            "category": "general",
            "description": "desc",
            "vote_options": ["A", "B"],
        },
    )
    post_vote = await client.post("/votes", json={"topic_id": topic.topic_id, "vote_index": 0})
    put_like = await client.put(f"/likes/topic/{topic.topic_id}")

    assert post_topic.status_code == 401
    assert post_vote.status_code == 401
    assert put_like.status_code == 401


@pytest.mark.asyncio
async def test_forbidden_delete_topic_returns_403(client: AsyncClient, db_session, set_auth_cookies):
    owner = await create_user(db_session, username="owner_user", email="owner@example.com")
    attacker = await create_user(db_session, username="attacker_user", email="attacker@example.com")
    topic = await create_topic(db_session, user_id=owner.user_id, title="forbidden-delete")
    await db_session.commit()

    set_auth_cookies(client, attacker.user_id)
    response = await client.delete(f"/topics/{topic.topic_id}")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_me_hashes_password_before_saving(
    authenticated_client: AsyncClient,
    db_session,
    auth_user,
    monkeypatch,
):
    async def fake_get_password_hash(password: str) -> str:
        return f"hashed::{password}"

    monkeypatch.setattr("app.services.user.get_password_hash", fake_get_password_hash)

    response = await authenticated_client.put(
        "/users/me",
        json={"password": "new-plain-password"},
    )

    assert response.status_code == 200

    await db_session.refresh(auth_user)
    db_user = await UserCrud.get_by_id(db_session, auth_user.user_id)
    assert db_user is not None
    assert db_user.password == "hashed::new-plain-password"


@pytest.mark.asyncio
async def test_user_activity_includes_topic_id_and_latest_first(
    authenticated_client: AsyncClient,
    db_session,
    auth_user,
):
    base_time = datetime.now(timezone.utc) - timedelta(hours=1)
    older_topic = await create_topic(
        db_session,
        user_id=auth_user.user_id,
        title="older-topic",
        created_at=base_time,
    )
    latest_topic = await create_topic(
        db_session,
        user_id=auth_user.user_id,
        title="latest-topic",
        created_at=base_time + timedelta(minutes=1),
    )
    await db_session.commit()

    response = await authenticated_client.get("/users/activity")

    assert response.status_code == 200
    payload = response.json()
    assert [item["topic_id"] for item in payload] == [
        latest_topic.topic_id,
        older_topic.topic_id,
    ]
    assert payload[0]["title"] == "latest-topic"
    assert payload[0]["type"] == "topic"
