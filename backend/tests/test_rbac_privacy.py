from datetime import date, timedelta

def test_team_availability_returns_aggregate_without_individual_records(
    client,
    employee_headers,
    manager_headers,
):
    """
    REQ-HR-02 & REQ-NFR-01: Manager dashboards show ONLY aggregate team availability.
    Individual sick-leave frequency, diagnoses, or individual employee records are NEVER exposed.
    """
    today = date.today()

    # Step 1: Create and approve a leave request for Thomas Weber (QA Dept)
    create_resp = client.post(
        "/api/v1/hr/leave-requests",
        json={
            "category": "sick_leave",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=2)).isoformat(),
            "notes": "Medical certificate submitted to HR",
        },
        headers=employee_headers,
    )
    assert create_resp.status_code == 201
    leave_id = create_resp.json()["id"]

    # Transition to pending
    client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "pending_manager"},
        headers=employee_headers,
    )

    # Step 2: Manager queries team availability aggregate
    resp = client.get(
        f"/api/v1/hr/team-availability?department=Quality Assurance&target_date={today.isoformat()}",
        headers=manager_headers,
    )
    assert resp.status_code == 200
    data = resp.json()

    # Verify response schema contains ONLY aggregate headcount metrics
    assert "total_members" in data
    assert "present_count" in data
    assert "scheduled_absent_count" in data
    assert "coverage_ratio" in data

    # STRICT PRIVACY & WORKS COUNCIL COMPLIANCE CHECKS:
    # 1. No individual identifiers
    assert "employee_id" not in data
    assert "employees" not in data
    assert "names" not in data
    assert "history" not in data
    # 2. No sick leave diagnosis or category details
    assert "sick_leave" not in data
    assert "category" not in data
    assert "notes" not in data

    assert data["total_members"] >= 3
    assert data["scheduled_absent_count"] >= 1
    assert data["present_count"] == data["total_members"] - data["scheduled_absent_count"]

def test_employee_cannot_approve_own_leave(client, employee_headers):
    today = date.today()
    create_resp = client.post(
        "/api/v1/hr/leave-requests",
        json={
            "category": "annual_vacation",
            "start_date": (today + timedelta(days=40)).isoformat(),
            "end_date": (today + timedelta(days=45)).isoformat(),
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

    # Employee tries to approve own request -> 403 Forbidden
    approve_attempt = client.post(
        f"/api/v1/hr/leave-requests/{leave_id}/transition",
        json={"target_status": "approved"},
        headers=employee_headers,
    )
    assert approve_attempt.status_code == 403
