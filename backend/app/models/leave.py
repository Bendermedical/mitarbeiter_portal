import uuid
from enum import Enum
from datetime import datetime, date
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, Enum as SQLEnum, CheckConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class LeaveStatus(str, Enum):
    DRAFT = "draft"
    PENDING_MANAGER = "pending_manager"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class LeaveCategory(str, Enum):
    ANNUAL_VACATION = "annual_vacation"
    SICK_LEAVE = "sick_leave"
    SPECIAL_LEAVE = "special_leave"
    UNPAID_LEAVE = "unpaid_leave"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="chk_leave_dates"),
    )

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(Uuid(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(SQLEnum(LeaveCategory, name="leave_category_enum"), nullable=False)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    status = Column(SQLEnum(LeaveStatus, name="leave_status_enum"), nullable=False, default=LeaveStatus.DRAFT, index=True)
    notes = Column(Text, nullable=True)
    
    approver_id = Column(Uuid(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="leave_requests")
    approver = relationship("Employee", foreign_keys=[approver_id])
