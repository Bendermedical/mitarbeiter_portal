from app.models.audit import AuditLogEntry

def test_mandatory_compliance_notice_acknowledgment(client, employee_headers, hr_admin_headers, db_session):
    # Step 1: HR Admin creates a compliance-critical policy notice (REQ-HR-04)
    create_resp = client.post(
        "/api/v1/hr/notices",
        json={
            "title": "ISO 13485 QMS Policy Revision v4.2",
            "content": "All employees in medical manufacturing must review the revised SOP-042.",
            "is_mandatory_ack": True,
        },
        headers=hr_admin_headers,
    )
    assert create_resp.status_code == 201
    post_data = create_resp.json()
    post_id = post_data["id"]
    assert post_data["is_mandatory_ack"] is True

    # Step 2: Employee views notice list, sees unacknowledged status
    list_resp = client.get("/api/v1/hr/notices", headers=employee_headers)
    assert list_resp.status_code == 200
    posts = list_resp.json()
    target_post = next((p for p in posts if p["id"] == post_id), None)
    assert target_post is not None
    assert target_post["has_acknowledged"] is False

    # Step 3: Employee records mandatory acknowledgment
    ack_resp = client.post(
        f"/api/v1/hr/notices/{post_id}/acknowledge",
        headers=employee_headers,
    )
    assert ack_resp.status_code == 200
    ack_data = ack_resp.json()
    assert ack_data["post_id"] == post_id
    assert ack_data["acknowledged_at"] is not None

    # Step 4: Verify notice list now reflects acknowledged status
    list_resp_after = client.get("/api/v1/hr/notices", headers=employee_headers)
    target_post_after = next((p for p in list_resp_after.json() if p["id"] == post_id), None)
    assert target_post_after["has_acknowledged"] is True

    # Step 5: Verify immutable Audit Log Entry exists for compliance audit
    audit = (
        db_session.query(AuditLogEntry)
        .filter(
            AuditLogEntry.table_name == "notice_acknowledgments",
            AuditLogEntry.action == "ACKNOWLEDGE",
        )
        .first()
    )
    assert audit is not None
    assert audit.new_values["title"] == "ISO 13485 QMS Policy Revision v4.2"
