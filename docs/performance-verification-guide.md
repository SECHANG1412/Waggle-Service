# Performance Verification Guide

이 문서는 Waggle에서 read API 성능을 확인할 때 사용하는 검증 흐름과 지표 해석 기준을 정리합니다.

## Purpose

성능 검증은 단일 수치만으로 판단하지 않습니다.

Waggle에서는 로컬 baseline, k6, Prometheus/Grafana, CloudWatch를 함께 확인해 read API의 병목 후보와 개선 효과를 비교합니다.

주요 대상은 다음 API입니다.

- `GET /topics`
- `GET /topics/{topic_id}`
- `GET /comments/by-topic/{topic_id}`
- `GET /votes/topic/{topic_id}`

## Verification Flow

성능 개선 전후 비교는 같은 조건을 유지하는 것을 기준으로 합니다.

```text
1. Local baseline 확인
2. k6 script로 고정 부하 실행
3. Prometheus/Grafana에서 request rate와 p95 확인
4. CloudWatch에서 EC2 CPU/Memory 확인
5. 결과를 같은 환경, 같은 script, 같은 seed data 기준으로 비교
```

## Tool Roles

| Tool | Role |
| --- | --- |
| `backend/perf_baseline_*` | query count, query time, response time, EXPLAIN output 확인 |
| k6 | fixed load 조건에서 request rate, response time, failure rate 확인 |
| Prometheus/Grafana | API request rate, latency percentile 흐름 확인 |
| CloudWatch | EC2 CPU/Memory 사용률 확인 |

각 도구는 서로 다른 관점을 제공합니다.

- k6는 클라이언트 관점의 부하 결과를 보여줍니다.
- Prometheus/Grafana는 서버가 수집한 API 지표를 보여줍니다.
- CloudWatch는 EC2 자원 사용률을 보여줍니다.
- backend baseline은 쿼리 단위의 local diagnostic 값을 보여줍니다.

## Comparison Rules

전후 비교 시 다음 조건을 최대한 동일하게 유지합니다.

- 같은 k6 script
- 같은 target environment
- 같은 seed data
- 같은 API endpoint
- 같은 VU/duration 조건
- 같은 배포 방식과 runtime 설정

조건이 달라졌다면 결과 수치를 직접 비교하지 않고, 변경된 조건을 함께 기록합니다.

