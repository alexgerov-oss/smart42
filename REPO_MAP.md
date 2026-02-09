# REPO_MAP — SMART42

This file is a **structure snapshot** of the repository, so a new chat can understand “what exists where”.
It is NOT a place for refactor TODOs (those go to `REFACTOR_NOTES.md`).

---

## Current stable baseline

- Stable commit (known good): `16ca172`
- Working branch (typical): `refactor/core-extract`

> If you move to a new stable commit, update the hash above.

---

## How to regenerate the repo file list

Run (in repo root):

- Generate full file list:
  - `git ls-tree -r --name-only HEAD > REPO_FILE_LIST.txt`

- (Optional) Show current commit:
  - `git rev-parse --short HEAD`

---

## High-level folder map

### app/
Next.js App Router entry points.
- `app/layout.tsx` — root layout (wraps AppProvider)
- `app/page.tsx` — main page
- `app/api/**` — API routes (local mock endpoints during UI phase)

### components/
UI screens/cards. These consume `useAppContext()` and should remain mostly “dumb UI”.
Examples (names may evolve; see `REPO_FILE_LIST.txt` for exact list):
- dashboard screen + cards (lock/unlock button is here)
- settings screen
- scenes screen
- activity log screen

### lib/
Shared logic.
- `lib/app-context.tsx` — **composition layer only**
  - wires together core hooks
  - exposes the unified `AppContext` API used by components
- `lib/permissions.ts` — centralized permission checks (role/plan gating)
- `lib/core/*` — extracted business logic hooks + pure helpers:
  - `subscription-state.ts` (trial/premium → plan status)
  - `lock-state.ts` + `lock-timers.ts` (door state + timers)
  - `doors-state.ts` (doors CRUD + persistence)
  - `users-state.ts` + `users.ts` (iButtons + app users rules/mutations)
  - `identity-state.ts` (currentUserId + name overrides wiring)
  - `session-state.ts` (session password)
  - `system-status-state.ts` (UI expand/collapse)
  - `access-state.ts` (role switching)
  - `controllers-state.ts` + `controllers-wiring.ts`
  - `storage.ts` (localStorage wrapper)

---

## Critical flows (quick orientation)

### Lock/Unlock flow (must not break during refactor)
UI button (components) →
`useAppContext().setDoorState("lock"|"unlock")` →
`lib/core/lock-state.ts` (state) →
(door action wiring) →
`lib/core/door-actions.ts` →
`lib/core/api.ts` →
`app/api/doors/(lock|unlock)/route.ts`

If lock/unlock stops working after refactor:
- Verify `setDoorState` is still called by UI (no gating by quickControlsLocked)
- Verify door-actions + api routes still exist and are called
- Verify API route returns success (mock) and does not throw

---

## Documentation index (what to attach in a new chat)

Minimal set for a new chat:
1) `HANDOFF.md`
2) `PROGRESS_LOG.md`
3) `ARCHITECTURE.md`
4) `PROJECT_LOGIC_SPEC.md`
5) `REPO_MAP.md`
6) `REPO_FILE_LIST.txt` (if the question is about “where is X / what files exist”)
