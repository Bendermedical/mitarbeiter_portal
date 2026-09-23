from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.core.security import get_current_user, require_permission
from app.core.rbac import Permission
from app.models.employee import Employee
from app.schemas.employee import EmployeeDirectoryItem

router = APIRouter()

@router.get("/directory", response_model=List[EmployeeDirectoryItem])
def search_staff_directory(
    query: Optional[str] = Query(None, description="Search by name, job title, or email"),
    department: Optional[str] = Query(None, description="Filter by department"),
    current_user: Employee = Depends(require_permission(Permission.DIRECTORY_READ)),
    db: Session = Depends(get_db),
) -> Any:
    """
    Searchable staff directory synchronized with Active Directory (REQ-HR-05).
    Exposes only standard corporate contact info: Name, Department, Job Title, Email.
    """
    stmt = db.query(Employee).filter(Employee.is_active == True)

    if department:
        stmt = stmt.filter(Employee.department == department)

    if query:
        search_filter = f"%{query}%"
        stmt = stmt.filter(
            or_(
                Employee.first_name.ilike(search_filter),
                Employee.last_name.ilike(search_filter),
                Employee.email.ilike(search_filter),
                Employee.job_title.ilike(search_filter),
            )
        )

    return stmt.order_by(Employee.last_name, Employee.first_name).all()
