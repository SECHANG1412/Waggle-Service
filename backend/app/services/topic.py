from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.crud import TopicCrud
from app.db.schemas.topics import TopicCreate, TopicRead
from app.db.models import Topic

class TopicService:
    @staticmethod
    async def create(db:AsyncSession, user_id: int, topic_data: TopicCreate) -> Topic:
        try:
            db_topic = await TopicCrud.create(db, topic_data, user_id)
            await db.commit()
            await db.refresh(db_topic)
            return db_topic
        except Exception:
            await db.rollback()
            raise
    
    @staticmethod
    async def get_by_id(db: AsyncSession, topic_id: int, user_id: int | None) -> TopicRead | None:
        db_topic = await TopicCrud.get_by_id(db, topic_id)
        if not db_topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        return db_topic
    
    @staticmethod
    async def get_all(
        db:AsyncSession,
        search: str | None = None,
        category: str | None = None,
        sort: str = "created_at",
        limit: int = 10,
        offset: int = 0,
        user_id: int | None = None
    ) -> list[TopicRead]:
        db_topics = await TopicCrud.get_all_with_filters(db,search,category,sort,limit,offset)
        return db_topics
    
    @staticmethod
    async def count_total(db:AsyncSession, category: str | None, search: str | None) -> int:
        return await TopicCrud.count_all_with_filters(db, category, search)