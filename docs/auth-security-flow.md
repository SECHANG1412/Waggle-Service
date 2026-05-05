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

## OAuth State Validation

Waggle은 Google, Naver, Kakao OAuth 로그인을 제공합니다.

OAuth 로그인은 외부 provider로 이동한 뒤 서비스 callback URL로 돌아오는 흐름이므로, callback 요청이 사용자가 시작한 로그인 흐름과 연결되어 있는지 확인해야 합니다.

이를 위해 모든 OAuth provider에 동일한 `state` 검증 기준을 적용합니다.

```text
OAuth login start
 -> server generates random state
 -> server stores state in oauth_state cookie
 -> server sends state as provider authorization URL parameter
 -> provider redirects to callback with state
 -> backend compares oauth_state cookie and callback state
```

callback 요청은 다음 조건을 모두 만족해야 통과합니다.

- `oauth_state` 쿠키가 존재해야 합니다.
- callback 요청의 `state` 파라미터가 존재해야 합니다.
- 두 값이 정확히 일치해야 합니다.

검증 실패 시에는 프론트엔드로 에러 코드를 전달하고, 남아 있는 `oauth_state` 쿠키를 정리합니다.

- `missing_state_cookie`
- `missing_state`
- `invalid_state`

로그인 성공 후에도 `oauth_state` 쿠키를 삭제해 state 값이 일회성으로만 사용되도록 합니다.

## Refresh Responsibility

인증 재발급 흐름은 자동 refresh 처리와 명시적 refresh API로 나누어 관리합니다.

기존 구조에서는 access token 만료 상황에서 `TokenRefreshMiddleware`가 먼저 refresh token을 처리한 뒤, `/users/refresh` 핸들러가 같은 refresh token을 다시 다룰 수 있는 흐름이 있었습니다.

이를 방지하기 위해 `/users/refresh` 요청은 자동 refresh 미들웨어가 직접 개입하지 않도록 분리합니다.

```text
General API request
 -> TokenRefreshMiddleware may refresh expired access token

/users/refresh request
 -> TokenRefreshMiddleware skips this path
 -> /users/refresh handler owns explicit refresh flow
```

이 기준으로 자동 refresh 처리와 명시적 refresh API의 책임을 구분해 refresh token이 중복 처리될 수 있는 흐름을 방지합니다.

## Regression Tests

인증 보안 흐름은 통합 테스트로 고정합니다.

- CSRF 헤더가 없으면 상태 변경 요청 차단
- CSRF 토큰이 일치하지 않으면 요청 차단
- CSRF 토큰이 일치하면 요청 허용
- OAuth callback에서 `oauth_state` 쿠키가 없으면 차단
- OAuth callback에서 `state` 값이 일치하지 않으면 차단
- OAuth callback 성공 시 인증 쿠키 설정 및 `oauth_state` 정리 확인
- refresh token 만료 시 적절한 에러 반환
- access token 만료와 유효한 refresh token 조합에서 `/users/refresh` 정상 동작 확인
