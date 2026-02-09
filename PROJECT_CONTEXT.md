# PROJECT_CONTEXT — SMART42 (START HERE)

STATUS: INDEX / ENTRY POINT  
Stable baseline (known good): **commit 16ca172** (Lock/Unlock works, no errors)

## What to read (order)
1) **PROJECT_LOGIC_SPEC.md** — AUTHORITATIVE business rules (UI must not change).  
2) **ARCHITECTURE.md** — folder/file ownership map.  
3) **DEV_WORKFLOW.md** — commands + runbook.  
4) **REFACTOR_NOTES.md** — working notes (non-authoritative).  
5) **PROGRESS_LOG.md** — latest work session + what’s next.

## Conflict rule
If any docs conflict → **PROJECT_LOGIC_SPEC.md wins**.

## Non-negotiables
- UI/layout/spacing/colors/animations MUST NOT change.
- Step-by-step changes only, minimal diffs.
- If permission logic is uncertain → default restrictive.

## Git safety
- Stable baseline: `16ca172`
- Keep a stable branch:
  - `stable-working` → points to 16ca172
- Do refactors only in a work branch:
  - `refactor-v2`

## What to attach/paste in a new chat
Minimum:
- PROJECT_CONTEXT.md
- HANDOFF.md
- PROGRESS_LOG.md (top entry)

Optional (if we need to inspect logic):
- PROJECT_LOGIC_SPEC.md
- ARCHITECTURE.md
- DEV_WORKFLOW.md
- REFACTOR_NOTES.md
