# ARCHITECTURE — SMART42 (REFERENCE MAP)

STATUS: **REFERENCE / OWNERSHIP MAP**
If conflict: PROJECT_LOGIC_SPEC.md wins.
Stable baseline: **16ca172**

Goal:
- `lib/app-context.tsx` = **composition/wiring only**
- `lib/core/*` = **business logic hooks + pure helpers**
- Components consume via `useAppContext()`

---

## 1) Folder Map (what lives where)

### `app/`
- Next.js App Router pages + API routes

### `components/`
- UI screens/cards
- MUST NOT contain business logic (only calls into context)

### `lib/`
- `app-context.tsx` (wiring layer)
- `permissions.ts` (central permission checks)
- `core/` (domain modules, state hooks, persistence, guards)

---

## 2) Main modules (core ownership)

### Wiring / composition
- `lib/app-context.tsx`
  - Provides `AppContext` + `AppProvider`
  - Composes core hooks and exposes one unified API

### Core: subscription/plan
- `lib/core/subscription-state.ts`
  - Derived:
    - `trialDaysLeft`
    - `adminHasActiveSubscription` (active plan = trial OR premium)

### Core: UI prefs
- `lib/core/ui-preferences.ts` (or `quick-controls-state.ts` if that is the actual file)
  - `quickControlsLocked` persistence

### Core: session
- `lib/core/session-state.ts`
  - `sessionPassword`

### Core: role switching / access
- `lib/core/access-state.ts`
  - `currentUserAccess`

### Core: system status UI
- `lib/core/system-status-state.ts`
  - `isSystemStatusExpanded`

### Core: identity + name overrides wiring
- `lib/core/identity-state.ts`
  - `currentUserId`
  - `nameOverrides`
  - `getEntityName / setEntityName`

### Core: doors
- `lib/core/doors-state.ts`
  - list + add/update/remove (guarded by role)
- `lib/core/api.ts` + `lib/core/door-actions.ts`
  - lock/unlock actions -> API routes

### Core: scenes
- `lib/core/scenes-state.ts`
  - scenes state + wiring to guards
- `lib/core/scenes-guard.ts`
  - limit + normalize logic

### Core: lock/timers
- `lib/core/lock-state.ts`
  - `doorState`, auto lock, night lock
- `lib/core/lock-timers.ts`
  - extracted timer hooks

### Core: profile + full access gating
- `lib/core/profile-state.ts`
  - base profile state + derived gating flags
- `lib/core/profile-sync-state.ts`
  - sync logic (name -> appUsers), if present
- `lib/core/full-access-state.ts`
  - derived helpers (counts + canCreate + profile getters)

### Core: users (iButton + app users)
- `lib/core/users-state.ts`
  - users state + mutations + guards
- `lib/core/users.ts`
  - pure helper functions / rules
- `lib/core/users-persistence.ts`
  - load/save of users lists

### Core: controllers
- `lib/core/controllers-state.ts`
  - controllers state + actions
- `lib/core/controllers-wiring.ts`
  - thin wrapper for consistent wiring

---

## 3) Data flow (critical paths)

### 3.1 Lock/Unlock (most fragile)
UI -> `useAppContext().setDoorState("lock"|"unlock")`
-> `useLockState` updates state
-> real action is executed via:
`door-actions.ts` -> `api.ts` -> `/api/doors/lock|unlock`

Rule:
- UI must NOT replace lock state with local demo state.

### 3.2 Users
UI -> AppContext -> users-state -> guards/helpers -> persistence

### 3.3 Scenes
UI -> AppContext -> scenes-state -> scenes-guard -> persistence

---

## 4) Persistence (current)
Currently mocked via browser storage (until backend):
- Local overrides and some lists persist across refresh.

---

## 5) Extension points
- Add backend API persistence (doors/users/scenes/controllers)
- Add tests for guards (scenes/users limits)
