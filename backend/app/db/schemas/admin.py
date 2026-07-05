from pydantic import BaseModel


class AdminDeleteResponse(BaseModel):
    deleted: bool


class AdminMeResponse(BaseModel):
    user_id: int
    is_admin: bool
