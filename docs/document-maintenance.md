# Document Maintenance Notes

이 문서는 README와 운영 문서를 수정할 때 확인할 기준을 정리합니다.

## Encoding

- 문서는 UTF-8로 저장합니다.
- PowerShell 콘솔에서 한글이 깨져 보일 수 있어도, 파일 자체가 깨진 것인지 먼저 확인합니다.
- 출력만 깨진 경우에는 문서 내용을 다시 저장하지 않습니다.
- 문서 전체를 복사해 붙여넣기 전에 diff에서 한글이 정상적으로 보이는지 확인합니다.

## Update Scope

- 기능 변경이 없는 문서 정리는 코드 수정과 분리합니다.
- README는 프로젝트 전체 소개, 실행 방법, 핵심 개선 요약을 중심으로 유지합니다.
- `docs/architecture-overview.md`는 배포 구조, 요청 흐름, 모니터링 흐름이 실제 구성과 맞는지 확인합니다.
- 테스트나 성능 측정 방법이 바뀌면 `backend/tests/README.md`, `k6/README.md`, `backend/perf_baseline_notes.md`도 함께 확인합니다.

## Closeout

- 문서만 수정한 경우에는 CI/CD 실행 범위를 확인합니다.
- GitHub Actions CD가 문서 변경만으로 실행되지 않도록 `paths-ignore` 정책과 충돌하지 않는지 확인합니다.
- PR 본문에는 문서 변경 범위와 코드 영향이 없다는 점을 명시합니다.
