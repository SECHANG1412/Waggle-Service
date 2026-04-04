from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from tests.factories import create_topic


@pytest.mark.asyncio
async def test_topics_list_filters_and_sort_by_like_count(authenticated_client, db_session, auth_user):
    t1 = await create_topic(
        db_session,
        user_id=auth_user.user_id,
        title="alpha topic",
        category="sports",
        created_at=datetime.now(timezone.utc) - timedelta(minutes=10),
    )
    t2 = await create_topic(
        db_session,
        user_id=auth_user.user_id,
        title="beta topic",
        category="sports",
        created_at=datetime.now(timezone.utc) - timedelta(minutes=5),
    )
    t3 = await create_topic(
        db_session,
        user_id=auth_user.user_id,
        title="gamma topic",
        category="music",
        created_at=datetime.now(timezone.utc),
    )

    # Create extra likes so that t1 should be ahead of t2 when sorted by like_count.
    from tests.factories import create_topic_like, create_user

    liker_1 = await create_user(db_session)
    liker_2 = await create_user(db_session)
    await create_topic_like(db_session, user_id=liker_1.user_id, topic_id=t1.topic_id)
    await create_topic_like(db_session, user_id=liker_2.user_id, topic_id=t1.topic_id)
    await create_topic_like(db_session, user_id=liker_1.user_id, topic_id=t2.topic_id)
    await db_session.commit()

    response = await authenticated_client.get(
        "/topics",
        params={"category": "sports", "search": "topic", "sort": "like_count", "limit": 10, "offset": 0},
    )
    assert response.status_code == 200
    payload = response.json()
    assert [item["topic_id"] for item in payload] == [t1.topic_id, t2.topic_id]
    assert all(item["category"] == "sports" for item in payload)
    assert all("topic" in item["title"] for item in payload)
    assert t3.topic_id not in [item["topic_id"] for item in payload]


@pytest.mark.asyncio
async def test_topic_detail_success_and_not_found(authenticated_client, db_session, auth_user):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="detail-target")
    await db_session.commit()

    ok = await authenticated_client.get(f"/topics/{topic.topic_id}")
    missing = await authenticated_client.get("/topics/999999")

    assert ok.status_code == 200
    assert ok.json()["topic_id"] == topic.topic_id
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_topic_pin_success_and_missing_topic_returns_404(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="pin-target")
    await db_session.commit()

    pinned = await authenticated_client.post(f"/topics/{topic.topic_id}/pin")
    missing = await authenticated_client.post("/topics/999999/pin")

    assert pinned.status_code == 200
    assert pinned.json() is True
    assert missing.status_code == 404
    assert missing.json()["detail"] == "Topic not found"


@pytest.mark.asyncio
async def test_topics_list_validation_errors(authenticated_client):
    invalid_limit = await authenticated_client.get("/topics", params={"limit": 0})
    invalid_offset = await authenticated_client.get("/topics", params={"offset": -1})
    invalid_sort = await authenticated_client.get("/topics", params={"sort": "wrong-value"})

    assert invalid_limit.status_code == 422
    assert invalid_offset.status_code == 422
    assert invalid_sort.status_code == 422
