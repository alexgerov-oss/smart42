## 2026-05-31 — Activity cleanup and System Status threshold event helper

Baseline/branch:
- branch: refactor-v2

What we changed:
- Removed the separate `power-restored` Activity event.
- Removed `power restored` from Activity event type filtering/dropdown.
- Removed the remaining demo/sample `power restored` Activity entry.
- Kept `power-drops` available.
- Added a new System Status threshold Activity helper:
  - `lib/core/system-status-activity.ts`
- Added threshold rules for:
  - WiFi weak signal
  - Battery low
  - CPU temperature high
  - CPU load high
  - Latency high
  - Power drop detected
- Threshold Activity entries are created only when a metric crosses from OK/unknown into a bad state.
- This prevents Activity spam while a value remains bad.
- The helper is ready for real ESP32/backend telemetry.
- The helper is not connected to the current static demo System Status values.

Thresholds added:
- WiFi weak: below `-80 dBm`
- Battery low: below `20%`
- CPU temperature high: above `75°C`
- CPU load high: above `90%`
- Latency high: above `500 ms`
- Power drop detected: count above `0`

Why:
- `power restored` does not need to be a separate Activity event because power recovery should be reflected inside the Power Drops/system-status flow.
- Activity should not log every System Status value continuously.
- Activity should log important threshold events only, such as weak WiFi, low battery, high CPU temperature, high latency, or power drops.
- Current System Status values are still static demo values, so no fake Activity entries should be created from them.
- The new helper prepares the app for real telemetry without adding demo noise.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No Lock/Unlock logic changes.
- No Door Open / Door Closed Activity logic changes.
- No Activity persistence key changes.
- No selected-door scoping changes.
- No permission logic changes.
- No backend/API integration yet.
- No demo System Status Activity logging added.
- No broad refactor.

Files changed:
- `components/activity-log-screen.tsx`
- `lib/core/activity-log.ts`
- `lib/core/system-status-activity.ts`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- Manual: Activity event type dropdown no longer shows `power restored`.
- Manual: Activity no longer shows demo/sample `power restored` event.
- Manual: `power-drops` remains available in Activity filtering.
- Manual: no fake System Status Activity entries are created from the current static demo values.

Result:
- OK

## 2026-05-31 — Fix: log Door Open and Door Closed sensor activity

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed Activity Log not showing Door Open and Door Closed events.
- Added real Activity logging when the demo door sensor state changes:
  - unlock → door open
  - lock → door closed
- Reused the existing Activity event types:
  - `door-open`
  - `door-closed`
- Added `door-open` and `door-closed` to Activity user-filter event handling so sensor events are not hidden by filtering.
- Moved sensor Activity logging after the immediate sensor state update using a zero-delay timeout.
- This keeps Lock/Unlock feeling responsive while still recording the sensor event.

Why:
- Lock/Unlock Activity entries were created correctly.
- The demo sensor state changed visually, but Door Open / Door Closed were not being written to Activity.
- After adding sensor logging directly, Lock/Unlock felt slower in dev mode because two Activity entries were written synchronously.
- The final fix records the sensor event asynchronously so the button response stays fast.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No Lock/Unlock API route changes.
- No permission logic changes.
- No Activity persistence key changes.
- No selected-door scoping changes.
- No backend/API changes.
- No broad refactor.

Files changed:
- `components/dashboard-screen.tsx`
- `components/activity-log-screen.tsx`

Tests/checks done:
- Manual: Home → Unlock creates `unlock` Activity entry.
- Manual: Home → Unlock also creates `open` Activity entry.
- Manual: Home → Lock creates `lock` Activity entry.
- Manual: Home → Lock also creates `closed` Activity entry.
- Manual: Activity filter `All` shows lock/unlock and open/closed entries.
- Manual: Lock/Unlock responsiveness remains OK after moving sensor Activity logging after the immediate state update.
- `npm run lint`: OK
- `npm run build`: OK

Result:
- OK

## 2026-05-31 — UX: expand Home Lock/Unlock label hit areas

Baseline/branch:
- branch: refactor-v2

What we changed:
- Expanded the clickable/tappable area around the Home Lock and Unlock labels.
- Tapping the label text still triggers the existing Lock/Unlock action.
- Tapping the nearby label spacing now also triggers the existing Lock/Unlock action.
- Reused the existing `handleLabelClick("lock" | "unlock")` logic.
- Converted the label hit areas from plain clickable text to transparent buttons for better accessibility and mobile tap behavior.

Why:
- The Lock/Unlock labels had small visible spacing around them, but only the exact text was clickable.
- On mobile this made the control feel inconsistent because tapping near the label did nothing.

What we did NOT change:
- No visual redesign.
- No Lock/Unlock business logic changes.
- No Lock/Unlock API changes.
- No Activity Log changes.
- No permission logic changes.
- No storage key changes.
- No broad refactor.

Files changed:
- `components/dashboard-screen.tsx`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- Manual: tapping Lock label triggers lock.
- Manual: tapping nearby Lock label spacing triggers lock.
- Manual: tapping Unlock label triggers unlock.
- Manual: tapping nearby Unlock label spacing triggers unlock.
- Manual: slider drag/tap behavior remains unchanged.

Result:
- OK

## 2026-05-31 — Fix: show Scene and iButton metadata clearly

Baseline/branch:
- branch: refactor-v2

What we changed:
- Improved Activity description when editing a Scene name.
- Scene edit Activity entries now show:
  - old Scene name
  - new Scene name
  - actor who made the change
- Added creation metadata to Scene cards.
- Scene cards now show:
  - Admin view:
    - creator role and creation date
  - non-admin view:
    - creation date only
- Added `createdAt` support to Scene data.
- Existing Scene creator metadata is preserved when editing a Scene.
- Existing Scene active state is preserved when editing a Scene.
- Added creation metadata to Settings → iButton Access list.
- iButton rows now show:
  - Admin view:
    - creator role and creation date
  - non-admin view:
    - creation date only
- iButton creator display now uses role labels only:
  - Admin
  - Full Access user
  - Open / Close Only user
- iButton creator display no longer uses personal names like `John Doe`.
- iButton creator display no longer uses the iButton name as the creator label.

Why:
- Scene edit Activity only showed the new Scene name, so it was not clear what changed.
- Scene cards did not show who created the Scene or when.
- iButton rows did not show creation metadata in Settings.
- Admin needed to see who created each iButton, but by role rather than by personal/display name.
- Non-admin users should only see when the Scene/iButton was created.

What we did NOT change:
- No UI/layout/spacing/color/animation redesign.
- No Activity persistence key changes.
- No selected-door scoping changes.
- No Lock/Unlock API changes.
- No permission logic changes.
- No backend/API changes.
- No broad refactor.

Files changed:
- `components/scenes-screen.tsx`
- `components/settings-screen.tsx`
- `lib/core/types.ts`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- Manual: Scene edit Activity shows old name → new name.
- Manual: Scene cards show creator role/date for Admin.
- Manual: Scene cards show date only for non-admin users.
- Manual: iButton rows show creator role/date for Admin.
- Manual: iButton rows show date only for non-admin users.
- Manual: Admin-created iButtons show `Created by Admin`.
- Manual: Full Access-created iButtons show `Created by Full Access user`.

Result:
- OK

## 2026-05-31 — Fix: complete Activity logging for Settings and Scenes events

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed missing Activity Log entries for Settings → iButton Access and App Users actions.
- Added Activity logging for:
  - iButton created
  - iButton edited
  - iButton deleted
  - App user created
  - App user edited
  - App user deleted
- Added Activity logging for Scenes actions:
  - Scene created
  - Scene edited
  - Scene deleted
- Added a new Activity event type:
  - `ibutton-edited`
- Added `iButton edited` to Activity Log event filtering.
- Activity edit descriptions now show old and new names when renaming:
  - iButton old name → new name
  - App user old name → new name
- Activity descriptions clearly show who performed the action:
  - Admin
  - Full Access user
  - Open / Close Only user
- Scene Activity entries are logged from the Scenes screen using method:
  - `Scenes`
- Settings-related Activity entries are logged from the Settings screen using method:
  - `Settings`

Why:
- Activity Log already had filters/types for several events, but some UI handlers only changed state and did not call `logActivity`.
- iButton edit had no dedicated Activity event type, so edited iButtons could not be filtered separately.
- Rename Activity entries were not clear enough because they did not show the previous name and the new name.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No Activity persistence key changes.
- No selected-door scoping changes.
- No Lock/Unlock API changes.
- No permission logic changes.
- No telemetry/sensor event logging added yet.
- No broad refactor.

Files changed:
- `components/settings-screen.tsx`
- `components/scenes-screen.tsx`
- `components/activity-log-screen.tsx`
- `lib/core/activity-log.ts`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- Manual: iButton create/edit/delete appears in Activity.
- Manual: App user create/edit/delete appears in Activity.
- Manual: Scene create/edit/delete appears in Activity.
- Manual: Activity filters show the new/updated events.
- Manual: iButton/App user edit descriptions show old name and new name.
- Manual: Activity descriptions show who performed the action.

Result:
- OK

## 2026-05-31 — Fix: log Quick Controls changes in Activity

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed Activity Log not showing events when Quick Controls settings are changed.
- Added Activity logging from Settings → Quick Controls for:
  - Quick Controls lock/unlock
  - Automatic Lock enabled/disabled
  - Automatic Lock delay change
  - Automatic Night Lock enabled/disabled
  - Automatic Night Lock time change
- Quick Controls changes now use the existing Activity event type:
  - `quick-control-changed`
- Activity event descriptions now clearly show who made the change:
  - Admin
  - Full Access user
  - Open / Close Only user
- Lock Delay changes are logged on slider commit/release instead of every slider movement.

Why:
- Activity filter already supported `quick-control-changed`, but Settings Quick Controls handlers were only changing state and were not calling `logActivity`.
- Activity cards show `description` for described events, so the actor was added directly into the Quick Controls description text.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No Activity filter UI changes.
- No Activity persistence key changes.
- No selected-door scoping changes.
- No Lock/Unlock API changes.
- No permission logic changes.
- No broad refactor.

Files changed:
- `components/settings-screen.tsx`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- Manual: changing Quick Controls settings creates Activity entries.
- Manual: filtering Activity by “Quick control changed” shows those entries.
- Manual: Activity description now shows who made the change.

Result:
- OK

## 2026-05-30 — UX: add drag support to circular time picker

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added pointer drag support to `components/ui/circular-time-picker.tsx`.
- The circular time picker now supports:
  - tap/click selection
  - drag/swipe selection on the clock face
  - touch and mouse pointer input
- After selecting an hour, the picker automatically switches to minute selection.
- Added a short 300 ms delay before switching from hour to minute mode.
- Optimized drag updates so the selected value updates only when the value actually changes.
- Removed the clock number color transition so the active number follows the finger more responsively during drag.

Where this applies:
- Settings → Automatic Night Lock
- Scenes → WHEN condition time picker

What we did NOT change:
- No UI/layout/spacing/color/animation structure changes.
- No Settings business logic changes.
- No Scenes business logic changes.
- No Lock/Unlock logic changes.
- No permission logic changes.
- No storage key changes.
- No broad refactor.

Files changed:
- `components/ui/circular-time-picker.tsx`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- Manual: drag/swipe works on the clock face.
- Manual: tap/click still works.
- Manual: hour selection switches to minute selection after a short delay.

Result:
- OK

## 2026-05-30 — Fix: show real Activity Log event time

Baseline/branch:
- branch: refactor-v2

What we changed:
- Fixed Activity Log time display to use the real event timestamp.
- Activity entries now format the visible time from `createdAt`.
- Home → Activity Log now also uses the real persisted `activityLog` entries instead of hardcoded demo times.
- New Lock/Unlock activity entries now store:
  - `createdAt`
  - real `timeLabel`
  - real `dateLabel`
- Fixed duplicate React key warning in Home → Activity Log when older/stale entries have repeated ids like `log_1`.
- Home Activity Log render keys now include:
  - id
  - time
  - index

Why:
- Home Activity Log was showing incorrect/example times instead of the real time of the event.
- Playwright later exposed a Next.js dev overlay issue caused by duplicate React keys from repeated old log ids.
- The overlay blocked clicking Home during the door-scoped state smoke test.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No Lock/Unlock API route changes.
- No door/controller scoping logic changes.
- No subscription/trial logic changes.
- No storage key changes.
- No broad refactor.

Files changed:
- `components/dashboard-screen.tsx`
- `components/activity-log-screen.tsx`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- `npm run test:e2e`: OK

Result:
- OK

## 2026-05-30 — Perf: lazy load secondary screens

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added lazy loading for secondary screens in `app/page.tsx`.
- Kept `DashboardScreen`, `LoginScreen`, and `RegisterScreen` as normal direct imports.
- Converted secondary screens to dynamic imports:
  - Activity Log
  - Settings
  - Profile
  - Subscription
  - Premium Payment
  - Payment Processing
  - Chart
  - Scenes

Why:
- Reduce initial bundle/work loaded when the app starts.
- Make the first load lighter while keeping Home/Dashboard available immediately.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No business logic changes.
- No permission logic changes.
- No Lock/Unlock behavior changes.
- No Activity logic changes.
- No Settings logic changes.
- No Scenes logic changes.
- No storage key changes.
- No broad refactor.

Files changed:
- `app/page.tsx`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK
- `npm run test:e2e`: OK

Result:
- OK

## 2026-05-30 — Fix: prevent duplicate Lock/Unlock actions

Baseline/branch:
- branch: refactor-v2

What we changed:
- Improved Dashboard Lock/Unlock responsiveness without using optimistic UI.
- Added a pending action guard in `components/dashboard-screen.tsx`.
- While one Lock/Unlock command is already running, duplicate Lock/Unlock requests are ignored.
- This prevents rapid click/drag interactions from sending multiple overlapping commands.
- The button/state still changes only after the real `lockDoor()` / `unlockDoor()` action succeeds.
- If the real API action fails, behavior remains unchanged:
  - error toast is shown
  - state is not falsely changed
- Activity Log behavior remains unchanged:
  - activity is logged only after successful Lock/Unlock action.
- Door sensor demo state behavior remains unchanged:
  - updated only after successful Lock/Unlock action.

Why:
- User reported small lag / slow reaction on the Lock/Unlock button.
- User explicitly did not want optimistic UI or a “fake” button state.
- The goal was to make the real command path feel cleaner while keeping button state tied to actual successful Lock/Unlock result.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No optimistic UI behavior.
- No fake immediate button state change.
- No Lock/Unlock API route changes.
- No permission logic changes.
- No Activity Log logic changes.
- No timer logic changes.
- No storage key changes.
- No broad refactor.

Files changed:
- `components/dashboard-screen.tsx`

Tests/checks done:
- `npm run lint`: OK
- `npm run build`: OK

Manual test to do / done:
- Run `npm run dev`.
- Click Unlock and Lock several times.
- Confirm terminal still shows normal:
  - `POST /api/doors/unlock`
  - `POST /api/doors/lock`
- Confirm rapid repeated click/drag does not create many overlapping duplicate requests.
- Confirm button/state changes only after successful command result.

Result:
- OK

## 2026-05-30 — UI polish: System Status chart readability, week drill-down and cleanup

Baseline/branch:
- branch: refactor-v2

What we changed:
- System Status metric charts:
  - Improved chart visibility on dark backgrounds.
  - Chart axis text now uses visible white styling.
  - Chart line remains visible.
  - Chart dots now use value-based colors:
    - high values: red
    - medium values: white
    - low values: green
  - Removed the earlier broad/global chart dot CSS override approach.
  - Kept the chart card/background/layout unchanged.

- Chart time ranges:
  - Fixed Month range to show 31 days instead of 30.
  - Fixed Year range to show all months 1–12, including 11.
  - Week labels now show weekday names:
    - Sun, Mon, Tue, Wed, Thu, Fri, Sat
  - Month and Year axis labels now use numbers only.

- Week drill-down:
  - Added Week → selected day drill-down behavior.
  - In Week view, tooltip now shows an OPEN button.
  - Clicking OPEN opens the selected day as a 24-hour chart.
  - Added Back to Week button when viewing a selected week day.
  - Selected week day detail view shows the selected date below the chart.

- Date labels:
  - Day view now shows today’s real date below the chart.
  - Week view shows the current week’s date numbers and month label below the chart.
  - Date label spacing was adjusted so Day date sits closer to the chart.

- Activity visibility selector:
  - Fixed one outdated `VisibilityThemeSelector` usage in `components/activity-log-screen.tsx`.
  - Replaced old props:
    - `currentTheme`
    - `onThemeChange`
  - With current component props:
    - `value`
    - `onChange`

- Recharts TypeScript compatibility:
  - Updated `components/ui/chart.tsx` tooltip and legend prop typing.
  - Added local prop types for:
    - `ChartTooltipContentProps`
    - `ChartLegendContentProps`
  - This fixes build errors with the current Recharts/TypeScript types.
  - No UI changes intended in shared chart UI.

- Dev origin config:
  - Restored existing `next.config.mjs` settings:
    - `typescript.ignoreBuildErrors`
    - `images.unoptimized`
  - Added current LAN dev origin:
    - `10.236.237.57`
  - Kept previous allowed dev origins:
    - `192.168.18.142`
    - `10.160.212.57`

Cleanup done:
- Removed temporary backup files created during patching.
- Removed temporary script:
  - `scripts/allow_phone_ip.py`
- Reverted accidental changes to:
  - `components/performance-chart.tsx`
- Cleaned `components/chart-screen.tsx`:
  - imports moved back to top
  - temporary `SMART42_*` markers removed
  - inline XAxis formatter extracted into `formatXAxisTick`
  - repeated Week open logic extracted into `openWeekDay`
  - chart data typed with `ChartDataPoint`

What we did NOT change:
- No Dashboard card layout changes.
- No System Status card/container layout changes.
- No Lock/Unlock logic changes.
- No API route changes.
- No permissions changes.
- No subscription/trial logic changes.
- No Activity data logic changes.
- No broad refactor outside touched chart-related files.

Files changed:
- `components/chart-screen.tsx`
- `components/activity-log-screen.tsx`
- `components/ui/chart.tsx`
- `next.config.mjs`

Tests/checks done:
- `npm run build`: OK

Result:
- OK

Notes:
- `components/chart-screen.tsx` now has more chart-specific logic than before.
- A later optional cleanup could extract chart helpers into a small local helper section or separate file, but only if needed and only with no UI behavior change.
- If editing charts again, avoid broad search/replace scripts and inspect exact code first.

## 2026-05-27 — Refactor: extract shared Playwright action helpers

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added shared Playwright action helper file:
  - `tests/e2e/helpers/actions.ts`

Extracted repeated E2E actions:
- `activateTrial`
- `addDoor`
- `selectDoor`
- `setAutomaticLockToMinimum`
- `lockQuickControls`
- `createScene`
- `createIButton`
- `createAppUser`
- `logout`
- `loginWithCredentials`
- `unlockDoor`
- `lockDoor`
- `unlockAndLock`

Refactored existing door-scoped tests to use the shared helpers:
- `tests/e2e/door-scoped-scenes-smoke.spec.ts`
- `tests/e2e/door-scoped-ibuttons-smoke.spec.ts`
- `tests/e2e/door-scoped-users-roles-smoke.spec.ts`
- `tests/e2e/door-scoped-state-smoke.spec.ts`
- `tests/e2e/auto-lock-deadline-between-doors-smoke.spec.ts`
- `tests/e2e/global-plan-door-scoped-data-smoke.spec.ts`

Why:
- Removed repeated test boilerplate.
- Kept door-scoped tests easier to read and maintain.
- Centralized common UI flows used by the regression tests.
- Reduced risk of future selector drift across many test files.

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.
- No test behavior changes intended.

Tests done:
- npx playwright test tests/e2e/door-scoped-scenes-smoke.spec.ts: OK
- npx playwright test tests/e2e/door-scoped-ibuttons-smoke.spec.ts: OK
- npx playwright test tests/e2e/door-scoped-users-roles-smoke.spec.ts: OK
- npx playwright test tests/e2e/door-scoped-state-smoke.spec.ts: OK
- npx playwright test tests/e2e/auto-lock-deadline-between-doors-smoke.spec.ts: OK
- npx playwright test tests/e2e/global-plan-door-scoped-data-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the Playwright helper cleanup.
- Optional later cleanup:
  - extract shared app storage helper for door-scoped keys, but only as a separate small commit.

## 2026-05-27 — Test: add global plan / door-scoped data Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/global-plan-door-scoped-data-smoke.spec.ts`

What the test verifies:
- Admin without trial opens Activity and sees the no-plan / upgrade flow.
- Admin can activate trial using the existing UI flow.
- Trial/premium access is global for Admin.
- Main Door can create door-scoped data:
  - App User
  - iButton
  - Scene
  - Automatic Lock setting
  - Activity Log entry
- A second added door keeps trial access available.
- The second door starts clean for door-scoped data:
  - no Main Door Activity entries
  - no Main Door App User
  - no Main Door iButton
  - no Main Door Scene
  - Automatic Lock default state
- Door 2 still has trial-enabled actions available:
  - Add Scene
  - Add User
  - Add iButton User

Test implementation notes:
- Uses existing auth helper:
  - `openCleanLoginPage`
  - `loginAsAdmin`
- Uses real UI flow:
  - no-plan Activity page
  - trial activation
  - create door-scoped data
  - add second door
  - verify global plan access remains
  - verify door data stays isolated
- `activateTrial()` handles both cases:
  - Home → Get Premium
  - already-open Activity upsell page → Start Free Trial

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.

Tests done:
- npx playwright test tests/e2e/global-plan-door-scoped-data-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the new Playwright regression test.
- Keep this test as the main guard for the core rule:
  - trial/premium is global
  - all door/controller data is scoped per selected door
- Stop adding broad E2E coverage unless a new feature or bug requires it.

## 2026-05-27 — Test: add auto-lock deadline between doors Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/auto-lock-deadline-between-doors-smoke.spec.ts`

What the test verifies:
- Admin can activate trial using the existing UI flow.
- Main Door can enable Automatic Lock.
- Lock Delay can be set to the minimum value:
  - 5 seconds
- Main Door can be unlocked and starts the Automatic Lock countdown.
- User can switch to / add another door before the countdown finishes.
- The Main Door auto-lock deadline keeps counting while another door is selected.
- After the deadline passes, returning to Main Door shows:
  - no restarted Automatic Lock countdown
  - Main Door is locked
- The second door remains separate and does not inherit Main Door countdown behavior.

Test implementation notes:
- Uses existing auth helper:
  - `openCleanLoginPage`
  - `loginAsAdmin`
- Uses real UI flow:
  - activate trial
  - enable Automatic Lock
  - set delay to 5 seconds
  - unlock
  - add/switch door
  - return to Main Door
  - verify the countdown did not restart
- This protects the `autoLockDeadlineAt` behavior from regressions.

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.

Tests done:
- npx playwright test tests/e2e/auto-lock-deadline-between-doors-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the new Playwright regression test.
- Continue using this test before changing Automatic Lock, selected-door logic, lock timers, or per-door lock state.

## 2026-05-27 — Test: add door-scoped iButtons Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/door-scoped-ibuttons-smoke.spec.ts`

What the test verifies:
- Admin can activate trial using the existing UI flow.
- Main Door can create and show its own iButton.
- A second added door does not show Main Door's iButton.
- The second door can create and show its own iButton.
- Returning to Main Door restores only Main Door's iButton.
- Returning to the second door restores only the second door's iButton.
- iButtons are isolated through the selected door/controller context.

Test implementation notes:
- Uses existing auth helper:
  - `openCleanLoginPage`
  - `loginAsAdmin`
- Uses real UI flow:
  - activate trial
  - add door
  - switch selected door
  - create iButtons from Settings → iButton Access
  - verify iButton visibility per selected door
- This protects the `iButtonUsers:<doorId>` behavior from regressions.

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.

Tests done:
- npx playwright test tests/e2e/door-scoped-ibuttons-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the new Playwright regression test.
- Continue using this test before changing iButton state, selected-door logic, iButton creation, or iButton persistence.

## 2026-05-27 — Test: add door-scoped Scenes Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/door-scoped-scenes-smoke.spec.ts`

What the test verifies:
- Admin can activate trial using the existing UI flow.
- Main Door can create and show its own Scene.
- A second added door does not show Main Door's Scene.
- The second door can create and show its own Scene.
- Returning to Main Door restores only Main Door's Scene.
- Returning to the second door restores only the second door's Scene.
- Scenes are isolated through the selected door/controller context.

Test implementation notes:
- Uses existing auth helper:
  - `openCleanLoginPage`
  - `loginAsAdmin`
- Uses real UI flow:
  - activate trial
  - add door
  - switch selected door
  - create scenes from the Scenes tab
  - verify scene visibility per selected door
- This protects the `scenes:<doorId>` behavior from regressions.

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.

Tests done:
- npx playwright test tests/e2e/door-scoped-scenes-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the new Playwright regression test.
- Continue using this test before changing Scenes state, selected-door logic, scene creation, or scene persistence.

## 2026-05-27 — Test: add door-scoped users and roles Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/door-scoped-users-roles-smoke.spec.ts`

What the test verifies:
- Admin can activate trial using the existing UI flow.
- On Main Door, Admin can create:
  - Full Access App User
  - Open/Close Only App User
- A second added door starts with a clean App Users list.
- App Users created on Main Door do not appear on the second door.
- Returning to Main Door restores the Main Door App Users list.
- Full Access user created on Main Door can:
  - log in
  - unlock/lock
  - access Settings
  - access Activity
- Open/Close Only user created on Main Door can:
  - log in
  - unlock/lock
  - cannot access Settings
  - cannot access Activity

Test implementation notes:
- Uses existing auth helper:
  - `openCleanLoginPage`
  - `loginAsAdmin`
- Uses the real UI flow:
  - activate trial
  - create App Users
  - add a second door
  - switch selected door
  - inspect Settings users list
  - logout/login as created App Users
  - verify role permissions through UI
- Keeps the test separate from the door-scoped Activity/Quick Controls test.
- This protects the `appUsers:<doorId>` behavior and role permission behavior from regressions.

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.

Tests done:
- npx playwright test tests/e2e/door-scoped-users-roles-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the new Playwright regression test.
- Continue using this test before changing per-door users, App User roles, login behavior, Settings users list, or permission logic.

## 2026-05-27 — Test: add door-scoped state Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/door-scoped-state-smoke.spec.ts`

What the test verifies:
- Admin can activate trial using the existing UI flow.
- Main Door can have its own scoped state:
  - Automatic Lock enabled
  - Lock Delay set to minimum value:
    - 5 seconds
  - Quick Controls locked
  - Activity Log entries from Lock/Unlock
- A second added door starts clean:
  - Automatic Lock is OFF
  - Lock Delay UI is not visible
  - Quick Controls are unlocked
  - Main Door Activity entries are not shown
- The second door can create its own Activity Log entries.
- Returning to Main Door restores Main Door scoped state:
  - Automatic Lock settings remain active
  - Quick Controls remain locked
  - Main Door Activity Log entries are still present
  - second door Activity entries are not shown
- Returning to the second door restores its own Activity Log.
- Additional lock activity on the second door remains isolated from Main Door.

Test implementation notes:
- Uses existing auth helper:
  - `openCleanLoginPage`
  - `loginAsAdmin`
- Uses the real UI flow:
  - activate trial
  - add door
  - switch selected door
  - change Settings
  - use Lock/Unlock
  - inspect Activity
- Fixed Playwright selector strict-mode issues by targeting:
  - selected door combobox for door selection assertions
  - `.first()` for Activity entries when multiple log cards have the same door name

What we did NOT change:
- No app logic changes.
- No UI/layout/spacing/color/animation changes.
- No permission logic changes.
- No trial/premium logic changes.
- No storage key changes.
- No Lock/Unlock API logic changes.

Tests done:
- npx playwright test tests/e2e/door-scoped-state-smoke.spec.ts: OK
- npm run test:e2e: OK
- npm run lint: OK
- npm run build: OK

Result:
- OK

Next:
- Commit the new Playwright regression test.
- Continue using this test before changing per-door state, lock timers, Activity Log, Quick Controls, or door selection logic.

## 2026-05-27 — Logic: scope lock settings, quick controls and activity by selected door

Baseline/branch:
- branch: refactor-v2

What we changed:
- Extended the selected-door/controller rule:
  - trial/premium remains global for Admin
  - all door/controller behavior should be scoped by selected door

- Quick Controls:
  - Scoped Quick Controls lock state by selected door:
    - `quickControlsLocked:<doorId>`
  - Each door now has its own Quick Controls locked/unlocked state.
  - New doors start with Quick Controls unlocked.
  - Returning to an older door restores that door's Quick Controls lock state.

- Lock state and timers:
  - Scoped lock-related state by selected door:
    - `lockState:<doorId>`
  - Per-door state now includes:
    - `doorState`
    - `countdown`
    - `autoLockDelay`
    - `autoLockEnabled`
    - `autoLockDeadlineAt`
    - `autoNightLockEnabled`
    - `nightLockHour`
    - `nightLockMinute`
    - `nightLockPeriod`
    - `lastNightLockDate`
  - New doors start with default lock settings:
    - locked
    - Automatic Lock OFF
    - Automatic Lock Delay 30 seconds
    - Automatic Night Lock OFF
    - Night Lock time 10:00 PM

- Automatic Lock deadline fix:
  - Fixed countdown restarting when switching away from a door and returning.
  - Automatic Lock now stores a per-door deadline timestamp:
    - `autoLockDeadlineAt`
  - If a door is unlocked and the user switches away:
    - returning before the deadline shows the remaining time
    - returning after the deadline locks that door instead of restarting the countdown
  - This preserves correct per-door timer behavior without UI changes.

- Activity Log:
  - Scoped Activity Log persistence by selected door:
    - `activityLog:<doorId>`
  - Each door/controller now has its own Activity history.
  - Activity entries from one door no longer appear on another door.
  - Activity Log still uses the existing screen/UI.

- Activity demo fallback cleanup:
  - Removed old demo Activity fallback records from the real Activity view.
  - Activity no longer shows fake `John Doe` records when the selected door has no real log entries.
  - If there are no real entries for the selected door, Activity shows no fake history.

- Activity render key safety:
  - Fixed duplicate React key warning when older/stale Activity entries have repeated ids like `log_1`.
  - Render keys are now made unique using:
    - id
    - createdAt
    - index
  - No visual Activity card changes.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No trial activation logic changes.
- No premium payment logic changes.
- No role/permission rule changes.
- No Lock/Unlock API route changes.
- No broad refactor.
- No visual screen rewrite.

Tests done:
- npm run lint: OK
- npm run build: OK
- npm run test:e2e: OK
- Manual: Quick Controls lock state is separate per selected door.
- Manual: Automatic Lock settings are separate per selected door.
- Manual: Automatic Night Lock settings are separate per selected door.
- Manual: Automatic Lock countdown no longer restarts from the beginning after switching doors.
- Manual: if Automatic Lock deadline passes while viewing another door, returning to the original door shows it locked.
- Manual: Activity Log is separate per selected door.
- Manual: old fake/demo Activity records no longer appear when no real entries exist.
- Manual: duplicate Activity key console warning is gone.

Result:
- OK

Next:
- Commit the scoped lock/quick controls/activity update.
- Continue only with small explicit requests.
- If more per-door state is discovered later, scope it one small area at a time.

## 2026-05-27 — Logic: scope users, iButtons and scenes by selected door

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added selected door state to AppContext:
  - `selectedDoorId`
  - `setSelectedDoorId`
- Dashboard now uses the AppContext selected door state instead of keeping selected door only locally.
- This allows other tabs/core hooks to know which door/controller is currently selected.
- No Dashboard UI/layout changes.

- Users/iButtons:
  - Scoped App Users persistence by selected door:
    - `appUsers:<doorId>`
  - Scoped iButton Users persistence by selected door:
    - `iButtonUsers:<doorId>`
  - When switching doors, Settings now loads the users/iButtons for the selected door.
  - New doors start with no added App Users or iButtons.
  - Returning to an older door restores that door's users/iButtons.
  - Trial/premium state remains global and unchanged.

- Scenes:
  - Scoped Scenes persistence by selected door:
    - `scenes:<doorId>`
  - When switching doors, Scenes now loads scenes for the selected door.
  - New doors start with no scenes.
  - Returning to an older door restores that door's scenes.
  - Removed the lint-problematic synchronous `setState` effect and used door-keyed state/loading instead.
  - Trial/premium state remains global and unchanged.

Logic clarified:
- One controller controls one door.
- The app can control multiple controllers/doors.
- Door/controller data is isolated per selected door.
- Admin trial/premium remains shared across all doors/controllers.

What we did NOT change:
- No UI/layout/spacing/color/animation changes.
- No Lock/Unlock API flow changes.
- No role/permission rule changes.
- No trial activation logic changes.
- No premium payment logic changes.
- No existing visual behavior changes.
- No broad refactor.

Tests done:
- npm run lint: OK
- npm run build: OK
- npm run test:e2e: OK
- Manual: selected Home door persists when navigating away and back.
- Manual: App Users/iButtons added on Main Door do not appear on a newly added door.
- Manual: returning to Main Door restores its App Users/iButtons.
- Manual: Scenes created on Main Door do not appear on a newly added door.
- Manual: returning to Main Door restores its Scenes.
- Manual: trial/premium remains active across newly added doors.

Result:
- OK

Next:
- Commit the scoped door/controller logic update.
- Continue only with small explicit logic/UI requests.
- If requested later, consider whether Quick Controls / lock timer settings / Activity Log should also become door-scoped.

## 2026-05-27 — UI polish: add visibility theme selector to Activity no-plan page

Baseline/branch:
- branch: refactor-v2

What we changed:
- Activity / no trial-premium flow:
  - Added the 3-square visibility theme selector to the Activity page shown when Admin has no active trial/premium.
  - Selector now appears in the top right of the Activity header.
  - Kept the Activity title on the left.
  - Kept the existing Activity upsell / trial-premium page structure.
  - Kept the existing bottom navigation visible.
  - No trial activation logic changes.
  - No premium payment logic changes.
  - No permission logic changes.

- Subscription/Activity upsell page theme behavior:
  - Wired the selector to the shared `homeVisibilityTheme` localStorage key.
  - Fixed selector props to use the shared component API:
    - `value`
    - `onChange`
  - Active selected square now shows the existing ring/border state correctly.
  - Theme selection now changes the visible page styling instead of only changing stored state.
  - Header, cards, muted text, and bottom navigation inactive text now follow the selected visibility theme.
  - Reused the same dark / soft / day color values already used by Activity.
  - No new theme system was introduced.

- ActivityLogScreen no-plan branch:
  - Added the same Activity header + visibility selector there as well.
  - This keeps the fallback no-plan branch consistent if that branch is rendered directly.

What we did NOT change:
- No business logic changes.
- No role/permission logic changes.
- No Lock/Unlock API flow changes.
- No Activity log data logic changes.
- No trial activation logic changes.
- No premium payment logic changes.
- No storage key changes.
- No broad refactor.
- No layout rewrite.

Tests done:
- npm run lint: OK
- npm run build: OK
- npm run test:e2e: OK
- Manual: Activity without trial/premium shows the 3 visibility theme squares in the top right.
- Manual: selected square shows the active ring/border.
- Manual: clicking the squares changes the Activity upsell page theme.
- Manual: bottom navigation remains visible on the Activity no-plan page.

Result:
- OK

Next:
- Commit the scoped UI polish update.
- Continue only with small explicit UI polish requests.

## 2026-05-27 — UI polish: Settings Night Lock, Activity upsell page and trial card

Baseline/branch:
- branch: refactor-v2

What we changed:
- Settings:
  - Fixed Quick Controls → Automatic Night Lock active lock icon color.
  - Automatic Night Lock lock icon now turns green when enabled.
  - It now matches the Automatic Lock icon active color.
  - No Quick Controls logic changes.
  - No timer logic changes.
  - No permission logic changes.

- Activity / no trial-premium flow:
  - Fixed bottom navigation disappearing when opening Activity without trial/premium.
  - Restored the old Activity upsell/trial page behavior for users without trial/premium.
  - Added bottom navigation to the upsell/trial page so the nav bar remains visible.
  - Changed the top page title from “Get Premium” to “Activity” when reached from Activity.
  - Kept the existing top icon and main heading:
    - Upgrade to Premium
    - Unlock all features and take full control
  - No subscription/trial activation logic changes.
  - No premium payment logic changes.
  - No permission logic changes.

- Activity upsell page layout:
  - Moved the Free Trial card above the Premium Benefits card.
  - Kept the top icon and title area unchanged.
  - Kept the Premium price / Get Premium card below.
  - No logic changes.

- Free Trial card:
  - Removed the white “Free Trial” heading from the card.
  - Changed the trial text from:
    - 30 days free
  - to:
    - 30 days free Trial
  - Made the whole “30 days free Trial” text green, matching the previous green “30 days” color.
  - Kept card spacing, layout, button, and remaining text unchanged.

- Start Free Trial button:
  - Made the green outline/border more visible.
  - Kept the button as an outline-style button.
  - Did not change the Get Premium button.

- Tests:
  - Updated Playwright expectations after the Activity header title changed from “Get Premium” to “Activity”.
  - Updated:
    - tests/e2e/full-access-auto-lock-smoke.spec.ts
    - tests/e2e/full-access-lock-unlock-smoke.spec.ts
    - tests/e2e/open-close-lock-unlock-smoke.spec.ts

What we did NOT change:
- No business logic changes.
- No role/permission logic changes.
- No Lock/Unlock API flow changes.
- No Activity log data logic changes.
- No trial activation logic changes.
- No premium payment logic changes.
- No storage key changes.
- No broad refactor.

Tests done:
- npm run lint: OK
- npm run test:e2e: OK
  - 6 passed

Result:
- OK

Next:
- Run npm run build before commit if not already done.
- Commit the scoped UI/test updates.
- Continue only with small explicit UI polish requests.

## 2026-05-27 — UI polish: Home, Scenes and Profile visibility refinements

Baseline/branch:
- branch: refactor-v2

What we changed:
- Home:
  - Moved the Main Door add `+` icon slightly to the right.
  - Removed the barely visible oval/background behind the `+` icon.
  - Kept the `+` visible and in the same Home/Main Door control area.
  - No Lock/Unlock logic changes.
  - No permission logic changes.

- Scenes:
  - Improved visibility of form borders in New Scene:
    - Scene Name input
    - THEN Action select
    - Custom message text input
  - Border colors now follow the selected visibility theme:
    - dark
    - soft
    - day
  - Improved visibility of the THEN Action select chevron.
  - Chevron brightness now follows the selected visibility theme.
  - Improved Enter value input background in WHEN Conditions.
  - Enter value fields now match the New Scene card background more closely across visibility themes.
  - Applied this to both numeric Enter value fields:
    - normal condition value input
    - power drops value input
  - Made created scene cards more compact vertically.
  - Reduced empty space above and below created scene text.
  - Adjusted scene description text spacing until it was readable while keeping the card compact.
  - Added mobile keyboard flow for New Scene inputs:
    - Enter/Next moves from Scene Name to the next available scene input
    - Enter/Next moves through Enter value inputs
    - Enter/Done on Custom message text blurs the field
  - Fixed duplicate JSX props created during the first Enter/Next change.
  - Final lint result after duplicate-prop fix: OK.
  - No scene business logic changes.
  - No scene save/toggle/delete logic changes.
  - No permission logic changes.

- Profile:
  - Improved Support form border visibility:
    - Issue Category select
    - Message textarea
  - Support form borders now follow the selected visibility theme:
    - dark
    - soft
    - day
  - Improved Issue Category placeholder/text brightness.
  - Improved Issue Category select chevron brightness.
  - Improved Message placeholder brightness:
    - “Describe your issue in detail...”
  - Select text, select chevron, and Message placeholder now use matching brightness per theme.
  - Made active Profile/Support tab state more visible.
  - Active tab styling now clearly shows whether Profile or Support is selected.
  - No Profile logic changes.
  - No Support submit logic changes.
  - No permission logic changes.

What we did NOT change:
- No business logic changes.
- No role/permission logic changes.
- No Lock/Unlock API flow changes.
- No Activity logic changes.
- No storage key changes.
- No broad refactor.
- No layout rewrite.
- No component rewrite.

Tests done:
- npm run lint: OK after final duplicate-prop fix.
- Manual: Home `+` icon is positioned correctly and no longer has the faint oval background.
- Manual: Scenes form field borders are visible across visibility themes.
- Manual: Scenes THEN Action chevron is more visible across visibility themes.
- Manual: Scenes Enter value fields visually match the New Scene card background better.
- Manual: Created scene cards are more compact vertically.
- Manual: Created scene text remains readable after spacing adjustments.
- Manual: Mobile Enter/Next flow in New Scene moves through fields correctly.
- Manual: Profile Support Issue Category and Message borders are visible across themes.
- Manual: Profile Support select text, chevron, and Message placeholder are brighter and theme-aware.
- Manual: Profile/Profile-Support active tab state is clearly visible.

Result:
- OK

Next:
- Before pushing, run:
  - npm run build
- If build is OK, commit these UI polish changes.
- Continue only with small explicit UI polish requests.
- Keep future changes scoped and avoid broad theme refactors.

## 2026-05-26 — UI polish: refine Home System Status controls

Baseline/branch:
- branch: refactor-v2

What we changed:
- Updated Home → System Status card collapsed height.
- When System Status is collapsed, the card is now thinner and shows mainly:
  - System Status title
  - controller online/offline status
  - compact expand control
- Reduced the vertical spacing near the collapse/expand control when System Status is expanded.
- Replaced the single collapse/expand chevron with a double-chevron indicator.
- Kept the chevron size visually consistent in both expanded and collapsed states.
- Adjusted chevron vertical position in both expanded and collapsed states.
- Changed the chevron color to a theme-aware gray instead of green/primary.
- Changed System Status online indicator/text from WiFi blue to green.
- Changed WiFi Signal icon and signal value from WiFi blue to green.
- Kept Open/Closed door state behavior correct:
  - Unlock shows Open in green
  - Lock shows Closed in normal text color
- Changed the Home door edit pencil icon from blue to white.
- No permission logic changes.
- No Lock/Unlock API logic changes.
- No shared component changes.

Tests done:
- lint: OK
- build: OK
- manual: collapsed System Status card is thinner
- manual: expanded System Status spacing near the chevron looks correct
- manual: double chevron appears in expanded and collapsed states
- manual: chevron position and size look correct
- manual: chevron uses theme-aware gray instead of green
- manual: Online status and WiFi Signal are green
- manual: Lock shows Closed and Unlock shows Open correctly
- manual: Home door edit pencil icon is white
- manual: Lock/Unlock still works

Result:
- OK

Next:
- Continue only with explicit small UI polish requests.
- Keep changes scoped to the requested screen/element.

## 2026-05-26 — UI polish: sync Lock Delay slider track with visibility theme

Baseline/branch:
- branch: refactor-v2

What we changed:
- Updated the Lock Delay slider in Settings → Quick Controls → Automatic Lock.
- The inactive/gray part of the slider track now follows the selected visibility theme.
- Dark theme keeps the original muted slider track.
- Soft/default theme uses darker visible gray:
  - `gray-600`
- Day/third theme uses darker visible gray:
  - `gray-500`
- The active/green slider range remains unchanged.
- The slider thumb remains unchanged.
- Automatic Lock logic remains unchanged.
- No layout/spacing/animation changes.
- No permission logic changes.
- No changes to the shared Slider component.

Tests done:
- lint: OK
- build: OK
- manual: Settings → Quick Controls → Automatic Lock slider track changes correctly across all 3 visibility themes
- manual: soft/default theme slider track is visible but not too bright
- manual: day/third theme slider track is visible and darker than before
- manual: active green slider range remains unchanged

Result:
- OK

Next:
- Continue only with explicit small UI polish requests.
- Keep future changes scoped and avoid broad theme refactors.

## 2026-05-25 — Test: add role-based Playwright smoke tests

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added role-based Playwright smoke tests for App Users.
- Added shared Playwright auth helper:
  - `tests/e2e/helpers/auth.ts`
- Updated existing login-based smoke tests to use the shared helper where needed.
- The helper:
  - opens a clean login page
  - clears cookies
  - clears `localStorage`
  - clears `sessionStorage`
  - reloads the app
  - logs in as Admin using the current mock login flow
  - handles the current mock `sessionPassword` behavior by trying known mock passwords

New tests added:
- `tests/e2e/full-access-lock-unlock-smoke.spec.ts`
  - Admin logs in
  - Admin activates Free Trial
  - Admin creates a Full Access App User
  - test logs out Admin
  - test logs in as the Full Access user
  - verifies Full Access can send `POST /api/doors/unlock`
  - verifies Full Access can send `POST /api/doors/lock`

- `tests/e2e/full-access-auto-lock-smoke.spec.ts`
  - Admin logs in
  - Admin activates Free Trial
  - Admin creates a Full Access App User
  - test logs out Admin
  - test logs in as the Full Access user
  - verifies Full Access can open Settings
  - verifies Full Access can use Quick Controls
  - enables Automatic Lock
  - sets Lock Delay to minimum value:
    - 5 seconds
  - returns Home
  - clicks Unlock
  - verifies `POST /api/doors/unlock`
  - verifies Automatic Lock countdown appears
  - waits for countdown to finish
  - verifies countdown disappears

- `tests/e2e/open-close-lock-unlock-smoke.spec.ts`
  - Admin logs in
  - Admin activates Free Trial
  - Admin creates an Open/Close Only App User
  - test logs out Admin
  - test logs in as the Open/Close Only user
  - verifies Open/Close Only cannot access Settings
  - verifies Open/Close Only cannot access Activity
  - verifies Open/Close Only can send `POST /api/doors/unlock`
  - verifies Open/Close Only can send `POST /api/doors/lock`

Existing tests improved:
- `tests/e2e/lock-unlock-smoke.spec.ts`
  - updated to use shared auth helper
- `tests/e2e/auto-lock-smoke.spec.ts`
  - updated to use shared auth helper

Important findings:
- Full Access App User must be selected explicitly in the Invite New User dialog.
- Default new App User access is:
  - Open/Close Only
- App User mock password is:
  - `smart42-temp`
- Current Automatic Lock logic does not send `POST /api/doors/lock`.
- Automatic Lock currently changes local UI/app state by calling:
  - `setDoorState("lock")`
- Therefore Automatic Lock tests verify countdown/UI behavior, not backend/controller lock API behavior.

What we did NOT change:
- No app UI changes.
- No layout/spacing/color/animation changes.
- No business logic changes.
- No permission logic changes.
- No Lock/Unlock logic changes.
- No Automatic Lock logic changes.
- No API route changes.
- No localStorage key changes.

Tests done:
- `npm run test:e2e`: OK
  - result: 6 passed
- `npx playwright test tests/e2e/auto-lock-smoke.spec.ts --repeat-each=5`: OK
  - result: 5 passed
- `npx playwright test --repeat-each=5`: OK
  - result: 30 passed

Result:
- OK

Notes:
- Playwright tests run with:
  - `workers: 1`
- This keeps tests stable with the current mock/localStorage-based app state.
- Role tests use real UI flow:
  - Admin activates trial
  - Admin creates App Users
  - App Users log in
  - permissions and lock/unlock behavior are checked through the UI
- The shared auth helper exists because the current mock login flow stores `sessionPassword`, and different test users can update that mock session password.

Next:
- Continue using the full check set before commits:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- For stability checks after changing test/login/role behavior:
  - `npx playwright test --repeat-each=5`
- If Automatic Lock is later changed to send a real lock API request, update the Automatic Lock tests to also verify:
  - `POST /api/doors/lock`

## 2026-05-25 — Test: add Auto Lock Playwright smoke test

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added a new Playwright smoke test:
  - `tests/e2e/auto-lock-smoke.spec.ts`
- The test checks the existing Automatic Lock behavior without changing app UI or app logic.
- Test flow:
  - opens the app
  - logs in through the existing mock Admin login flow
  - opens Settings
  - finds Quick Controls
  - enables Automatic Lock
  - sets Lock Delay slider to the minimum value:
    - 5 seconds
  - goes back to Home
  - clicks Unlock
  - verifies `POST /api/doors/unlock`
  - verifies the Automatic lock countdown appears
  - waits for the countdown to finish
  - verifies the Automatic lock countdown disappears

Important finding:
- Current Automatic Lock logic does NOT send `POST /api/doors/lock`.
- Current code only changes local UI/app state by calling:
  - `setDoorState("lock")`
- Therefore this smoke test verifies the current timer/UI behavior, not a backend/controller lock API call.
- This is intentional for now because we did not change app logic.

What we did NOT change:
- No app UI changes.
- No layout/spacing/color/animation changes.
- No business logic changes.
- No Lock/Unlock logic changes.
- No auto-lock logic changes.
- No API route changes.
- No permission logic changes.
- No localStorage key changes.

Tests done:
- `npx playwright test tests/e2e/auto-lock-smoke.spec.ts`: OK
  - result: 1 passed
- Auto Lock minimum delay test confirmed:
  - Automatic Lock can be enabled from Settings
  - Lock Delay can be set to 5 seconds
  - Unlock sends `POST /api/doors/unlock`
  - countdown appears
  - countdown finishes and UI returns to locked state behavior

Result:
- OK

Notes:
- This test is useful for future refactors touching:
  - Quick Controls
  - Automatic Lock
  - Lock Delay slider
  - `lib/core/lock-state.ts`
  - `lib/core/lock-timers.ts`
  - Dashboard lock/unlock UI
- If we later decide that Automatic Lock must also send a real lock API request to the controller, app logic must be changed separately and this test should be updated then.

Next:
- Run full checks before commit:
  - `npm run test:e2e`
  - `npm run lint`
  - `npm run build`
- If all checks pass, commit:
  - `git add PROGRESS_LOG.md tests/e2e/auto-lock-smoke.spec.ts`
  - `git commit -m "test: add auto lock smoke test"`

## 2026-05-25 — Test infrastructure: add Playwright smoke tests

Baseline/branch:
- branch: refactor-v2

What we changed:
- Added minimal Playwright test infrastructure.
- Installed Playwright as a dev dependency only:
  - @playwright/test
- Added Playwright Chromium browser install for local testing.
- Added `playwright.config.ts`.
- Added Playwright scripts to `package.json`:
  - `npm run test:e2e`
  - `npm run test:e2e:ui`
- Added Playwright output folders to `.gitignore`:
  - `/test-results/`
  - `/playwright-report/`
- Added first app smoke test:
  - `tests/e2e/app-smoke.spec.ts`
  - verifies the app page loads without crashing
  - checks that the body is visible
  - checks there is no visible runtime crash text
- Added Lock/Unlock smoke test:
  - `tests/e2e/lock-unlock-smoke.spec.ts`
  - logs in through the existing mock Admin login flow
  - clicks Unlock first because initial door state is locked
  - verifies `POST /api/doors/unlock`
  - clicks Lock after that
  - verifies `POST /api/doors/lock`
- Set Playwright `workers: 1` so tests run one at a time.
- This avoids flaky behavior from parallel browser tests sharing mock/local app state.

What we did NOT change:
- No app UI changes.
- No layout/spacing/color/animation changes.
- No business logic changes.
- No Lock/Unlock logic changes.
- No API route changes.
- No permission logic changes.
- No localStorage key changes.

Tests done:
- `npm run test:e2e`: OK
  - app smoke test: passed
  - unlock/lock API smoke test: passed
  - final result: 2 passed
- Lock/Unlock automated test confirmed:
  - `POST /api/doors/unlock`
  - `POST /api/doors/lock`

Result:
- OK

Notes:
- Playwright is a development/test dependency only.
- It does not load in the production app.
- It does not make the normal site heavier for users.
- It only runs when explicitly started with:
  - `npm run test:e2e`
- The Lock/Unlock smoke test replaces the old manual check for confirming API POST calls, but manual testing can still be done when touching critical lock code.

Next:
- Keep using this before commits that touch app wiring, dashboard, lock state, door actions, API routes, or refactor logic:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- If Lock/Unlock flow is changed later, this automated smoke test should catch missing API side-effects.

## 2026-05-25 — Feature: start using persisted Activity Log for Lock/Unlock

Baseline/branch:
- branch: refactor-v2

Commits:
- 31028bd feat: log dashboard lock actions
- 8240f54 feat: show persisted activity log

What we changed:
- Found that `AppContext` already exposed persisted Activity Log state:
  - `activityLog`
  - `logActivity`
  - `clearActivityLog`
- Found that no code was calling `logActivity()` yet.
- Added real Activity Log writing for successful Dashboard Lock/Unlock actions.
- The log entry is written only after the door API action succeeds.
- Failed Lock/Unlock actions still do not create activity entries.
- Added log data for:
  - `createdAt`
  - `doorName`
  - `timeLabel`
  - `dateLabel`
  - `action`
  - `method`
  - `user`
  - `eventType`
- Kept Lock/Unlock API flow unchanged:
  - `lockDoor(doorId)`
  - `unlockDoor(doorId)`
- Kept demo sensor state behavior unchanged:
  - `setDoorSensorOpen(nextState === "unlock")`

Activity screen:
- Updated `components/activity-log-screen.tsx` to read `activityLog` from `useAppContext()`.
- Added a small adapter from persisted/core activity log entries to the existing Activity UI shape.
- Kept the existing render/filter UI mostly unchanged.
- Kept the existing hardcoded demo logs as fallback.
- Behavior now:
  - if persisted `activityLog` has entries → Activity tab shows real persisted entries
  - if persisted `activityLog` is empty → Activity tab still shows the old demo fallback entries
- This avoids an empty Activity screen on clean browser state while allowing real Lock/Unlock history to appear after actions.

What we did NOT change:
- No permission logic changes.
- No Lock/Unlock permission changes.
- No API route changes.
- No localStorage storage key changes.
- No theme color changes.
- No layout/spacing/animation changes.
- No bottom navigation changes.
- No Settings/Scenes/Profile behavior changes.
- No activity filter UI changes.
- No direct removal of demo logs yet; they remain fallback only.

Tests done:
- For `31028bd feat: log dashboard lock actions`:
  - npm run lint: OK
  - npm run build: OK
  - npm run dev: OK
  - manual Lock/Unlock smoke test: OK
    - terminal showed `POST /api/doors/lock`
    - terminal showed `POST /api/doors/unlock`
- For `8240f54 feat: show persisted activity log`:
  - npm run lint: OK
  - npm run build: OK
  - npm run dev: OK
  - manual Lock/Unlock smoke test: OK
    - terminal showed `POST /api/doors/lock`
    - terminal showed `POST /api/doors/unlock`
  - manual Activity tab test: OK
    - Activity tab showed real Lock/Unlock entries after actions

Result:
- OK

Notes:
- This is the first step toward replacing demo Activity data with real app activity.
- Demo Activity entries are intentionally still kept as fallback when there are no persisted entries.
- Next possible step, only if requested:
  - add more real `logActivity()` calls for other important actions, one area at a time:
    - add/edit/delete doors
    - add/edit/delete iButtons
    - add/edit/delete App Users
    - scenes create/edit/delete/toggle
    - controller restart
- If touching Lock/Unlock path again, manual POST smoke test remains mandatory.

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
