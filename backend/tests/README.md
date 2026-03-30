# Backend Integration Tests

## Purpose

This suite protects core API contracts and prevents regressions around:

- pagination offset behavior
- topics sort contract
- vote statistics aggregation for `time_range=all`
- auth-required endpoint behavior
- CSRF protection for authenticated unsafe requests
- OAuth `state` validation across social login callbacks

## Prerequisites

1. Move to the backend directory.
   - `cd backend`
2. Install test dependencies.
   - `pip install -r requirements-dev.txt`
3. Optional: use a custom test DB.
   - Windows PowerShell: `$env:TEST_DATABASE_URL="mysql+asyncmy://user:pass@127.0.0.1:3306/dbname"`
   - Default DB: `sqlite+aiosqlite:///backend/tests/test_integration.db`

## Run

- Run all integration tests:
  - `pytest -q tests/integration`
- Run one file:
  - `pytest -q tests/integration/test_regressions.py`

## Contract And Regression Coverage

- `test_topics_api.py`
  - topics list filters, sorting, validation, detail success/not-found
- `test_votes_api.py`
  - vote create success/business errors, stats errors, payload validation
- `test_auth_required_api.py`
  - no-auth `401`, forbidden delete `403`
- `test_security_auth_api.py`
  - CSRF missing/mismatch/success cases
  - Google/Naver/Kakao callback state validation and one-time cookie cleanup
- `test_regressions.py`
  - fixed regression contract: `offset = (page - 1) * limit`
  - fixed sort contract: only `created_at`, `like_count` allowed
  - fixed full-period aggregation when `time_range=all`

## Failure Triage

- `422` on `/topics?sort=...`
  - Check that router validation still restricts sort to `created_at|like_count`.
- Pagination order mismatch in regression test
  - Check offset/page calculation and deterministic ordering by `created_at`.
- vote stats count mismatch for `time_range=all`
  - Check that no recent-time filter is applied for `all`.
- unexpected `401/403`
  - Check auth cookie fixture and endpoint authorization flow.
- unexpected CSRF `403`
  - Check `csrf_token` cookie, `X-CSRF-Token` header, and exempt-path configuration.
- OAuth callback redirect mismatch
  - Check saved `oauth_state` cookie, callback `state`, and cookie cleanup on success.

## CI Merge Gate

GitHub Actions workflow: `.github/workflows/ci.yml`

- Trigger: pull request targeting `main`
- Required checks on branch protection:
  - `Backend Integration Tests`
  - `Frontend Build`
- Merge policy:
  - Do not merge when either required check fails.

## PR Closeout Checklist

- [ ] `pytest -q tests/integration` passes locally
- [ ] no contract drift from guarded regressions (`offset`, `sort`, `time_range=all`)
- [ ] CSRF and OAuth state protections still pass after auth-flow changes
- [ ] CI required checks are green on the PR
- [ ] docs updated if API contract or test scope changed

## Track Summary (Steps 1-4)

- test infra added:
  - `pytest.ini`, `requirements-dev.txt`, `tests/conftest.py`, `tests/factories.py`
- contract alignment completed:
  - sort contract unified to `created_at|like_count`
- integration/regression suite added:
  - topics, votes, auth-required, regressions
- CI gate enabled:
  - PR-to-main workflow with required backend/frontend checks
