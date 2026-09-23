import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.core.rbac import UserRole

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_guid = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    job_title = Column(String(100), nullable=False)
    manager_id = Column(Uuid(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    role = Column(SQLEnum(UserRole, name="user_role_enum"), nullable=False, default=UserRole.EMPLOYEE)
    ad_groups = Column(JSON().with_variant(ARRAY(String), "postgresql"), nullable=False, default=list)
    is_active = Column(Boolean, nullable=False, default=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Self-referential relationship for manager hierarchy
    manager = relationship("Employee", remote_side=[id], backref="direct_reports")
    
    # Relationships
    leave_requests = relationship("LeaveRequest", back_populates="employee", foreign_keys="LeaveRequest.employee_id")
    notice_acknowledgments = relationship("NoticeAcknowledgment", back_populates="employee")

class ADSecurityGroupMapping(Base):
    __tablename__ = "ad_security_group_mappings"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_group_name = Column(String(255), unique=True, nullable=False)
    ad_group_sid_or_oid = Column(String(64), unique=True, nullable=False)
    mapped_role = Column(SQLEnum(UserRole, name="user_role_enum"), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
