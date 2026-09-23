from datetime import date
from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user, require_permission
from app.core.rbac import Permission, UserRole
from app.models.employee import Employee
from app.schemas.leave import (
    LeaveRequestCreate,
    LeaveRequestRead,
    LeaveRequestTransition,
    TeamAvailabilityAggregateResponse,
)
from app.schemas.notice import (
    NoticePostCreate,
    NoticePostRead,
    NoticeAcknowledgmentRead,
)
from app.services.leave_service import LeaveService
from app.services.availability_service import AvailabilityService
from app.services.notice_service import NoticeService

router = APIRouter()

# --- Leave Requests (REQ-HR-01) ---

@router.post("/leave-requests", response_model=LeaveRequestRead, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    payload: LeaveRequestCreate,
    request: Request,
    current_user: Employee = Depends(require_permission(Permission.LEAVE_CREATE_OWN)),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create a new leave request in DRAFT status (REQ-HR-01).
    """
    client_ip = request.client.host if request.client else None
    return LeaveService.create_leave_request(
        db=db,
        employee_id=current_user.id,
        payload=payload,
        client_ip=client_ip,
    )

@router.get("/leave-requests", response_model=List[LeaveRequestRead])
def get_my_leave_requests(
    current_user: Employee = Depends(require_permission(Permission.LEAVE_READ_OWN)),
    db: Session = Depends(get_db),
) -> Any:
    """
    List leave requests for the currently authenticated employee.
    """
    return LeaveService.get_employee_leave_requests(
        db=db,
        employee_id=current_user.id,
    )

@router.post("/leave-requests/{leave_id}/transition", response_model=LeaveRequestRead)
def transition_leave_request_status(
    leave_id: UUID,
    payload: LeaveRequestTransition,
    request: Request,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Execute a state transition in the leave state machine (REQ-HR-01).
    Enforces authorization rules and writes to immutable audit log (REQ-NFR-08).
    """
    client_ip = request.client.host if request.client else None
    return LeaveService.transition_leave_request(
        db=db,
        leave_id=leave_id,
        payload=payload,
        current_user=current_user,
        client_ip=client_ip,
    )

# --- Team Availability Aggregate (REQ-HR-02, REQ-NFR-01) ---

@router.get(
    "/team-availability",
    response_model=TeamAvailabilityAggregateResponse,
)
def get_team_availability(
    department: Optional[str] = Query(None, description="Department name (defaults to current user's department)"),
    target_date: Optional[date] = Query(None, description="Date to query availability for (defaults to today)"),
    current_user: Employee = Depends(require_permission(Permission.TEAM_AVAILABILITY_AGGREGATE)),
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve team availability headcount aggregate for a department (REQ-HR-02).
    
    COMPLIANCE ENFORCEMENT:
    - Never exposes individual sick-leave frequency or names.
    - Prohibits individual performance / velocity surveillance (REQ-NFR-01).
    """
    target_dept = department or current_user.department
    query_date = target_date or date.today()

    # Managers can only view their own department's aggregate unless HR Admin
    if current_user.role == UserRole.MANAGER and target_dept != current_user.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers may only view aggregate availability for their own department",
        )

    return AvailabilityService.get_team_availability_aggregate(
        db=db,
        department=target_dept,
        target_date=query_date,
    )

# --- Compliance Notice Board (REQ-HR-04) ---

@router.get("/notices", response_model=List[NoticePostRead])
def list_notice_board_posts(
    current_user: Employee = Depends(require_permission(Permission.NOTICE_READ)),
    db: Session = Depends(get_db),
) -> Any:
    """
    List company notice board posts with acknowledgment status for compliance posts.
    """
    return NoticeService.list_notices_for_employee(
        db=db,
        employee_id=current_user.id,
    )

@router.post("/notices", response_model=NoticePostRead, status_code=status.HTTP_201_CREATED)
def create_notice_board_post(
    payload: NoticePostCreate,
    request: Request,
    current_user: Employee = Depends(require_permission(Permission.NOTICE_WRITE)),
    db: Session = Depends(get_db),
) -> Any:
    """
    Publish a notice board post (HR Admin only).
    """
    client_ip = request.client.host if request.client else None
    post = NoticeService.create_notice(
        db=db,
        author=current_user,
        payload=payload,
        client_ip=client_ip,
    )
    return NoticePostRead(
        id=post.id,
        title=post.title,
        content=post.content,
        author_id=post.author_id,
        is_mandatory_ack=post.is_mandatory_ack,
        published_at=post.published_at,
        archived_at=post.archived_at,
        has_acknowledged=False if post.is_mandatory_ack else None,
    )

@router.post("/notices/{post_id}/acknowledge", response_model=NoticeAcknowledgmentRead)
def acknowledge_compliance_notice(
    post_id: UUID,
    request: Request,
    current_user: Employee = Depends(require_permission(Permission.NOTICE_ACKNOWLEDGE)),
    db: Session = Depends(get_db),
) -> Any:
    """
    Record an immutable, timestamped 'Read & Acknowledged' compliance record (REQ-HR-04).
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    return NoticeService.acknowledge_notice(
        db=db,
        post_id=post_id,
        employee=current_user,
        client_ip=client_ip,
    )
