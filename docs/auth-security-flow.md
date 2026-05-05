# Auth Security Flow

이 문서는 Waggle의 쿠키 인증 기반 요청 보호, OAuth state 검증, refresh 처리 책임 분리 흐름을 정리합니다.

## CSRF Protection

Waggle은 인증 정보를 쿠키로 관리합니다.

쿠키 기반 인증에서는 브라우저가 요청마다 인증 쿠키를 자동으로 전송하므로, 로그인된 사용자의 상태 변경 요청에는 별도 검증이 필요합니다.

보호 대상은 서버 상태를 변경하는 unsafe method입니다.

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

백엔드는 `CSRFMiddleware`에서 Double Submit Token 방식으로 CSRF 토큰을 검증합니다.

```text
Login
 -> server issues csrf_token cookie
 -> frontend reads csrf_token cookie
 -> unsafe request sends X-CSRF-Token header
 -> backend compares cookie token and header token
 -> request is allowed only when both values exist and match
```

인증 쿠키는 브라우저가 자동으로 전송하지만, 상태 변경 요청은 프론트엔드가 `csrf_token` 값을 `X-CSRF-Token` 헤더에 명시적으로 담아 보낼 때만 통과합니다.

프론트엔드는 Axios 요청 인터셉터에서 unsafe method 요청에 `X-CSRF-Token` 헤더를 자동으로 추가합니다.

이 흐름을 통해 개별 API 호출부에서 CSRF 헤더를 직접 붙이지 않아도, 상태 변경 요청에 일관된 보호 규칙이 적용됩니다.

토큰 비교는 보안 민감 값 비교 흐름을 보수적으로 유지하기 위해 `compare_digest` 기반으로 처리합니다.

