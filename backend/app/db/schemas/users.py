from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    email: str
    username: str
    password: str


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
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    user_id: int
    email: str
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserStats(BaseModel):
    topics: int
    votes: int
    likes: int


class UserActivity(BaseModel):
    type: str
    title: str
    created_at: datetime
