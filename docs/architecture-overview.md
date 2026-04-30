# Waggle Architecture Overview

이 문서는 Waggle의 전체 구성 요소와 요청 흐름을 한눈에 정리하기 위한 아키텍처 메모입니다.

## 요청 흐름

1. 사용자는 `waggle.kr` 도메인으로 접속합니다.
2. Nginx가 외부 요청을 받습니다.
3. 정적 파일 요청은 EC2 내부의 `frontend/dist`에서 서빙합니다.
4. API 요청은 Nginx reverse proxy를 통해 FastAPI backend로 전달합니다.
5. FastAPI backend는 MySQL 8.0에 데이터를 읽고 씁니다.
6. MySQL 데이터는 Docker volume `db_data`에 저장합니다.

## 애플리케이션 구성

- Frontend
  - React
  - Vite
  - Tailwind CSS
  - Axios
  - Recharts
- Backend
  - FastAPI
  - SQLAlchemy
  - Alembic
  - SQLAdmin
- Database
  - MySQL 8.0
- Web Server
  - Nginx
- Runtime
  - Docker Compose

## 모니터링 구성

- FastAPI backend는 Prometheus가 수집할 수 있는 metrics를 제공합니다.
- Prometheus는 backend metrics를 scrape합니다.
- Grafana는 Prometheus datasource를 조회해 API 요청량과 응답시간 지표를 시각화합니다.
- AWS CloudWatch는 EC2 CPU와 Memory 지표를 확인하는 데 사용합니다.

## CI/CD 흐름

1. 개발자가 GitHub repository에 push 또는 PR을 생성합니다.
2. PR 단계에서는 GitHub Actions CI가 실행됩니다.
3. CI는 backend test/lint와 frontend lint/build를 검증합니다.
4. `main` merge 이후 GitHub Actions CD가 실행됩니다.
5. CD는 GitHub Secrets의 SSH 정보를 사용해 EC2에 접속합니다.
6. EC2에서 최신 코드 pull, backend rebuild, Alembic migration, frontend build, Nginx reload, health check를 수행합니다.

## 운영 확인 지점

- `/health`: FastAPI 애플리케이션 상태 확인
- `/health/db`: DB 연결 상태 확인
- `/topics?page=1&limit=10`: 핵심 목록 조회 API smoke test
- `/manage`: 관리자 운영 화면
- Prometheus/Grafana: API metrics 확인
- CloudWatch: EC2 CPU/Memory 확인
