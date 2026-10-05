# Kawan Project Conventions

## Source of truth

`docs/kawan-spec.md` decides. `docs/PRD.md` (product), `docs/TRD.md` (technical), and `docs/task-list.md` (lane assignments) are derived views — when they conflict with the spec, the spec wins; flag the discrepancy instead of silently picking one.

Platform reference for Chutes API work lives in `docs/references/` (chutes-llms.md is a snapshot of https://chutes.ai/llms.txt; the live URL is authoritative for API details).

## Library docs — don't trust memory on pinned versions

Before writing code against this repo's pinned libraries — **PixiJS v6 + pixi-live2d-display, React 18, FastAPI, SQLAlchemy 2 async, APScheduler 3.x** — verify current, version-correct APIs via the Context7 MCP tools rather than memory. Training-data drift on these (especially PixiJS, which is v8+ upstream while we pin v6) is the main source of subtle breakage.

## Agent skills

### Issue tracker

Issues live in the `M1KUAPP/Kawan` GitHub repo via the `gh` CLI. Tracking is optional per teammate — `docs/task-list.md` stays the canonical task assignment; the five phase-gate milestones exist if you choose to file issues. See `docs/agents/issue-tracker.md`.

Issues are a convenience for work that benefits from a ticket. The `spike` and `priority:*` labels and the five phase-gate milestones are orthogonal to the triage labels in `triage-labels.md`.

### Triage labels

Five canonical triage roles map to identically-named labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

All five triage labels exist on the repo.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/grill-with-docs`). See `docs/agents/domain.md`.
