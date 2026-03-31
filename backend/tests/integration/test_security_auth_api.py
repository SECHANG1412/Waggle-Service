from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_csrf_blocks_unsafe_request_when_header_missing(client, auth_user, set_auth_cookies):
    set_auth_cookies(client, auth_user.user_id)
    client.headers.pop("X-CSRF-Token", None)

    response = await client.post(
        "/topics",
        json={
            "title": "blocked-topic",
            "category": "general",
            "description": "desc",
            "vote_options": ["A", "B"],
        },
    )

    assert response.status_code == 403
    assert response.text == "CSRF validation failed"


@pytest.mark.asyncio
async def test_csrf_blocks_unsafe_request_when_token_mismatch(client, auth_user, set_auth_cookies):
    set_auth_cookies(client, auth_user.user_id)
    client.headers["X-CSRF-Token"] = "wrong-token"

    response = await client.post(
        "/topics",
        json={
            "title": "blocked-topic-mismatch",
            "category": "general",
            "description": "desc",
            "vote_options": ["A", "B"],
        },
    )

    assert response.status_code == 403
    assert response.text == "CSRF validation failed"


@pytest.mark.asyncio
async def test_csrf_allows_unsafe_request_with_matching_token(authenticated_client):
    response = await authenticated_client.post(
        "/topics",
        json={
            "title": "allowed-topic",
            "category": "general",
            "description": "desc",
            "vote_options": ["A", "B"],
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "allowed-topic"


@pytest.mark.asyncio
async def test_oauth_callback_requires_saved_state_cookie(client):
    response = await client.get(
        "/auth/google/callback",
        params={"code": "abc", "state": "state-123"},
    )

    assert response.status_code == 302
    assert response.headers["location"].endswith("/?auth_error=missing_state_cookie")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("path", "exchange_target", "exchange_impl"),
    [
        (
            "/auth/google/callback",
            "app.routers.oauth.exchange_google_code_for_tokens",
            lambda code: {"access_token": "google-access-token"},
        ),
        (
            "/auth/naver/callback",
            "app.routers.oauth.exchange_naver_code_for_tokens",
            lambda code, state: {"access_token": "naver-access-token"},
        ),
        (
            "/auth/kakao/callback",
            "app.routers.oauth.exchange_kakao_code_for_tokens",
            lambda code: {"access_token": "kakao-access-token"},
        ),
    ],
)
async def test_oauth_callback_requires_saved_state_cookie_for_all_providers(
    client,
    monkeypatch,
    path,
    exchange_target,
    exchange_impl,
):
    monkeypatch.setattr(exchange_target, exchange_impl)

    response = await client.get(
        path,
        params={"code": "abc", "state": "state-123"},
    )

    assert response.status_code == 302
    assert response.headers["location"].endswith("/?auth_error=missing_state_cookie")


@pytest.mark.asyncio
async def test_oauth_callback_rejects_invalid_state(client):
    client.cookies.set("oauth_state", "expected-state")

    response = await client.get(
        "/auth/google/callback",
        params={"code": "abc", "state": "wrong-state"},
    )

    assert response.status_code == 302
    assert response.headers["location"].endswith("/?auth_error=invalid_state")
    assert "oauth_state=" in response.headers.get("set-cookie", "")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("path", "exchange_target", "expected_error"),
    [
        (
            "/auth/google/callback",
            "app.routers.oauth.exchange_google_code_for_tokens",
            "google_oauth_error",
        ),
        (
            "/auth/naver/callback",
            "app.routers.oauth.exchange_naver_code_for_tokens",
            "naver_oauth_error",
        ),
        (
            "/auth/kakao/callback",
            "app.routers.oauth.exchange_kakao_code_for_tokens",
            "kakao_oauth_error",
        ),
    ],
)
async def test_oauth_callback_redirects_unexpected_errors_per_provider(
    client,
    monkeypatch,
    path,
    exchange_target,
    expected_error,
):
    client.cookies.set("oauth_state", "expected-state")

    def _raise_unexpected(*args, **kwargs):
        raise RuntimeError("unexpected callback failure")

    monkeypatch.setattr(exchange_target, _raise_unexpected)

    response = await client.get(
        path,
        params={"code": "abc", "state": "expected-state"},
    )

    assert response.status_code == 302
    assert response.headers["location"].endswith(f"/?auth_error={expected_error}")
    assert "oauth_state=" in response.headers.get("set-cookie", "")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("path", "builder_target"),
    [
        ("/auth/google/login", "app.routers.oauth.build_google_authorization_url"),
        ("/auth/naver/login", "app.routers.oauth.build_naver_authorization_url"),
        ("/auth/kakao/login", "app.routers.oauth.build_kakao_authorization_url"),
    ],
)
async def test_oauth_login_endpoints_issue_state_cookie(client, monkeypatch, path, builder_target):
    monkeypatch.setattr(builder_target, lambda state: f"https://provider.example/login?state={state}")

    response = await client.get(path)

    assert response.status_code == 302
    assert response.headers["location"].startswith("https://provider.example/login?state=")
    assert "oauth_state" in response.headers.get("set-cookie", "")
