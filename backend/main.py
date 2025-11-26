import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, async_engine
from app.db import models  # ensure all models (including new ones) are registered
from fastapi.concurrency import asynccontextmanager
from app.routers import user, topic, vote, comment, reply, like
from app.middleware.token_refresh import TokenRefreshMiddleware
from app.admin.setup import setup_admin

load_dotenv(dotenv_path=".env")

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await async_engine.dispose()

app = FastAPI(lifespan=lifespan)

setup_admin(app, async_engine)

# CORS should run before custom middleware so that preflight/headers are applied
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경: 모든 오리진 허용
    allow_origin_regex="https?://localhost(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TokenRefreshMiddleware)

app.include_router(user.router)
app.include_router(topic.router)
app.include_router(vote.router)
app.include_router(comment.router)
app.include_router(reply.router)
app.include_router(like.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
