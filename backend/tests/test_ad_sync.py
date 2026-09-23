from app.core.rbac import UserRole

def test_oidc_claims_jit_sync_and_role_resolution(client, db_session):
    # Simulate NextAuth OpenID Connect Token Exchange with AD Security Groups
    claims_payload = {
        "oid": "ad-guid-newhire-lukas-meier",
        "email": "lukas.meier@bendermedical.de",
        "given_name": "Lukas",
        "family_name": "Meier",
        "department": "IT Operations",
        "job_title": "Junior Support Specialist",
        "groups": ["SG-BMV-IT-Agents", "SG-BMV-All-Employees"],
    }

    exchange_resp = client.post("/api/v1/auth/oidc/exchange", json=claims_payload)
    assert exchange_resp.status_code == 200
    data = exchange_resp.json()
    assert "access_token" in data
    user = data["user"]
    assert user["email"] == "lukas.meier@bendermedical.de"
    # Verify group SG-BMV-IT-Agents was mapped to UserRole.IT_AGENT
    assert user["role"] == UserRole.IT_AGENT.value
    assert user["department"] == "IT Operations"

def test_staff_directory_search(client, employee_headers):
    # REQ-HR-05: Searchable staff directory synced with AD
    resp = client.get("/api/v1/hr/directory?department=Quality Assurance", headers=employee_headers)
    assert resp.status_code == 200
    staff_list = resp.json()
    assert len(staff_list) >= 2
    for member in staff_list:
        assert member["department"] == "Quality Assurance"
        assert "first_name" in member
        assert "last_name" in member
        assert "email" in member
        assert "job_title" in member
