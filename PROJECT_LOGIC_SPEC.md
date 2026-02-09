# PROJECT_LOGIC_SPEC — SMART42 (AUTHORITATIVE)

STATUS: **AUTHORITATIVE / RULES OF THE APP**
If there is any conflict:
- **This file wins** over ARCHITECTURE / DEV_WORKFLOW / REFACTOR_NOTES.

STABLE BASELINE (known good, no errors, Lock/Unlock works):
- **commit: 16ca172**

UI PROTECTION (NON-NEGOTIABLE):
- UI, layout, spacing, colors, animations, and visual structure **MUST NOT be changed**.
- This project must be **REFACTORED, not rewritten**.
- Reuse existing components/pages/routes. Refactor logic inside current files.

---

## 0) Roles & Access Levels

Roles:
- Admin
- Full Access
- Open / Close Only

### 0.1 Admin
Admin has full control. Admin CAN:
- Add / edit / delete doors
- Add / edit / delete app users
- Add / edit / delete iButtons
- View Activity
- Change controller settings
- Rename anything globally
- Start / manage trial
- Upgrade to premium

Admin CANNOT:
- Be restricted by any trial limitations

### 0.2 Full Access
Full Access CAN:
- Lock / unlock doors
- Rename doors (local rename – visible only to this user)
- Rename iButtons (local rename – visible only to this user)
- Add app users ONLY if:
  - Admin has premium OR Admin has active trial

Full Access CANNOT:
- Add doors
- Delete doors
- See admin-only settings
- Change controller-level settings
- See admin-only name overrides

### 0.3 Open / Close Only
Open / Close Only CAN:
- Lock / unlock doors

Open / Close Only CANNOT:
- Add doors
- Add users
- Rename anything
- Access Activity
- Access Settings

---

## 1) Trial & Premium Logic

Trial:
- Owned by Admin
- Affects permissions of Full Access users
- Enables:
  - Adding app users
  - Advanced features

When trial ends:
- Full Access loses user-management permissions
- UI buttons become disabled (not hidden unless specified)

---

## 2) Doors Logic

Door identity:
- id
- systemName (immutable)
- createdBy (admin)
- createdAt

Door display name:
- Each user can have local name override:
  - localDoorName[userId][doorId]

Rules:
- Local door name is visible ONLY to the user who set it
- Switching tabs or reload MUST preserve the name
- Local names persist across sessions

---

## 3) iButton Logic

iButton identity:
- id
- systemName
- createdBy
- createdAt

iButton display names:
- Each role can override name locally

Rules:
- Admin sees only admin-defined name
- Full Access sees only their own renamed version
- Name changes are NOT shared across roles
- Rename modal must show the LAST name set by the current user

---

## 4) App Users Logic

App user naming:
- Admin and Full Access can rename users locally
- Name changes visible ONLY to the user who made them
- App users list must reflect local naming
- Switching tabs must NOT reset names

---

## 5) Home Screen Behavior

- On login → scroll position must be at TOP
- On trial activation → redirect to Home, scroll TOP
- Door dropdown expands dynamically with controls aligned right
- Add (+) and Edit (✏️) buttons:
  - Visible ONLY to Admin
  - Right-aligned
  - Spacing preserved

---

## 6) Activity Access

- Admin → full access
- Full Access → access allowed
- Open / Close Only → NO access (tab hidden or blocked)

---

## 7) Controller Input Validation

Controller ID:
- Confirm button active ONLY after ≥ 8 characters

Restart controller:
- Requires confirmation modal

---

## 8) UI Stability Rules

- No layout resizing on dynamic text
- Containers must reserve max height
- Auto lock / closed labels move upward instead of resizing container

---

## 9) Local Override Storage Rules (TEMP MOCK)

Persistence:
- All local name overrides MUST be persisted

Allowed storage:
- Backend (preferred)
- OR localStorage scoped by:
  - userId
  - doorId / iButtonId / appUserId

Example:
- localDoorName[userId][doorId] = "My Door Name"

Rules:
- Overrides MUST survive:
  - tab switch
  - page reload
  - logout / login
- Overrides MUST NOT leak between users

Backend-ready requirement:
- Local storage is temporary mock
- Data structures must be compatible with future API replacement

---

## 10) Name Resolution Priority

When displaying a name:
1) Check local override for current user
2) If not exists → fallback to system/admin name
3) Never merge names between roles

Admin NEVER sees:
- Full Access local names
- Open/Close Only local names

---

## 11) Role Change Behavior

If a user's role changes:
- Their local overrides remain stored
- UI permissions update immediately
- Hidden buttons stay hidden
- Disabled buttons stay disabled
- No data cleanup unless explicitly deleted

---

## 12) Error Safety Rules

If permission logic fails:
- Default to MOST restrictive behavior
- Disable buttons instead of enabling
- Never allow forbidden action silently

---

## 13) Development Mode Rules

While refactoring:
- No feature removal
- No visual cleanup
- No “simplification” of UI
- Only logic corrections allowed
