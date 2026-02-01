# REFACTOR_NOTES

## Goal
Make `lib/app-context.tsx` a thin composition layer and move logic into `lib/core/*`.

## Completed extractions
- Subscription state → `lib/core/subscription-state.ts`
- Quick controls UI pref → `lib/core/quick-controls-state.ts`
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

## Notes
- Avoid manual `useMemo` wrappers that conflict with React Compiler lint rules.
- Prefer returning plain objects/functions from hooks unless memoization is clearly needed.
- App-context should stay readable and predictable: compose core hooks and expose context API.

## Next
- Optional: extract the profile-sync wiring (createSetUserNameHandler + useProfileSyncToAppUsers) into a dedicated core hook.
- Optional: add basic tests for guards (scenes/users limits).
