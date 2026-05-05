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

## Evidence Checklist

성능 개선 결과를 PR, README, 포트폴리오에 정리할 때는 원본 수치와 관측 화면을 함께 남깁니다.

### k6 Summary

k6 summary에서는 다음 값을 확인합니다.

- request rate
- average response time
- p95 response time
- failure rate
- test duration
- VU 조건

전후 비교를 할 때는 같은 script와 같은 VU/duration 조건에서 실행한 결과만 나란히 비교합니다.

### Grafana

Grafana에서는 backend metrics 기준으로 API 지표를 확인합니다.

- request rate
- p95 latency
- status code 흐름
- 테스트가 실행된 시간 구간

k6 결과와 Grafana 지표가 같은 방향을 보이는지 확인합니다.

### CloudWatch

CloudWatch에서는 EC2 자원 사용률을 확인합니다.

- CPU utilization
- Memory usage
- 테스트가 실행된 시간 구간

CPU 사용률이 낮아졌는지뿐 아니라, 같은 CPU 사용 구간에서 처리량이 증가했는지도 함께 봅니다.

### Backend Baseline

backend baseline은 local diagnostic 근거로 사용합니다.

- query count
- query time
- response time
- EXPLAIN output

baseline 파일은 의도적으로 read API 기준이 바뀐 경우에만 갱신합니다.

## Wording Guidelines

성능 결과를 설명할 때는 측정 범위와 조건을 함께 적습니다.

권장 표현:

- 같은 k6 script와 같은 EC2 사양에서 개선 전후를 비교했습니다.
- 300 VU는 실제 동시 사용자 수를 단정하기 위한 값이 아니라, 비교 기준 부하로 사용했습니다.
- k6 결과와 Prometheus/Grafana 지표가 같은 방향을 보여 개선 효과를 교차 확인했습니다.
- 요청 1건당 조회/집계 비용을 줄여 같은 EC2 자원에서 더 많은 요청을 처리하도록 개선했습니다.

피해야 할 표현:

- 실제 사용자 300명을 안정적으로 처리했습니다.
- 모든 병목을 해결했습니다.
- p95 문제가 완전히 해결되었습니다.
- EXPLAIN 또는 query count를 확인하지 않은 변경에 대해 쿼리 병목을 단정합니다.

