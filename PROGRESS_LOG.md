## 2026-05-24 — PermissionContext cleanup: ChartScreen/AppBottomNav

Baseline/branch:
- branch: refactor-v2

What we changed:
- Standardized `AppBottomNav` permission context to pass `{ currentUserAccess, hasPlan }` directly.
- Removed unused legacy `isOnTrial` / `remainingTrialDays` props from `ChartScreen`.
- Removed the same unused props from the `ChartScreen` call in `app/page.tsx`.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: not needed for this small prop cleanup

Result:
- OK

Next:
- Continue with minimal permission/context cleanup only where safe.

## 2026-05-24 — Refactor cleanup: remove adminHasActiveSubscription legacy flag

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed the legacy `adminHasActiveSubscription` naming repo-wide.
- Standardized remaining core wiring to use the unified `hasPlan` flag.
- Updated:
  - `lib/app-context.tsx`
  - `lib/core/full-access-state.ts`
  - `lib/core/scenes-guard.ts`
  - `lib/core/scenes-state.ts`
  - `lib/core/subscription-state.ts`
  - `lib/core/users-state.ts`
  - `lib/permissions.ts`
  - `lib/plan.ts`
  - `components/settings-screen.tsx` comment cleanup
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: Lock/Unlock works and sends API calls

Result:
- OK

Next:
- Continue refactor-v2 with minimal diffs only.
- Optional next step: standardize remaining `PermissionContext` usage and remove unused trial fields where safe.


## 2026-02-09 — Session

Current commit/branch:
- commit: 16ca172
- branch: stable-working (refactor work goes to refactor-v2)

What works now:
- Lock/Unlock works
- build/lint ok

Next task:
- Start refactor-v2: make Lock/Unlock explicit actions + add manual POST check after refactors


# PROGRESS_LOG — SMART42 (APPEND-ONLY)

How to use:
- Add a new entry at the TOP after each work session.
- Keep it short.
- Always include: date/time, commit/branch, what changed, what was tested, what is next.

---

## YYYY-MM-DD (local time) — Session title
Baseline/branch:
- commit:
- branch:

What we changed:
- 

Tests done:
- lint:
- build:
- manual:

Result:
- 

Next:
- 

## 2026-02-09 — Anti-regression: Lock/Unlock must send real action (not only UI state)

Baseline/branch:
- stable baseline commit: 16ca172 (known good)
- work should continue in a separate refactor branch (e.g. refactor-v2)

What broke during refactor (root cause):
- Lock/Unlock UI button was still changing `doorState` (UI state),
  but the real side effect (calling `doorActions.lock/unlock` -> API) was lost.
- Result: button “looked clickable” but no real lock/unlock command was sent.

How to prevent this in the next refactor:
1) Keep Lock/Unlock as explicit ACTIONS in the context API:
   - prefer `lockDoor()` / `unlockDoor()` (or `setDoorState` MUST also trigger doorActions),
   so we cannot accidentally refactor away the side-effect.
2) Add a mandatory manual smoke-test after ANY refactor touching:
   - `lib/app-context.tsx`, `lib/core/lock-state.ts`, door actions/api, dashboard handlers.
   Smoke-test = click Lock then Unlock and confirm in dev terminal logs:
   - `POST /api/doors/lock`
   - `POST /api/doors/unlock`
3) After each change: `npm run lint` + `npm run build` + `npm run dev` and re-test Lock/Unlock.
4) Use frequent git checkpoints (small commits) so regressions are easy to revert.

Next:
- When starting refactor-v2: implement (1) first, then refactor other modules.

- Lesson: When a core feature breaks after refactor, do NOT guess.
  Use git to locate the exact change:
  - `git reflog -20` (find last known-good HEAD)
  - or `git bisect` between good/bad commits
  This is faster than patching blindly.
