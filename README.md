# Waggle

Waggle is a voting-based community service built with React, FastAPI, and MySQL.

This project goes beyond CRUD implementation and includes performance diagnosis and optimization of the `/topics` read path through local/Docker verification and AWS EC2 load testing.

## Technical Highlights

- React + Vite frontend and FastAPI backend
- MySQL 8, SQLAlchemy 2, Alembic-based schema management
- Prometheus, Grafana, and CloudWatch-based monitoring
- k6-based stage and fixed-load testing on AWS EC2
- `/topics` API read-path optimization through batched aggregation and index tuning

## Performance Optimization

The main bottleneck was the `/topics` list API.

While building the response, the server repeatedly queried per-topic counts and aggregates such as comments, replies, likes, and votes. As the topic list grew, both query volume and response construction cost increased.

The optimization focused on switching from per-topic repeated lookups to list-level batched aggregation.

- Vote results aggregated once by `topic_id`
- Comment, reply, and like counts batched by `topic_id`
- Read-path indexes added for sorting, filtering, and aggregation
- Repeated per-topic access removed from response construction

Under the same AWS EC2 `300 VU / 5 min` condition:

| Metric | Before | After |
| --- | ---: | ---: |
| Avg response time | 7.00s | 2.1s |
| p95 response time | 13.96s | 7.8s |
| Throughput | 37 req/s | 95 req/s |
| Failure rate | 0.22% | 0.003~0.004% |

The key result was not lower CPU usage itself, but lower per-request processing cost, allowing the same EC2 instance to handle more requests.

## Infrastructure

- Service EC2
  - Nginx
  - FastAPI backend
  - MySQL
  - Prometheus
  - Grafana
- Load Test EC2
  - k6
- Monitoring
  - Prometheus
  - Grafana
  - AWS CloudWatch / CloudWatch Agent

## Core Features

- Topic creation, listing, detail, deletion
- Voting and vote result aggregation
- Comments and replies
- Topic likes and pinned topics
- Search, category filter, and sorting
- OAuth login support
- User profile and activity stats

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

### Backend

- FastAPI
- SQLAlchemy 2
- Alembic
- MySQL 8
- asyncmy / PyMySQL

### Test / Infra

- pytest
- Docker Compose
- Prometheus
- Grafana
- AWS EC2
- CloudWatch
- k6

## Project Structure

```text
.
|-- backend
|   |-- app
|   |-- alembic
|   `-- tests
|-- frontend
|   `-- src
|-- k6
|-- docker-compose.yml
`-- prometheus.yml
```

## Getting Started

### Run with Docker Compose

```bash
docker compose up -d --build
```

Available endpoints:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- MySQL: `localhost:3307`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### Run Backend Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Testing

### Backend Integration Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q tests/integration
```

### Read API Baseline Test

```bash
cd backend
pytest tests/integration/test_read_api_perf_baseline.py -q -s
```

Target APIs:

- `/topics`
- `/topics/{topic_id}`
- `/comments/by-topic/{topic_id}`
- `/votes/topic/{topic_id}`

## Related Documents

- Frontend details: `frontend/README.md`
- Backend test details: `backend/tests/README.md`
