from datetime import datetime
from pydantic import BaseModel, ConfigDict

class VoteBase(BaseModel):
    topic_id: int
    vote_index: int

class VoteCreate(VoteBase):
    pass

class VoteInDB(VoteBase):
    vote_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VoteRead(VoteInDB):
    pass
