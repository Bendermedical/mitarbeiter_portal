from datetime import datetime, date
from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.leave import LeaveRequest, LeaveStatus, LeaveCategory
from app.models.employee import Employee
from app.core.rbac import UserRole, Permission, verify_role_has_permission
from app.schemas.leave import LeaveRequestCreate, LeaveRequestTransition
from app.services.audit_service import AuditService

VALID_TRANSITIONS = {
    LeaveStatus.DRAFT: {LeaveStatus.PENDING_MANAGER, LeaveStatus.CANCELLED},
    LeaveStatus.PENDING_MANAGER: {LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.CANCELLED},
    LeaveStatus.APPROVED: {LeaveStatus.CANCELLED},
    LeaveStatus.REJECTED: set(),
    LeaveStatus.CANCELLED: set(),
}

class LeaveService:
    @staticmethod
    def create_leave_request(
        db: Session,
        employee_id: UUID,
        payload: LeaveRequestCreate,
        client_ip: Optional[str] = None,
    ) -> LeaveRequest:
        leave_req = LeaveRequest(
            employee_id=employee_id,
            category=payload.category,
            start_date=payload.start_date,
            end_date=payload.end_date,
            notes=payload.notes,
            status=LeaveStatus.DRAFT,
        )
        db.add(leave_req)
        db.flush()

        AuditService.log_event(
            db=db,
            table_name="leave_requests",
            record_id=leave_req.id,
            action="CREATE",
            old_values=None,
            new_values={
                "status": leave_req.status.value,
                "category": leave_req.category.value,
                "start_date": leave_req.start_date,
                "end_date": leave_req.end_date,
            },
            actor_id=employee_id,
            client_ip=client_ip,
        )
        db.commit()
        db.refresh(leave_req)
        return leave_req

    @staticmethod
    def get_employee_leave_requests(
        db: Session,
        employee_id: UUID,
    ) -> List[LeaveRequest]:
        return (
            db.query(LeaveRequest)
            .filter(LeaveRequest.employee_id == employee_id)
            .order_by(LeaveRequest.created_at.desc())
            .all()
        )

    @staticmethod
    def transition_leave_request(
        db: Session,
        leave_id: UUID,
        payload: LeaveRequestTransition,
        current_user: Employee,
        client_ip: Optional[str] = None,
    ) -> LeaveRequest:
        leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
        if not leave_req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave request not found",
            )

        current_status = leave_req.status
        target_status = payload.target_status

        # Validate state machine transition
        allowed_targets = VALID_TRANSITIONS.get(current_status, set())
        if target_status not in allowed_targets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid state transition from {current_status.value} to {target_status.value}. Allowed: {[s.value for s in allowed_targets]}",
            )

        # Validate Authorization per RBAC & Ownership
        is_owner = leave_req.employee_id == current_user.id
        is_hr_admin = current_user.role == UserRole.HR_ADMIN
        is_manager = current_user.role in {UserRole.MANAGER, UserRole.HR_ADMIN}

        # Transition-specific authorization rules:
        if target_status == LeaveStatus.PENDING_MANAGER:
            # Only owner can submit draft for approval
            if not is_owner and not is_hr_admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the requesting employee can submit a draft for manager approval",
                )
        elif target_status in {LeaveStatus.APPROVED, LeaveStatus.REJECTED}:
            # Only manager or HR Admin can approve or reject
            if not is_manager:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Manager or HR Admin role required to approve or reject leave requests",
                )
            if is_owner and not is_hr_admin:
                # Employee cannot approve their own leave request
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Employees cannot approve or reject their own leave requests",
                )
            if target_status == LeaveStatus.REJECTED and not payload.rejection_reason:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Rejection reason is mandatory when rejecting a leave request",
                )
        elif target_status == LeaveStatus.CANCELLED:
            # Owner or HR Admin can cancel
            if not is_owner and not is_hr_admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the employee or HR Admin can cancel a leave request",
                )

        old_state = {
            "status": leave_req.status.value,
            "approver_id": str(leave_req.approver_id) if leave_req.approver_id else None,
            "rejection_reason": leave_req.rejection_reason,
        }

        # Apply state changes
        leave_req.status = target_status
        if target_status == LeaveStatus.APPROVED:
            leave_req.approver_id = current_user.id
            leave_req.approved_at = datetime.utcnow()
        elif target_status == LeaveStatus.REJECTED:
            leave_req.approver_id = current_user.id
            leave_req.rejection_reason = payload.rejection_reason

        db.flush()

        new_state = {
            "status": leave_req.status.value,
            "approver_id": str(leave_req.approver_id) if leave_req.approver_id else None,
            "rejection_reason": leave_req.rejection_reason,
        }

        # Write immutable audit record
        AuditService.log_event(
            db=db,
            table_name="leave_requests",
            record_id=leave_req.id,
            action="STATE_TRANSITION",
            old_values=old_state,
            new_values=new_state,
            actor_id=current_user.id,
            client_ip=client_ip,
        )

        db.commit()
        db.refresh(leave_req)
        return leave_req
