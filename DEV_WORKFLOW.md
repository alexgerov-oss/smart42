# DEV_WORKFLOW

## Commands

Install:
- `npm install`

Dev:
- `npm run dev`

Lint:
- `npm run lint`

Build:
- `npm run build`

---

## Open app on phone (same Wi-Fi / hotspot)

1) Start dev server on PC.
2) Find your PC LAN IP (example: `192.168.1.50`).
3) Open on phone:
- `http://192.168.1.50:3000`

If it doesn’t open:
- Ensure phone and PC are on the same network/hotspot
- Allow Windows Firewall inbound for port 3000
- Ensure Next dev binds to all interfaces (0.0.0.0)

### Bind dev server to 0.0.0.0 (if needed)

Option A:
- `npm run dev -- --hostname 0.0.0.0 --port 3000`

Option B (Windows cmd):
- `set HOSTNAME=0.0.0.0 && npm run dev`

(Use whichever works in your environment.)

---

## Git checkpoints (recommended)

Typical checkpoint:
- `git status`
- `git add .`
- `git commit -m "checkpoint: <short description>"`

Examples:
- `checkpoint: app-context refactor into core hooks`
- `checkpoint: extracted subscription + ui prefs state`
- `checkpoint: extracted scenes + lock + profile state`

If remote exists:
- `git push`
