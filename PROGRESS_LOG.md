## 2026-05-25 — Refactor cleanup: safe type/import simplifications

Baseline/branch:
- branch: refactor-v2

Commits:
- c5b2754 refactor: remove unused cn imports
- b83c95e refactor: simplify scenes button variant class
- 7c89415 refactor: type crypto randomUUID helper
- 40b45c0 refactor: remove activity log id any cast

What we changed:
- Removed unused `cn` imports after visibility selector extraction.
- Simplified one `Scenes` className from `cn(buttonVariants(...))` to `buttonVariants(...)`.
- Removed `any` casts around `crypto.randomUUID` in `lib/id.ts`.
- Removed unnecessary `any` cast in `lib/core/activity-log-state.ts`.

What we did NOT change:
- No UI changes.
- No theme color changes.
- No layout/spacing/animation changes.
- No permission logic changes.
- No localStorage behavior changes.
- No Lock/Unlock logic changes.
- No activity log behavior changes.
- No ID generation behavior changes.

Tests done:
- lint: OK after each code change
- build: OK after each code change
- pushes: OK
- final working tree: clean

Notes:
- `components/ui/dialog.tsx` still contains one `any` workaround for `aria-describedby`.
- We intentionally did not touch it because it is a shared Dialog/accessibility workaround and has higher risk of changing UI/accessibility behavior.

Result:
- OK

## 2026-05-25 — UI polish: add visibility theme selector to app tabs

Baseline/branch:
- branch: refactor-v2
- commits:
  - e92316c style: add visibility theme selector to settings
  - 86d012c style: add visibility theme selector to activity
  - 4ab46b5 style: add visibility theme selector to scenes
  - 4282929 style: add visibility theme selector to profile

What we changed:
- Added the same 3 visibility theme selector squares to the main app tabs:
  - Settings
  - Activity
  - Scenes
  - Profile
- Selector placement matches Home:
  - top right side
  - aligned opposite the page title
- Selectors update the shared localStorage key:
  - homeVisibilityTheme
- Changing the selector from any supported tab now syncs the selected visibility theme with Home and the other themed tabs.
- Added swatch styling per screen:
  - dark square
  - diagonal dark/white square
  - white square
- Kept black header/bottom/navigation areas unchanged where they were intended to remain black.
- Kept red/green/status colors unchanged.
- Kept primary/accent colors unchanged.
- No permission logic changes.
- No layout/spacing/animation changes beyond placing the selector in the existing header row.

Tests done:
- lint: OK after each screen change
- build: OK after each screen change
- final lint: OK
- final build: OK
- manual: Settings selector works and syncs theme to Home
- manual: Activity selector works and syncs theme to Home
- manual: Scenes selector works and syncs theme to Home
- manual: Profile selector works and syncs theme to Home
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock after each screen change

Result:
- OK

Next:
- Consider extracting the duplicated visibility theme selector/theme constants into a shared component/helper later.
- Do not do broad refactor unless explicitly requested.
- Continue with small screen-by-screen UI diffs.

## 2026-05-25 — UI polish: apply visibility theme across main app tabs

Baseline/branch:
- branch: refactor-v2
- commits:
  - d8f6935 style: sync bottom nav with home visibility theme
  - 9e20e8f docs: update progress log for bottom nav theme
  - bc08890 style: apply visibility theme to settings
  - 1478c00 style: apply visibility theme to activity
  - 8c5b11c style: apply visibility theme to scenes
  - a8a378d style: apply visibility theme to profile

What we changed:
- Extended the Home visibility theme behavior to the main app tabs one screen at a time.
- Bottom navigation inactive gray icons/text now follow the selected visibility theme.
- Applied the same 3 visibility levels to:
  - Settings
  - Activity
  - Scenes
  - Profile
- Theme selection still uses localStorage key: homeVisibilityTheme.
- Default first-load visibility theme is now soft.
- Kept black elements unchanged.
- Kept red/green/status colors unchanged.
- Kept primary/accent colors unchanged.
- Kept layouts, spacing, animations, and permission logic unchanged.
- Settings:
  - cards, inner tiles, muted labels/text, and bottom nav follow visibility theme.
- Activity:
  - header, filter area, activity cards, muted descriptions/time/date text, and bottom nav follow visibility theme.
- Scenes:
  - header, scene cards, scene editor card, condition tiles, muted labels/text, and bottom nav follow visibility theme.
- Profile:
  - header, profile/contact/account/support cards, inner info tiles, muted labels/text, and bottom nav follow visibility theme.

Tests done:
- lint: OK after every screen change
- build: OK after every screen change
- final lint: OK
- final build: OK
- manual: Settings visibility theme test OK
- manual: Activity visibility theme test OK
- manual: Scenes visibility theme test OK
- manual: Profile visibility theme test OK
- manual: bottom navigation stays black while inactive icons/text brighten by theme
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock after each screen change

Result:
- OK

Next:
- Consider extracting duplicated visibility theme constants/helpers into a shared helper only if needed later.
- Do not start a broad theme refactor unless explicitly requested.
- Continue with small, screen-by-screen diffs.

## 2026-05-25 — UI polish: sync bottom nav with Home visibility theme

Baseline/branch:
- branch: refactor-v2
- commit: d8f6935

What we changed:
- Updated bottom navigation inactive gray icons/text to follow the selected Home visibility theme.
- Bottom navigation bar background remains unchanged/black.
- Active bottom nav tab color remains unchanged (`text-primary`).
- Home visibility themes now affect bottom nav inactive text/icons:
  - dark: original muted gray
  - soft: brighter gray
  - day: brightest gray
- Adjusted day theme bottom nav gray to be clearly brighter than soft.
- Made default Home visibility theme `soft` for first app load when no localStorage value exists.
- Made inactive Unlock label brighter only in the day theme.
- No layout/spacing/animation changes.

Tests done:
- lint: OK
- build: OK
- manual: bottom nav inactive icons/text change correctly across all 3 Home visibility themes
- manual: bottom nav bar stays black
- manual: active bottom nav tab color unchanged
- manual: inactive Unlock label is brighter in day theme
- manual: default first-load Home visibility theme is soft
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Decide whether visibility theme remains Home-only or becomes app-wide.
- If app-wide, apply one screen at a time with minimal diffs:
  - Settings
  - Activity
  - Scenes
  - Profile
- Do not start broad theme refactor.

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-25 — UI prototype: Home visibility theme selector

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a Home-only visibility theme selector next to SmartDoor Inc.
- Added 3 small square theme buttons:
  - dark square = current/dark theme
  - diagonal dark/white square = medium/day visibility theme
  - white square = brightest visibility theme
- Theme choice is persisted in localStorage as homeVisibilityTheme.
- Change is currently scoped only to Home/Dashboard screen.
- Adjusted Home gray surfaces only:
  - large cards get slightly lighter per theme
  - inner dark tiles remain darker for contrast
  - muted gray text changes per selected theme
- Kept black elements black.
- Kept red/green/primary/accent colors unchanged.
- Improved Home Main Door dropdown visibility:
  - clearer gray border
  - clearer chevron/arrow
  - dropdown text/chevron follows Home visibility theme.
- Inactive Lock/Unlock labels now follow selected Home visibility theme.
- No intended layout/spacing/animation changes except adding the 3 selector squares in the Home header.

Tests done:
- lint: OK
- build: OK
- manual: Home selector appears next to SmartDoor Inc.
- manual: selector squares are visually understandable
- manual: selected theme persists after refresh
- manual: Home cards and inner tiles keep acceptable contrast
- manual: Main Door dropdown is clearer in dark theme
- manual: inactive Lock/Unlock label changes with selected theme
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Start new chat because current chat became slow.
- Continue carefully from this Home-only prototype.
- Next planned UI tasks:
  1. Make bottom navigation gray icons/text follow the selected Home visibility theme.
  2. Decide whether the visibility theme should remain Home-only or become app-wide.
  3. If app-wide, apply the same 3 visibility levels to other tabs one screen at a time.
  4. Do not change black, red, green, primary/accent colors.
  5. Keep all diffs minimal and test after each screen.
- Important caution:
  - This theme prototype touched more lines than the previous small UI border fixes.
  - If anything looks wrong, it can still be reverted with:
    git restore components/dashboard-screen.tsx
  - Do not start broader theme refactor until Home + navigation are stable.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-25 — UI polish: improve Lock/Unlock slider outline

Baseline/branch:
- branch: refactor-v2

What we changed:
- Improved Lock/Unlock slider visibility on the Home/Dashboard screen.
- Kept the slider track fill black.
- Changed the slider track border from theme border to gray-700.
- Kept the red/green lock/unlock knob behavior unchanged.
- No layout/spacing/animation changes.

Tests done:
- lint: OK
- build: OK
- manual: Lock/Unlock slider is visually clearer
- manual: Lock button still works
- manual: Unlock button still works
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Continue only with explicit UI tweaks requested by the user.
- Keep diffs minimal and avoid unrelated visual changes.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-25 — UI polish: improve Login input visibility

Baseline/branch:
- branch: refactor-v2

What we changed:
- Improved default visibility of Login screen input fields.
- Changed Email and Password input normal border from theme border to gray-500.
- Focus behavior remains unchanged.
- No layout/spacing/animation changes.

Tests done:
- lint: OK
- build: OK
- manual: Email and Password fields are clearly visible before focus
- manual: focus border still works
- manual: Admin/App User login still works
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Continue only with explicit UI tweaks requested by the user.
- Keep diffs minimal and avoid unrelated visual changes.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-25 — UI polish: add inactive Quick Controls switch outline

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a visible gray outline to inactive Quick Controls switches.
- Applied the change only to:
  - Automatic Lock switch
  - Automatic Night Lock switch
- Set inactive switch fill to gray-700 in light/dark states.
- Kept inactive switch outline gray-400.
- No layout/spacing/animation changes.

Tests done:
- lint: OK
- build: OK
- manual: inactive Quick Controls switches now look like switch controls
- manual: active switch state remains unchanged
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Continue only with explicit UI tweaks requested by the user.
- Keep diffs minimal and avoid unrelated visual changes.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-25 — UI text: show App User inviter and invite timestamp

Baseline/branch:
- branch: refactor-v2

What we changed:
- Updated App Users list invited status text.
- Invited App Users now show who invited them:
  - Invited by Admin
  - Invited by Full Access
- Added invite timestamp after the inviter text.
- Timestamp format is: 25 MAY 2026 - 12:12 AM.
- No layout/color/spacing/animation changes.

Tests done:
- lint: OK
- build: OK
- manual: Admin-created Open/Close user shows Invited by Admin with timestamp
- manual: Full Access-created Open/Close user shows Invited by Full Access with timestamp
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Continue manual role/login sanity pass.
- Fix only concrete bugs found during testing.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-25 — Bugfix: remove manual App User password field

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed the manual Password input from the Invite New User dialog.
- App Users are now created with name, email, and access role only.
- Added temporary mock generated password for new App Users: smart42-temp.
- App User login still works with the created email and the temporary mock password.
- Kept existing local/mock storage flow until backend/email delivery is added.
- No layout/color/spacing/animation changes.

Tests done:
- lint: OK
- build: OK
- manual: Admin with trial/premium can create Full Access user without password field
- manual: Full Access login works with created email + smart42-temp
- manual: Admin with trial/premium can create Open/Close user without password field
- manual: Open/Close login works with created email + smart42-temp
- manual: Lock/Unlock still sends POST /api/doors/lock and POST /api/doors/unlock

Result:
- OK

Next:
- Continue manual role/login sanity pass.
- Later replace mock temporary password with real backend-generated password + email delivery.

"""

p.write_text(entry + old, encoding="utf-8")
PY

## 2026-05-24 — Bugfix: gate Open/Close profile and restore default door

Baseline/branch:
- branch: refactor-v2

What we changed:
- Applied complete App User checks to Open/Close Only role switching.
- Open/Close Only can no longer be entered unless a real App User exists with name, email, and password.
- Admin or Full Access can create Open/Close users when plan rules allow it.
- Added role profile initialization for App Users so Open/Close receives the Admin/Full-created name and email.
- App User login now initializes the target role-local profile.
- Restored default Main Door when browser storage has no doors, so Lock/Unlock still works after clearing localStorage.
- No layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: Open/Close blocked until complete App User exists
- manual: Open/Close shows created name/email after switch/login
- manual: Lock/Unlock works again after clearing localStorage

Result:
- OK

Next:
- Continue manual role/login sanity checks.

## 2026-05-24 — Bugfix: remove default Full Access mock profile

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed default Full Access mock identity values.
- Full Access no longer starts with Jane Smith / jane.smith@example.com.
- Switching to Full Access now requires a real Admin-created Full Access App User with name, email, and password.
- Home now shows the current role-local userName, so Full Access local name changes appear on Home.
- Removed unused Full Access profile fallback from Dashboard.
- No layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: cleared localStorage appUsers/iButtonUsers and confirmed Full Access is blocked until Admin creates the user

Result:
- OK

Next:
- Continue manual role/login sanity checks.

## 2026-05-24 — Bugfix: add App User password login flow

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added password field to AppUser mock model.
- Admin now sets App User password when inviting/creating an App User.
- App User creation requires non-empty name, email, and password.
- Login now checks App User email/password first.
- Matching App User login switches to that user's access role.
- Existing Admin sessionPassword login remains as fallback.
- No layout/color/spacing changes beyond adding the required password input to existing invite dialog.

Tests done:
- lint: OK
- build: OK
- manual: pending login checks

Result:
- OK

Next:
- Manual test Admin creates Full Access with email/password, then login with those credentials.

## 2026-05-24 — Bugfix: gate Full Access role switching

Baseline/branch:
- branch: refactor-v2

What we changed:
- Blocked switching to Full Access when Admin has no trial/premium.
- Blocked switching to Full Access when Admin has not created a Full Access App User.
- Removed old free-admin App User creation fallback in users-state.
- Full Access role-local name/email now initialize from the Admin-created Full Access profile.
- Full Access can still later change own local name/email.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: pending role switch checks

Result:
- OK

Next:
- Add proper per-user password model for App Users in a separate step.

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Bugfix: plan-gated App Users and iButtons

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed old free-plan App User limit logic from Settings.
- Admin without plan can no longer add App Users.
- App Users now require trial/premium plan.
- Fixed iButton creation rules:
  - Admin without plan can add maximum 1 iButton.
  - Full Access can add iButtons only when Admin has active plan.
  - Open/Close Only cannot add iButtons.
- Updated UI permission layer for iButton add access.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: pending Settings role checks

Result:
- OK

Next:
- Manual test Settings as Admin, Full Access, and Open/Close Only.
- Commit after manual sanity check.

"""

p.write_text(entry + old, encoding="utf-8")
PY

## 2026-05-24 — Handoff: next task is plan-gated users/iButtons cleanup

Baseline/branch:
- branch: refactor-v2
- working tree: should be clean before starting
- latest confirmed state: build/lint OK; last pushed commits are OK

What we fixed in this chat:
- Removed legacy `adminHasActiveSubscription` naming repo-wide; code now uses `hasPlan`.
- Cleaned `PermissionContext` usage where safe.
- Fixed `AppBottomNav` runtime errors caused by leftover `plan` references.
- Added `allowedDevOrigins: ["192.168.18.142"]` to `next.config.mjs` to remove Next dev LAN warning.
- Added hidden `DialogTitle` to `CircularTimePicker` to fix Radix Dialog accessibility warning.
- Fixed Full Access profile name:
  - Full Access can change own local profile name.
  - Admin does not see that as Admin’s own name.
- Fixed profile emails:
  - Admin and Full Access now have separate role-local emails.
  - Changing Admin email no longer changes Full Access email.
  - Changing Full Access email no longer changes Admin email.
- Fixed Quick Controls:
  - Full Access can use Automatic Lock / Auto Lock Delay / Automatic Night Lock / Night Lock Time when Admin has not locked Quick Controls.
  - Admin lock still disables Quick Controls for Full Access.

Important rule clarification from user:
- Trial/Premium belongs only to Admin.
- Trial/Premium UI must not be visible to Full Access or Open/Close Only.
- Without trial/premium:
  - Only Admin should exist as an app user.
  - Admin can create maximum 1 iButton.
  - Admin cannot create any App Users.
  - Full Access and Open/Close Only should not be creatable/exist yet.
- With trial/premium:
  - Admin can create App Users:
    - Full Access
    - Open/Close Only
  - Full Access can add App Users only if Admin has active trial/premium.
  - Full Access can add iButtons only if Admin has active trial/premium.
  - Open/Close Only cannot add users/iButtons.

Next task:
- Fix Settings/App User/iButton permission logic according to the clarified rules.

Current suspected wrong code:
- `components/settings-screen.tsx`
  - currently has old free-plan App User logic:
    - `const appUsersLimitReached = isFreeAdmin && appUsers.length >= 1`
    - messages like: “On free plan you can add 1 app user...”
    - this is wrong and must be removed because Admin without plan cannot create any App Users.
  - current App User section likely needs:
    - `canAddAppUsers = Permissions.canAddAppUsers(permissionContext)` where permission itself should require `hasPlan`
    - no “1 free app user” logic
    - if no plan, button disabled/locked with message: get trial/premium to add App Users
  - iButton add currently may be blocked by Full Access activation guard or old logic.
- `lib/permissions.ts`
  - check:
    - `canAddAppUsers`
    - `canAddIButtons`
  - likely App Users should require `hasPlan` for Admin/Full.
  - iButtons should:
    - allow Admin without plan only through free limit of 1 in core/users logic
    - allow Full Access only when `hasPlan` is true
    - block Open/Close Only.
- `lib/core/users.ts`
  - current `canCreateIButtonUser(role, hasPlan, currentCount)` allows non-open-close with free count < 1.
  - needs to match clarified rule:
    - Admin without plan: allowed only if currentCount < 1.
    - Full Access without plan: false.
    - Admin/Full with plan: true.
    - Open/Close: false.
  - current `canCreateAppUser(role, hasPlan)` is probably OK if it returns false without plan for all roles except open-close always false.

Before editing in new chat:
1. Run:
   - `git status`
2. Confirm clean working tree.
3. Inspect:
   - `sed -n '120,155p' components/settings-screen.tsx`
   - `sed -n '210,255p' components/settings-screen.tsx`
   - `sed -n '795,820p' components/settings-screen.tsx`
   - `sed -n '1,120p' lib/permissions.ts`
   - `sed -n '1,80p' lib/core/users.ts`
4. Make minimal diffs only.
5. Do not change UI layout/spacing/colors/animations.
6. After every change:
   - `npm run lint`
   - `npm run build`
   - manual test Settings as Admin and Full Access.

Manual tests needed after next fix:
- Admin without plan:
  - cannot add App User
  - can add only 1 iButton
  - cannot create Full Access/Open Close Only user
- Admin with trial/premium:
  - can add App Users
  - can create Full Access/Open Close Only
  - can add more iButtons
- Full Access with Admin plan:
  - can add own iButtons
  - can add App Users if rules allow
- Full Access without Admin plan:
  - should not be reachable/existing under clarified rules
- Open/Close Only:
  - cannot add users/iButtons

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Bugfix: allow Full Access to use Quick Controls

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed over-restrictive Full Access activation guards from Quick Controls handlers.
- Full Access can now use Automatic Lock and Automatic Night Lock controls when Admin has not locked Quick Controls.
- Admin lock/unlock behavior remains unchanged.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: Full Access can use Quick Controls when unlocked by Admin
- manual: Admin lock still disables Quick Controls for Full Access

Result:
- OK

Next:
- Fix Full Access permissions for iButtons and App Users.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Bugfix: separate Admin and Full Access profile emails

Baseline/branch:
- branch: refactor-v2

What we changed:
- Changed profile email state from one shared `userEmail` to role-scoped `userEmailsByRole`.
- Admin and Full Access now have separate email values.
- `ProfileScreen` now displays the current role-local email.
- Full Access can change its own email without changing Admin email.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: Admin email remains separate from Full Access email
- manual: Full Access email remains separate from Admin email

Result:
- OK

Next:
- Continue with Full Access permission bugs: quick controls, iButton, scenes.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Bugfix: allow Full Access local profile name change

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed Full Access profile name editing.
- `ProfileScreen` now displays the current role-local `userName` instead of always preferring the admin-created Full Access profile name.
- `profile-sync.ts` now allows Full Access to save its own local name while still blocking Open/Close Only.
- Email behavior was intentionally left unchanged for now.

Tests done:
- lint: OK
- build: OK
- manual: Full Access can change own displayed name
- manual: Admin name remains separate

Result:
- OK

Next:
- Fix Full Access email separation so Admin and Full Access do not share the same email state.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Bugfix: Activity nav and time picker dialog accessibility

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed remaining stale `plan` reference in `components/app-bottom-nav.tsx`.
- Activity navigation now uses `hasPlan`.
- Added hidden `DialogTitle` to `components/ui/circular-time-picker.tsx`.
- Fixed Radix/Dialog accessibility warning when changing Automatic Night Lock time.
- No UI/layout/color/spacing changes.

Tests done:
- build: OK
- manual: Activity opens without runtime error
- manual: Automatic Night Lock time picker opens without DialogTitle warning

Result:
- OK

Next:
- Continue manual UI sanity pass before more refactor work.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Dev config: allow LAN dev origin

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added `allowedDevOrigins: ["192.168.18.142"]` to `next.config.mjs`.
- Fixed Next.js dev warning when opening the app from LAN IP.
- No UI/layout/color/spacing changes.

Tests done:
- build: OK
- dev: warning disappeared when opening `http://192.168.18.142:3000`

Result:
- OK

Next:
- Continue manual UI sanity pass.

"""

p.write_text(entry + old, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Bugfix: fix AppBottomNav runtime `plan is not defined`

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed runtime error in `components/app-bottom-nav.tsx`.
- Replaced leftover `plan` reference with `hasPlan` after previous cleanup removed the `plan` variable.
- No UI/layout/color/spacing changes.

Tests done:
- build: OK
- manual: app loads without `plan is not defined`
- manual: Lock/Unlock works

Result:
- OK

Next:
- Continue manual UI sanity pass before more refactor work.

"""

p.write_text(entry + old, encoding="utf-8")
PY

## 2026-05-24 — Docs cleanup: remove stale back-compat comment

Baseline/branch:
- branch: refactor-v2

What we changed:
- Updated stale comment in `lib/permissions.ts`.
- Changed `Keep alias for readability/back-compat` to `Alias for readability`.
- No logic changes.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK from previous check
- manual: not needed for comment-only cleanup

Result:
- OK

Next:
- Continue only with safe cleanup where diffs stay minimal.
- Avoid touching files if line-ending changes create large diffs.

Commit:
- docs: remove stale back-compat comment

python - <<'PY'
from pathlib import Path

p = Path("PROGRESS_LOG.md")
old = p.read_text(encoding="utf-8")

entry = """## 2026-05-24 — Cleanup: remove unused SettingsScreen trial props

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed unused `isOnTrial` / `isTrialExpired` props from the `SettingsScreen` call in `app/page.tsx`.
- Confirmed `SettingsScreen` does not use those props.
- No UI/layout/color/spacing changes.

Tests done:
- lint: OK
- build: OK
- manual: not needed for this prop cleanup

Result:
- OK

Next:
- Continue only with safe cleanup where props are clearly unused.

"""

p.write_text(entry + old, encoding="utf-8")
PY

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

Commit:
- refactor: clean PermissionContext usage

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

##2026-02-19  CONTEXT (Smart42 refactor-v2) — progress since last commit

### ✅ What we fixed / refactored
- Unified “plan” gating across UI using a single flag: `hasPlan` (trial OR premium OR dev override).
- Removed / migrated legacy `isPremium` usage repo-wide:
  - `lib/plan.ts` was updated earlier, and a script was used to remove JSX `isPremium` props.
  - Verified `git grep "isPremium"` returns 0 (except scripts/docs).
- Updated core subscription hook:
  - `lib/core/subscription-state.ts` now exposes `hasPlan` as the main output.
  - Kept temporary legacy alias where needed during migration (`adminHasActiveSubscription`) to avoid breaking wiring.
- Updated screens and bottom navigation to use `hasPlan`:
  - Scenes screen, Activity log screen, Chart screen, App bottom nav, Settings screen were aligned to the unified plan flag.
- Fixed an important permission bug:
  - App Users could be created even without plan/trial.
  - Root cause: core rule allowed creation when it shouldn’t (role logic + plan gating mismatch).
  - Fixed in `lib/core/users.ts` so App User creation requires an active plan (trial/premium) and blocks otherwise.
- Consolidated permissions:
  - Merged `canRenameEntity` into `lib/permissions.ts` and removed the duplicate `lib/core/permissions.ts`.
  - Fixed build error caused by old import (`@/lib/core/permissions`) by updating imports to the unified `lib/permissions.ts`.
- Build is clean again (previous Turbopack font fetch error was due to temporary internet outage, now resolved).
- Dialog warning (“Missing Description/aria-describedby”) was reviewed; file is OK (no functional break), but can be improved later for strict a11y.

### ✅ Current state (confirmed behaviors)
- Without plan/trial:
  - iButton user is limited as expected (blocks after allowed free limit with proper message).
  - App User creation is now blocked as expected (no silent creation).
- With plan/trial:
  - Features unlock as expected using `hasPlan`.

---

## 🔥 What remains to do (next priorities)
1) Finish migration away from legacy `adminHasActiveSubscription`
   - Goal: only `hasPlan` flows through UI + permissions + core hooks.
   - Remove temporary alias from:
     - `lib/app-context.tsx` (context type + provider value)
     - any remaining wiring hooks accepting legacy field.
2) Standardize `PermissionContext` usage everywhere
   - Ensure every caller passes `{ currentUserAccess, hasPlan }` (optionally trial fields only where truly needed).
   - Remove leftover trial fields from UI where not used, to simplify.
3) Clean up architecture docs
   - Update `ARCHITECTURE.md` to reflect final state:
     - `hasPlan` is the only plan flag.
     - `adminHasActiveSubscription` removed fully once migration completes.
4) Optional hardening
   - Add small test coverage (or simple runtime asserts) for:
     - canCreateAppUser / canCreateIButtonUser
     - free admin limits for scenes/users
   - Improve dialog accessibility (add `DialogDescription` or pass `aria-describedby={undefined}` where required).

### 🧭 Suggested next concrete step
- Run `git grep -n "adminHasActiveSubscription"` across repo and remove it completely by:
  - updating hook args to `hasPlan`
  - removing the legacy fields from context + permissions once nothing references them.

git commit 51d2e1a

##2026-02-19 Progress log (since last commit)

### Plan / subscription refactor (unification)
- Standardized the app to use **one plan flag**: `hasPlan` (trial OR premium OR dev override).
- Removed/neutralized legacy `isPremium` usage across UI and wiring:
  - Ran cleanup scripts so `git grep "isPremium"` returns 0 relevant app usages.
  - Kept any remaining mentions only inside scripts / comments for tooling.

### AppContext + wiring cleanup
- Updated `lib/core/subscription-state.ts` to expose:
  - `hasPlan` as the unified source of truth.
  - (temporary) legacy alias removed from consumer expectations where needed.
- Updated `lib/app-context.tsx` wiring to pass plan correctly into core hooks and UI screens.
- Updated screen components to consume only `hasPlan` for gating (Scenes / Activity / Charts / Settings / BottomNav).

### Permissions consolidation
- Consolidated permissions logic into `lib/permissions.ts` as the **single** permissions source for the UI.
- Removed `lib/core/permissions.ts` dependency:
  - Fixed build error caused by `name-overrides.ts` importing the old core permissions file.
- Updated `ARCHITECTURE.md` to reflect:
  - `hasPlan` as unified plan flag.
  - Legacy fields allowed only temporarily during migration.

### App Users gating fix (critical bug)
- Fixed the bug where **App Users could be created without trial/premium**:
  - Root cause: `Permissions.canAddAppUsers()` allowed `admin` unconditionally.
  - Updated logic to require `hasPlan` for creating App Users (non open-close roles).
- Verified expected behavior:
  - iButton limit works without plan (only 1).
  - App Users are now blocked without plan and work with trial/premium.

### UI / DX
- Addressed editor “file is newer” conflict by ensuring changes match current working tree before saving.
- Build now passes (Google Fonts fetch errors were due to temporary network outage, not code).

### Current status
- Plan gating and role-based restrictions are consistent across screens.
- Permissions + plan checks have one primary source of truth (`hasPlan` + `lib/permissions.ts`).

git commit e21c849

git commit -am "docs: remove adminHasActiveSubscription legacy notes (hasPlan is sole plan flag)"

git commit 006c76e

##2026-02-18  Refactor v2: унифицирахме trial/premium gating към един флаг hasPlan и премахнахме legacy isPremium (JSX props).

Пуснат скрипт за премахване на isPremium props + фиксирани TypeScript интерфейси/ползване в засегнатите компоненти (dashboard/activity-log/chart/profile/scenes/settings).

Почистени остатъци: lib/plan.ts вече не приема/ползва isPremium (само subscription + active trial), а repo-wide grep за isPremium е 0.

npm run lint и npm run build минават успешно.

git comit 2e74021

##2026-02-18 Goal
Unify plan/premium logic to use a single flag (`hasPlan`) and remove legacy `isPremium` prop usage across the UI.

### What we did
- Added/used a Node script to automatically remove `isPremium={...}` JSX props from component usages.
- Ran the script successfully and cleaned up the call sites:
  - `app/page.tsx`
  - `components/activity-log-screen.tsx`
  - `components/chart-screen.tsx`
  - `components/profile-screen.tsx`
  - `components/scenes-screen.tsx`
  - `components/settings-screen.tsx`
- After auto-removal, fixed TypeScript errors caused by components still requiring `isPremium` in their prop types.
  - Updated `components/profile-screen.tsx`:
    - Removed `isPremium` from `ProfileScreenProps`
    - Removed `isPremium` from component destructuring/usage
    - Kept plan logic based on `hasPlan` (trial/premium/subscription) as the single source of truth
- Verified: `lint` and `build` pass successfully.

### Result
- No more TypeScript prop errors in Cursor.
- Codebase now relies on `hasPlan` as the primary plan flag, with legacy `isPremium` usage removed from the updated screens.

git commit 3557cb3


## Progress (since last commit)

### Bottom navigation (unified)
- Added/updated `components/app-bottom-nav.tsx` as a shared bottom navigation component.
- Introduced `hasPlan` support (trial/premium/active subscription) while keeping `isPremium` for backward compatibility.
- Activity tab behavior:
  - if no plan → navigates to `subscription`
  - if plan → navigates to `activity-log`
  - shows lock overlay when locked
- Scenes/Settings tabs respect permissions (no navigation if no access) and display lock icon.

### Profile screen updates
- Updated Profile screen bottom nav to follow the unified navigation logic and permission gating.
- Synced active tab detection and consistent behavior for plan/no-plan scenarios.

### Settings screen updates
- Updated Settings to use unified “active plan” logic (Premium + Trial + active subscription = plan).
- Bottom nav in Settings now uses shared permissions (`canAccessScenes`, `canAccessSettings`) and plan gating.

### Scenes screen TypeScript fixes (event type mapping)
- Fixed TypeScript errors caused by mismatched event names:
  - `ibutton-created` → `user-ibutton-created`
  - `ibutton-deleted` → `user-ibutton-deleted`
  - `quick-control-changed` → `quick-controls-changed`
- Added/updated normalization between UI event types and core event types when:
  - loading scenes (core → UI)
  - saving scenes (UI → core)

### Activity log lint + hooks fixes
- Fixed ESLint/React Hooks issues in `components/activity-log-screen.tsx`:
  - `useMemo` is no longer called conditionally (moved before early returns).
  - `activityLogs` is now stable (memoized) to avoid dependency warnings.
- Ensured filtering logic remains safe under restricted/locked scenarios.
commit <bd2a22b>

### Result
- ✅ `npm run lint` passes without errors.
- ✅ Bottom navigation is consistent across Profile / Settings / Scenes / Activity Log.
- ✅ Permissions + plan gating behave consistently across screens.


## 2026-02-15 — Activity Log + Scenes + Settings: фиксове и унифициране на логика

### Направено
- Fix: оправен ESLint проблем “Cannot call impure function during render” (махнато `Date.now()` от render пътя при създаване на Scene ID; използва се стабилен `newId("scene")`).
- Activity Log:
  - добавен `createdAt` в `ActivityLogEntry` (за TS съвместимост с core activity-log моделите).
  - добавени примерни събития с `createdAt` (ISO datetime) за демо/тест.
  - добавени филтри: Time range, Event type, User (условно показване на User филтъра според event type).
  - gating (permissions): restricted screen за роли без достъп; premium/trial gating за history.
- Scenes:
  - оправени типове и мапинг между UI conditions и Core whenConditions (вкл. door events и time window between).
  - добавен стабилен формат на описанието на Scene (IF … → THEN …), включително “between HH:MM AM/PM–…”.
  - ограничение за Free Admin: максимум 1 scene без plan.
  - Full Access: може да редактира/триe само свои сцени; ако full не е активиран — блокираме действията.
- Settings:
  - уеднаквена “plan” логика: `hasPlan = premium OR trial OR adminHasActiveSubscription`.
  - Free Admin limit: максимум 1 iButton без plan.
  - запазени правила за Full Access (само 1 акаунт), скриване/показване на Full в edit/invite според наличен слот.
- Генерално:
  - изчистени TS грешки от типа “missing fields / wrong imports” около activity log и id generator.
  - подготовка за следващ рефактор: изнасяне на bottom navigation в общ компонент (за да спрем дублирането по screen-овете).
commit <ff7b28b>

### Следващо
- Изнасяне на bottom navigation в общ компонент `<AppBottomNav />` и подмяна във всички screen-ове.
- `npm run build` + фиксове ако излязат нови TS/ESLint предупреждения.


## 2026-02-15
### Fixed: Activity Log type mismatch + exports
- Unified ActivityLogEntry type to come from `@/lib/core/activity-log` to avoid duplicate/competing types.
- Updated `lib/core/activity-log-state.ts` to:
  - re-export `ActivityLogEntry`
  - introduce `AddActivityLogInput` (input type for adding entries)
  - provide stable id generation (`log_<increment>`) without `Date.now/Math.random` (lint-safe)
  - add legacy aliases (`activityLog`, `logActivity`, `clearActivityLog`, etc.) for backwards compatibility with `app-context`.
- Result: TypeScript errors resolved (missing `time/date`, missing exports), build/lint consistency improved.
commit <b3e5ccb>

## 2026-02-15 — UI/TypeScript cleanup + Scenes/Activity Log refactor

- Activity Log: оправени TypeScript проблеми (timeRange/eventType/userFilter), добавени type guards и по-строги типове за филтрите; подредени условията за показване на user filter.
- Scenes: сериозен refactor за типове и стабилност:
  - добавени UiWhenType/Operator/TimeWindow + type guards
  - направен mapping Core ↔ UI (coreWhenToUi + форматиране на “between HH:MM”)
  - премахнати any-cast-ове където може и изчистени edge-case-ове при edit/save
- Lint fix: премахнато Date.now() от render path (react-hooks/purity) чрез helper за ID (lib/id).
- AppContext: добавени/изведени явни действия lockDoor/unlockDoor (wiring към core hooks) + запазен setDoorState за вътрешни таймери.
- UI polish: оправени Tailwind canonical class warnings за Slider (role=slider селектори).
- Проверка: `npm run lint` и `npm run build` минават; Google Fonts (Geist) може да fail-не само при прекъснат интернет (без нужда от промени в кода).

commit: <60644d6>

## 2026-02-15 — Lint cleanup + type safety pass (patch-based)
- Cleaned remaining TS lint issues across core + UI:
  - lib/core/api.ts: removed unsafe `(payload as any).error` access via type guards and safer error extraction.
  - lib/core/scenes-persistence.ts: removed legacy `(parsed as any).scenes` parsing and replaced with safe record checks.
  - lib/core/subscription-state.ts: clarified “system/admin-owned” subscription logic (ADMIN_ROLE constant), removed unnecessary role casts.
  - lib/app-context.tsx: preserved explicit lock/unlock actions wiring and subscription compatibility.
  - lib/core/lock-unlock-wiring.ts: stabilized error returns without `any` casts.
  - components/scenes-screen.tsx: removed `: any` usage, added type guards for selector values, and ensured edit flow adapts core conditions to UI time format.
  - components/activity-log-screen.tsx: fixed selector typing (no `any`) and proper state updates.
  - components/settings-screen.tsx: updated Slider class selector to canonical Tailwind form (removed IntelliSense warnings).
- Build now passes cleanly (note: Geist fonts require internet during build when using next/font/google).

Commit: 64f37c3

Next task:
- Run a quick UI sanity pass: Scenes create/edit, Activity Log filters, Settings quick controls sliders; then proceed to the next feature work item in PROGRESS_LOG.md.


## 2026-02-15 — Lint cleanup: remove unsafe casts (no UI change)

Branch:
- branch: refactor-v2
- commit: <7534254>

What we changed (no UI change):
- lib/core/lock-unlock-wiring.ts: removed `as unknown as ...` by using typed error helpers for lock/unlock results
- lib/core/api.ts: removed `(payload as any).error` using type guards
- lib/core/scenes-persistence.ts: removed `(parsed as any).scenes` using type guards
- components/scenes-screen.tsx: removed `as any` casts in scene save/update/toggle/delete paths
- components/settings-screen.tsx: removed `as any` casts when editing user access

Tests done:
- npm run lint: OK
- npm run build: OK
- manual: Scenes/Settings open; Lock/Unlock still sends POST logs

Next:
- Continue refactor-v2 with NO UI changes: keep lib/app-context.tsx wiring-only and clean remaining lint/type warnings one file at a time.


## 2026-02-12 — Refactor-v2: remove subscription type-cast glue in app-context

Baseline/branch:
- commit: <8857c61>
- branch: refactor-v2

What we changed:
- lib/app-context.tsx:
  - Removed risky subscription hook type-cast glue:
    - removed `(useSubscriptionState as unknown as (...))({ currentUserAccess })`
  - Now calls `useSubscriptionState()` directly (no casts).
  - Kept behavior the same: “active plan” is still computed as (premium OR trial days left > 0).
- UI unchanged.

Tests done:
- lint: ok
- build: ok
- manual: Lock/Unlock sends POST logs (POST /api/doors/lock + POST /api/doors/unlock)

Result:
- OK

Next:
- Move “active plan = premium OR trial” computation into lib/core/subscription-state.ts
  so it returns `adminHasActiveSubscription` as the final plan flag (per ARCHITECTURE).
- Then simplify lib/app-context.tsx to pass-through that flag (remove local adminHasPlan calc).
- Re-run: lint + build + manual Lock/Unlock POST check.


## 2026-02-11 — Refactor-v2: SSR-safe core hooks + persistence fixes

Baseline/branch:
- commit: <576d0d2>
- branch: refactor-v2

What we changed:
- Fixed scenes-persistence exports (loadScenes/saveScenes)
- Stabilized subscription + ui-preferences hooks
- Lint cleanup (full-access-state)

Tests done:
- lint: ok
- build: ok
- manual: Lock/Unlock sends POST logs

Next:
- Continue refactor without UI changes: keep app-context “wiring only”


## 2026-02-11 — Session

Current commit/branch:
- commit: 8463384
- branch: refactor-v2
- remote: origin -> https://github.com/alexgerov-oss/smart42.git

What works now:
- UI unchanged (dashboard restored)
- Lock/Unlock works (explicit actions in AppContext)
- build/lint ok
- pushed to GitHub (refactor-v2)

Next task:
- Refactor-v2 continues: keep UI untouched
- Clean remaining core wiring + remove risky destructuring / SSR pitfalls
- Fix small lint warnings in core hooks (if any), one file at a time + re-test build


## 2026-02-09 — Refactor-v2: extract Lock/Unlock wiring into core hook

Baseline/branch:
- commit: 80ad9a6
- branch: refactor-v2

What we changed:
- Extracted Lock/Unlock wiring (API side-effect + anti-double-send protection) into a dedicated core hook.
- AppContext stays composition-only and exposes explicit lockDoor/unlockDoor actions (anti-regression).

Tests done:
- lint: ok
- build: ok
- manual: Click Lock then Unlock and confirm terminal logs:
  - POST /api/doors/lock
  - POST /api/doors/unlock

Result:
- OK

Next:
- Continue thinning lib/app-context.tsx by extracting the subscription/plan wiring (remove the current type-cast glue).

## 2026-02-09 — Lint cleanup: ui-preferences warning fixed

Baseline/branch:
- commit: <264c53f>
- branch: refactor-v2

What we changed:
- Removed eslint hook warning in lib/core/ui-preferences.ts (no behavior change).

Tests done:
- lint: ok (0 warnings)
- build: ok
- manual: ok

Result:
- OK

Next:
- Continue refactor: make lib/app-context.tsx thinner by extracting profile-sync wiring into a dedicated core hook.


## 2026-02-09 — Refactor-v2 checkpoint: explicit Lock/Unlock actions

Baseline/branch:
- commit: <d06eae0>
- branch: refactor-v2

What we changed:
- Made Lock/Unlock explicit actions via AppContext API to prevent losing the real side-effect (POST) during refactors.
- Dashboard now calls context actions instead of relying on state-only updates.

Tests done:
- lint: ok (warning only)
- build: ok
- manual: Click Lock then Unlock and confirm terminal logs:
  - POST /api/doors/lock
  - POST /api/doors/unlock

Result:
- OK

Next:
- Fix the remaining lint warning in lib/core/ui-preferences.ts (remove unnecessary dependency).
- Then continue refactor (optional): extract profile-sync wiring into a dedicated core hook.

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
