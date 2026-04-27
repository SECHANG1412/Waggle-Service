import pytest
from httpx import AsyncClient

from app.db.models import AdminActionLog
from tests.factories import create_user


async def _set_admin_cookies(client: AsyncClient, db_session, set_auth_cookies):
    admin = await create_user(db_session, is_admin=True)
    await db_session.commit()
    set_auth_cookies(client, admin.user_id)
    return admin


async def _create_log(
    db_session,
    *,
    admin_user_id: int,
    action: str,
    target_type: str,
    target_id: int = 1,
    reason: str = "moderation reason",
) -> AdminActionLog:
    log = AdminActionLog(
        admin_user_id=admin_user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        before_value={"status": "before"},
        after_value={"status": "after"},
        reason=reason,
    )
    db_session.add(log)
    await db_session.flush()
    return log


@pytest.mark.asyncio
async def test_admin_logs_requires_login(client: AsyncClient):
    response = await client.get("/manage-api/logs")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_logs_rejects_regular_user(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.get("/manage-api/logs")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_list_logs(client: AsyncClient, db_session, set_auth_cookies):
    admin = await _set_admin_cookies(client, db_session, set_auth_cookies)
    log = await _create_log(
        db_session,
        admin_user_id=admin.user_id,
        action="HIDE_TOPIC",
        target_type="Topic",
        target_id=10,
        reason="hidden by policy",
    )
    await db_session.commit()

    response = await client.get("/manage-api/logs")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["log_id"] == log.log_id
    assert payload[0]["admin_user_id"] == admin.user_id
    assert payload[0]["action"] == "HIDE_TOPIC"
    assert payload[0]["target_type"] == "Topic"
    assert payload[0]["target_id"] == 10
    assert payload[0]["before_value"] == {"status": "before"}
    assert payload[0]["after_value"] == {"status": "after"}
    assert payload[0]["reason"] == "hidden by policy"


@pytest.mark.asyncio
async def test_admin_logs_filters_by_action_target_type_and_admin_user(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    admin = await _set_admin_cookies(client, db_session, set_auth_cookies)
    other_admin = await create_user(db_session, is_admin=True)
    matched = await _create_log(
        db_session,
        admin_user_id=admin.user_id,
        action="HIDE_COMMENT",
        target_type="Comment",
        target_id=20,
    )
    await _create_log(
        db_session,
        admin_user_id=admin.user_id,
        action="HIDE_TOPIC",
        target_type="Topic",
        target_id=21,
    )
    await _create_log(
        db_session,
        admin_user_id=other_admin.user_id,
        action="HIDE_COMMENT",
        target_type="Comment",
        target_id=22,
    )
    await db_session.commit()

    response = await client.get(
        "/manage-api/logs",
        params={
            "action": "HIDE_COMMENT",
            "target_type": "Comment",
            "admin_user_id": admin.user_id,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert [item["log_id"] for item in payload] == [matched.log_id]


@pytest.mark.asyncio
async def test_admin_logs_limit_validation(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get("/manage-api/logs", params={"limit": 0})

    assert response.status_code == 422
