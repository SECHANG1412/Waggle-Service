# Monitoring Checklist

이 문서는 부하 테스트나 배포 후 상태 확인 시 함께 볼 지표를 정리합니다.

## Application Metrics

- Prometheus가 FastAPI backend의 metrics endpoint를 정상 scrape하는지 확인합니다.
- Grafana에서 요청량, 응답시간, p95 지표가 수집되는지 확인합니다.
- 특정 API를 비교할 때는 같은 기간, 같은 테스트 조건, 같은 데이터 조건을 기준으로 봅니다.

## Infrastructure Metrics

- CloudWatch에서 EC2 CPU 사용률을 확인합니다.
- CloudWatch에서 EC2 memory 사용률을 확인합니다.
- CPU 사용률이 높아도 처리량이 함께 증가했는지, 또는 처리량이 정체되고 응답시간만 늘어나는지 구분합니다.

## Load Test Checks

- k6 결과에서 request rate, average duration, p95, failed requests를 함께 확인합니다.
- 개선 전후 비교는 같은 k6 script와 같은 target environment를 기준으로 합니다.
- k6 결과만 단독으로 판단하지 않고 Prometheus/Grafana, CloudWatch 지표와 함께 봅니다.

## Read API Baseline

- 읽기 API 병목을 볼 때는 `backend/perf_baseline.md`와 k6 결과를 함께 확인합니다.
- query count, query time, response time, EXPLAIN 결과가 이전 측정과 어떤 차이가 있는지 확인합니다.
- baseline 갱신 시 pytest runner output은 제외하고 측정 표와 EXPLAIN 결과만 남깁니다.

## Common Interpretation

- request rate가 정체되고 p95가 증가하면 요청당 처리 비용이나 CPU 경합 가능성을 먼저 봅니다.
- memory 사용률이 안정적이면 메모리 부족보다 CPU 사용률, DB 조회 비용, 응답 조립 비용을 우선 확인합니다.
- worker 수 조정이나 로그 설정 변경은 구조 개선과 분리해서 효과를 검증합니다.
