import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import AdminActionLog
from tests.factories import create_inquiry, create_user


@pytest.mark.asyncio
async def test_inquiry_status_update_creates_admin_action_log(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    inquiry = await create_inquiry(db_session, status="pending")
    admin = await create_user(db_session, is_admin=True)
    await db_session.commit()
    set_auth_cookies(client, admin.user_id)

    response = await client.patch(
        f"/admin-api/inquiries/{inquiry.inquiry_id}/status",
        json={"status": "resolved", "reason": "문의 처리 완료"},
    )

    assert response.status_code == 200

    result = await db_session.execute(select(AdminActionLog))
    log = result.scalar_one()
    assert log.admin_user_id == admin.user_id
    assert log.action == "UPDATE_INQUIRY_STATUS"
    assert log.target_type == "Inquiry"
    assert log.target_id == inquiry.inquiry_id
    assert log.before_value == {"status": "pending"}
    assert log.after_value == {"status": "resolved"}
    assert log.reason == "문의 처리 완료"


@pytest.mark.asyncio
async def test_blank_reason_does_not_create_admin_action_log(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    inquiry = await create_inquiry(db_session, status="pending")
    admin = await create_user(db_session, is_admin=True)
    await db_session.commit()
    set_auth_cookies(client, admin.user_id)

    response = await client.patch(
        f"/admin-api/inquiries/{inquiry.inquiry_id}/status",
        json={"status": "resolved", "reason": "   "},
    )

    assert response.status_code == 422

    result = await db_session.execute(select(AdminActionLog))
    assert result.scalars().all() == []
