from __future__ import annotations

import argparse

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import sync_engine
from app.db.models import User


def promote_admin(email: str) -> None:
    with Session(sync_engine) as session:
        user = session.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if user is None:
            raise SystemExit(f"User not found: {email}")

        user.is_admin = True
        session.commit()
        print(f"Admin permission granted: {email}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Grant admin permission to an existing user.")
    parser.add_argument("email", help="Target user email")
    args = parser.parse_args()

    promote_admin(args.email)


if __name__ == "__main__":
    main()
