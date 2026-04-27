from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


InquiryStatus = Literal["pending", "in_progress", "resolved"]


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    title: str = Field(..., min_length=1, max_length=150)
    content: str = Field(..., min_length=1, max_length=2000)


class InquiryRead(InquiryCreate):
    inquiry_id: int
    status: InquiryStatus = "pending"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


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
