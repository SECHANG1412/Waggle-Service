# Waggle

Waggle은 React, FastAPI, MySQL 기반으로 만든 투표형 커뮤니티 서비스입니다.

단순 CRUD 구현에 그치지 않고, `/topics` 조회 경로의 병목을 분석하고 로컬/Docker 환경과 AWS EC2 환경에서 부하테스트와 모니터링을 통해 성능 개선을 검증했습니다.

## 기술 하이라이트

- React + Vite 프론트엔드와 FastAPI 백엔드 구성
- MySQL 8, SQLAlchemy 2, Alembic 기반 데이터베이스 관리
- Prometheus, Grafana, CloudWatch 기반 모니터링 구성
- AWS EC2 환경에서 k6 기반 부하테스트 수행
- `/topics` API 조회 성능 개선을 위한 일괄 집계 및 인덱스 최적화 적용

## 성능 개선

주요 병목은 `/topics` 목록 조회 API에서 확인되었습니다.

응답 생성 과정에서 topic별 댓글 수, 답글 수, 좋아요 수, 투표 결과 등을 반복 조회하고 있었고, 목록 크기가 커질수록 DB 쿼리 수와 응답 생성 비용이 함께 증가하는 구조였습니다.

이를 개선하기 위해 topic별 반복 조회를 목록 단위 일괄 집계 방식으로 전환했습니다.

- 투표 결과를 `topic_id` 기준으로 한 번에 집계
- 댓글 수, 답글 수, 좋아요 수를 `topic_id` 기준으로 일괄 집계
- 정렬, 필터링, 집계 비용 완화를 위한 조회 경로 인덱스 추가
- 응답 생성 과정에서 topic별 반복 접근 제거

동일한 AWS EC2 `300 VU / 5분` 조건에서 성능을 재검증한 결과는 다음과 같습니다.

| 지표 | 개선 전 | 개선 후 |
| --- | ---: | ---: |
| 평균 응답시간 | 7.00s | 2.1s |
| p95 응답시간 | 13.96s | 7.8s |
| 처리량 | 37 req/s | 95 req/s |
| 실패율 | 0.22% | 0.003~0.004% |

이번 개선은 CPU 사용률 자체를 낮추는 작업이라기보다, 요청 1건당 처리 비용을 줄여 동일한 EC2 자원에서 더 많은 요청을 처리하도록 만든 작업이었습니다.

## 인프라 구성

- 서비스 EC2
  - Nginx
  - FastAPI 백엔드
  - MySQL
  - Prometheus
  - Grafana
- 부하테스트 EC2
  - k6
- 모니터링
  - Prometheus
  - Grafana
  - AWS CloudWatch / CloudWatch Agent

## 주요 기능

- 토픽 생성, 목록 조회, 상세 조회, 삭제
- 투표 및 투표 결과 집계
- 댓글 및 답글 기능
- 좋아요 및 토픽 고정 기능
- 검색, 카테고리 필터, 정렬
- OAuth 로그인 지원
- 사용자 프로필 및 활동 통계

## 기술 스택

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

## 프로젝트 구조

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

## 실행 방법

### Docker Compose로 실행

```bash
docker compose up -d --build
```

접속 주소:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- MySQL: `localhost:3307`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

### Frontend 로컬 실행

```bash
cd frontend
npm install
npm run dev
```

### Backend 로컬 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 테스트

### 백엔드 통합 테스트

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q tests/integration
```

### 조회 API 기준선 테스트

```bash
cd backend
pytest tests/integration/test_read_api_perf_baseline.py -q -s
```

대상 API:

- `/topics`
- `/topics/{topic_id}`
- `/comments/by-topic/{topic_id}`
- `/votes/topic/{topic_id}`

## 관련 문서

- Frontend 상세 문서: `frontend/README.md`
- Backend 테스트 문서: `backend/tests/README.md`
