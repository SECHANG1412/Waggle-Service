# Deployment Closeout Checklist

이 문서는 main merge 이후 배포가 끝났을 때 확인할 항목을 정리합니다.

## GitHub Actions

- PR 단계의 required status checks가 모두 통과했는지 확인합니다.
- CD workflow가 main merge 이후 정상 실행되었는지 확인합니다.
- CD 로그에서 다음 단계가 순서대로 완료되었는지 확인합니다.
  - EC2 SSH 접속
  - 최신 코드 pull
  - backend rebuild
  - Alembic migration
  - frontend build
  - Nginx config test
  - Nginx reload
  - health check

## Server Health

- `/health`가 정상 응답하는지 확인합니다.
- `/health/db`가 DB 연결 성공을 반환하는지 확인합니다.
- `/topics?page=1&limit=10`이 정상 응답하는지 확인합니다.

## Runtime

- `docker compose ps`로 `backend`, `db`, `prometheus`, `grafana` 상태를 확인합니다.
- EC2 재부팅 이후에는 `restart: unless-stopped` 정책에 따라 주요 컨테이너가 자동 복구되는지 확인합니다.
- Nginx가 정적 파일 서빙과 API reverse proxy를 정상 처리하는지 확인합니다.

## Notes

- 문서나 편집기 설정만 변경된 경우 CD가 실행되지 않는 것이 정상입니다.
- 배포 실패 시에는 GitHub Actions 로그에서 실패 단계부터 확인합니다.
- migration 실패가 발생하면 backend 컨테이너 로그와 Alembic revision 상태를 함께 확인합니다.
