# HANDOFF — SMART42 (PASTE THIS IN NEW CHAT)

## 1) Stable baseline
- Stable commit (known good): **16ca172**
- Start from it:
  - `git checkout 16ca172`

Recommended branches:
- `stable-working` = points to stable commit
- `refactor-v2` = do refactor work here only

## 2) Non-negotiables
- UI MUST NOT CHANGE (layout/spacing/colors/animations/components).
- Step-by-step changes only.
- If unsure: default to most restrictive behavior.

## 3) What files you will attach/paste in a new chat
Attach or paste these files:
- PROJECT_LOGIC_SPEC.md (AUTHORITATIVE rules)
- ARCHITECTURE.md (ownership map)
- DEV_WORKFLOW.md (commands/runbook)
- REFACTOR_NOTES.md (todo/notes)
- PROGRESS_LOG.md (latest entry at top)

## 4) Must-pass checks after each change
- `npm run lint`
- `npm run build`
- `npm run dev`
Manual:
- Lock/Unlock works
- Auto lock countdown works
- Night lock settings save & behave
- Limits and permissions follow PROJECT_LOGIC_SPEC

## 5) Instructions for the assistant (so it doesn’t “start from zero”)
- Do not propose UI changes.
- Do not rewrite architecture.
- Prefer minimal diffs.
- If something breaks: use git to isolate (checkout / reflog / bisect) instead of guessing.
