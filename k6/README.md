# k6 Load Test Scripts

This directory contains k6 scripts used to check read API behavior under a few fixed load levels.

## Script Groups

| Group | Target API | Purpose |
| --- | --- | --- |
| `topics-list-*` | `GET /topics` | Topic list read path and aggregate response cost |
| `topic-detail-*` | `GET /topics/{topic_id}` | Topic detail read path |
| `comments-*` | `GET /comments/by-topic/{topic_id}` | Comment list read path |
| `vote-stats-*` | `GET /votes/topic/{topic_id}` | Vote trend/statistics read path |

## Load Levels

| Suffix | Purpose |
| --- | --- |
| `smoke` | Quick endpoint availability check |
| `low-load` | Light local/Docker load check |
| `mid-load` | Medium load check before heavier runs |
| `upper-load` | Higher load check for bottleneck exploration |

## Run Examples

Run a smoke check from the repository root:

```bash
k6 run k6/topics-list-smoke.js
```

Run a higher-load topic list check:

```bash
k6 run k6/topics-list-upper-load.js
```

Most scripts target `http://host.docker.internal:8000`, so run them while the backend is available from Docker or a local environment that resolves that host.

## Notes

- Keep the same script, target environment, and seed data when comparing before/after performance numbers.
- Treat these scripts as diagnostic tools, not as complete production traffic simulations.
- Use k6 summary output together with server-side metrics such as CloudWatch, Prometheus, or Grafana when diagnosing bottlenecks.
