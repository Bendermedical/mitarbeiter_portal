# BMV Staff Portal

Internal staff services portal for **BMV Bender Medical Vertrieb GmbH** — a single, Dockerized web application that is every employee's front door for HR & leave, IT support, the company fleet, and equipment/software assets.

**Status:** Spec complete, pre-build. The full requirements, architecture, and agent-driven build workflow live in [`docs/master-product-guide.md`](docs/master-product-guide.md) — that document is the source of truth; this README is the front door to the repo.

---

## Table of Contents

- [What this is](#what-this-is)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick start (local development)](#quick-start-local-development)
- [Environment variables](#environment-variables)
- [Architecture at a glance](#architecture-at-a-glance)
- [Building this with Antigravity 2.0](#building-this-with-antigravity-20)
- [Development workflow (Gated SDLC)](#development-workflow-gated-sdlc)
- [Testing](#testing)
- [Environments](#environments)
- [Compliance](#compliance)
- [Requirement traceability](#requirement-traceability)
- [Contributing](#contributing)
- [Ownership & license](#ownership--license)

---

## What this is

The portal replaces scattered spreadsheets, email threads, and side channels with one system covering four pillars:

| Pillar | Covers |
|---|---|
| **HR & Culture** | Leave requests, onboarding, the digital notice board, staff directory |
| **IT Service Desk** | Ticketing, time & billing tracking, asset-linked support history |
| **Fleet Asset Registry** | Vehicle assignment, TÜV/insurance compliance alerts, handover audits |
| **Equipment & Software Lifecycle** | Hardware state tracking, software subscription management |

One rule governs every design decision in the system: **the portal may measure systems and processes, never people.** IT can see that SLAs are slipping; it can never see that one agent closes tickets slower than another. See [`docs/master-product-guide.md` §1](docs/master-product-guide.md#1-executive-summary) for the full rationale and [§2](docs/master-product-guide.md#2-roles--rbac-matrix) for how it's enforced.

Because BMV manufactures medical devices, the portal is built and operated under ISO 13485 auditability, DSGVO/GDPR data minimization, and German Works Council (Betriebsrat) constraints on employee monitoring — see [Compliance](#compliance) below.

## Repository structure

```
bmv-staff-portal/
├── .agents/
│   └── skills/                  # Antigravity agent Skill files (one per agent)
│       ├── agent_orchestrator/SKILL.md
│       ├── agent_architect/SKILL.md
│       ├── agent_designer/SKILL.md
│       ├── agent_compliance/SKILL.md
│       ├── agent_developer/SKILL.md
│       ├── agent_qa_devops/SKILL.md
│       └── agent_docs/SKILL.md
├── docs/
│   ├── master-product-guide.md  # Source of truth: SRS, NFRs, data model, SDLC, agent roles
│   └── design-system.md         # Color/type/spacing tokens, density model, Shadcn component states — spec agent_designer builds against
├── frontend/                    # Next.js 14+ (App Router), TypeScript, Tailwind, Shadcn UI
├── backend/                     # FastAPI (Python)
├── docker-compose.yml           # Local/on-prem dev & deployment stack
├── .env.example                 # Template for required environment variables
└── README.md                    # You are here
```

`frontend/`, `backend/`, and `docker-compose.yml` are scaffolded as part of Gate 0–2 of the build (see [Development workflow](#development-workflow-gated-sdlc)); they are not present until that work has run.

## Prerequisites

- **Docker** and **Docker Compose** — the app runs as a Docker Compose stack for local dev and on-prem deployment (data residency requirement, see [master guide §5](docs/master-product-guide.md#5-technology-stack)).
- **Node.js 20+** and **Python 3.11+** — only needed if you're running the frontend or backend outside their containers (e.g. for faster iteration or IDE tooling).
- **Access to BMV Active Directory** — the portal has no local login; every environment needs an OIDC app registration in AD (client ID/secret, issuer URL) before auth will work.
- **Google Antigravity 2.0** — the intended way this codebase gets built out; see [Building this with Antigravity 2.0](#building-this-with-antigravity-20).

## Quick start (local development)

Once the initial scaffold exists (post Gate 2, see [Development workflow](#development-workflow-gated-sdlc)):

```bash
# 1. Clone and enter the repo
git clone <repo-url> bmv-staff-portal
cd bmv-staff-portal

# 2. Copy the environment template and fill in real values
cp .env.example .env

# 3. Start the full stack (Postgres, FastAPI backend, Next.js frontend)
docker compose up --build

# 4. Frontend: http://localhost:3000
#    Backend OpenAPI docs: http://localhost:8000/docs
```

To reset the database during development:

```bash
docker compose down -v   # drops the Postgres volume
docker compose up --build
```

## Environment variables

Defined in `.env.example` (copy to `.env` and fill in per environment — never commit real secrets, see [master guide REQ-NFR-10](docs/master-product-guide.md#44-security)):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL of the deployed frontend |
| `NEXTAUTH_SECRET` | NextAuth.js session encryption secret |
| `AD_OIDC_CLIENT_ID` / `AD_OIDC_CLIENT_SECRET` / `AD_OIDC_ISSUER` | Active Directory OIDC app registration (REQ-IT-09) |
| `TEAMS_WEBHOOK_SIGNING_SECRET` / `CHAT_WEBHOOK_SIGNING_SECRET` | Inbound webhook signature verification (REQ-NFR-11) |
| `IT_HOURLY_RATE_DEFAULT` | Default rate for the IT time/billing calculator, in €/hr (REQ-IT-06; default 120.00) |

Secrets are injected via environment or a secrets manager in every non-local environment — see [master guide §4.4](docs/master-product-guide.md#44-security).

## Architecture at a glance

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** FastAPI (Python), contract-first via OpenAPI
- **Database:** PostgreSQL (`pgvector` reserved, not enabled until Phase 2)
- **Auth:** NextAuth.js → OIDC → Active Directory federation; no local password storage anywhere
- **Infra:** Docker Compose, on-prem/German server deployment
- **CI/CD:** GitHub Actions (or GitLab CI) — lint, unit tests, Playwright against staging on every merge to `main`

Full stack rationale: [master guide §5](docs/master-product-guide.md#5-technology-stack). Entity relationships and the append-only audit model: [master guide §6](docs/master-product-guide.md#6-high-level-data-model).

## Building this with Antigravity 2.0

This project is designed to be built by a squad of seven Antigravity agents (`agent_orchestrator`, `agent_architect`, `agent_designer`, `agent_compliance`, `agent_developer`, `agent_qa_devops`, `agent_docs`), each loaded from its own `SKILL.md` under `.agents/skills/`. Full role definitions, system instructions, and execution rules: [master guide §8](docs/master-product-guide.md#8-the-antigravity-20-agent-squad).

To pick up development:

1. Open this repo as an Antigravity Project (frontend + backend in one Project so agents share context).
2. Set the Review Gate security preset so schema migrations, deletions, and audit-log writes require human approval.
3. Open the Manager View and paste a COMMAND block — a ready-to-use one for the HR pillar is in [master guide §10](docs/master-product-guide.md#10-ready-to-paste-execution-prompts).
4. Follow the full walkthrough in [master guide §9](docs/master-product-guide.md#9-step-by-step-running-this-guide-in-antigravity-20).

Every `§N` or `REQ-XX-NN` an agent's Skill file cites resolves only if it can open `docs/master-product-guide.md` in this repo — that file must stay committed and current for the agent instructions to mean anything.

## Development workflow (Gated SDLC)

Features move through five gates, with `agent_compliance` reviewing at every one rather than only at the end:

| Gate | Focus |
|---|---|
| Gate 0 | Architecture & data modeling (schema, OpenAPI contracts, RBAC) |
| Gate 1 | UX/UI blueprinting |
| Gate 2 | Foundation & auth (Docker Compose, AD SSO, i18n scaffolding) |
| Gate 3 | Feature implementation, run once per pillar (HR → IT → Fleet → Assets) |
| Gate 4 | E2E verification & hardening |

No feature reaches the next gate without its Exit Criteria met and a `COMPLIANCE APPROVED` from `agent_compliance`. Full gate definitions and exit criteria: [master guide §7](docs/master-product-guide.md#7-gated-sdlc).

## Testing

- **Unit tests** (backend/frontend) run in CI on every merge to `main`.
- **Playwright E2E** covers the full journey set, with the Equipment Return and Fleet Handover flows as the Gate 4 acceptance bar — see [master guide §7, Gate 4](docs/master-product-guide.md#7-gated-sdlc).
- Run the suite locally:

```bash
# Backend unit tests
docker compose exec backend pytest

# Frontend unit tests
docker compose exec frontend npm test

# Playwright E2E (against a running local stack)
npx playwright test
```

## Environments

Three environments minimum: `dev`, `staging`, `production`. Staging is a mandatory Playwright/E2E gate before any production deploy. Nightly PostgreSQL backups with a tested restore procedure (RPO ≤ 24h). Details: [master guide §4.5](docs/master-product-guide.md#45-performance-availability-environments).

## Compliance

This is a production system for a medical device manufacturer, not a generic internal tool:

- **ISO 13485** — every state change on hardware, fleet, or leave records is append-only and immutable at the database permission level, not just by UI convention.
- **DSGVO/GDPR** — RBAC enforced server-side on every endpoint; data minimization; erasure requests pseudonymize rather than delete audit rows so audit integrity survives.
- **Works Council (Betriebsrat)** — no feature, report, or query may expose individual productivity metrics, even if only derivable by client-side aggregation.

Full requirements: [master guide §4](docs/master-product-guide.md#4-non-functional--compliance-requirements).

## Requirement traceability

Every requirement carries a stable ID (`REQ-HR-01`, `REQ-IT-03`, `REQ-NFR-08`, etc.) defined in [master guide §3–§4](docs/master-product-guide.md#3-software-requirements-specification). `agent_docs` maintains a traceability log mapping each REQ- ID to the PR/commit that implemented it, appended after every pillar's Gate 4 sign-off — see [master guide §8.6](docs/master-product-guide.md#86-agent_docs-the-traceability-keeper).

## Contributing

1. Open an issue describing the change, and which pillar it affects.
2. `agent_orchestrator` (or a human reviewer) maps it to the relevant REQ- ID(s) in `docs/master-product-guide.md`, or proposes new ones if it's genuinely new scope.
3. The change runs through the Gated SDLC above — Gate 0 through Gate 4 — same as any other feature, whether built by the agent squad or by a human contributor.
4. `agent_compliance`'s sign-off is required regardless of who writes the code.

New requirements that expand scope beyond `docs/master-product-guide.md` should be added there first (with a version bump in its Document Control table), not decided ad hoc in code review.

## Ownership & license

Internal project — **BMV Bender Medical Vertrieb GmbH**, owned by Product/IT Leadership. Not licensed for external use or distribution.
