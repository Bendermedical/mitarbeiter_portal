import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.employee import Employee, ADSecurityGroupMapping
from app.core.rbac import UserRole

# Standard BMV Active Directory Security Group mappings
DEFAULT_AD_MAPPINGS = [
    {
        "ad_group_name": "SG-BMV-HR-Admins",
        "ad_group_sid_or_oid": "ad-group-hr-admins-oid-001",
        "mapped_role": UserRole.HR_ADMIN,
        "description": "BMV Human Resources Administration",
    },
    {
        "ad_group_name": "SG-BMV-Managers",
        "ad_group_sid_or_oid": "ad-group-managers-oid-002",
        "mapped_role": UserRole.MANAGER,
        "description": "BMV Department Team Leads and Managers",
    },
    {
        "ad_group_name": "SG-BMV-IT-Admins",
        "ad_group_sid_or_oid": "ad-group-it-admins-oid-003",
        "mapped_role": UserRole.IT_ADMIN,
        "description": "BMV IT Systems Administration",
    },
    {
        "ad_group_name": "SG-BMV-IT-Agents",
        "ad_group_sid_or_oid": "ad-group-it-agents-oid-004",
        "mapped_role": UserRole.IT_AGENT,
        "description": "BMV IT Service Desk Support Agents",
    },
    {
        "ad_group_name": "SG-BMV-Compliance",
        "ad_group_sid_or_oid": "ad-group-compliance-oid-005",
        "mapped_role": UserRole.COMPLIANCE_OFFICER,
        "description": "BMV Regulatory and Works Council Officers",
    },
    {
        "ad_group_name": "SG-BMV-All-Employees",
        "ad_group_sid_or_oid": "ad-group-employees-oid-006",
        "mapped_role": UserRole.EMPLOYEE,
        "description": "All Active BMV Staff Members",
    },
]

class ADSyncService:
    @staticmethod
    def ensure_default_ad_mappings(db: Session):
        """Ensure system AD security group mappings are seeded."""
        for mapping in DEFAULT_AD_MAPPINGS:
            existing = (
                db.query(ADSecurityGroupMapping)
                .filter(ADSecurityGroupMapping.ad_group_name == mapping["ad_group_name"])
                .first()
            )
            if not existing:
                entry = ADSecurityGroupMapping(**mapping)
                db.add(entry)
        db.commit()

    @staticmethod
    def resolve_role_from_ad_groups(db: Session, ad_groups: List[str]) -> UserRole:
        """
        Translates AD group names/OIDs to internal UserRole based on priority hierarchy.
        Hierarchy: HR_ADMIN > IT_ADMIN > COMPLIANCE_OFFICER > MANAGER > IT_AGENT > EMPLOYEE
        """
        mappings = db.query(ADSecurityGroupMapping).all()
        mapping_dict = {m.ad_group_name: m.mapped_role for m in mappings}
        mapping_dict.update({m.ad_group_sid_or_oid: m.mapped_role for m in mappings})

        matched_roles = set()
        for g in ad_groups:
            if g in mapping_dict:
                matched_roles.add(mapping_dict[g])

        priority_order = [
            UserRole.HR_ADMIN,
            UserRole.IT_ADMIN,
            UserRole.COMPLIANCE_OFFICER,
            UserRole.MANAGER,
            UserRole.FLEET_MANAGER,
            UserRole.ASSET_MANAGER,
            UserRole.IT_AGENT,
            UserRole.EMPLOYEE,
        ]

        for r in priority_order:
            if r in matched_roles:
                return r
        return UserRole.EMPLOYEE

    @classmethod
    def sync_user_from_oidc_claims(
        cls,
        db: Session,
        claims: Dict[str, Any],
    ) -> Employee:
        """
        Path A: Just-In-Time (JIT) provisioning/refresh on OIDC authentication.
        """
        cls.ensure_default_ad_mappings(db)

        ad_guid = claims.get("oid") or claims.get("sub")
        email = claims.get("email") or claims.get("upn") or f"{ad_guid}@bendermedical.de"
        first_name = claims.get("given_name") or claims.get("first_name", "Staff")
        last_name = claims.get("family_name") or claims.get("last_name", "Member")
        department = claims.get("department", "Production")
        job_title = claims.get("jobTitle") or claims.get("job_title", "Medical Device Specialist")
        ad_groups = claims.get("groups", [])
        if isinstance(ad_groups, str):
            ad_groups = [ad_groups]

        role = cls.resolve_role_from_ad_groups(db, ad_groups)

        employee = db.query(Employee).filter(Employee.ad_guid == ad_guid).first()
        if not employee:
            employee = db.query(Employee).filter(Employee.email == email).first()

        now = datetime.utcnow()
        if not employee:
            employee = Employee(
                ad_guid=ad_guid,
                email=email,
                first_name=first_name,
                last_name=last_name,
                department=department,
                job_title=job_title,
                role=role,
                ad_groups=ad_groups,
                is_active=True,
                last_synced_at=now,
            )
            db.add(employee)
        else:
            # Refresh fields synced from AD
            employee.ad_guid = ad_guid
            employee.first_name = first_name
            employee.last_name = last_name
            employee.department = department
            employee.job_title = job_title
            employee.role = role
            employee.ad_groups = ad_groups
            employee.last_synced_at = now

        db.commit()
        db.refresh(employee)
        return employee

    @classmethod
    def seed_demo_directory(cls, db: Session):
        """Seed initial BMV staff directory for local dev & testing."""
        cls.ensure_default_ad_mappings(db)

        demo_staff = [
            {
                "ad_guid": "ad-guid-manager-anna-schmidt",
                "email": "anna.schmidt@bendermedical.de",
                "first_name": "Anna",
                "last_name": "Schmidt",
                "department": "Quality Assurance",
                "job_title": "Head of QA & Medical Compliance",
                "role": UserRole.MANAGER,
                "ad_groups": ["SG-BMV-Managers", "SG-BMV-All-Employees"],
            },
            {
                "ad_guid": "ad-guid-employee-thomas-weber",
                "email": "thomas.weber@bendermedical.de",
                "first_name": "Thomas",
                "last_name": "Weber",
                "department": "Quality Assurance",
                "job_title": "Senior QA Engineer",
                "role": UserRole.EMPLOYEE,
                "ad_groups": ["SG-BMV-All-Employees"],
            },
            {
                "ad_guid": "ad-guid-employee-elena-becker",
                "email": "elena.becker@bendermedical.de",
                "first_name": "Elena",
                "last_name": "Becker",
                "department": "Quality Assurance",
                "job_title": "QA Test Specialist",
                "role": UserRole.EMPLOYEE,
                "ad_groups": ["SG-BMV-All-Employees"],
            },
            {
                "ad_guid": "ad-guid-hr-maria-kraus",
                "email": "maria.kraus@bendermedical.de",
                "first_name": "Maria",
                "last_name": "Kraus",
                "department": "Human Resources",
                "job_title": "HR Director",
                "role": UserRole.HR_ADMIN,
                "ad_groups": ["SG-BMV-HR-Admins", "SG-BMV-All-Employees"],
            },
            {
                "ad_guid": "ad-guid-it-markus-fischer",
                "email": "markus.fischer@bendermedical.de",
                "first_name": "Markus",
                "last_name": "Fischer",
                "department": "IT Operations",
                "job_title": "IT Systems Administrator",
                "role": UserRole.IT_ADMIN,
                "ad_groups": ["SG-BMV-IT-Admins", "SG-BMV-All-Employees"],
            },
        ]

        created_employees = {}
        for s in demo_staff:
            emp = db.query(Employee).filter(Employee.ad_guid == s["ad_guid"]).first()
            if not emp:
                emp = Employee(**s)
                db.add(emp)
                db.flush()
            created_employees[s["email"]] = emp

        # Link reporting hierarchy (Anna Schmidt manages Thomas and Elena)
        manager = created_employees.get("anna.schmidt@bendermedical.de")
        if manager:
            for report_email in ["thomas.weber@bendermedical.de", "elena.becker@bendermedical.de"]:
                report = created_employees.get(report_email)
                if report and report.manager_id != manager.id:
                    report.manager_id = manager.id

        db.commit()
