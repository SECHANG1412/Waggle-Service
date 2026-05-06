# Document Maintenance Notes

이 문서는 README와 운영 문서를 수정할 때 확인할 기준을 정리합니다.

## Encoding

- 문서는 UTF-8로 저장합니다.
- Windows PowerShell 또는 편집기에서 한글이 깨져 보이면 저장 인코딩을 먼저 확인합니다.
- 기존 문서를 수정할 때는 불필요한 전체 재저장을 피하고, 실제 변경한 문장 중심으로 diff를 남깁니다.
- 깨진 문서를 복구할 때는 문서의 목적과 링크 구조를 유지하고, 코드 동작과 무관한 설명만 정리합니다.

## Update Scope

- 문서 변경은 기능 변경과 분리해 작은 단위로 커밋합니다.
- README는 프로젝트 소개, 실행 방법, 주요 문서 링크처럼 진입점 역할을 하는 내용만 유지합니다.
- `docs/architecture-overview.md`는 배포 구조, reverse proxy, 모니터링, CI/CD 흐름이 바뀔 때 함께 확인합니다.
- 성능 검증 흐름이 바뀌면 `backend/tests/README.md`, `k6/README.md`, `backend/perf_baseline_notes.md`도 함께 확인합니다.

## Closeout

- 문서만 변경한 PR은 코드 테스트가 필요한 변경인지 먼저 구분합니다.
- GitHub Actions CD가 문서 변경만으로 불필요하게 실행되지 않는지 `paths-ignore` 범위와 맞춰 확인합니다.
- PR 본문에는 변경한 문서, 변경 이유, 코드 영향 없음 여부를 짧게 남깁니다.

## PR Checklist

- 변경한 문서 링크가 실제 파일 경로와 맞는지 확인합니다.
- 문서 변경이 실행 방법, 배포 절차, 테스트 명령어와 충돌하지 않는지 확인합니다.
- 코드 영향이 없는 문서 정리라면 PR 본문에 테스트 미실행 사유를 명시합니다.
