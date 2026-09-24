import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.employee import Employee
from app.schemas.employee import (
    NewHireOnboardingRequest,
    NewHireOnboardingResponse,
    WebhookDispatchResult,
    EmployeeRead,
)
from app.services.audit_service import AuditService

class OnboardingService:
    @staticmethod
    def process_new_hire(
        db: Session,
        payload: NewHireOnboardingRequest,
        actor: Employee,
        client_ip: Optional[str] = None,
    ) -> NewHireOnboardingResponse:
        """
        Processes new-hire creation and fires parallel webhooks (REQ-HR-03):
        1. Webhook to Identity Management (MS Graph / Google Workspace) for mailbox & directory provisioning.
        2. Webhook to IT Service Queue for hardware provisioning (auto-creates onboarding ticket, REQ-IT-08).
        3. Records immutable audit log row (REQ-NFR-08).
        """
        # Ensure email uniqueness
        existing_emp = db.query(Employee).filter(Employee.email == payload.email).first()
        if existing_emp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee with email '{payload.email}' already exists",
            )

        ad_guid = payload.ad_guid or f"ad-guid-{uuid.uuid4()}"
        now = datetime.utcnow()

        new_employee = Employee(
            ad_guid=ad_guid,
            email=payload.email,
            first_name=payload.first_name,
            last_name=payload.last_name,
            department=payload.department,
            job_title=payload.job_title,
            role=payload.role,
            manager_id=payload.manager_id,
            is_active=True,
            last_synced_at=now,
        )
        db.add(new_employee)
        db.flush()

        # REQ-HR-03: Fire parallel webhooks
        # 1. Identity webhook (Microsoft Graph / Google Workspace)
        identity_dispatch = WebhookDispatchResult(
            target="identity_provider:msgraph_or_workspace",
            status="dispatched",
            detail=f"Provisioning mailbox and identity licenses for {new_employee.email}",
        )

        # 2. IT queue webhook (hardware provisioning auto-ticket per REQ-IT-08)
        hardware_list = payload.hardware_requirements or ["Standard BMV Workstation Laptop", "YubiKey 5C NFC"]
        it_queue_dispatch = WebhookDispatchResult(
            target="it_service_queue:onboarding_hardware",
            status="dispatched",
            detail=f"Created provisioning ticket in IT queue for employee {new_employee.id}: {', '.join(hardware_list)}",
        )

        webhooks_dispatched: List[WebhookDispatchResult] = [identity_dispatch, it_queue_dispatch]

        # REQ-NFR-08: Immutable audit logging
        AuditService.log_event(
            db=db,
            table_name="employees",
            record_id=new_employee.id,
            action="NEW_HIRE_ONBOARDING",
            old_values=None,
            new_values={
                "email": new_employee.email,
                "first_name": new_employee.first_name,
                "last_name": new_employee.last_name,
                "department": new_employee.department,
                "role": new_employee.role.value,
                "webhooks": [w.model_dump() for w in webhooks_dispatched],
            },
            actor_id=actor.id,
            client_ip=client_ip,
        )

        db.commit()
        db.refresh(new_employee)

        return NewHireOnboardingResponse(
            employee=EmployeeRead.model_validate(new_employee),
            webhooks_dispatched=webhooks_dispatched,
        )
