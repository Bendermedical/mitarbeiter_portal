from datetime import date, timedelta
from app.models.audit import AuditLogEntry

def test_full_leave_approval_state_machine(client, employee_headers, manager_headers, db_session):
    today = date.today()
    start_date = (today + timedelta(days=10)).isoformat()
    end_date = (today + timedelta(days=14)).isoformat()

    # Step 1: Employee creates Draft leave request (REQ-HR-01)
    create_resp = client.post(
        "/api/v1/hr/leave-requests",
        json={
            "category": "annual_vacation",
            "start_date": start_date,
            "end_date": end_date,
            "notes": "Summer holiday",
        },
        headers=employee_headers,
    )
    assert create_resp.status_code == 201
    leave_data = create_resp.json()
    leave_id = leave_data["id"]
    assert leave_data["status"] == "draft"

    # Step 2: Employee transitions Draft -> Pending Manager
    submit_resp = client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "pending_manager"},
        headers=employee_headers,
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "pending_manager"

    # Step 3: Manager Approves Pending Manager -> Approved
    approve_resp = client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "approved"},
        headers=manager_headers,
    )
    assert approve_resp.status_code == 200
    approved_data = approve_resp.json()
    assert approved_data["status"] == "approved"
    assert approved_data["approver_id"] is not None
    assert approved_data["approved_at"] is not None

    # Step 4: Verify Audit Trail was written per REQ-NFR-08
    audit_entries = (
        db_session.query(AuditLogEntry)
        .filter(AuditLogEntry.table_name == "leave_requests")
        .order_by(AuditLogEntry.created_at.desc())
        .all()
    )
    assert len(audit_entries) >= 3 # CREATE, DRAFT->PENDING, PENDING->APPROVED
    latest_audit = audit_entries[0]
    assert latest_audit.action == "STATE_TRANSITION"
    assert latest_audit.new_values["status"] == "approved"

def test_leave_rejection_requires_reason(client, employee_headers, manager_headers):
    today = date.today()
    start_date = (today + timedelta(days=20)).isoformat()
    end_date = (today + timedelta(days=22)).isoformat()

    create_resp = client.post(
        "/api/v1/hr/leave-requests",
        json={
            "category": "annual_vacation",
            "start_date": start_date,
            "end_date": end_date,
            "notes": "Conference trip",
        },
        headers=employee_headers,
    )
    leave_id = create_resp.json()["id"]

    # Submit
    client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "pending_manager"},
        headers=employee_headers,
    )

    # Attempt rejection without reason -> 400 Bad Request
    fail_reject = client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "rejected"},
        headers=manager_headers,
    )
    assert fail_reject.status_code == 400
    assert "Rejection reason is mandatory" in fail_reject.json()["detail"]

    # Reject with reason -> 200 OK
    ok_reject = client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "rejected", "rejection_reason": "Staff shortage on project milestone"},
        headers=manager_headers,
    )
    assert ok_reject.status_code == 200
    assert ok_reject.json()["status"] == "rejected"
    assert ok_reject.json()["rejection_reason"] == "Staff shortage on project milestone"

def test_invalid_state_transition_is_rejected(client, employee_headers):
    today = date.today()
    create_resp = client.post(
        "/api/v1/hr/leave-requests",
        json={
            "category": "annual_vacation",
            "start_date": (today + timedelta(days=30)).isoformat(),
            "end_date": (today + timedelta(days=32)).isoformat(),
        },
        headers=employee_headers,
    )
    leave_id = create_resp.json()["id"]

    # Attempt invalid jump: Draft -> Approved directly (skipping Pending Manager)
    invalid_resp = client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "approved"},
        headers=employee_headers,
    )
    assert invalid_resp.status_code == 400
    assert "Invalid state transition" in invalid_resp.json()["detail"]
