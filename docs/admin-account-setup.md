# Admin Account Setup Guide

이 문서는 기존 사용자 계정에 관리자 권한을 부여하는 방법과 접근 권한 확인 기준을 정리합니다.

## Admin Permission Model

- 일반 사용자는 `users.is_admin = false` 상태로 생성됩니다.
- 관리자 사용자는 `users.is_admin = true` 상태여야 `/manage` 화면과 관리자 API를 사용할 수 있습니다.
- 관리자 권한은 프론트엔드 화면 노출 여부만으로 판단하지 않고, 백엔드 API에서도 `is_admin` 값을 기준으로 다시 검증합니다.

## Access Rules

- 비로그인 사용자가 관리자 API에 접근하면 `401 Unauthorized`를 반환합니다.
- 로그인했지만 관리자가 아닌 사용자가 관리자 API에 접근하면 `403 Forbidden`을 반환합니다.
- 관리자 사용자는 관리자 API와 `/manage` 화면에 접근할 수 있습니다.

## Grant Admin Permission

관리자 권한은 이미 가입된 사용자 계정에 부여합니다.

```bash
cd backend
python scripts/promote_admin.py <user-email>
```

예시:

```bash
cd backend
python scripts/promote_admin.py admin@example.com
```

스크립트는 입력한 이메일에 해당하는 사용자를 찾아 `is_admin` 값을 `true`로 변경합니다.

## Manual Database Check

필요하면 DB에서 관리자 권한 부여 결과를 확인할 수 있습니다.

```sql
SELECT user_id, email, username, is_admin
FROM users
WHERE email = 'admin@example.com';
```

`is_admin` 값이 `1` 또는 `true`로 표시되면 관리자 권한이 부여된 상태입니다.

## Notes

- 관리자 권한은 신규 가입 단계에서 자동으로 부여하지 않습니다.
- 운영 환경에서는 관리자 권한을 부여할 계정을 먼저 가입시킨 뒤 권한을 부여합니다.
- 관리자 권한을 부여한 뒤에는 해당 계정으로 다시 로그인해 `/manage` 접근 여부를 확인합니다.
