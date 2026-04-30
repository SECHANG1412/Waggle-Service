# Waggle

Waggle은 투표와 댓글을 중심으로 의견을 나누는 커뮤니티 서비스입니다.

React/Vite 프론트엔드와 FastAPI 백엔드, MySQL 기반으로 구현했으며, 단순 CRUD를 넘어 성능 개선, 인증 보안 보강, CI/CD 자동화, 관리자 운영 시스템, 운영 관점의 UX 개선까지 단계적으로 확장했습니다.

## 핵심 요약

- `/topics` 목록 조회의 반복 조회/집계 구조를 목록 단위 일괄 집계로 전환해 300 VU 기준 처리량을 `37 req/s -> 95 req/s`로 개선
- 쿠키 인증 기반 상태 변경 요청에 CSRF 검증을 적용하고, OAuth callback의 `state` 검증을 강화
- GitHub Actions 기반 CI/CD를 구성해 PR 검증부터 EC2 배포, migration, frontend build, nginx reload, health check까지 자동화
- 문의 접수부터 관리자 문의 처리, 토픽/댓글 숨김, 감사 로그 조회까지 이어지는 관리자 운영 시스템 구현
- 모바일 화면, 토픽 카드 클릭 영역, 투표 트렌드 그래프, Dialog/Toast 피드백 등 실제 사용 흐름 중심의 UI/UX 보강
- Prometheus, Grafana, CloudWatch, k6를 사용해 부하테스트와 운영 지표를 교차 확인

## 주요 기능

### 사용자 기능

- 회원가입, 로그인, 로그아웃
- Google, Naver, Kakao OAuth 로그인
- 토픽 생성, 목록 조회, 상세 조회, 삭제
- 투표 및 투표 결과 조회
- 투표 트렌드 그래프 조회
- 댓글, 답글 작성 및 조회
- 좋아요, 토픽 고정
- 검색, 카테고리 필터, 정렬
- 문의 접수
- 프로필에서 문의 내역과 숨김 콘텐츠 상태 확인
- 모바일 반응형 화면 지원

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

## 대표 개선 사례

### 1. 관측 지표 기반 목록 조회 API 최적화

`/topics` 목록 조회에서 topic별 댓글 수, 투표 결과, 좋아요 수, pinned 여부를 반복 조회하던 구조를 목록 단위 일괄 집계로 개선했습니다.

- 로컬/Docker 환경에서 반복 조회/집계 구조가 병목 후보인지 먼저 확인
- AWS EC2 배포 환경에서 동일한 300 VU 조건으로 재검증
- k6, CloudWatch, Prometheus/Grafana 지표를 함께 확인해 처리량 정체 구간과 병목 후보 분석
- topic별 반복 조회를 `topic_id` 목록 기준 일괄 집계로 전환
- 300 VU / 5분 기준 처리량 `37 req/s -> 95 req/s`, 평균 응답시간 `7.00s -> 2.1s`, 실패율 `0.22% -> 0.003~0.004%` 수준으로 개선

### 2. 쿠키 인증 기반 상태 변경 요청 보호와 OAuth state 검증 강화

쿠키 기반 인증 구조에서 일반 상태 변경 요청 보호와 OAuth callback 검증을 분리해 보강했습니다.

- 로그인 사용자의 `POST`/`PUT`/`PATCH`/`DELETE` 요청에 CSRF 토큰 검증 적용
- 프론트엔드에서 `csrf_token` 쿠키 값을 읽어 `X-CSRF-Token` 헤더로 자동 전송
- Google/Naver/Kakao OAuth callback에서 `oauth_state` 쿠키와 callback `state` 값 일치 여부 검증
- `TokenRefreshMiddleware`와 `/users/refresh`의 책임을 분리해 refresh token 중복 처리 흐름 방지
- CSRF, OAuth state, refresh 흐름에 대한 통합 테스트 추가

### 3. 감사 로그 기반 관리자 운영 시스템 구현

기존에 실제 기능과 연결되지 않았던 `/contact` 문의 흐름을 로그인 사용자 기반 문의 접수 및 관리자 처리 흐름으로 확장했습니다.

- 일반 사용자와 관리자 권한을 분리하고, 관리자 전용 API와 `/manage` 화면 구성
- 문의 상태를 `pending`, `in_progress`, `resolved`로 관리
- 토픽/댓글은 삭제 대신 숨김/해제 방식으로 관리
- 모든 주요 관리자 조치에 사유 입력을 필수화하고 변경 전/후 값을 감사 로그로 기록
- 사용자 프로필에서 문의 처리 결과와 숨김 콘텐츠 상태 확인 가능

### 4. GitHub Actions 기반 CI/CD 파이프라인 구축

PR 단계의 CI와 `main` merge 이후 CD를 분리해, 기존 EC2 수동 배포 절차를 GitHub Actions workflow로 자동화했습니다.

- PR 단계에서 백엔드 통합 테스트, backend lint, frontend lint/build 자동 실행
- `main` merge 이후 EC2 자동 배포 수행
- backend 재배포, Alembic migration, frontend build, Nginx reload, health check 자동화
- `/health`, `/health/db`, `/topics` smoke test로 배포 후 상태 검증 분리
- 문서/편집기 설정 변경 시 불필요한 CD 실행 방지
- EC2 재부팅 후 주요 컨테이너 자동 복구 설정

### 5. 사용자 경험 및 모바일 UI 보강

서비스 운영 흐름이 확장된 뒤, 사용자가 실제로 많이 마주치는 화면과 피드백 흐름도 함께 정리했습니다.

- SweetAlert2 제거 후 프로젝트 스타일에 맞는 Dialog/Toast 흐름으로 교체
- 투표/삭제 확인 Dialog와 로그인 필요 안내 흐름 개선
- 비로그인 상태의 불필요한 로그인 안내 남발 방지
- 모바일 Navbar, 토픽 카드, 토픽 상세, 댓글, 프로필, 관리자 화면 반응형 보강
- 토픽 카드 클릭 영역과 버튼 영역을 분리해 오입력 가능성 완화

## 인프라 구성

- 운영 EC2
  - Nginx
  - FastAPI backend
  - MySQL
  - Prometheus
  - Grafana
- 모니터링
  - Prometheus
  - Grafana
  - CloudWatch / CloudWatch Agent
- 부하 테스트
  - k6

운영 환경에서는 Nginx가 외부 요청을 받고, 정적 파일은 `frontend/dist`에서 서빙하며 API 요청은 FastAPI backend로 프록시합니다. 외부 사용자는 80/443 포트로 접근하고, backend 8000 포트와 frontend 개발용 3000 포트는 운영 보안그룹에서 외부 공개 대상이 아닙니다.

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

### 부하 테스트

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
- k6 부하 테스트 문서: `k6/README.md`
- 성능 기준 메모: `backend/perf_baseline_notes.md`
