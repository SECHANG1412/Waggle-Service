# Waggle

투표형 커뮤니티 주제를 만들고, 투표하고, 댓글과 대댓글로 의견을 나눌 수 있는 웹 서비스입니다.

현재 프로젝트는 기능 구현과 함께 조회 API 성능 개선 작업을 진행하고 있습니다. 최근에는 주요 조회 API의 기준선 측정과 병목 분석 환경을 먼저 정리하는 방향으로 성능 개선을 진행 중입니다.

## 주요 기능

- 주제 생성, 조회, 삭제
- 다중 선택지 기반 투표
- 주제 좋아요 및 고정
- 댓글, 대댓글, 좋아요
- OAuth 기반 로그인
- 주제 목록 검색, 카테고리 필터, 정렬
- 투표 통계 차트 조회

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
- SQLite (기본 통합 테스트용)
- Docker Compose

## 프로젝트 구조

```text
.
|-- backend
|   |-- app
|   |-- alembic
|   `-- tests
|-- frontend
|   `-- src
`-- docker-compose.yml
```

## 실행 방법

### 1. Docker Compose로 실행

프로젝트 루트에서 아래 명령을 실행합니다.

```bash
docker compose up -d --build
```

기본 포트:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- MySQL: `localhost:3307`

### 2. 로컬에서 Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

### 3. 로컬에서 Backend 실행

환경 변수 파일을 준비한 뒤 아래 명령을 실행합니다.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 테스트

### 통합 테스트 실행

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q tests/integration
```

### 조회 API 기준선 측정

주요 조회 API의 요청당 쿼리 수, DB 시간, 응답 시간을 확인할 수 있습니다.

```bash
cd backend
pytest tests/integration/test_read_api_perf_baseline.py -q -s
```

대상 API:

- `/topics`
- `/topics/{topic_id}`
- `/comments/by-topic/{topic_id}`
- `/votes/topic/{topic_id}`

## 성능 개선 진행 현황

현재는 조회 성능 개선 작업의 1단계인 기준선 수립을 완료한 상태입니다.

- 대상 API 확정
- 핵심 지표 확정
- 현재 응답시간 및 쿼리 수 기록
- 테스트 환경 정의
- 베이스라인 표 작성

다음 단계에서는 부하테스트 시나리오와 모니터링 설계를 진행할 예정입니다.

## 참고 문서

- Frontend 기본 문서: `frontend/README.md`
- Backend 테스트 문서: `backend/tests/README.md`
