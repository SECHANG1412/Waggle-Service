import pytest

from app.db.crud import UserCrud
from app.services.google_oauth import ensure_user_from_google
from app.services.kakao_oauth import ensure_user_from_kakao
from app.services.naver_oauth import NaverOAuthError, ensure_user_from_naver
from tests.factories import create_user


@pytest.mark.asyncio
async def test_google_oauth_returns_existing_user_by_email(db_session):
    existing = await create_user(
        db_session,
        username="existing",
        email="oauth@example.com",
    )
    await db_session.commit()

    user = await ensure_user_from_google(
        db_session,
        email="oauth@example.com",
        name="OAuth User",
    )

    assert user.user_id == existing.user_id


@pytest.mark.asyncio
async def test_oauth_user_creation_generates_unique_username(db_session, monkeypatch):
    async def fake_hash_password(password: str) -> str:
        return f"hashed::{password}"

    monkeypatch.setattr("app.services.oauth_user.get_password_hash", fake_hash_password)
    await create_user(db_session, username="OAuth User", email="first@example.com")
    await db_session.commit()

    user = await ensure_user_from_google(
        db_session,
        email="second@example.com",
        name="OAuth User",
    )

    assert user.email == "second@example.com"
    assert user.username == "OAuth User1"


@pytest.mark.asyncio
async def test_naver_oauth_requires_email(db_session):
    with pytest.raises(NaverOAuthError) as exc_info:
        await ensure_user_from_naver(db_session, email=None, nickname="naver")

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "email_required"


@pytest.mark.asyncio
async def test_kakao_oauth_without_email_uses_valid_placeholder_domain(db_session, monkeypatch):
    async def fake_hash_password(password: str) -> str:
        return f"hashed::{password}"

    monkeypatch.setattr("app.services.oauth_user.get_password_hash", fake_hash_password)

    user = await ensure_user_from_kakao(
        db_session,
        provider_id=12345,
        email=None,
        nickname="kakao-user",
    )

    assert user.email == "kakao_12345@oauth.kakao.waggle.kr"
    assert user.username == "kakao-user"

    db_user = await UserCrud.get_by_email(db_session, "kakao_12345@oauth.kakao.waggle.kr")
    assert db_user is not None


@pytest.mark.asyncio
async def test_kakao_oauth_without_email_reuses_legacy_placeholder_user(db_session):
    legacy = await create_user(
        db_session,
        username="legacy-kakao",
        email="kakao_12345@placeholder.local",
    )
    await db_session.commit()

    user = await ensure_user_from_kakao(
        db_session,
        provider_id=12345,
        email=None,
        nickname="kakao-user",
    )

    assert user.user_id == legacy.user_id
