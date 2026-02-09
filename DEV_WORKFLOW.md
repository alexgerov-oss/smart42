# DEV_WORKFLOW — SMART42 (RUNBOOK)

STATUS: **REFERENCE / COMMANDS**
Stable baseline: **16ca172**

---

## 1) Commands

Install:
- `npm install`

Dev:
- `npm run dev`

Lint:
- `npm run lint`

Build:
- `npm run build`

---

## Manual smoke tests (do after any refactor)

After **any** change touching:
- `lib/app-context.tsx`
- `lib/core/lock-state.ts` / `lib/core/lock-timers.ts`
- `lib/core/api.ts` / `lib/core/door-actions.ts`
- dashboard lock/unlock UI handlers

Do this quick check:

1) Run:
- `npm run dev`

2) Click **Lock**, then **Unlock** on the dashboard.

3) Confirm in the terminal logs you see:
- `POST /api/doors/lock`
- `POST /api/doors/unlock`

If the UI changes but these POST logs do NOT appear:
- the refactor broke the side-effect (doorActions call) and must be fixed immediately.


---

## 2) Open app on phone (same Wi-Fi / hotspot)

1) Start dev server on PC
2) Find PC LAN IP (example: `192.168.1.50`)
3) Open on phone:
- `http://192.168.1.50:3000`

If it doesn’t open:
- Phone and PC must be on same network/hotspot
- Allow Windows Firewall inbound for port 3000
- Ensure Next dev binds to all interfaces

Bind dev server to 0.0.0.0 (if needed):
- `npm run dev -- --hostname 0.0.0.0 --port 3000`

---

## 3) Common problems

### Port 3000 is in use
- stop the other dev server
- or use the port Next prints (3001 etc.)

### Next dev lock file error
If you see: `.next/dev/lock`
- stop dev (Ctrl+C)
- delete `.next`
- start again:
  - `npm run dev`

### Git output “freezes” (less)
In bash/Git Bash:
- `export GIT_PAGER=cat`

---

## Terminal sanity (Windows)

Recommended terminal for git commands: **Git Bash** (less confusion than PowerShell prompts).

Avoid “frozen” git output (less pager):
- `export GIT_PAGER=cat`

If a command opens a pager screen:
- press `q` to exit

---

## If git cannot move between commits

Check:
- `git status`

If you see unwanted **Untracked files** (example: `lib/core/Untitled`):
- delete them (example): `rm -f lib/core/Untitled`

Then retry your git operation (checkout/bisect/etc.).

---

## Note: Data “sticking” in the UI
If you still see old iButtons/users after code changes, it's usually persisted site data (not page cache).
For clean tests, use a fresh browser profile or clear site data for localhost.
