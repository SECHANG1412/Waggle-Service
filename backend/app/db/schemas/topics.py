from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator

TOPIC_TITLE_MAX_LENGTH = 80
TOPIC_OPTION_COUNT = 2


class TopicBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=TOPIC_TITLE_MAX_LENGTH)
    category: str = "기타"
    vote_options: list[str] = Field(..., min_length=TOPIC_OPTION_COUNT, max_length=TOPIC_OPTION_COUNT)
    description: str | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("title must not be blank.")
        return stripped

    @field_validator("vote_options")
    @classmethod
    def check_vote_options_length(cls, value):
        if len(value) != TOPIC_OPTION_COUNT:
            raise ValueError("vote_options must contain exactly 2 options.")
        return value


class TopicCreate(TopicBase):
    pass


class TopicInDB(TopicBase):
    topic_id: int
    created_at: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class TopicRead(TopicInDB):
    author_name: str | None = None
    has_voted: bool = False
    user_vote_index: int | None = None
    vote_results: list[int] = Field(default_factory=list)
    total_vote: int = 0
    like_count: int = 0
    has_liked: bool = False
    is_pinned: bool = False
    comment_count: int = 0


class TopicAdminRead(TopicInDB):
    is_hidden: bool = False
    hidden_at: datetime | None = None
    hidden_by: int | None = None


class TopicModerationUpdate(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)

    @field_validator("reason")
    @classmethod
    def reason_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("reason must not be blank.")
        return stripped
