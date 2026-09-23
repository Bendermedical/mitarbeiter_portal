from datetime import timedelta
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.config import settings
from app.core.security import create_access_token, get_current_user
from app.db.session import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeRead
from app.services.ad_sync_service import ADSyncService

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: EmployeeRead

class OIDCExchangeRequest(BaseModel):
    oid: str
    email: str
    given_name: str
    family_name: str
    department: str
    job_title: str
    groups: list[str] = []

@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Authenticate against staff directory (or Active Directory mock).
    """
    employee = db.query(Employee).filter(Employee.email == payload.email).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found in directory. Ensure Active Directory sync has run.",
        )
    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee account is inactive",
        )

    access_token = create_access_token(subject=str(employee.id))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": employee,
    }

@router.post("/oidc/exchange", response_model=TokenResponse)
def oidc_token_exchange(
    claims: OIDCExchangeRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Path A: NextAuth OpenID Connect Token Exchange & JIT Claim Synchronization.
    """
    claims_dict = claims.model_dump()
    employee = ADSyncService.sync_user_from_oidc_claims(db, claims_dict)
    access_token = create_access_token(subject=str(employee.id))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": employee,
    }

@router.get("/me", response_model=EmployeeRead)
def read_current_user_profile(
    current_user: Employee = Depends(get_current_user),
) -> Any:
    """
    Get profile of currently authenticated staff member.
    """
    return current_user
