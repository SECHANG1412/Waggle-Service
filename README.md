# Waggle

Waggle은 투표와 댓글을 중심으로 의견을 나누는 커뮤니티 서비스입니다.

React/Vite 프론트엔드와 FastAPI 백엔드, MySQL 기반으로 구현했으며, 단순 CRUD 구현을 넘어 성능 개선, 인증 보안 보강, CI/CD 자동화, 관리자 운영 시스템까지 단계적으로 확장했습니다.

## 핵심 요약

- `/topics` 목록 조회의 반복 조회/집계 구조를 목록 단위 일괄 집계로 전환해 300 VU 기준 처리량을 약 `37 req/s -> 95 req/s`로 개선
- 쿠키 인증 기반 상태 변경 요청에 CSRF 검증을 적용하고, OAuth callback의 `state` 검증을 강화
- GitHub Actions 기반 CI/CD를 구성해 PR 검증부터 EC2 배포, migration, frontend build, nginx reload, health check까지 자동화
- 문의 접수부터 관리자 문의 처리, 토픽/댓글 숨김, 감사 로그 조회까지 이어지는 관리자 운영 시스템 구현
- Prometheus, Grafana, CloudWatch, k6를 활용해 부하테스트와 운영 지표를 교차 확인

## 주요 기능

### 사용자 기능

- 회원가입, 로그인, 로그아웃
- Google, Naver, Kakao OAuth 로그인
- 토픽 생성, 목록 조회, 상세 조회, 삭제
- 투표 및 투표 결과 조회
- 댓글, 답글 작성 및 조회
- 좋아요, 토픽 고정
- 검색, 카테고리 필터, 정렬
- 문의 접수

### 관리자 운영 기능

- 관리자 권한 기반 `/manage` 화면 접근 제어
- 문의 목록/상세 조회
- 문의 상태 변경
  - `pending`
  - `in_progress`
  - `resolved`
- 토픽 숨김/해제
- 댓글 숨김/해제
- 관리자 조치 사유 입력 필수화
- 관리자 조치 감사 로그 기록
  - 관리자 ID
  - action
  - target type
  - target ID
  - 변경 전/후 값
  - 사유
  - 생성 시각
- 관리자 대시보드
  - 처리 대기 문의 수
  - 처리 중 문의 수
  - 숨김 토픽 수
  - 숨김 댓글 수
  - 최근 문의
  - 최근 관리자 작업 로그

## 대표 개선 사례

### 1. `/topics` API 성능 개선

`/topics` 목록 조회는 단순 게시글 목록 조회처럼 보였지만, 실제 응답 생성 과정에서 topic별 댓글 수, 투표 결과, 좋아요 수 등을 반복 조회하고 있었습니다.

목록 크기가 커질수록 DB 쿼리 수와 응답 생성 비용이 함께 증가하는 구조였기 때문에, topic별 개별 조회를 목록에 포함된 `topic_id` 기준 일괄 집계로 전환했습니다.

적용한 개선:

- 투표 결과를 `GROUP BY + COUNT` 기반으로 일괄 집계
- 댓글 수, 답글 수, 좋아요 수를 `topic_id IN (...)` 기반으로 일괄 집계
- 조회 조건에 맞는 인덱스 추가
- 응답 생성 과정에서 필요한 부가 정보를 map 형태로 구성해 topic별 반복 DB 접근 제거

AWS EC2 `t3a.small` 환경에서 300 VU / 5분 조건으로 재검증한 결과:

| 지표 | 개선 전 | 개선 후 |
| --- | ---: | ---: |
| 평균 응답시간 | 7.00s | 약 2.1s |
| p95 응답시간 | 13.96s | 약 7.8s |
| 처리량 | 약 37 req/s | 약 95 req/s |
| 실패율 | 0.22% | 약 0.003~0.004% |

이번 개선은 인스턴스 사양을 높이는 방식이 아니라, 동일한 EC2 자원에서 요청 1건당 처리 비용을 줄여 더 많은 요청을 처리하도록 만든 작업입니다.

### 2. 인증 보안 보강

쿠키 기반 인증 구조에서는 브라우저가 인증 쿠키를 자동 전송하기 때문에, 상태 변경 요청에 대한 CSRF 보호가 필요했습니다.

또한 일반 로그인 이후 요청 보호와 OAuth callback 보호는 서로 다른 문제이므로, CSRF 검증과 OAuth `state` 검증을 분리해 보강했습니다.

적용한 개선:

- 로그인 사용자의 `POST`, `PUT`, `PATCH`, `DELETE` 요청에 CSRF 토큰 검증 적용
- 프론트엔드에서 `csrf_token` 쿠키 값을 읽어 `X-CSRF-Token` 헤더로 전송
- refresh 요청이 인터셉터에서 재귀 호출되지 않도록 예외 처리
- OAuth callback에서 `oauth_state` 쿠키 존재 여부와 callback `state` 값 일치 여부 검증
- 로그인 성공 이후 `oauth_state` 쿠키 삭제
- CSRF 및 OAuth state 검증 통합 테스트 추가

이를 통해 일반 상태 변경 요청과 소셜 로그인 callback 흐름을 각각 보호하는 구조로 정리했습니다.

### 3. GitHub Actions 기반 CI/CD 자동화

기존에는 PR 전 테스트/빌드를 수동으로 확인하고, merge 이후 EC2에 직접 접속해 배포를 진행했습니다.

이를 GitHub Actions 기반으로 자동화해 코드 검증과 서버 반영 흐름을 표준화했습니다.

CI:

- Backend Lint: `ruff check app main.py tests`
- Backend Integration Tests: `pytest -q tests/integration`
- Frontend Lint: `npm run lint`
- Frontend Build: `npm run build`
- Branch protection rule과 required status checks로 merge 전 검증 강제

CD:

- `main` merge 이후 EC2 자동 배포
- `git pull --ff-only`
- backend Docker rebuild
- Alembic migration
- frontend build
- nginx config test/reload
- `/health`, `/health/db`, `/topics` health check/smoke test
- 문서/설정 파일만 변경된 경우 불필요한 CD 실행 방지

EC2 접속 정보와 SSH private key는 GitHub Secrets로 관리해 workflow에 민감 정보가 노출되지 않도록 구성했습니다.

### 4. 관리자 권한 기반 운영 시스템

기존에는 푸터의 문의 링크가 실제 기능으로 연결되지 않았고, 운영자가 문의나 부적절한 콘텐츠를 관리할 수 있는 흐름이 부족했습니다.

이를 문의 접수, 관리자 처리, 콘텐츠 숨김, 감사 로그 조회까지 이어지는 운영 관리 시스템으로 확장했습니다.

구현한 흐름:

- 사용자는 `/contact`에서 문의 접수
- 관리자는 `/manage`에서 문의 목록/상세 조회
- 관리자는 문의 상태 변경 시 사유 입력
- 관리자는 토픽/댓글을 삭제하지 않고 숨김/해제 처리
- 숨김 처리된 콘텐츠는 일반 사용자 화면에 그대로 노출되지 않음
- 모든 관리자 조치는 감사 로그로 기록

관리자 조치에는 `before_value`, `after_value`, `reason`을 함께 저장해 누가, 언제, 무엇을, 왜 변경했는지 추적할 수 있도록 했습니다.

## 기술 스택

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend

- FastAPI
- SQLAlchemy 2
- Alembic
- MySQL 8
- asyncmy / PyMySQL
- SQLAdmin

### Test / Quality

- pytest
- pytest-asyncio
- ruff
- ESLint

### Infra / Monitoring

- Docker Compose
- AWS EC2
- Nginx
- GitHub Actions
- Prometheus
- Grafana
- AWS CloudWatch
- k6

## 인프라 구성

- 운영 EC2
  - Nginx
  - FastAPI backend
  - MySQL
  - Prometheus
  - Grafana
- 부하테스트 EC2
  - k6
- 모니터링
  - Prometheus
  - Grafana
  - CloudWatch / CloudWatch Agent

## 프로젝트 구조

```text
.
|-- backend
|   |-- app
|   |   |-- admin
|   |   |-- core
|   |   |-- db
|   |   |-- middleware
|   |   |-- routers
|   |   `-- services
|   |-- alembic
|   `-- tests
|-- frontend
|   `-- src
|-- k6
|-- .github
|   `-- workflows
|-- docker-compose.yml
`-- prometheus.yml
```

## 실행 방법

### Docker Compose 실행

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

## 테스트 및 검증

### Backend

```bash
cd backend
pip install -r requirements-dev.txt
ruff check app main.py tests
pytest -q tests/integration
```

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run build
```

### 부하테스트

```bash
cd k6
k6 run <script-name>.js
```

## 운영 확인용 엔드포인트

- Application health: `/health`
- Database health: `/health/db`
- Topics smoke test: `/topics?page=1&limit=10`
- Admin API: `/manage-api`
- Admin UI: `/manage`

## 관련 문서

- Frontend 문서: `frontend/README.md`
- Backend 테스트 문서: `backend/tests/README.md`
