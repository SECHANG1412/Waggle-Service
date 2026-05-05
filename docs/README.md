# Waggle Operations Docs

Waggle 운영, 배포, 모니터링 관련 문서를 한곳에서 찾기 위한 인덱스입니다.

## Architecture

- [Architecture Overview](architecture-overview.md)
  - 요청 흐름, 애플리케이션 구성, 모니터링 구성, CI/CD 흐름을 정리합니다.

## Security

- [Auth Security Flow](auth-security-flow.md)
  - 쿠키 인증 기반 CSRF 보호, OAuth state 검증, refresh 책임 분리 흐름을 정리합니다.

## Deployment

- [Deployment Closeout Checklist](deployment-closeout-checklist.md)
  - main merge 이후 배포가 끝났을 때 확인할 GitHub Actions, health check, runtime 항목을 정리합니다.

## Admin Operations

- [Admin Account Setup Guide](admin-account-setup.md)
  - 기존 사용자 계정에 관리자 권한을 부여하는 방법과 접근 권한 확인 기준을 정리합니다.
- [Admin Operations Guide](admin-operations-guide.md)
  - 문의 처리, 토픽/댓글 숨김, 감사 로그 확인 등 관리자 운영 흐름을 정리합니다.

## Monitoring

- [Monitoring Checklist](monitoring-checklist.md)
  - k6, Prometheus/Grafana, CloudWatch를 함께 볼 때 확인할 지표와 해석 기준을 정리합니다.

## Documentation

- [Document Maintenance Notes](document-maintenance.md)
  - 문서 인코딩, 문서 변경 범위, PR 마무리 기준을 정리합니다.

## Related Docs

- [Backend Test Docs](../backend/tests/README.md)
- [k6 Load Test Docs](../k6/README.md)
- [Performance Baseline Notes](../backend/perf_baseline_notes.md)
