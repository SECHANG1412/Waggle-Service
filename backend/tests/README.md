# Integration Tests

## Setup

1. Install test dependencies:
   - `pip install -r requirements-dev.txt`
2. (Optional) Use a different DB URL:
   - `set TEST_DATABASE_URL=mysql+asyncmy://user:pass@127.0.0.1:3306/dbname`
   - default: `sqlite+aiosqlite:///backend/tests/test_integration.db`

## Run

- `pytest -q tests/integration`

## Scope

- Topic list/detail APIs
- Vote create/statistics APIs (`time_range=all` regression included)
- Auth-required endpoints and status code matrix (`400/401/403/422`)
- Regression guards:
  - `offset = (page - 1) * limit`
  - sort contract (`created_at`, `like_count` only)
  - full-period vote aggregation for `time_range=all`
