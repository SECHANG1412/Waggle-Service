from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from email_validator import validate_email, EmailNotValidError
from app.db.crud import UserCrud, TopicCrud, VoteCrud, LikeCrud
from app.db.models import User
from app.db.schemas.users import (
    UserLogin,
    UserCreate,
    UserRead,
    UserUpdate,
    UserStats,
    UserActivity,
)
from app.core.jwt_handler import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)


class UserService:
    _DISPOSABLE_DOMAINS = {
        "mailinator.com",
        "tempmail.com",
        "10minutemail.com",
        "guerrillamail.com",
        "throwawaymail.com",
        "trashmail.com",
        "yopmail.com",
    }

    @staticmethod
    def _validate_email(email: str) -> str:
        """
        Validate email format and deliverability (MX) and block disposable domains.
        Returns the normalized email or raises HTTPException.
        """
        try:
            v = validate_email(email, check_deliverability=True)
            normalized = v.email
        except EmailNotValidError:
            raise HTTPException(status_code=400, detail="올바른 이메일 형식이 아닙니다.")

        domain = normalized.split("@")[-1].lower()
        if domain in UserService._DISPOSABLE_DOMAINS:
            raise HTTPException(status_code=400, detail="일회용 이메일 주소는 사용할 수 없습니다.")
        return normalized

    @staticmethod
    async def get_user(db: AsyncSession, user_id: int) -> UserRead:
        db_user = await UserCrud.get_by_id(db, user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        return await UserService._build_user_read(db, db_user)

    @staticmethod
    async def signup(db: AsyncSession, user: UserCreate) -> UserRead:
        user.email = UserService._validate_email(user.email)

        if await UserCrud.get_by_username(db, user.username):
            raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")
        if await UserCrud.get_by_email(db, user.email):
            raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

        user.password = await get_password_hash(user.password)

        try:
            db_user = await UserCrud.create(db, user)
            await db.commit()
            await db.refresh(db_user)
            return await UserService._build_user_read(db, db_user)
        except Exception:
            await db.rollback()
            raise HTTPException(status_code=500, detail="회원가입 처리 중 오류가 발생했습니다.")

    @staticmethod
    async def login(db: AsyncSession, user: UserLogin) -> tuple:
        db_user = await UserCrud.get_by_email(db, user.email)
        if not db_user or not await verify_password(user.password, db_user.password):
            raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

        refresh_token = create_refresh_token(db_user.user_id)
        access_token = create_access_token(db_user.user_id)

        updated_user = await UserCrud.update_refresh_token_by_id(
            db, db_user.user_id, refresh_token
        )
        await db.commit()
        await db.refresh(updated_user)

        return await UserService._build_user_read(db, updated_user), access_token, refresh_token

    @staticmethod
    async def update_user(db: AsyncSession, user_id: int, update: UserUpdate) -> UserRead:
        if update.email:
            update.email = UserService._validate_email(update.email)
            existing_email = await UserCrud.get_by_email(db, update.email)
            if existing_email and existing_email.user_id != user_id:
                raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")
        if update.username:
            existing_username = await UserCrud.get_by_username(db, update.username)
            if existing_username and existing_username.user_id != user_id:
                raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")

        if update.password:
            update.password = await get_password_hash(update.password)

        db_user = await UserCrud.update_by_id(db, user_id, update)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        await db.commit()
        await db.refresh(db_user)
        return await UserService._build_user_read(db, db_user)

    @staticmethod
    async def get_stats(db: AsyncSession, user_id: int) -> UserStats:
        topics = await TopicCrud.count_by_user_id(db, user_id)
        votes = await VoteCrud.count_by_user_id(db, user_id)
        likes = await LikeCrud.count_likes_received(db, user_id)
        return UserStats(topics=topics, votes=votes, likes=likes)

    @staticmethod
    async def get_activity(db: AsyncSession, user_id: int) -> list[UserActivity]:
        topics = await TopicCrud.get_recent_by_user_id(db, user_id, limit=5)
        return [
            UserActivity(
                topic_id=topic.topic_id,
                type="topic",
                title=topic.title,
                created_at=topic.created_at,
            )
            for topic in topics
        ]

    @staticmethod
    async def _build_user_read(db: AsyncSession, user: User) -> UserRead:
        return UserRead(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            is_admin=user.is_admin,
            created_at=user.created_at,
        )
