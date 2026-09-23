-- 01-init.sql: PostgreSQL Initial Schema for BMV Staff Portal (Gate 0)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role_enum AS ENUM (
    'employee',
    'manager',
    'hr_admin',
    'it_agent',
    'it_admin',
    'fleet_manager',
    'asset_manager',
    'compliance_officer'
);

CREATE TYPE leave_status_enum AS ENUM (
    'draft',
    'pending_manager',
    'approved',
    'rejected',
    'cancelled'
);

CREATE TYPE leave_category_enum AS ENUM (
    'annual_vacation',
    'sick_leave',
    'special_leave',
    'unpaid_leave'
);

-- Core Employee Table (Active Directory Synchronized)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_guid VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    role user_role_enum NOT NULL DEFAULT 'employee',
    ad_groups TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_ad_guid ON employees(ad_guid);

-- Active Directory Security Group to Role Mapping Configuration
CREATE TABLE IF NOT EXISTS ad_security_group_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_group_name VARCHAR(255) UNIQUE NOT NULL,
    ad_group_sid_or_oid VARCHAR(64) UNIQUE NOT NULL,
    mapped_role user_role_enum NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests (REQ-HR-01, REQ-HR-02)
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    category leave_category_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status leave_status_enum NOT NULL DEFAULT 'draft',
    notes TEXT,
    approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- Notice Board Posts & Mandatory Acknowledgments (REQ-HR-04)
CREATE TABLE IF NOT EXISTS notice_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES employees(id),
    is_mandatory_ack BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notice_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES notice_posts(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_hash VARCHAR(64) NOT NULL,
    CONSTRAINT uq_notice_employee UNIQUE (post_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_notice_ack_post ON notice_acknowledgments(post_id);

-- Central Immutable Audit Trail (REQ-NFR-08, REQ-AS-03, REQ-FL-04)
CREATE TABLE IF NOT EXISTS audit_log_entries (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(64) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(16) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    actor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    actor_pseudonym VARCHAR(64),
    ip_address_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log_entries(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log_entries(created_at);

-- Database-Level Append-Only Enforcement (REQ-NFR-08)
REVOKE UPDATE, DELETE ON audit_log_entries FROM PUBLIC;
REVOKE UPDATE, DELETE ON notice_acknowledgments FROM PUBLIC;
