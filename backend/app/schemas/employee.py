from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict
from app.core.rbac import UserRole

class EmployeeBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    department: str
    job_title: str
    role: UserRole = UserRole.EMPLOYEE

class EmployeeCreate(EmployeeBase):
    ad_guid: str
    manager_id: Optional[UUID] = None
    ad_groups: List[str] = []

class EmployeeRead(EmployeeBase):
    id: UUID
    ad_guid: str
    manager_id: Optional[UUID] = None
    ad_groups: List[str] = []
    is_active: bool
    last_synced_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmployeeDirectoryItem(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    department: str
    job_title: str

    model_config = ConfigDict(from_attributes=True)

class ADSecurityGroupMappingBase(BaseModel):
    ad_group_name: str
    ad_group_sid_or_oid: str
    mapped_role: UserRole
    description: Optional[str] = None

class ADSecurityGroupMappingRead(ADSecurityGroupMappingBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
