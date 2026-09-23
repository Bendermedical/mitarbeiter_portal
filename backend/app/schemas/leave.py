from typing import Optional
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, model_validator, ConfigDict
from app.models.leave import LeaveStatus, LeaveCategory

class LeaveRequestBase(BaseModel):
    category: LeaveCategory
    start_date: date
    end_date: date
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestTransition(BaseModel):
    target_status: LeaveStatus
    rejection_reason: Optional[str] = None

class LeaveRequestRead(LeaveRequestBase):
    id: UUID
    employee_id: UUID
    status: LeaveStatus
    approver_id: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Works Council & RBAC compliant aggregate availability response (REQ-HR-02, REQ-NFR-01)
class TeamAvailabilityAggregateResponse(BaseModel):
    department: str
    target_date: date
    total_members: int
    present_count: int
    scheduled_absent_count: int
    coverage_ratio: float
