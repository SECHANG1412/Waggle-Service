from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)

    model_config = ConfigDict(str_strip_whitespace=True)


class UserCreate(UserBase):
    pass


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    email: str | None = None
    username: str | None = None
    password: str | None = None


class UserInDB(BaseModel):
    user_id: int
    email: str
    username: str
    password: str
    is_admin: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    user_id: int
    email: str
    username: str
    is_admin: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserStats(BaseModel):
    topics: int
    votes: int
    likes: int


class UserActivity(BaseModel):
    topic_id: int
    type: str
    title: str
    created_at: datetime


class UserHiddenContent(BaseModel):
    type: Literal["topic", "comment"]
    item_id: int
    topic_id: int
    title: str
    content: str | None = None
    hidden_at: datetime | None = None
