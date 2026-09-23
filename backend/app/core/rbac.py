from enum import Enum
from typing import List, Set
from fastapi import HTTPException, status

class UserRole(str, Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    HR_ADMIN = "hr_admin"
    IT_AGENT = "it_agent"
    IT_ADMIN = "it_admin"
    FLEET_MANAGER = "fleet_manager"
    ASSET_MANAGER = "asset_manager"
    COMPLIANCE_OFFICER = "compliance_officer"

class Permission(str, Enum):
    # HR Permissions
    LEAVE_READ_OWN = "leave:read_own"
    LEAVE_CREATE_OWN = "leave:create_own"
    LEAVE_TRANSITION_OWN = "leave:transition_own"
    LEAVE_APPROVE_TEAM = "leave:approve_team"
    LEAVE_READ_ALL = "leave:read_all"
    LEAVE_WRITE_ALL = "leave:write_all"
    TEAM_AVAILABILITY_AGGREGATE = "team:availability_aggregate"
    
    # Directory & Notices
    DIRECTORY_READ = "directory:read"
    NOTICE_READ = "notice:read"
    NOTICE_ACKNOWLEDGE = "notice:acknowledge"
    NOTICE_WRITE = "notice:write"
    
    # Audit Logs
    AUDIT_READ = "audit:read"

# Role Permission Mapping strictly compliant with §2 RBAC Matrix
ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    UserRole.EMPLOYEE: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
    },
    UserRole.MANAGER: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.LEAVE_APPROVE_TEAM,
        # Strictly aggregate capacity only; no individual sick-leave access (REQ-HR-02)
        Permission.TEAM_AVAILABILITY_AGGREGATE,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
    },
    UserRole.HR_ADMIN: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.LEAVE_READ_ALL,
        Permission.LEAVE_WRITE_ALL,
        Permission.TEAM_AVAILABILITY_AGGREGATE,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
        Permission.NOTICE_WRITE,
    },
    UserRole.IT_AGENT: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
    },
    UserRole.IT_ADMIN: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
    },
    UserRole.FLEET_MANAGER: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
    },
    UserRole.ASSET_MANAGER: {
        Permission.LEAVE_READ_OWN,
        Permission.LEAVE_CREATE_OWN,
        Permission.LEAVE_TRANSITION_OWN,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
    },
    UserRole.COMPLIANCE_OFFICER: {
        Permission.LEAVE_READ_OWN,
        Permission.DIRECTORY_READ,
        Permission.NOTICE_READ,
        Permission.NOTICE_ACKNOWLEDGE,
        Permission.AUDIT_READ,
    },
}

def verify_role_has_permission(role: UserRole, required_permission: Permission) -> bool:
    role_perms = ROLE_PERMISSIONS.get(role, set())
    return required_permission in role_perms
