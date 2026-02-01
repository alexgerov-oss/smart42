# ARCHITECTURE

## 1) Overview

This project is a smart door access control system UI (Next.js + React + Tailwind + shadcn/ui) with clear separation:

- `lib/app-context.tsx` = **composition/wiring only**
- `lib/core/*` = **business logic hooks + pure helpers**
- Components/screens consume context state via `useAppContext()`

Key principle:
> Anything that can be a pure function or a hook goes to `lib/core/*`.
> `lib/app-context.tsx` stays as a thin composition layer.

---

## 2) Folder Map

### `lib/app-context.tsx`
- Provides `AppContext` + `AppProvider`
- Composes core hooks and exposes one unified context API to screens/components

### `lib/core/*` (main extracted blocks)
- `subscription-state.ts`  
  Trial/Premium state + computed values:
  - `trialDaysLeft`
  - `adminHasActiveSubscription`

- `quick-controls-state.ts`  
  UI preference persistence: `quickControlsLocked`

- `session-state.ts`  
  Session-only state: `sessionPassword`

- `access-state.ts`  
  Role switching state: `currentUserAccess`

- `system-status-state.ts`  
  UI state: `isSystemStatusExpanded`

- `identity-state.ts`  
  `currentUserId` + name overrides wiring:
  - `nameOverrides`
  - `getEntityName`
  - `setEntityName`

- `scenes-state.ts`  
  Scenes state + rules wiring:
  - `canCreateScene()`
  - `setScenes()` normalizes by guards (subscription/role limits)

- `lock-state.ts`  
  Door lock state + timers:
  - auto lock countdown
  - auto night lock schedule

- `profile-state.ts`  
  Profile data and Full Access activation gating (state only):
  - `userNamesByRole`, `userName`, `userEmail`
  - `fullAccessCreatedByAdmin`, `fullAccessProfileByAdmin`
  - `creatorIdentity`
  - `canOperateFullRestrictedActions`

- `users-state.ts`  
  iButtonUsers + appUsers state + mutations + guards (role/subscription):
  - add/update/remove iButton users
  - add/update/remove app users
  - updates propagate full-access profile callbacks

- `full-access-state.ts`  
  Derived helpers:
  - `fullAccessAccountCount`
  - `canCreateFullAccessAccount`
  - `canFullAccessAddUsers`
  - `getFullAccessUserProfile`

- `controllers-wiring.ts`  
  Thin wrapper around `useControllersState` for consistent wiring

Other existing core modules used by the above:
- `doors-state.ts`, `controllers-state.ts`, `scenes-guard.ts`, `lock-timers.ts`
- `users.ts` (pure helpers)
- `profile-sync.ts` (sync logic: name → appUsers)

---

## 3) Rules / Guards (important)

### Roles
- `admin` has full access.
- `full` may be blocked from restricted actions until activated by admin (`fullIsActivated`).
- `open-close` has the most restrictions.

### Subscription
- `adminHasActiveSubscription` is derived from:
  - active trial OR premium

### Scenes limits
Implemented via `lib/core/scenes-guard.ts` and used by `useScenesState`:
- `open-close` cannot create scenes
- without subscription: max 1 scene
- with subscription: higher limits (as defined in guard)

### Users (iButton/App users)
Creation/editing is gated by:
- role restrictions (`open-close`)
- subscription checks (where applicable)
- full-access activation gating (`canOperateFullRestrictedActions`)

---

## 4) State flow

- Screens/components call `useAppContext()`.
- `AppProvider` composes state from core hooks and exposes a stable API.
- Persistence:
  - trial/premium persisted via `load*/save*`
  - UI prefs persisted via `loadQuickControlsLocked/saveQuickControlsLocked`
  - other states are in-memory unless explicitly persisted

---

## 5) Extension points (next steps)

- Add backend API integration (controllers/doors/users/scenes persistence)
- Introduce tests for guards and pure helpers (scenes/users limits)
- Replace demo profile data with real auth/user identity when backend is ready
