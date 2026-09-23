from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class NoticePostBase(BaseModel):
    title: str
    content: str
    is_mandatory_ack: bool = False

class NoticePostCreate(NoticePostBase):
    pass

class NoticePostRead(NoticePostBase):
    id: UUID
    author_id: UUID
    published_at: datetime
    archived_at: Optional[datetime] = None
    has_acknowledged: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class NoticeAcknowledgeRequest(BaseModel):
    pass

class NoticeAcknowledgmentRead(BaseModel):
    id: UUID
    post_id: UUID
    employee_id: UUID
    acknowledged_at: datetime

    model_config = ConfigDict(from_attributes=True)
