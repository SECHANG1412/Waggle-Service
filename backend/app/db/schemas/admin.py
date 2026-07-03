from pydantic import BaseModel


class AdminDeleteResponse(BaseModel):
    deleted: bool
