# BMV Staff Portal — Master Product Guide v1.2

## Document Control

| Field | Value |
|---|---|
| Document | BMV Staff Portal — Master Product Guide |
| Version | 1.2 |
| Status | Draft for review |
| Owner | Product/IT Leadership, BMV Bender Medical Vertrieb GmbH |
| Applicable standards | ISO 13485 (QMS documentation discipline), DSGVO/GDPR, German Works Council (Betriebsrat) co-determination |
| Last updated | 2026-09-23 |

**Version history** (REQ-NFR-09):

| Version | Date | Summary | Approved by |
|---|---|---|---|
| 1.0 | 2026-09-22 | Initial merged guide (SRS + Execution Guide → single spec) | — |
| 1.1 | 2026-09-23 | Added REQ-HR-06: employees may edit a leave request while it's in `Draft`, before submission | — |
| 1.2 | 2026-09-23 | Added `docs/design-system.md` as the concrete token/component source `agent_designer` builds against (§8.2); updated the citation in step 2 of §9 accordingly | — |

Every requirement below carries a stable ID (e.g. `REQ-HR-01`) so it can be traced from spec → build gate → test — required once this is a controlled document under an ISO 13485 QMS.

## 1. Executive Summary

The BMV Staff Portal is a single, Dockerized web application that becomes every employee's front door for four services: HR & leave, IT support, the company fleet, and equipment/software assets. It is built on Next.js (frontend) and FastAPI (backend) over PostgreSQL, authenticated through Active Directory, and is developed and operated as a production system for a medical device manufacturer — meaning ISO 13485 auditability, DSGVO data minimization, and Works Council (Betriebsrat) constraints on employee monitoring are non-negotiable, not aspirational.

The four pillars:

1. **HR & Culture** — leave requests, onboarding, the digital notice board and staff directory.
2. **IT Service Desk** — ticketing, time & billing tracking, and asset-linked support history.
3. **Fleet Asset Registry** — vehicle assignment, TÜV/insurance compliance alerts, handover audits.
4. **Equipment & Software Lifecycle** — hardware state tracking and software subscription management.

The one hard rule that governs every design decision in this document: **the portal may measure systems and processes, never people.** IT can see that ticket-resolution SLAs are slipping; it cannot see that one agent closes tickets slower than another. This is enforced structurally (schema and query level), not just by policy — see §2 and the `agent_compliance` role in §8.3.

## 2. Roles & RBAC Matrix

DSGVO minimization and the Works Council ban on individual monitoring both depend on exactly who can query what, so roles are a first-class access model enforced at the API layer, not just in the UI.

| Role | HR data | IT tickets | Fleet | Assets | Admin functions |
|---|---|---|---|---|---|
| Employee | Own leave/profile only | Own tickets, create/comment | Own assigned vehicle | Own assigned hardware | — |
| Manager | Team aggregate availability only (never individual sick-leave history) | — | — | — | — |
| HR Admin | Full read/write, all employees | — | — | — | Onboarding/offboarding triggers |
| IT Agent | — | Assigned queue; internal notes hidden from employees | Read-only (device-linked tickets) | Read-only (device-linked tickets) | — |
| IT Admin | — | Full queue, workflow config, system-level SLA dashboards (no per-agent metrics) | — | — | Ticket categories/workflow states |
| Fleet Manager | — | — | Full read/write, alerts, handovers | — | Vehicle lifecycle config |
| Asset Manager | — | — | — | Full read/write, license budgets | Hardware/software lifecycle config |
| Compliance / Works Council rep | Audit-log read access across all pillars (who changed what, not operational data) | Audit-log read access | Audit-log read access | Audit-log read access | — |

**Enforcement rule:** every list/aggregate endpoint that touches HR or ticket data must be reviewed against this table before merge — this is exactly what `agent_compliance` gates in §7. A query that *can* be reshaped into an individual performance ranking (e.g. "tickets closed per agent per week") is a violation even if no UI ever renders it that way.

## 3. Software Requirements Specification

### 3.1 Pillar 1 — HR & Culture ("The People Pillar")

| ID | Requirement |
|---|---|
| REQ-HR-01 | Leave requests follow a strict state machine: `Draft → Pending Manager → Approved / Rejected → Cancelled`. |
| REQ-HR-02 | Manager dashboards show only aggregate team availability (e.g. "3 of 8 out this week"). Individual sick-leave frequency or historical pattern is never exposed to a manager — Works Council requirement, enforced per the RBAC matrix in §2. |
| REQ-HR-03 | On new-hire creation, the system fires parallel webhooks: one to identity (Microsoft Graph / Google Workspace) for mailbox provisioning, one to the IT queue for hardware provisioning (auto-creates an onboarding ticket, see REQ-IT-08). |
| REQ-HR-04 | The notice board supports a mandatory "Read & Acknowledged" flag for compliance-critical posts (e.g. ISO policy updates). Each acknowledgment writes an immutable, timestamped row — this is the audit evidence a QMS audit will ask for. |
| REQ-HR-05 | A searchable staff directory is kept in sync with Active Directory (name, department, role, contact — no data AD doesn't already hold). |
| REQ-HR-06 | While a leave request is in the `Draft` state (REQ-HR-01), the requesting employee may edit its dates, type, and reason freely — enforced server-side as owner-only per §2. Once submitted (`Draft → Pending Manager`), the request becomes read-only to the employee; changing it requires cancelling and creating a new request. Draft edits are not individually written to the audit log — only the state transition itself is (REQ-NFR-08). |

**Note on scope:** the "Onboarding Journey" (training acknowledgment + equipment collection as a guided checklist) is a UX wrapper around REQ-HR-03/REQ-HR-04, not a separate feature — it's the same webhook and acknowledgment mechanics presented as a single new-hire checklist.

### 3.2 Pillar 2 — IT Service Desk ("The Support Pillar")

| ID | Requirement |
|---|---|
| REQ-IT-01 | Two distinct interfaces: a simplified submission/status view for employees, and a high-density triage view for IT staff. |
| REQ-IT-02 | Ticket submission enforces mandatory Subject, Description, and Category/Type fields. |
| REQ-IT-03 | Ticket status progression (`New → In Progress → Resolved → Closed`, etc.) is driven by admin-configurable lookup tables, not hard-coded enums — new states or categories don't require a deploy. |
| REQ-IT-04 | Agents can mark comments internal (hidden from the employee). Attached emails render inline as readable text in the ticket timeline, not as opaque downloadable files. |
| REQ-IT-05 | Category-based routing integrates with MS Teams/Google Chat webhooks; incoming email chains are parsed into the same unified ticket timeline as REQ-IT-04. |
| REQ-IT-06 | Time & billing: effort is captured in real seconds via a live start/stop timer or retrospective entry. "Billed Time" rounds up to the next 15-minute block with a 15-minute minimum. A configurable rate (default €120.00/hr) multiplies Billed Time to quantify internal IT value for reporting. |
| REQ-IT-07 | Every ticket links relationally to an Employee ID and, where applicable, a Device ID, enabling aggregate views that surface high-maintenance devices or high-ticket-volume users — device/asset analytics, never agent-performance analytics (RBAC §2). |
| REQ-IT-08 | Onboarding hardware-provisioning tickets (from REQ-HR-03) enter the same queue and workflow as any other ticket. |
| REQ-IT-09 | Auth relies entirely on Active Directory federation; the portal never stores or manages its own passwords. |
| REQ-IT-10 | System-level SLA adherence and hardware-failure heatmaps are tracked and reportable; per-agent ticket-closing speed is not tracked, not stored, and not derivable from any exposed query (Works Council constraint). |

**AI IT Agent — descoped to v1.2.** The IT Agent role stays a human for v1.0 (§2); an AI chatbot front-line responder is deferred, see §11.

**Deferred to Phase 2 — RAG-powered ticket deflection.** Intercepting ticket drafts, embedding them (pgvector) against a vectorized IT knowledge base, and surfacing instant resolutions before submission is a good idea, but it's a second system (embedding pipeline, a curated and maintained knowledge base, evaluation of deflection accuracy) layered on top of a ticketing system that doesn't exist yet — building it now risks both landing late. It's specified in §11 so it's not lost, and the Gate 0 schema should leave room for it (e.g. don't preclude a `pgvector` extension later), but it is explicitly out of the v1.0 Gated SDLC scope.

### 3.3 Pillar 3 — Fleet Asset Registry ("The Mobility Pillar")

| ID | Requirement |
|---|---|
| REQ-FL-01 | Vehicle records hold VIN, license plate, and lease terms, and link dynamically to the current assignee. |
| REQ-FL-02 | Assignment type is strictly typed as Operational or Personal (drives tax/reporting treatment downstream). |
| REQ-FL-03 | A daily background job scans for TÜV inspection and insurance expiry dates and dispatches webhook alerts to the Fleet Manager at 30, 15, and 5 days out. |
| REQ-FL-04 | Check-out/check-in requires a mandatory odometer reading and digital sign-off from both the Fleet Manager and the employee; the completed handover record is locked into the immutable audit table (see REQ-NFR-08). |

### 3.4 Pillar 4 — Equipment & Software Lifecycle ("The Asset Pillar")

| ID | Requirement |
|---|---|
| REQ-AS-01 | Hardware (laptops, phones) moves through strict states: `In Stock → Assigned → Maintenance/Repair → Retired`. |
| REQ-AS-02 | Location tag (Office vs. Home-Office) drives the applicable replacement SLA. |
| REQ-AS-03 | Every hardware state change, loss/damage report, and offboarding return writes an immutable, timestamped audit record — the ISO 13485 traceability requirement. |
| REQ-AS-04 | Hardware and software procurement records are not maintained in Brunnie's system, so this pillar is and remains the sole system of record for procurement-to-asset mapping. No external ERP data ingestion is required or planned for this data. |
| REQ-AS-05 | Software licenses are tracked against a department budget, aggregating monthly recurring cost and firing MS Teams/Google Chat alerts ahead of auto-renewal dates. |

## 4. Non-Functional & Compliance Requirements

The compliance principles (DSGVO, Works Council, ISO 13485) are stated below as concrete engineering constraints — not just as policy — so an agent can build directly against them.

### 4.1 Works Council (Betriebsrat)

- REQ-NFR-01: No feature, report, or ad-hoc query may expose individual productivity metrics (ticket-closing speed, response latency per agent, leave-taking frequency per employee). This is checked at the API contract stage, not just the UI — an endpoint that *could* be aggregated client-side into a ranking is a violation.
- REQ-NFR-02: Any new feature that touches employee behavior data requires a one-line Works Council impact note in its Gate 0 sign-off, even if the answer is "none."

### 4.2 DSGVO / GDPR

- REQ-NFR-03: RBAC per §2 is enforced server-side on every endpoint; the frontend hiding a field is not sufficient.
- REQ-NFR-04: Data minimization — only collect fields a stated requirement above needs. No speculative "might be useful later" personal-data columns.
- REQ-NFR-05: Right to erasure (Art. 17) vs. immutable audit logs (REQ-AS-03, REQ-HR-04, REQ-FL-04) is resolved as: **pseudonymize, don't delete, audit rows.** On an erasure request, personal identifiers in historical audit entries are replaced with a stable pseudonymous reference; the audit trail's integrity (what changed, when) survives, the personal identity does not.
- REQ-NFR-06: A documented data retention schedule per data category (tickets, leave records, fleet handovers) with defined deletion/anonymization triggers.

### 4.3 ISO 13485 & Computerized System Validation

BMV manufactures medical devices under ISO 13485. Internal software that produces records used for quality or compliance decisions (equipment audit trails, handover sign-offs) is commonly brought under the same document-control and validation discipline as other QMS tooling, even though the portal itself isn't a medical device. Two concrete implications to decide explicitly, not by default:

- REQ-NFR-07: Decide whether digital sign-offs (fleet handover, equipment return) need to meet an electronic-signature standard equivalent to 21 CFR Part 11 / GxP Annex 11 practice (unique user ID + password/AD auth + a signed timestamp bound to the specific record version). If yes, this is an explicit Gate 0 exit criterion for those two features, not an afterthought.
- REQ-NFR-08: All audit tables are append-only at the database level (no `UPDATE`/`DELETE` grants on audit rows for the application role) — "soft-delete" alone is a UI convention, not a guarantee; the DB permissions must enforce it.
- REQ-NFR-09: This document itself follows change control — each revision gets a version row in the Document Control table at the top of this document, a diff summary, and an approver, the same discipline as any other QMS document.

### 4.4 Security

- REQ-NFR-10: Secrets (DB credentials, webhook signing keys, AD client secret) live in a secrets manager or environment-injected at deploy time — never in the repo.
- REQ-NFR-11: All inbound webhooks (Teams, Chat) are signature-verified; all outbound webhooks are rate-limited and retried with backoff.
- REQ-NFR-12: Standard OWASP ASVS Level 1 checks (input validation, output encoding, session handling via NextAuth) are part of Gate 4, not assumed.

### 4.5 Performance, Availability, Environments

- REQ-NFR-13: Three environments minimum — dev, staging, production — with staging as the mandatory Playwright/E2E gate before any production deploy.
- REQ-NFR-14: Nightly automated PostgreSQL backups with a tested restore procedure; RPO ≤ 24h, RTO documented per environment.
- REQ-NFR-15: p95 API response time target ≤ 500ms for read endpoints under expected internal load (BMV's employee count); this is a placeholder target to be sized against real headcount before Gate 4 sign-off.

### 4.6 Accessibility & Localization

- REQ-NFR-16: WCAG 2.2 AA is the binding accessibility target.
- REQ-NFR-17: UI language: German primary, English secondary toggle — scoped to UI chrome only: menus, buttons, system notifications, and error messages. User-generated content (notice-board posts, ticket descriptions) stays in whatever language the author typed it; no bilingual authoring fields, no schema impact. Implemented once as i18n scaffolding at Gate 2 (§7), not repeated per pillar.

## 5. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI | |
| Backend | FastAPI (Python) | Self-documenting via OpenAPI; contract-first per Gate 0 |
| Database | PostgreSQL | `pgvector` extension reserved but not enabled until Phase 2 (§11) |
| Auth | NextAuth.js → OpenID Connect → Active Directory federation | No local password storage anywhere in the app |
| Infrastructure | Docker Compose | Local/on-prem German server deployment (data residency) |
| CI/CD | GitHub Actions (or GitLab CI) | Runs lint, unit tests, and Playwright against the staging environment on every merge to main; owned by `agent_qa_devops` (§8.5) |

## 6. High-Level Data Model

This entity list is the input to `agent_architect`'s Gate 0 schema (§7, §8.1). It is not exhaustive — it's the skeleton Gate 0 fleshes out.

| Entity | Key relationships |
|---|---|
| `Employee` | Sourced/synced from Active Directory; referenced by nearly every other entity |
| `LeaveRequest` | belongs to `Employee`; state machine per REQ-HR-01 |
| `NoticeAcknowledgment` | belongs to `Employee` + `NoticePost`; immutable |
| `Ticket` | belongs to `Employee` (requester), `Employee` (assigned agent), optional `Device` |
| `TicketTimeEntry` | belongs to `Ticket`; raw seconds + computed billed minutes |
| `TicketComment` | belongs to `Ticket`; `is_internal` flag |
| `Vehicle` | has one current `Employee` assignee (nullable); assignment type enum |
| `VehicleHandover` | belongs to `Vehicle` + `Employee`; odometer, dual sign-off, immutable |
| `Device` | hardware asset; state enum; location tag; optional link to `Employee` |
| `SoftwareLicense` | belongs to a department/budget; renewal date |
| `AuditLogEntry` | polymorphic reference to any of the above; old value, new value, actor, timestamp; append-only (REQ-NFR-08) |

Every entity above that represents a state change (`LeaveRequest`, `Ticket`, `Vehicle` assignment, `Device` state, `VehicleHandover`) writes to `AuditLogEntry` — this is the one cross-cutting table that makes REQ-AS-03, REQ-HR-04, REQ-FL-04, and the general ISO 13485 audit requirement all the same underlying mechanism, not four separate ones.

## 7. Gated SDLC

Compliance review is embedded as a checkpoint inside every gate, not held for a single pass at the end — catching a violation at Gate 0 is far cheaper than catching it after Gate 3 is already built. No feature proceeds to the next gate until its Exit Criteria are met and `agent_compliance` has signed off (§8.3).

| Gate | Focus | Exit Criteria |
|---|---|---|
| **Gate 0** — Architecture & Data Modeling | PostgreSQL schema, OpenAPI contracts, RBAC matrix (§2) | Schema explicitly links `Ticket` → `Employee`/`Device` (REQ-IT-07); all audit tables are append-only at the DB permission level, not just soft-delete by convention (REQ-NFR-08); `agent_compliance` confirms the schema minimizes personal data collected. |
| **Gate 1** — UX/UI Blueprinting | Next.js routing, Shadcn component structure, Tailwind config | Distinct routing/layout for Employee portal vs. IT Admin dashboard (REQ-IT-01); WCAG 2.2 AA verified (REQ-NFR-16); no UI surface renders per-agent or per-employee performance data (REQ-NFR-01). |
| **Gate 2** — Foundation & Auth | Docker Compose base stack, NextAuth.js + AD federation, base layouts | AD SSO login simulated successfully; all containers start clean; no local password path exists anywhere in the app (REQ-IT-09); i18n scaffolding is in place (e.g. next-intl, `[locale]` routing) with German as the default locale and an English toggle, satisfying REQ-NFR-17 before any pillar's Gate 1 UI work begins. |
| **Gate 3** — Feature Implementation | FastAPI + Next.js feature build, run **once per pillar** (HR, then IT, then Fleet, then Assets — not as one undifferentiated pass) | Unit tests pass, including the 15-minute billing-rounding algorithm (REQ-IT-06) and the savings-calculator math; `agent_compliance` verifies the new endpoints' data exposure against the RBAC matrix before merge. |
| **Gate 4** — E2E Verification & Hardening | Playwright E2E across all four pillars, webhook routing, backup/restore drill | Playwright confirms the Equipment Return and Fleet Handover flows end-to-end including dual sign-off (REQ-FL-04); every simulated field change produces a correct, immutable audit row (REQ-NFR-08); a restore-from-backup drill succeeds (REQ-NFR-14); zero DSGVO/Works-Council violations detected by `agent_compliance`'s final review. |

The RAG deflection feature (§11) gets its own Gate 0–Gate 4 pass once scheduled — it doesn't ride along inside the v1.0 gates above.

## 8. The Antigravity 2.0 Agent Squad

Antigravity 2.0 (Google's agent-first dev platform) has specific mechanics this agent squad is built around — without them, the system instructions below are just prose no agent framework enforces:

- **Skills, not just prompts.** Antigravity loads per-agent instructions via `.agents/skills/<name>/SKILL.md` files in the project — progressive disclosure, loaded only when relevant. Each role below should be one Skill file, not a chat message you retype every session.
- **Manager View + dynamic subagents.** The Manager View runs multiple agents in parallel across a Project; any agent can spawn scoped child subagents for parallel sub-work (e.g. `agent_developer` spawning one child per pillar). Use this for Gate 3, which is explicitly per-pillar (§7).
- **Artifacts, not raw tool logs.** Every agent should produce a Task List before starting, an Implementation Plan before writing code, and a Walkthrough when done — these are reviewable by a human before the next gate opens, and they're what `agent_compliance` actually reviews.
- **`/browser` subagent for verification.** Real browser-driven checks (screenshots, Playwright-style flows) run through Antigravity's browser subagent, not a description of what should happen.
- **Review Gates (security presets).** Configure Antigravity's approval settings so schema migrations, deletions, and anything touching the audit-log tables require explicit human approval before the agent executes — this is the human-in-the-loop backstop behind `agent_compliance`'s automated veto.
- **Scheduled Tasks.** Antigravity supports cron-like recurring agent runs. Use this for `agent_qa_devops`'s recurring dependency/security scan (§8.5), not a manual reminder.

**Every citation below is a pointer, not a memory.** Each agent's `SKILL.md` is loaded in isolation — it does not come with this whole guide attached. A `§7` or `REQ-NFR-08` reference only resolves if the agent can open `docs/master-product-guide.md` and read that section itself. Committing the guide into the repo (§9, step 2) is not optional bookkeeping — without it, every cross-reference below is meaningless to the agent reading it.

### 8.0 agent_orchestrator (The Product Owner)

**Role:** Turns a business ask ("build the leave-approval flow") into a properly sequenced COMMAND for the other five agents, and is the single point that decides whether a repeated `agent_compliance` veto gets escalated to a human rather than retried indefinitely.

**System instruction (Skill content):** "You are the Product Owner for the BMV Staff Portal. Given a feature request, you identify which pillar and which requirement IDs (§3) it maps to, then issue a COMMAND block (§10) sequencing `agent_architect → agent_designer → agent_compliance → agent_developer → agent_qa_devops`. You never write code, schema, or tests yourself. If `agent_compliance` vetoes the same feature twice in a row, you stop the loop and flag it to a human reviewer with both veto reasons — you do not let the squad retry a third time unattended."

**Execution rule:** Runs first for any new feature; also the agent that reads this guide's requirement IDs so nothing gets built without a REQ- traceability link.

### 8.1 agent_architect (The Master Planner)

**Role:** Owns the PostgreSQL schema, FastAPI route design, and system logic.

**System instruction:** "You design normalized, efficient databases and API contracts. Your highest priority is ensuring an audit-log write path exists for every state change (§6). You do not write frontend code. You output raw SQL migrations and OpenAPI specs as an Implementation Plan artifact, and you flag in that plan which tables are append-only per REQ-NFR-08."

**Execution rule:** Triggers first in any new feature (after `agent_orchestrator`). Pauses and hands the plan to `agent_compliance`. May only finalize the schema once Compliance approves. Schema migrations require human approval under the Review Gate security preset before they execute.

### 8.2 agent_designer (The Experience Director)

**Role:** Owns UI/UX direction, Tailwind configuration, and Shadcn component structure.

**Full spec:** [`docs/design-system.md`](design-system.md) — the concrete color tokens, type scale, spacing/density model, and Shadcn component state set this agent builds every screen against. The aesthetic direction below is the intent; that document is the buildable spec, and it's what keeps four pillars' worth of screens from drifting into inconsistent, independently-invented styling.

**System instruction:** "You translate requirements into frictionless 'Medical Corporate' interfaces, built strictly against the tokens, type scale, spacing/density model, and component states defined in `docs/design-system.md` — you do not invent a color, spacing value, or component state that isn't in that document; if a screen needs one that doesn't exist there, you flag it for a design-system update rather than picking one inline. You evaluate every screen from two perspectives: the employee under time pressure (low cognitive load, Comfortable density) and the IT/Fleet/Asset admin doing high-density, keyboard-first triage (Compact density) — both density modes are defined in `docs/design-system.md` §4. You hold the mandate for WCAG 2.2 AA (REQ-NFR-16, checklist in `docs/design-system.md` §7) and for the RBAC-driven UI rule in REQ-NFR-01: if a screen could expose individual performance data, you redesign it before it reaches `agent_developer`. You also own the Gate 2 i18n scaffolding (`next-intl` or equivalent, German as the default locale with an English toggle, REQ-NFR-17) and ensure every subsequent screen's strings are externalized to locale files, never hardcoded, and sized for German string length per `docs/design-system.md` §3."

**Execution rule:** Acts only after `agent_architect`'s payload is compliance-approved. Produces a component-hierarchy artifact for `agent_developer`; a `/browser` screenshot pass on the wireframe stage is recommended before handoff. Any screen that needs a token, state, or mapping not already in `docs/design-system.md` pauses for a design-system update (version bump, per that document's own §9 governance) before proceeding — it does not get invented ad hoc in the component-hierarchy artifact.

### 8.3 agent_compliance (The Regulatory Guard)

**Role:** Owns ISO 13485, DSGVO, and Works Council compliance across every gate.

**System instruction:** "You are the Regulatory Officer. You review every schema, API route, and UI design produced by `agent_architect` and `agent_designer` against §2 (RBAC), §4 (NFR/compliance), and the requirement IDs in §3. You veto any feature that tracks individual agent/employee velocity, over-collects personal data, or lacks an immutable, append-only audit write for asset/fleet/leave state changes. You output exactly 'COMPLIANCE APPROVED' or 'COMPLIANCE VETO: <specific fix required, citing the REQ- or RBAC row violated>'."

**Execution rule:** Gatekeeper at every gate in §7, not just before development. `agent_developer` is blocked from writing business logic until COMPLIANCE APPROVED is issued for the current feature's schema and design. Two consecutive vetoes on the same feature escalate to `agent_orchestrator` → human review.

### 8.4 agent_developer (The High-Velocity Coder)

**Role:** Owns Next.js and FastAPI feature implementation.

**System instruction:** "You are the Senior Full-Stack Developer. You implement features strictly against the Architect's API spec and the Designer's UI blueprint — you do not redesign either. You write clean, modular, type-safe Next.js and FastAPI code. For Gate 3 (§7), you work one pillar at a time; when a feature spans independent sub-parts, you may spawn scoped child subagents (e.g. one per pillar) rather than serializing unrelated work."

**Execution rule:** Strictly blocked from writing code until 'COMPLIANCE APPROVED' is received for the current feature's schema and design. Produces a Walkthrough artifact on completion for `agent_qa_devops` and human review.

### 8.5 agent_qa_devops (The Stability Expert)

**Role:** Owns Dockerization, CI/CD, Playwright E2E testing, and ongoing hardening.

**System instruction:** "Your goal is a zero-defect production release. You containerize the Next.js and FastAPI apps via Docker Compose. You write Playwright tests through the `/browser` subagent that simulate real employee journeys — specifically the Equipment Return and Fleet Handover flows (Gate 4) — and capture before/after screenshots as verification artifacts, not just pass/fail logs."

**Execution rule:** Acts once `agent_developer` commits feature code. Failing E2E tests kick the feature back to `agent_developer` with exact failure logs and the failing screenshot. Also owns a Scheduled Task (weekly) running a dependency/security scan against the repo — configured once in Antigravity, not re-triggered manually.

### 8.6 agent_docs (The Traceability Keeper)

**Role:** Keeps this guide's requirement IDs mapped to actual code/PRs, and maintains the changelog.

**System instruction:** "After `agent_qa_devops` confirms a feature passed Gate 4, you record which REQ- IDs were implemented, in which PR/commit, and append one line to the traceability log and to the Document Control table's version history. You do not write feature code; you write records about feature code."

**Execution rule:** Runs last in every COMMAND sequence. This keeps requirement traceability current — without it, "which requirement did this code satisfy" is answerable only by reading git history.

## 9. Step-by-Step: Running This Guide in Antigravity 2.0

1. **Create the Project.** In Antigravity, create a new Project pointed at the portal's repo folder (e.g. `bmv-staff-portal/`). Antigravity Projects can span multiple folders — keep frontend and backend in one Project so agents share full context.
2. **Add the Skills.** Create `.agents/skills/` in the repo root with one subfolder per agent in §8 (`agent_orchestrator/`, `agent_architect/`, `agent_designer/`, `agent_compliance/`, `agent_developer/`, `agent_qa_devops/`, `agent_docs/`), each with a `SKILL.md` containing that agent's Role + System Instruction + Execution Rule verbatim from §8. This is what makes the instructions load automatically instead of being retyped into chat every session. Also commit this guide itself into the repo as `docs/master-product-guide.md`, and start every `SKILL.md` with one line — `Full spec: docs/master-product-guide.md` — so that any §N or REQ-XX-NN citation inside the instructions is something the agent can actually open and read, not a dangling reference to a document it was never given. `agent_designer/SKILL.md` additionally needs `docs/design-system.md` committed alongside it and cited with its own `Full spec:` line (§8.2) — without it, that agent's tokens, states, and density model are as unreachable as an uncommitted master guide would be.
3. **Set the Review Gate security preset.** Before running anything, configure Antigravity so schema migrations, file deletions, and any write to an audit-log table require explicit human approval. This is the human backstop behind `agent_compliance`'s automated veto (§8.3) — set it once, at the Project level.
4. **Open the Manager View.** This is where you'll issue the COMMAND blocks (§10) and watch the five-to-seven agents run, potentially with `agent_developer` spawning per-pillar subagents at Gate 3.
5. **Kick off Gate 0.** Paste the first sample prompt from §10 (schema + API contracts for one pillar) into the Manager View. Review the Task List and Implementation Plan artifacts `agent_architect` produces before approving — don't rubber-stamp; this is the cheapest point to catch a modeling mistake.
6. **Watch for the compliance checkpoint.** `agent_compliance` will post 'COMPLIANCE APPROVED' or 'COMPLIANCE VETO' as its own message in the Manager View. A veto blocks `agent_developer` automatically (§8.4) — you don't need to intervene unless it's vetoed twice in a row, at which point `agent_orchestrator` should flag it to you directly.
7. **Review the Walkthrough artifact after Gate 3.** `agent_developer`'s Walkthrough is your diff-review point. Approve or send back with specific comments — the same as reviewing a PR.
8. **Verify with `/browser` at Gate 4.** Use the `/browser` subagent command to have `agent_qa_devops` run the Equipment Return and Fleet Handover journeys and capture screenshots. These screenshots are your evidence artifact, not just a green checkmark.
9. **Set up the recurring Scheduled Task.** Once Gate 4 passes for the first pillar, configure Antigravity's Scheduled Tasks for `agent_qa_devops`'s weekly dependency/security scan (§8.5) so it runs unattended going forward.
10. **Repeat Gates 0–4 per pillar.** HR, then IT, then Fleet, then Assets — each pillar is its own pass through the gate sequence, per §7's Gate 3 note. `agent_docs` (§8.6) appends to the traceability log after each pillar's Gate 4 sign-off.

## 10. Ready-to-Paste Execution Prompts

Use this COMMAND structure in the Antigravity Manager View. The first block below kicks off Pillar 1; the pattern repeats for Pillars 2–4 by swapping the feature name and REQ- range.

```
COMMAND: Initiate HR & Culture Pillar (REQ-HR-01..05) via Gated SDLC.

agent_orchestrator: Confirm scope against REQ-HR-01..05 and REQ-NFR-01/02/17. Issue the sequence below.
agent_architect: Generate the PostgreSQL schema (LeaveRequest, NoticeAcknowledgment, AuditLogEntry writes) and OpenAPI contract for Gate 0. Confirm audit tables are append-only per REQ-NFR-08.
agent_designer: Generate component blueprints for the leave request flow (employee view) and the aggregate team-availability view (manager view — no individual history, REQ-HR-02).
agent_compliance: Review architecture & design against §2 RBAC matrix and §4 NFRs. Output COMPLIANCE APPROVED or COMPLIANCE VETO with the specific fix required. (WAIT FOR APPROVAL — do not proceed until this line is APPROVED.)
agent_developer: Implement the FastAPI backend and Next.js frontend per the approved schema and blueprint. Do not begin until COMPLIANCE APPROVED is posted above.
agent_qa_devops: Update Docker Compose if needed; write Playwright tests covering the full leave-approval state machine (Draft → Pending Manager → Approved/Rejected → Cancelled) and confirm the manager dashboard never renders individual sick-leave data.
agent_docs: On Gate 4 pass, record REQ-HR-01..05 as implemented in the traceability log with the corresponding PR reference.
```

**First-run checkpoint:** before running the block above for real, confirm in the Manager View: *Does this agent squad configuration, gate sequence, and Review Gate preset match what you expect for the Antigravity workspace? If approved, this executes Gate 0 for the HR pillar and produces the foundational PostgreSQL schema and OpenAPI contract as the first reviewable artifact.*

## 11. Phase 2 Backlog

| Item | Why deferred |
|---|---|
| RAG-powered ticket deflection (pgvector-backed IT knowledge base, drafts intercepted before submission) | Needs a ticketing system and a body of resolved tickets to train/curate against before it can be useful; adds an embedding pipeline and ongoing content-curation burden on top of the unbuilt core. |
| Electronic-signature hardening for handover/return sign-offs (REQ-NFR-07), if the Gate 0 decision (§4.3) determines it's required | Scope depends entirely on that Gate 0 decision — could be in v1.0 or Phase 2. |
| AI IT Agent for the IT Service Desk (targeted v1.2) | IT Agent stays a human role through v1.0. When this is built, reserve REQ-IT-11–13 (disclosure to the employee, scoped to their own data, no autonomous destructive actions, AI actions tagged separately in the audit log) and REQ-NFR-18/19 (Betriebsrat co-determination review, per-request-only data access) for it, and evaluate whether it needs the RAG grounding work above rather than staying ungrounded. |

---

Sources: [Google Antigravity](https://antigravity.google/) · [Google Antigravity — Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity) · [Getting Started with Google Antigravity — Google Codelabs](https://codelabs.developers.google.com/getting-started-google-antigravity) · [Google Antigravity 2.0: Agent-First Dev Platform — Apidog](https://apidog.com/blog/google-antigravity-2/)
