from __future__ import annotations

import pytest

from tests.factories import create_comment, create_reply, create_topic, create_user


@pytest.mark.asyncio
async def test_comment_create_list_update_and_forbidden_delete(
    authenticated_client,
    client,
    db_session,
    auth_user,
    set_auth_cookies,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="comment-topic")
    outsider = await create_user(db_session, username="outsider", email="outsider@example.com")
    await db_session.commit()

    created = await authenticated_client.post(
        "/comments",
        json={"topic_id": topic.topic_id, "content": "first comment"},
    )
    assert created.status_code == 200
    payload = created.json()
    comment_id = payload["comment_id"]
    assert payload["content"] == "first comment"
    assert payload["username"] == auth_user.username
    assert payload["replies"] == []

    listed = await authenticated_client.get(f"/comments/by-topic/{topic.topic_id}")
    assert listed.status_code == 200
    listed_payload = listed.json()
    assert len(listed_payload) == 1
    assert listed_payload[0]["comment_id"] == comment_id

    updated = await authenticated_client.put(
        f"/comments/{comment_id}",
        json={"content": "edited comment"},
    )
    assert updated.status_code == 200
    assert updated.json()["content"] == "edited comment"

    set_auth_cookies(client, outsider.user_id)
    forbidden = await client.delete(f"/comments/{comment_id}")
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_comment_list_missing_topic_returns_404(authenticated_client):
    response = await authenticated_client.get("/comments/by-topic/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Topic not found"


@pytest.mark.asyncio
async def test_comment_delete_soft_and_hard_delete_behaviors(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="delete-topic")
    child_user = await create_user(db_session, username="child_user", email="child@example.com")

    soft_comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="keep thread",
    )
    await create_reply(
        db_session,
        user_id=child_user.user_id,
        comment_id=soft_comment.comment_id,
        content="child reply",
    )

    hard_comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="remove fully",
    )
    await db_session.commit()

    soft_deleted = await authenticated_client.delete(f"/comments/{soft_comment.comment_id}")
    assert soft_deleted.status_code == 200
    soft_payload = soft_deleted.json()
    assert soft_payload["is_deleted"] is True
    assert len(soft_payload["replies"]) == 1

    hard_deleted = await authenticated_client.delete(f"/comments/{hard_comment.comment_id}")
    assert hard_deleted.status_code == 200
    assert hard_deleted.json()["comment_id"] == hard_comment.comment_id

    listed = await authenticated_client.get(f"/comments/by-topic/{topic.topic_id}")
    assert listed.status_code == 200
    remaining_ids = [item["comment_id"] for item in listed.json()]
    assert soft_comment.comment_id in remaining_ids
    assert hard_comment.comment_id not in remaining_ids


@pytest.mark.asyncio
async def test_reply_create_nested_update_and_deleted_parent_guard(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="reply-topic")
    comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="root comment",
    )
    deleted_comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="gone",
        is_deleted=True,
    )
    await db_session.commit()

    root_reply = await authenticated_client.post(
        "/replies",
        json={"comment_id": comment.comment_id, "content": "root reply"},
    )
    assert root_reply.status_code == 200
    root_reply_id = root_reply.json()["reply_id"]

    nested_reply = await authenticated_client.post(
        "/replies",
        json={
            "comment_id": comment.comment_id,
            "content": "nested reply",
            "parent_reply_id": root_reply_id,
        },
    )
    assert nested_reply.status_code == 200
    assert nested_reply.json()["parent_reply_id"] == root_reply_id

    updated = await authenticated_client.put(
        f"/replies/{root_reply_id}",
        json={"content": "root reply edited"},
    )
    assert updated.status_code == 200
    assert updated.json()["content"] == "root reply edited"

    listed = await authenticated_client.get(f"/comments/by-topic/{topic.topic_id}")
    assert listed.status_code == 200
    replies = listed.json()[0]["replies"]
    assert len(replies) == 1
    assert replies[0]["reply_id"] == root_reply_id
    assert len(replies[0]["replies"]) == 1
    assert replies[0]["replies"][0]["content"] == "nested reply"

    deleted_parent = await authenticated_client.post(
        "/replies",
        json={"comment_id": deleted_comment.comment_id, "content": "blocked"},
    )
    assert deleted_parent.status_code == 400


@pytest.mark.asyncio
async def test_reply_create_rejects_missing_or_cross_comment_parent(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="reply-parent-guard")
    first_comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="first comment",
    )
    second_comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="second comment",
    )
    parent_reply = await create_reply(
        db_session,
        user_id=auth_user.user_id,
        comment_id=first_comment.comment_id,
        content="parent reply",
    )
    await db_session.commit()

    missing_parent = await authenticated_client.post(
        "/replies",
        json={
            "comment_id": first_comment.comment_id,
            "content": "missing parent",
            "parent_reply_id": 999999,
        },
    )
    assert missing_parent.status_code == 404
    assert missing_parent.json()["detail"] == "Parent reply not found"

    cross_comment_parent = await authenticated_client.post(
        "/replies",
        json={
            "comment_id": second_comment.comment_id,
            "content": "wrong parent",
            "parent_reply_id": parent_reply.reply_id,
        },
    )
    assert cross_comment_parent.status_code == 400
    assert (
        cross_comment_parent.json()["detail"]
        == "Parent reply must belong to the same comment"
    )


@pytest.mark.asyncio
async def test_reply_delete_removes_soft_deleted_parent_when_last_child_removed(
    authenticated_client,
    db_session,
    auth_user,
):
    topic = await create_topic(db_session, user_id=auth_user.user_id, title="cleanup-topic")
    comment = await create_comment(
        db_session,
        user_id=auth_user.user_id,
        topic_id=topic.topic_id,
        content="to be soft deleted",
    )
    reply = await create_reply(
        db_session,
        user_id=auth_user.user_id,
        comment_id=comment.comment_id,
        content="last child",
    )
    comment.is_deleted = True
    await db_session.commit()

    deleted = await authenticated_client.delete(f"/replies/{reply.reply_id}")
    assert deleted.status_code == 200
    assert deleted.json()["reply_id"] == reply.reply_id

    listed = await authenticated_client.get(f"/comments/by-topic/{topic.topic_id}")
    assert listed.status_code == 200
    assert listed.json() == []
