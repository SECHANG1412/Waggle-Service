from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from tests.factories import create_topic, create_user, create_vote


@pytest.mark.asyncio
async def test_regression_offset_contract_page_formula(authenticated_client, db_session, auth_user):
    base_time = datetime.now(timezone.utc) - timedelta(hours=2)
    created_topics = []

    for i in range(25):
        topic = await create_topic(
            db_session,
            user_id=auth_user.user_id,
            title=f"offset-{i}",
            created_at=base_time + timedelta(minutes=i),
        )
        created_topics.append(topic)
    await db_session.commit()

    expected_order = [t.topic_id for t in sorted(created_topics, key=lambda x: x.created_at, reverse=True)]

    page_1 = await authenticated_client.get("/topics", params={"limit": 10, "offset": 0, "sort": "created_at"})
    page_2 = await authenticated_client.get("/topics", params={"limit": 10, "offset": 10, "sort": "created_at"})
    page_3 = await authenticated_client.get("/topics", params={"limit": 10, "offset": 20, "sort": "created_at"})

    assert page_1.status_code == 200
    assert page_2.status_code == 200
    assert page_3.status_code == 200

    ids_1 = [item["topic_id"] for item in page_1.json()]
    ids_2 = [item["topic_id"] for item in page_2.json()]
    ids_3 = [item["topic_id"] for item in page_3.json()]

    assert ids_1 == expected_order[0:10]
    assert ids_2 == expected_order[10:20]
    assert ids_3 == expected_order[20:25]


@pytest.mark.asyncio
async def test_regression_sort_contract_allows_only_created_or_like_count(authenticated_client):
    ok_created = await authenticated_client.get("/topics", params={"sort": "created_at"})
    ok_likes = await authenticated_client.get("/topics", params={"sort": "like_count"})
    invalid = await authenticated_client.get("/topics", params={"sort": "vote_count"})

    assert ok_created.status_code == 200
    assert ok_likes.status_code == 200
    assert invalid.status_code == 422


@pytest.mark.asyncio
async def test_regression_vote_stats_time_range_all_includes_full_period(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, vote_options=["yes", "no"])
    old_user = await create_user(db_session)
    recent_user = await create_user(db_session)

    await create_vote(
        db_session,
        user_id=old_user.user_id,
        topic_id=topic.topic_id,
        vote_index=0,
        created_at=datetime.now(timezone.utc) - timedelta(days=40),
    )
    await create_vote(
        db_session,
        user_id=recent_user.user_id,
        topic_id=topic.topic_id,
        vote_index=1,
        created_at=datetime.now(timezone.utc) - timedelta(hours=1),
    )
    await db_session.commit()

    response = await authenticated_client.get(
        f"/votes/topic/{topic.topic_id}",
        params={"time_range": "all"},
    )
    assert response.status_code == 200

    payload = response.json()
    assert payload["0"]["count"] == 1
    assert payload["1"]["count"] == 1
