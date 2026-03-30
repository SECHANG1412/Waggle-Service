from __future__ import annotations

import pytest

from tests.factories import create_comment, create_reply, create_topic


@pytest.mark.asyncio
async def test_like_toggles_for_topic_comment_and_reply(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="like-target")
    comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="comment target",
    )
    reply = await create_reply(
        db_session,
        user_id=auth_user.user_id,
        comment_id=comment.comment_id,
        content="reply target",
    )
    await db_session.commit()

    topic_like_on = await authenticated_client.put(f"/likes/topic/{topic.topic_id}")
    topic_like_off = await authenticated_client.put(f"/likes/topic/{topic.topic_id}")
    comment_like_on = await authenticated_client.put(f"/likes/comment/{comment.comment_id}")
    reply_like_on = await authenticated_client.put(f"/likes/reply/{reply.reply_id}")

    assert topic_like_on.status_code == 200
    assert topic_like_on.json() is True
    assert topic_like_off.status_code == 200
    assert topic_like_off.json() is False
    assert comment_like_on.status_code == 200
    assert comment_like_on.json() is True
    assert reply_like_on.status_code == 200
    assert reply_like_on.json() is True

    comments = await authenticated_client.get(f"/comments/by-topic/{topic.topic_id}")
    assert comments.status_code == 200
    payload = comments.json()
    assert payload[0]["like_count"] == 1
    assert payload[0]["has_liked"] is True
    assert payload[0]["replies"][0]["like_count"] == 1
    assert payload[0]["replies"][0]["has_liked"] is True


@pytest.mark.asyncio
async def test_like_endpoints_auth_required_and_not_found(
    authenticated_client,
    auth_user,
    set_auth_cookies,
):
    authenticated_client.cookies.clear()
    no_auth = await authenticated_client.put("/likes/topic/1")
    assert no_auth.status_code == 401

    set_auth_cookies(authenticated_client, auth_user.user_id)

    missing_topic = await authenticated_client.put("/likes/topic/999999")
    missing_comment = await authenticated_client.put("/likes/comment/999999")
    missing_reply = await authenticated_client.put("/likes/reply/999999")

    assert missing_topic.status_code == 404
    assert missing_comment.status_code == 404
    assert missing_reply.status_code == 404
