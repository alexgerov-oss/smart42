# REFACTOR_NOTES — SMART42 (WORKING NOTES)

STATUS: **WORKING NOTES / TODO LIST**
If conflict: PROJECT_LOGIC_SPEC.md wins.
Stable baseline: **16ca172**

Goal:
- Make `lib/app-context.tsx` a thin composition layer
- Move business logic into `lib/core/*`
- Keep UI unchanged

---

## Completed extractions (as of baseline)
- Subscription state → `lib/core/subscription-state.ts`
- Quick controls UI pref → `lib/core/ui-preferences.ts` (or `quick-controls-state.ts`)
- Session state → `lib/core/session-state.ts`
- Scenes state/guards wiring → `lib/core/scenes-state.ts`
- Lock state/timers → `lib/core/lock-state.ts`
- Profile state (no sync inside) → `lib/core/profile-state.ts`
- Users state + mutations → `lib/core/users-state.ts`
- Full access derived helpers → `lib/core/full-access-state.ts`
- Controllers wiring wrapper → `lib/core/controllers-wiring.ts`
- Access state → `lib/core/access-state.ts`
- System UI state → `lib/core/system-status-state.ts`
- Identity + name overrides wiring → `lib/core/identity-state.ts`

---

## Notes (rules while refactoring)
- Avoid manual `useMemo` wrappers that conflict with React hook lint rules unless clearly needed.
- App-context should remain readable and predictable: compose core hooks and expose context API.
- Never break Lock/Unlock: always re-test after changes.

---

## Next (suggested)
1) Optional: extract profile-sync wiring into a dedicated core hook.
2) Optional: add basic tests for guards (scenes/users limits).
3) Backend readiness: keep data structures compatible with future API replacement.

## Common refactor failure modes (avoid)
- Import/export drift: don't import a hook that doesn't exist (example: `useUiPreferences`).
  Prefer keeping module public API stable during refactors.
- Duplicate imports / duplicate hook names in app-context can create silent breakage.
- After any extraction: run `npm run build` (catches missing exports early).

