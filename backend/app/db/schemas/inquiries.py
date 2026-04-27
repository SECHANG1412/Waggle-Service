from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


InquiryStatus = Literal["pending", "in_progress", "resolved"]


class InquiryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    content: str = Field(..., min_length=1, max_length=2000)


class InquiryRead(BaseModel):
    inquiry_id: int
    user_id: int | None = None
    name: str
    email: EmailStr
    title: str
    content: str
    status: InquiryStatus = "pending"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MyInquiryRead(InquiryRead):
    latest_reason: str | None = None


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus
    reason: str = Field(..., min_length=1, max_length=500)

    @field_validator("reason")
    @classmethod
    def reason_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("reason must not be blank.")
        return stripped
