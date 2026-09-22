# Contributing to the BMV Staff Portal

This document defines how changes get into this repository — branching, commit messages, pull requests, and releases. It complements [`README.md`](README.md) (what the project is, how to run it) and [`docs/master-product-guide.md`](docs/master-product-guide.md) (what to build, the source of truth for requirements and the Gated SDLC). Read this before opening your first PR, whether you're a human contributor or reviewing output from the Antigravity agent squad.

## Table of Contents

- [Before you start](#before-you-start)
- [Branching model](#branching-model)
- [Branch naming](#branch-naming)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Branch protection on `main`](#branch-protection-on-main)
- [Code ownership](#code-ownership)
- [Merge strategy](#merge-strategy)
- [Releases & changelog](#releases--changelog)
- [Contributing with the Antigravity agent squad](#contributing-with-the-antigravity-agent-squad)
- [Requirement traceability](#requirement-traceability)
- [Changing the master product guide](#changing-the-master-product-guide)
- [Local checks before opening a PR](#local-checks-before-opening-a-pr)

## Before you start

Every change should trace back to a requirement ID (`REQ-HR-01`, `REQ-NFR-08`, etc.) defined in [`docs/master-product-guide.md` §3–§4](docs/master-product-guide.md#3-software-requirements-specification). If what you want to build isn't covered by an existing REQ- ID, open an issue first describing the change and which pillar it affects — either a human reviewer or `agent_orchestrator` maps it to a new or existing ID before any code gets written. Code without a REQ- ID is unreviewable against the spec and won't pass `agent_compliance`'s gate.

## Branching model

This repo uses **GitHub Flow**: a single long-lived `main` branch that is always deployable, and short-lived feature branches merged via pull request. There are no long-lived `develop`, `staging`, or `production` branches — `dev`, `staging`, and `production` (per [master guide §4.5](docs/master-product-guide.md#45-performance-availability-environments)) are CI/CD deploy targets, not git branches. The same commit on `main` is what gets promoted through them.

Keep feature branches short-lived — days, not weeks. A branch that's been open for a long time is a sign the underlying change should have been split, or is blocked on a compliance decision that should be resolved before more code is written on top of it.

## Branch naming

```
<type>/<pillar>/<short-desc>
```

- `type` — one of `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`
- `pillar` — `hr`, `it`, `fleet`, `assets`, or `nfr`/`infra` for cross-cutting work

Examples:

```
feat/hr/req-hr-01-leave-state-machine
fix/it/req-it-06-billing-rounding
chore/qa/playwright-fleet-handover
docs/req-nfr-09-changelog
```

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/), with the REQ- ID(s) implemented in the footer so `agent_docs` can generate the traceability log mechanically instead of it being maintained by hand.

```
feat(hr): implement leave request state machine

Draft → Pending Manager → Approved/Rejected → Cancelled.
Manager dashboard shows aggregate availability only, no individual history.

Refs: REQ-HR-01, REQ-HR-02
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `build`, `perf`  
**Scope:** the pillar (`hr`, `it`, `fleet`, `assets`) or `nfr`/`infra` for cross-cutting work  
**Footer:** `Refs: REQ-XX-NN[, REQ-XX-NN...]` — required on any commit that implements or modifies a requirement

## Pull requests

Every PR description should answer, at a glance:

- Which REQ- ID(s) does this implement or modify?
- Which Gate does this correspond to (per [master guide §7](docs/master-product-guide.md#7-gated-sdlc))?
- Compliance checklist: RBAC reviewed against [§2](docs/master-product-guide.md#2-roles--rbac-matrix)? Audit-log write path confirmed for any state change (REQ-NFR-08)? WCAG 2.2 AA checked, if this touches UI (REQ-NFR-16)?
- Links to the Antigravity Task List, Implementation Plan, and Walkthrough artifacts that produced this change, if built through the agent squad.

A minimal PR template:

```markdown
## What
<one or two sentences>

## Requirement IDs
Refs: REQ-XX-NN

## Gate
Gate <N> — <focus>

## Compliance checklist
- [ ] RBAC reviewed against §2
- [ ] Audit-log write path confirmed (if this changes a state)
- [ ] WCAG 2.2 AA checked (if this touches UI)
- [ ] No individual performance data exposed (REQ-NFR-01)

## Antigravity artifacts (if applicable)
- Task List:
- Implementation Plan:
- Walkthrough:
```

## Branch protection on `main`

- No direct pushes — every change goes through a PR.
- Required status checks before merge: lint, unit tests, Playwright against staging (see [master guide §5](docs/master-product-guide.md#5-technology-stack)).
- Require `agent_compliance`'s `COMPLIANCE APPROVED` before merge is allowed. In practice this is a required review or a required label (e.g. `compliance-approved`) applied only after that agent posts approval — the structural version of the Review Gate described in [master guide §8.3](docs/master-product-guide.md#83-agent_compliance-the-regulatory-guard) and [§9](docs/master-product-guide.md#9-step-by-step-running-this-guide-in-antigravity-20).
- No force-push, no history rewriting on `main`.
- Schema migrations and any change touching an audit-log table additionally require explicit human approval, per the Review Gate security preset configured in Antigravity (master guide §9, step 3) — this applies whether the change was written by a human or by `agent_developer`.

## Code ownership

A `CODEOWNERS` file assigns required reviewers by path:

```
/backend/                        @architect-reviewer @compliance-reviewer
/frontend/                       @design-reviewer
/docs/master-product-guide.md    @product-lead
/.agents/skills/                 @product-lead
```

Adjust the actual usernames/teams to your org. The principle: schema and backend changes need an architecture-literate reviewer, UI changes need a design-literate reviewer, and changes to the spec or agent Skill files need product/IT leadership sign-off — because those two are what every agent's instructions and every future PR get checked against.

## Merge strategy

**Squash merge** feature branches into `main`. A single Gate 3 pass for one requirement can produce a dozen small commits from `agent_developer`; squashing keeps `main`'s history at one clean, Conventional-Commits-formatted entry per REQ- ID, which is what you want feeding into the traceability log and changelog — not a dozen "wip" commits per feature.

## Releases & changelog

Tag production deploys with semantic versions (`v1.0.0`, `v1.1.0`, ...). Each tag gets a `CHANGELOG.md` entry in [Keep a Changelog](https://keepachangelog.com/) format, maintained by `agent_docs` ([master guide §8.6](docs/master-product-guide.md#86-agent_docs-the-traceability-keeper)):

```markdown
## [1.1.0] - 2026-10-15
### Added
- REQ-FL-03: automated TÜV/insurance expiry alerts (30/15/5 days out)
### Fixed
- REQ-IT-06: billing rounding edge case at exactly 15-minute boundaries
```

This is also how [master guide REQ-NFR-09](docs/master-product-guide.md#43-iso-13485--computerized-system-validation)'s change-control requirement gets satisfied for the codebase itself, distinct from the guide's own Document Control table which tracks changes to the spec document.

## Contributing with the Antigravity agent squad

Most feature work is expected to run through the agent squad described in [master guide §8](docs/master-product-guide.md#8-the-antigravity-20-agent-squad), kicked off with a COMMAND block (§10) in the Antigravity Manager View. That doesn't change anything above — agent-authored commits follow the same branch naming, commit message, and PR conventions as human ones, and still need `agent_compliance`'s sign-off and (for schema/audit-table changes) explicit human approval before merge. The Walkthrough artifact `agent_developer` produces is your PR description's evidence; link it rather than re-describing the diff by hand.

If you're contributing as a human alongside the agent squad — reviewing its PRs, or writing code directly — the same Gate 0–4 sequence in [master guide §7](docs/master-product-guide.md#7-gated-sdlc) applies to you. There isn't a separate, lighter process for human-authored code.

## Requirement traceability

Every requirement has a stable ID defined in [master guide §3–§4](docs/master-product-guide.md#3-software-requirements-specification). `agent_docs` appends to the traceability log after each pillar's Gate 4 sign-off, mapping REQ- IDs to the PR/commit that implemented them. Keeping the `Refs:` footer on every commit accurate is what makes that log trustworthy — a missing or wrong REQ- ID reference is worth flagging in review the same way a failing test would be.

## Changing the master product guide

`docs/master-product-guide.md` is the source of truth every agent's `SKILL.md` cites by section number — changing it changes what every agent builds against. Treat edits to it like any other change: open a PR, get it reviewed (see `CODEOWNERS` above), and bump the version row in its Document Control table with a summary of what changed and why. Don't let scope decisions get made silently in code review that should have been a spec change first.

## Local checks before opening a PR

```bash
# Backend unit tests
docker compose exec backend pytest

# Frontend unit tests
docker compose exec frontend npm test

# Lint
docker compose exec backend ruff check .
docker compose exec frontend npm run lint

# Playwright E2E (against a running local stack)
npx playwright test
```

See [`README.md`](README.md#testing) for the full local dev and testing setup.
