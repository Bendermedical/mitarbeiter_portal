from datetime import date
from app.models.employee import Employee
from app.models.audit import AuditLogEntry

def test_new_hire_onboarding_dispatches_parallel_webhooks(client, hr_admin_headers, employee_headers, db_session):
    """
    REQ-HR-03: On new-hire creation, fires parallel webhooks:
    - Identity provisioning (MS Graph / Google Workspace)
    - IT queue hardware provisioning (REQ-IT-08 auto-ticket)
    REQ-NFR-08: Writes immutable audit row.
    RBAC §2: Only HR Admin can trigger onboarding.
    """
    new_hire_data = {
        "first_name": "Lukas",
        "last_name": "Schneider",
        "email": "lukas.schneider@bendermedical.de",
        "department": "Production",
        "job_title": "Cleanroom Assembly Specialist",
        "hardware_requirements": ["Standard Ruggedized Laptop", "Barcode Scanner", "Cleanroom Badge"],
    }

    # Non-HR Admin employee cannot trigger onboarding (RBAC §2)
    unauth_resp = client.post(
        "/api/v1/hr/onboarding/new-hire",
        json=new_hire_data,
        headers=employee_headers,
    )
    assert unauth_resp.status_code == 403

    # HR Admin triggers onboarding
    resp = client.post(
        "/api/v1/hr/onboarding/new-hire",
        json=new_hire_data,
        headers=hr_admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()

    # Employee record created
    emp = data["employee"]
    assert emp["email"] == "lukas.schneider@bendermedical.de"
    assert emp["first_name"] == "Lukas"
    assert emp["department"] == "Production"

    # Parallel webhooks dispatched
    webhooks = data["webhooks_dispatched"]
    assert len(webhooks) == 2
    targets = [w["target"] for w in webhooks]
    assert "identity_provider:msgraph_or_workspace" in targets
    assert "it_service_queue:onboarding_hardware" in targets

    # Audit row written (REQ-NFR-08)
    audit = (
        db_session.query(AuditLogEntry)
        .filter(AuditLogEntry.table_name == "employees")
        .filter(AuditLogEntry.action == "NEW_HIRE_ONBOARDING")
        .first()
    )
    assert audit is not None
    assert audit.new_values["email"] == "lukas.schneider@bendermedical.de"
