from typing import Optional, Any, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class AuditLogEntryRead(BaseModel):
    id: int
    table_name: str
    record_id: UUID
    action: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    actor_id: Optional[UUID] = None
    actor_pseudonym: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
