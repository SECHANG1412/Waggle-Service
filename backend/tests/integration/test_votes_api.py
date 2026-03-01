from __future__ import annotations

import pytest

from tests.factories import create_topic


@pytest.mark.asyncio
async def test_vote_create_success(authenticated_client, db_session, auth_user):
    topic = await create_topic(db_session, user_id=auth_user.user_id, vote_options=["A", "B", "C"])
    await db_session.commit()

    response = await authenticated_client.post(
        "/votes",
        json={"topic_id": topic.topic_id, "vote_index": 1},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["topic_id"] == topic.topic_id
    assert payload["vote_index"] == 1


@pytest.mark.asyncio
async def test_vote_create_business_errors_returns_400(authenticated_client, db_session, auth_user):
    topic = await create_topic(db_session, user_id=auth_user.user_id, vote_options=["A", "B"])
    await db_session.commit()

    invalid_index = await authenticated_client.post(
        "/votes",
        json={"topic_id": topic.topic_id, "vote_index": 99},
    )
    assert invalid_index.status_code == 400

    ok = await authenticated_client.post(
        "/votes",
        json={"topic_id": topic.topic_id, "vote_index": 0},
    )
    assert ok.status_code == 200

    duplicate = await authenticated_client.post(
        "/votes",
        json={"topic_id": topic.topic_id, "vote_index": 1},
    )
    assert duplicate.status_code == 400


@pytest.mark.asyncio
async def test_vote_stats_errors(authenticated_client, db_session, auth_user):
    topic = await create_topic(db_session, user_id=auth_user.user_id, vote_options=["A", "B"])
    await db_session.commit()

    invalid_time_range = await authenticated_client.get(
        f"/votes/topic/{topic.topic_id}",
        params={"time_range": "bad-format"},
    )
    missing_topic = await authenticated_client.get("/votes/topic/999999", params={"time_range": "all"})

    assert invalid_time_range.status_code == 400
    assert missing_topic.status_code == 404


@pytest.mark.asyncio
async def test_vote_payload_validation_error_422(authenticated_client, db_session, auth_user):
    topic = await create_topic(db_session, user_id=auth_user.user_id, vote_options=["A", "B"])
    await db_session.commit()

    response = await authenticated_client.post(
        "/votes",
        json={"topic_id": topic.topic_id},
    )
    assert response.status_code == 422
