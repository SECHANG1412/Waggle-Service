# Waggle Operations Docs

Waggle 운영, 배포, 모니터링, 관리자 기능, 성능 검증 흐름을 정리한 문서 모음입니다.

## Architecture

- [Architecture Overview](architecture-overview.md)
  - EC2 배포 구조, Nginx reverse proxy, Docker Compose 구성, 모니터링 및 CI/CD 흐름을 정리합니다.

## Security

- [Auth Security Flow](auth-security-flow.md)
  - 쿠키 인증 기반 CSRF 보호, OAuth state 검증, refresh 처리 책임 분리 흐름을 정리합니다.

## Deployment

- [Deployment Closeout Checklist](deployment-closeout-checklist.md)
  - main merge 이후 배포 확인에 필요한 GitHub Actions, health check, runtime 점검 항목과 실패 단계 확인 기준을 정리합니다.

## Admin Operations

- [Admin Account Setup Guide](admin-account-setup.md)
  - 로컬 또는 배포 환경에서 관리자 계정을 설정하고 API 접근 권한을 확인하는 절차를 정리합니다.
- [Admin Operations Guide](admin-operations-guide.md)
  - 문의 처리, 토픽/댓글 숨김, 감사 로그 조회 등 관리자 운영 흐름을 정리합니다.

## Monitoring

- [Monitoring Checklist](monitoring-checklist.md)
  - k6, Prometheus/Grafana, CloudWatch를 함께 확인하는 부하테스트 및 운영 지표 점검 항목을 정리합니다.
- [Performance Verification Guide](performance-verification-guide.md)
  - read API 성능 측정, query count, EXPLAIN 결과, 부하테스트 검증 흐름을 정리합니다.

## Documentation

- [Document Maintenance Notes](document-maintenance.md)
  - 문서 인코딩, 문서 변경 범위, PR closeout 기준을 정리합니다.

## Related Docs

- [Backend Test Docs](../backend/tests/README.md)
- [k6 Load Test Docs](../k6/README.md)
- [Performance Baseline Notes](../backend/perf_baseline_notes.md)
