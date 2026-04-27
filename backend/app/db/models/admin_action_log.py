from __future__ import annotations

from datetime import datetime

from sqlalchemy import ForeignKey, JSON, String, TIMESTAMP, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AdminActionLog(Base):
    __tablename__ = "admin_action_logs"

    log_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    admin_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    target_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    target_id: Mapped[int] = mapped_column(nullable=False, index=True)
    before_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    after_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )
