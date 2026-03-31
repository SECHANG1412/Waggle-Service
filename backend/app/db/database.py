from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.settings import settings

async_engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=async_engine, class_=AsyncSession
)

sync_engine = create_engine(settings.sync_database_url, pool_pre_ping=True)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# async def get_db():
#     db = AsyncSessionLocal()
#     try:
#         yield db
#     finally:
#         await db.close()
