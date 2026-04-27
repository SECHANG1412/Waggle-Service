from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminActionLogRead(BaseModel):
    log_id: int
    admin_user_id: int
    action: str
    target_type: str
    target_id: int
    before_value: dict
    after_value: dict
    reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
