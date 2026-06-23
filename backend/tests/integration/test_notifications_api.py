import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import Notification
from tests.factories import create_comment, create_inquiry, create_topic, create_user


@pytest.mark.asyncio
async def test_list_notifications_requires_login(client: AsyncClient):
    response = await client.get("/notifications")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_notifications_returns_only_current_user(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    other = await create_user(db_session)
    db_session.add(
        Notification(
            user_id=user.user_id,
            type="topic_comment",
            target_type="Comment",
            target_id=1,
            topic_id=10,
            message="새 댓글이 달렸습니다.",
            link="/topic/10",
        )
    )
    db_session.add(
        Notification(
            user_id=other.user_id,
            type="topic_comment",
            target_type="Comment",
            target_id=2,
            topic_id=20,
            message="다른 사용자 알림",
            link="/topic/20",
        )
    )
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.get("/notifications")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["user_id"] == user.user_id
    assert payload[0]["message"] == "새 댓글이 달렸습니다."
    assert payload[0]["is_read"] is False


@pytest.mark.asyncio
async def test_unread_count_and_mark_as_read(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    notification = Notification(
        user_id=user.user_id,
        type="comment_reply",
        target_type="Reply",
        target_id=1,
        topic_id=10,
        message="새 답글이 달렸습니다.",
        link="/topic/10",
    )
    db_session.add(notification)
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    count_response = await client.get("/notifications/unread-count")

    assert count_response.status_code == 200
    assert count_response.json() == {"count": 1}

    read_response = await client.patch(
        f"/notifications/{notification.notification_id}/read"
    )

    assert read_response.status_code == 200
    assert read_response.json()["is_read"] is True

    next_count_response = await client.get("/notifications/unread-count")
    assert next_count_response.json() == {"count": 0}


@pytest.mark.asyncio
async def test_mark_all_notifications_as_read(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    for idx in range(2):
        db_session.add(
            Notification(
                user_id=user.user_id,
                type="topic_comment",
                target_type="Comment",
                target_id=idx + 1,
                topic_id=10,
                message="새 댓글이 달렸습니다.",
                link="/topic/10",
            )
        )
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.patch("/notifications/read-all")

    assert response.status_code == 200
    assert response.json() == {"updated_count": 2}
    count_response = await client.get("/notifications/unread-count")
    assert count_response.json() == {"count": 0}


@pytest.mark.asyncio
async def test_creating_comment_notifies_topic_author(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    author = await create_user(db_session, username="author")
    commenter = await create_user(db_session, username="commenter")
    topic = await create_topic(db_session, user_id=author.user_id)
    await db_session.commit()
    set_auth_cookies(client, commenter.user_id)

    response = await client.post(
        "/comments",
        json={"topic_id": topic.topic_id, "content": "hello"},
    )

    assert response.status_code == 200
    result = await db_session.execute(select(Notification))
    notification = result.scalar_one()
    assert notification.user_id == author.user_id
    assert notification.actor_user_id == commenter.user_id
    assert notification.type == "topic_comment"
    assert notification.target_type == "Comment"
    assert notification.topic_id == topic.topic_id
    assert notification.link == f"/topic/{topic.topic_id}"


@pytest.mark.asyncio
async def test_creating_own_comment_does_not_notify_self(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    topic = await create_topic(db_session, user_id=user.user_id)
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.post(
        "/comments",
        json={"topic_id": topic.topic_id, "content": "own comment"},
    )

    assert response.status_code == 200
    result = await db_session.execute(select(Notification))
    assert result.scalars().all() == []


@pytest.mark.asyncio
async def test_creating_reply_notifies_comment_author(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    author = await create_user(db_session)
    replier = await create_user(db_session)
    topic = await create_topic(db_session, user_id=author.user_id)
    comment = await create_comment(
        db_session,
        user_id=author.user_id,
        topic_id=topic.topic_id,
    )
    await db_session.commit()
    set_auth_cookies(client, replier.user_id)

    response = await client.post(
        "/replies",
        json={
            "comment_id": comment.comment_id,
            "content": "reply",
            "parent_reply_id": None,
        },
    )

    assert response.status_code == 200
    result = await db_session.execute(select(Notification))
    notification = result.scalar_one()
    assert notification.user_id == author.user_id
    assert notification.actor_user_id == replier.user_id
    assert notification.type == "comment_reply"
    assert notification.target_type == "Reply"
    assert notification.topic_id == topic.topic_id


@pytest.mark.asyncio
async def test_admin_inquiry_status_update_notifies_owner(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    inquiry = await create_inquiry(db_session, user_id=user.user_id)
    admin = await create_user(db_session, is_admin=True)
    await db_session.commit()
    set_auth_cookies(client, admin.user_id)

    response = await client.patch(
        f"/manage-api/inquiries/{inquiry.inquiry_id}/status",
        json={"status": "resolved", "reason": "done"},
    )

    assert response.status_code == 200
    result = await db_session.execute(select(Notification))
    notification = result.scalar_one()
    assert notification.user_id == user.user_id
    assert notification.actor_user_id == admin.user_id
    assert notification.type == "inquiry_status"
    assert notification.target_type == "Inquiry"
    assert notification.target_id == inquiry.inquiry_id
