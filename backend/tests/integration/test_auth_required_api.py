from __future__ import annotations

import pytest
from httpx import AsyncClient

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
