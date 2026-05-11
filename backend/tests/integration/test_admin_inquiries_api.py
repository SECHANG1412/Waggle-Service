import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.crud import InquiryCrud
from app.db.models import AdminActionLog
from tests.factories import create_inquiry, create_user


async def _set_admin_cookies(client: AsyncClient, db_session, set_auth_cookies):
    admin = await create_user(db_session, is_admin=True)
    await db_session.commit()
    set_auth_cookies(client, admin.user_id)
    return admin


@pytest.mark.asyncio
async def test_admin_inquiry_list_requires_login(client: AsyncClient):
    response = await client.get("/manage-api/inquiries")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_inquiry_list_rejects_regular_user(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    user = await create_user(db_session)
    await db_session.commit()
    set_auth_cookies(client, user.user_id)

    response = await client.get("/manage-api/inquiries")

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_list_inquiries(client: AsyncClient, db_session, set_auth_cookies):
    await create_inquiry(db_session, email="first@example.com", title="first")
    await create_inquiry(db_session, email="second@example.com", title="second")
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get("/manage-api/inquiries")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2
    assert {item["title"] for item in payload} == {"first", "second"}


@pytest.mark.asyncio
async def test_admin_can_get_inquiry_detail(client: AsyncClient, db_session, set_auth_cookies):
    inquiry = await create_inquiry(db_session, title="detail")
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get(f"/manage-api/inquiries/{inquiry.inquiry_id}")

    assert response.status_code == 200
    assert response.json()["inquiry_id"] == inquiry.inquiry_id
    assert response.json()["title"] == "detail"


@pytest.mark.asyncio
async def test_admin_inquiry_detail_returns_404_for_missing_inquiry(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get("/manage-api/inquiries/999999")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_admin_can_update_inquiry_status(client: AsyncClient, db_session, set_auth_cookies):
    inquiry = await create_inquiry(db_session)
    admin = await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        f"/manage-api/inquiries/{inquiry.inquiry_id}/status",
        json={"status": "in_progress", "reason": "checking issue"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"

    db_inquiry = await InquiryCrud.get_by_id(db_session, inquiry.inquiry_id)
    await db_session.refresh(db_inquiry)
    assert db_inquiry.status == "in_progress"

    result = await db_session.execute(select(AdminActionLog))
    log = result.scalar_one()
    assert log.admin_user_id == admin.user_id
    assert log.action == "UPDATE_INQUIRY_STATUS"
    assert log.target_type == "Inquiry"
    assert log.target_id == inquiry.inquiry_id
    assert log.before_value == {"status": "pending"}
    assert log.after_value == {"status": "in_progress"}
    assert log.reason == "checking issue"


@pytest.mark.asyncio
async def test_update_inquiry_status_requires_reason(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    inquiry = await create_inquiry(db_session)
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        f"/manage-api/inquiries/{inquiry.inquiry_id}/status",
        json={"status": "resolved", "reason": ""},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_inquiry_status_rejects_invalid_status(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    inquiry = await create_inquiry(db_session)
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        f"/manage-api/inquiries/{inquiry.inquiry_id}/status",
        json={"status": "closed", "reason": "invalid status"},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_admin_can_delete_inquiry_and_record_audit_log(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    inquiry = await create_inquiry(db_session, status="resolved")
    admin = await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.patch(
        f"/manage-api/inquiries/{inquiry.inquiry_id}/delete",
        json={"reason": "completed cleanup"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "deleted"

    await db_session.refresh(inquiry)
    assert inquiry.status == "deleted"

    result = await db_session.execute(select(AdminActionLog))
    log = result.scalar_one()
    assert log.admin_user_id == admin.user_id
    assert log.action == "DELETE_INQUIRY"
    assert log.target_type == "Inquiry"
    assert log.target_id == inquiry.inquiry_id
    assert log.before_value == {"status": "resolved"}
    assert log.after_value == {"status": "deleted"}
    assert log.reason == "completed cleanup"


@pytest.mark.asyncio
async def test_admin_can_filter_inquiries_by_status(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    await create_inquiry(db_session, title="pending", status="pending")
    await create_inquiry(db_session, title="deleted", status="deleted")
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get("/manage-api/inquiries", params={"status": "deleted"})

    assert response.status_code == 200
    payload = response.json()
    assert [item["title"] for item in payload] == ["deleted"]


@pytest.mark.asyncio
async def test_admin_inquiry_list_excludes_deleted_by_default(
    client: AsyncClient,
    db_session,
    set_auth_cookies,
):
    await create_inquiry(db_session, title="visible", status="pending")
    await create_inquiry(db_session, title="deleted", status="deleted")
    await _set_admin_cookies(client, db_session, set_auth_cookies)

    response = await client.get("/manage-api/inquiries")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["visible"]


@pytest.mark.asyncio
async def test_deleted_inquiry_is_excluded_from_my_inquiries(
    authenticated_client: AsyncClient,
    db_session,
    auth_user,
):
    await create_inquiry(
        db_session,
        user_id=auth_user.user_id,
        title="deleted inquiry",
        status="deleted",
    )
    await create_inquiry(
        db_session,
        user_id=auth_user.user_id,
        title="visible inquiry",
        status="pending",
    )
    await db_session.commit()

    response = await authenticated_client.get("/inquiries/me")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["visible inquiry"]
