from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import HTTPException, status
from app.models.employee import Employee
from app.models.leave import LeaveRequest, LeaveStatus
from app.schemas.leave import TeamAvailabilityAggregateResponse

class AvailabilityService:
    @staticmethod
    def get_team_availability_aggregate(
        db: Session,
        department: str,
        target_date: date,
    ) -> TeamAvailabilityAggregateResponse:
        """
        Works Council & RBAC compliant aggregate availability query (REQ-HR-02, REQ-NFR-01).
        
        Strict Privacy Constraints:
        - Calculates solely numeric headcount counts.
        - NEVER returns individual employee identities, names, or individual sick leave history.
        - Does NOT expose individual leave categories/diagnoses to managers.
        """
        # Count total active members in department
        total_members = (
            db.query(func.count(Employee.id))
            .filter(
                Employee.department == department,
                Employee.is_active == True,
            )
            .scalar()
        ) or 0

        if total_members == 0:
            return TeamAvailabilityAggregateResponse(
                department=department,
                target_date=target_date,
                total_members=0,
                present_count=0,
                scheduled_absent_count=0,
                coverage_ratio=0.0,
            )

        # Count active members in department with approved or pending leave on target_date
        scheduled_absent_count = (
            db.query(func.count(func.distinct(LeaveRequest.employee_id)))
            .join(Employee, Employee.id == LeaveRequest.employee_id)
            .filter(
                Employee.department == department,
                Employee.is_active == True,
                LeaveRequest.status.in_([LeaveStatus.APPROVED, LeaveStatus.PENDING_MANAGER]),
                LeaveRequest.start_date <= target_date,
                LeaveRequest.end_date >= target_date,
            )
            .scalar()
        ) or 0

        # Present count
        present_count = max(0, total_members - scheduled_absent_count)
        coverage_ratio = round(present_count / total_members, 2) if total_members > 0 else 0.0

        return TeamAvailabilityAggregateResponse(
            department=department,
            target_date=target_date,
            total_members=total_members,
            present_count=present_count,
            scheduled_absent_count=scheduled_absent_count,
            coverage_ratio=coverage_ratio,
        )
