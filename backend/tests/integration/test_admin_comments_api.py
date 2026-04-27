import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import AdminActionLog
from tests.factories import create_comment, create_topic, create_user


async def _set_admin_cookies(client: AsyncClient, db_session, set_auth_cookies):
    admin = await create_user(db_session, is_admin=True)
    await db_session.commit()
    set_auth_cookies(client, admin.user_id)
    return admin


@pytest.mark.asyncio
async def test_admin_comment_list_requires_login(client: AsyncClient):
    response = await client.get("/admin-api/comments")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_comment_list_rejects_regular_user(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.get("/admin-api/comments")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_list_comments_including_hidden(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    owner = await create_user(db_session)
    topic = await create_topic(db_session, user_id=owner.user_id)
    await create_comment(
        db_session,
        user_id=owner.user_id,
        topic_id=topic.topic_id,
        content="public-comment",
    )
    await create_comment(
        db_session,
        user_id=owner.user_id,
        topic_id=topic.topic_id,
        content="hidden-comment",
        is_hidden=True,
    )
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get("/admin-api/comments")

    assert response.status_code == 200
    payload = response.json()
    assert {item["content"] for item in payload} == {
        "public-comment",
        "hidden-comment",
    }


@pytest.mark.asyncio
async def test_admin_can_hide_comment_and_record_audit_log(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    owner = await create_user(db_session)
    topic = await create_topic(db_session, user_id=owner.user_id)
    comment = await create_comment(
        db_session,
        user_id=owner.user_id,
        topic_id=topic.topic_id,
    )
    admin = await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        f"/admin-api/comments/{comment.comment_id}/hide",
        json={"reason": "abusive comment"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_hidden"] is True
    assert payload["hidden_by"] == admin.user_id

    await db_session.refresh(comment)
    assert comment.is_hidden is True
    assert comment.hidden_by == admin.user_id
    assert comment.hidden_at is not None

    result = await db_session.execute(select(AdminActionLog))
    log = result.scalar_one()
    assert log.admin_user_id == admin.user_id
    assert log.action == "HIDE_COMMENT"
    assert log.target_type == "Comment"
    assert log.target_id == comment.comment_id
    assert log.before_value == {"is_hidden": False, "hidden_by": None}
    assert log.after_value == {"is_hidden": True, "hidden_by": admin.user_id}
    assert log.reason == "abusive comment"


@pytest.mark.asyncio
async def test_admin_can_unhide_comment_and_record_audit_log(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    owner = await create_user(db_session)
    admin = await _set_admin_cookies(client, db_session, set_auth_cookies)
    topic = await create_topic(db_session, user_id=owner.user_id)
    comment = await create_comment(
        db_session,
        user_id=owner.user_id,
        topic_id=topic.topic_id,
        is_hidden=True,
        hidden_by=admin.user_id,
    )
    await db_session.commit()

    response = await client.patch(
        f"/admin-api/comments/{comment.comment_id}/unhide",
        json={"reason": "review completed"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["is_hidden"] is False
    assert payload["hidden_by"] is None

    await db_session.refresh(comment)
    assert comment.is_hidden is False
    assert comment.hidden_by is None
    assert comment.hidden_at is None

    result = await db_session.execute(select(AdminActionLog))
    log = result.scalar_one()
    assert log.admin_user_id == admin.user_id
    assert log.action == "UNHIDE_COMMENT"
    assert log.target_type == "Comment"
    assert log.target_id == comment.comment_id
    assert log.before_value == {"is_hidden": True, "hidden_by": admin.user_id}
    assert log.after_value == {"is_hidden": False, "hidden_by": None}
    assert log.reason == "review completed"


@pytest.mark.asyncio
async def test_hide_comment_requires_reason(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    owner = await create_user(db_session)
    topic = await create_topic(db_session, user_id=owner.user_id)
    comment = await create_comment(
        db_session,
        user_id=owner.user_id,
        topic_id=topic.topic_id,
    )
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        f"/admin-api/comments/{comment.comment_id}/hide",
        json={"reason": "   "},
    )

    assert response.status_code == 422

    result = await db_session.execute(select(AdminActionLog))
    assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_hide_missing_comment_returns_404(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        "/admin-api/comments/999999/hide",
        json={"reason": "missing comment"},
    )

    assert response.status_code == 404
