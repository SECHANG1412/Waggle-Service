# Read API Performance Baseline Notes

This note explains how to use the baseline outputs stored in:

- `backend/perf_baseline.md`
- `backend/perf_baseline.txt`

## Purpose

The baseline files capture local diagnostic output for selected read APIs. They are useful when comparing before/after changes in query count, query time, response time, and EXPLAIN output.

File roles:

- `backend/perf_baseline.md`: markdown-friendly baseline for review and documentation
- `backend/perf_baseline.txt`: raw text copy kept for quick terminal comparison

Current baseline targets:

- `GET /topics`
- `GET /topics/{topic_id}`
- `GET /comments/by-topic/{topic_id}`
- `GET /votes/topic/{topic_id}?time_range=all&interval=1h`

## How to Regenerate

Run from `backend/`:

```bash
pytest -q -s tests/integration/test_read_api_perf_baseline.py
```

The test prints a summary table and EXPLAIN output to stdout. Copy the output into the baseline file only when the change intentionally updates the read API baseline.

When updating a baseline file, copy only the summary table and EXPLAIN sections. Do not copy pytest runner output such as `.` or `1 passed in ...`.

## Reading the Numbers

| Field | Meaning |
| --- | --- |
| `query_count` | Number of SQL statements captured for the request |
| `query_time_ms` | Total captured SQL execution time |
| `response_time_ms` | Request handling time measured by the performance middleware |
| `unique_selects` | Number of captured SELECT statements with EXPLAIN output |

## Notes

- These numbers are local diagnostic values, not production SLOs.
- Results can vary depending on the local machine, test database, and seed data.
- Keep the same test data and command when comparing before/after numbers.
- Keep pytest runner output out of the baseline files so diffs only reflect measured query and EXPLAIN changes.
- Use these files as supporting evidence together with k6 and server-side metrics when diagnosing read API bottlenecks.
